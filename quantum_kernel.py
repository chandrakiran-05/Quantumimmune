"""
QuantumImmune Dx — Quantum Kernel Module
PennyLane-based quantum kernel with angle encoding and entangling layers.

Uses chunked parallel processing for kernel matrix computation.
"""

import numpy as np
import pennylane as qml
import multiprocessing
import time
import json
import os
from concurrent.futures import ProcessPoolExecutor


def _create_circuit(n_qubits, n_layers):
    """Create a PennyLane quantum kernel circuit."""
    dev = qml.device("lightning.qubit", wires=n_qubits)

    @qml.qnode(dev)
    def kernel_circuit(x1, x2):
        for layer in range(n_layers):
            for i in range(n_qubits):
                qml.RY(x1[i], wires=i)
            for i in range(n_qubits - 1):
                qml.CNOT(wires=[i, i + 1])
            if n_qubits > 1:
                qml.CNOT(wires=[n_qubits - 1, 0])

        for layer in range(n_layers - 1, -1, -1):
            if n_qubits > 1:
                qml.CNOT(wires=[n_qubits - 1, 0])
            for i in range(n_qubits - 2, -1, -1):
                qml.CNOT(wires=[i, i + 1])
            for i in range(n_qubits - 1, -1, -1):
                qml.RY(-x2[i], wires=i)

        return qml.probs(wires=range(n_qubits))

    return kernel_circuit


_CIRCUITS = {}


def create_feature_map_circuit(n_qubits, n_layers=2):
    """Get or create a cached kernel circuit."""
    key = (n_qubits, n_layers)
    if key not in _CIRCUITS:
        _CIRCUITS[key] = _create_circuit(n_qubits, n_layers)
    return _CIRCUITS[key]


def compute_kernel_entry(kernel_circuit, x1, x2):
    """Compute a single kernel entry K(x1, x2) = |<phi(x1)|phi(x2)>|^2."""
    probs = kernel_circuit(x1, x2)
    return float(probs[0])


# ──────────────────────────────────────────────────────────────────────────────
# Standalone worker for process pool (avoids pickling QNodes)
# ──────────────────────────────────────────────────────────────────────────────

def _process_chunk(chunk_data):
    """
    Process a chunk of kernel pair computations in a worker process.
    Each worker creates its own circuit (no pickle needed).
    """
    pairs, n_qubits, n_layers = chunk_data
    circuit = _create_circuit(n_qubits, n_layers)
    results = []
    for i, j, x1, x2 in pairs:
        probs = circuit(x1, x2)
        results.append((i, j, float(probs[0])))
    return results


def compute_kernel_matrix_sequential(X, kernel_circuit):
    """Compute kernel matrix sequentially."""
    n = X.shape[0]
    K = np.zeros((n, n))
    for i in range(n):
        for j in range(i, n):
            val = compute_kernel_entry(kernel_circuit, X[i], X[j])
            K[i, j] = val
            K[j, i] = val
    return K


def compute_kernel_matrix(X, kernel_circuit, n_jobs=1, n_qubits=10, n_layers=2):
    """
    Compute the full symmetric kernel matrix for dataset X.
    
    For n_jobs > 1, distributes work across multiple processes using chunked batches.
    Each process creates its own PennyLane circuit to avoid serialization issues.
    """
    n = X.shape[0]

    if n_jobs == 1:
        return compute_kernel_matrix_sequential(X, kernel_circuit)

    # Build pairs with serializable numpy data
    pairs = []
    for i in range(n):
        for j in range(i, n):
            pairs.append((i, j, X[i].tolist(), X[j].tolist()))

    n_workers = min(multiprocessing.cpu_count(), 8) if n_jobs == -1 else n_jobs

    # Chunk pairs into n_workers batches
    chunk_size = max(1, len(pairs) // n_workers)
    chunks = []
    for start in range(0, len(pairs), chunk_size):
        chunk = pairs[start:start + chunk_size]
        chunks.append((chunk, n_qubits, n_layers))

    K = np.zeros((n, n))

    # Use multiprocessing Pool (works on Windows with if __name__ guard)
    with multiprocessing.Pool(processes=n_workers) as pool:
        all_results = pool.map(_process_chunk, chunks)

    for batch in all_results:
        for i, j, val in batch:
            K[i, j] = val
            K[j, i] = val

    return K


def compute_kernel_matrix_test(X_test, X_train, kernel_circuit, n_jobs=-1, n_qubits=10, n_layers=2):
    """Compute kernel matrix between test and training data."""
    n_test = X_test.shape[0]
    n_train = X_train.shape[0]

    if n_jobs == 1:
        K = np.zeros((n_test, n_train))
        for i in range(n_test):
            for j in range(n_train):
                K[i, j] = compute_kernel_entry(kernel_circuit, X_test[i], X_train[j])
        return K

    pairs = []
    for i in range(n_test):
        for j in range(n_train):
            pairs.append((i, j, X_test[i].tolist(), X_train[j].tolist()))

    n_workers = min(multiprocessing.cpu_count(), 8) if n_jobs == -1 else max(1, n_jobs)
    chunk_size = max(1, len(pairs) // n_workers)
    chunks = []
    for start in range(0, len(pairs), chunk_size):
        chunk = pairs[start:start + chunk_size]
        chunks.append((chunk, n_qubits, n_layers))

    K = np.zeros((n_test, n_train))

    with multiprocessing.Pool(processes=n_workers) as pool:
        all_results = pool.map(_process_chunk, chunks)

    for batch in all_results:
        for i, j, val in batch:
            K[i, j] = val

    return K


def benchmark_kernel_computation(X_sample, kernel_circuit, n_qubits=10, n_layers=2, save_path=None):
    """Benchmark sequential vs parallel kernel matrix computation."""
    results = {}
    n_cores = multiprocessing.cpu_count()

    # Sequential
    print("  Benchmarking sequential kernel computation...")
    t0 = time.time()
    K_seq = compute_kernel_matrix_sequential(X_sample, kernel_circuit)
    t_seq = time.time() - t0
    results["sequential_time"] = round(t_seq, 3)
    results["sequential_pairs"] = len(X_sample) * (len(X_sample) + 1) // 2
    print(f"    Sequential: {t_seq:.3f}s")

    # Parallel
    print(f"  Benchmarking parallel kernel computation ({n_cores} cores)...")
    t0 = time.time()
    K_par = compute_kernel_matrix(X_sample, kernel_circuit, n_jobs=-1,
                                   n_qubits=n_qubits, n_layers=n_layers)
    t_par = time.time() - t0
    results["parallel_time"] = round(t_par, 3)
    results["parallel_pairs"] = results["sequential_pairs"]
    results["n_cores"] = n_cores
    print(f"    Parallel:   {t_par:.3f}s")

    results["speedup"] = round(t_seq / max(t_par, 0.001), 2)
    results["sample_size"] = len(X_sample)

    max_diff = np.max(np.abs(K_seq - K_par))
    results["max_diff"] = float(max_diff)
    print(f"    Speedup: {results['speedup']}x")
    print(f"    Max difference: {max_diff:.2e}")

    if save_path:
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        with open(save_path, "w") as f:
            json.dump(results, f, indent=2)

    return results

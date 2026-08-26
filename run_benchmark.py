"""
Benchmark with larger sample to demonstrate meaningful parallel speedup.
Uses 100 samples = 5050 pairs. With ~3ms/pair that's ~15s sequential.
"""
import numpy as np
import multiprocessing

if __name__ == "__main__":
    from quantum_kernel import (
        create_feature_map_circuit, benchmark_kernel_computation
    )

    N_QUBITS = 10
    N_LAYERS = 2
    SAMPLE_SIZE = 100

    np.random.seed(42)
    X = np.random.uniform(0, np.pi, (SAMPLE_SIZE, N_QUBITS))
    circuit = create_feature_map_circuit(N_QUBITS, N_LAYERS)

    n_pairs = SAMPLE_SIZE * (SAMPLE_SIZE + 1) // 2
    print(f"CPU cores: {multiprocessing.cpu_count()}")
    print(f"Sample: {SAMPLE_SIZE}, Pairs: {n_pairs}")
    print(f"Expected sequential: ~{n_pairs * 0.003:.1f}s")
    print()

    results = benchmark_kernel_computation(
        X, circuit, n_qubits=N_QUBITS, n_layers=N_LAYERS,
        save_path="models/runtime_benchmarks.json"
    )
    print(f"\nFinal: {results}")

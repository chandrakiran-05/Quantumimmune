"""
QuantumImmune Dx — Model Training Pipeline
Trains classical baselines (RF, SVM) and QSVM on the synthetic dataset.

Usage: python train_models.py
Outputs: Trained models, metrics, kernel matrices, and runtime benchmarks in models/
"""

import numpy as np
import pandas as pd
import json
import os
import time
import warnings
warnings.filterwarnings("ignore")

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder, MinMaxScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.multiclass import OneVsRestClassifier
from sklearn.metrics import (
    accuracy_score, f1_score, precision_score, recall_score,
    confusion_matrix, classification_report
)
from sklearn.decomposition import PCA
import joblib

from quantum_kernel import (
    create_feature_map_circuit,
    compute_kernel_matrix,
    compute_kernel_matrix_test,
    benchmark_kernel_computation,
)

SEED = 42
np.random.seed(SEED)

# Configuration
N_QUBITS = 10         # Use PCA to reduce 18 features -> 10 for qubit feasibility
N_LAYERS = 2           # Circuit depth
BENCHMARK_SAMPLE = 40  # Samples for sequential vs parallel benchmark
USE_QUANTUM = True     # Set False to skip quantum (fallback mode)


def load_and_preprocess():
    """Load dataset and preprocess for training."""
    print("=" * 60)
    print("STEP 1: Loading and preprocessing dataset")
    print("=" * 60)

    df = pd.read_csv("data/autoimmune_dataset.csv")
    print(f"  Loaded {len(df)} patients, {df['Label'].nunique()} classes")

    # Separate features and labels
    feature_cols = [c for c in df.columns if c not in ["Label", "data_source"]]
    X = df[feature_cols].values.astype(float)
    y = df["Label"].values

    # Encode labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    print(f"  Classes: {list(le.classes_)}")

    # Stratified split: 70% train, 15% val, 15% test
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y_encoded, test_size=0.30, random_state=SEED, stratify=y_encoded
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, random_state=SEED, stratify=y_temp
    )
    print(f"  Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)

    return (
        X_train_scaled, X_val_scaled, X_test_scaled,
        y_train, y_val, y_test,
        le, scaler, feature_cols
    )


def train_classical_baselines(X_train, X_test, y_train, y_test, le, feature_cols):
    """Train Random Forest and classical SVM baselines."""
    print("\n" + "=" * 60)
    print("STEP 2: Training classical baselines")
    print("=" * 60)

    metrics = {}

    # ── Random Forest ──
    print("\n  Training Random Forest...")
    rf = RandomForestClassifier(
        n_estimators=200, max_depth=20, random_state=SEED, n_jobs=-1
    )
    t0 = time.time()
    rf.fit(X_train, y_train)
    rf_train_time = time.time() - t0

    y_pred_rf = rf.predict(X_test)
    metrics["Random Forest"] = {
        "accuracy": round(accuracy_score(y_test, y_pred_rf), 4),
        "f1_macro": round(f1_score(y_test, y_pred_rf, average="macro"), 4),
        "precision_macro": round(precision_score(y_test, y_pred_rf, average="macro", zero_division=0), 4),
        "recall_macro": round(recall_score(y_test, y_pred_rf, average="macro", zero_division=0), 4),
        "train_time": round(rf_train_time, 3),
        "confusion_matrix": confusion_matrix(y_test, y_pred_rf).tolist(),
    }
    print(f"    Accuracy: {metrics['Random Forest']['accuracy']}")
    print(f"    Macro F1: {metrics['Random Forest']['f1_macro']}")
    print(f"    Train time: {rf_train_time:.3f}s")

    # Feature importance
    fi = dict(zip(feature_cols, rf.feature_importances_.tolist()))
    fi_sorted = dict(sorted(fi.items(), key=lambda x: x[1], reverse=True))

    # ── Classical SVM (RBF) ──
    print("\n  Training Classical SVM (RBF kernel)...")
    csvm = SVC(kernel="rbf", C=10, gamma="scale", random_state=SEED, probability=True)
    t0 = time.time()
    csvm.fit(X_train, y_train)
    csvm_train_time = time.time() - t0

    y_pred_csvm = csvm.predict(X_test)
    metrics["Classical SVM"] = {
        "accuracy": round(accuracy_score(y_test, y_pred_csvm), 4),
        "f1_macro": round(f1_score(y_test, y_pred_csvm, average="macro"), 4),
        "precision_macro": round(precision_score(y_test, y_pred_csvm, average="macro", zero_division=0), 4),
        "recall_macro": round(recall_score(y_test, y_pred_csvm, average="macro", zero_division=0), 4),
        "train_time": round(csvm_train_time, 3),
        "confusion_matrix": confusion_matrix(y_test, y_pred_csvm).tolist(),
    }
    print(f"    Accuracy: {metrics['Classical SVM']['accuracy']}")
    print(f"    Macro F1: {metrics['Classical SVM']['f1_macro']}")
    print(f"    Train time: {csvm_train_time:.3f}s")

    return rf, csvm, metrics, fi_sorted


def train_quantum_svm(X_train, X_test, y_train, y_test, le):
    """Train QSVM using precomputed quantum kernel matrix."""
    print("\n" + "=" * 60)
    print("STEP 3: Quantum Kernel SVM")
    print("=" * 60)

    # PCA reduction to N_QUBITS dimensions
    print(f"\n  Reducing features to {N_QUBITS} dimensions via PCA...")
    pca = PCA(n_components=N_QUBITS, random_state=SEED)
    X_train_pca = pca.fit_transform(X_train)
    X_test_pca = pca.transform(X_test)
    print(f"    Explained variance: {pca.explained_variance_ratio_.sum():.4f}")

    # Scale to [0, pi] for angle encoding
    pi_scaler = MinMaxScaler(feature_range=(0, np.pi))
    X_train_q = pi_scaler.fit_transform(X_train_pca)
    X_test_q = pi_scaler.transform(X_test_pca)

    # Create quantum kernel circuit
    print(f"\n  Creating quantum circuit: {N_QUBITS} qubits, {N_LAYERS} layers")
    kernel_circuit = create_feature_map_circuit(N_QUBITS, N_LAYERS)

    # Benchmark sequential vs parallel (on small sample)
    print(f"\n  Running benchmark on {BENCHMARK_SAMPLE} samples...")
    benchmark_data = X_train_q[:BENCHMARK_SAMPLE]
    bench_results = benchmark_kernel_computation(
        benchmark_data, kernel_circuit,
        n_qubits=N_QUBITS, n_layers=N_LAYERS,
        save_path="models/runtime_benchmarks.json"
    )

    # Compute full training kernel matrix (parallelized)
    print(f"\n  Computing full training kernel matrix ({len(X_train_q)}x{len(X_train_q)})...")
    t0 = time.time()
    K_train = compute_kernel_matrix(X_train_q, kernel_circuit, n_jobs=-1, n_qubits=N_QUBITS, n_layers=N_LAYERS)
    kernel_train_time = time.time() - t0
    print(f"    Done in {kernel_train_time:.1f}s")

    # Compute test kernel matrix
    print(f"\n  Computing test kernel matrix ({len(X_test_q)}x{len(X_train_q)})...")
    t0 = time.time()
    K_test = compute_kernel_matrix_test(X_test_q, X_train_q, kernel_circuit, n_jobs=-1, n_qubits=N_QUBITS, n_layers=N_LAYERS)
    kernel_test_time = time.time() - t0
    print(f"    Done in {kernel_test_time:.1f}s")

    # Train QSVM with precomputed kernel
    print("\n  Training SVC(kernel='precomputed')...")
    qsvm = SVC(kernel="precomputed", C=10, probability=True, random_state=SEED)
    t0 = time.time()
    qsvm.fit(K_train, y_train)
    qsvm_train_time = time.time() - t0
    print(f"    SVM fit time: {qsvm_train_time:.3f}s")

    # Evaluate
    y_pred_q = qsvm.predict(K_test)
    metrics = {
        "accuracy": round(accuracy_score(y_test, y_pred_q), 4),
        "f1_macro": round(f1_score(y_test, y_pred_q, average="macro"), 4),
        "precision_macro": round(precision_score(y_test, y_pred_q, average="macro", zero_division=0), 4),
        "recall_macro": round(recall_score(y_test, y_pred_q, average="macro", zero_division=0), 4),
        "train_time": round(qsvm_train_time + kernel_train_time, 3),
        "kernel_train_time": round(kernel_train_time, 3),
        "kernel_test_time": round(kernel_test_time, 3),
        "confusion_matrix": confusion_matrix(y_test, y_pred_q).tolist(),
    }
    print(f"\n    QSVM Accuracy: {metrics['accuracy']}")
    print(f"    QSVM Macro F1: {metrics['f1_macro']}")

    return qsvm, metrics, pca, pi_scaler, K_train, K_test, X_train_q, bench_results


def main():
    os.makedirs("models", exist_ok=True)

    # Step 1: Load & preprocess
    (
        X_train, X_val, X_test,
        y_train, y_val, y_test,
        le, scaler, feature_cols
    ) = load_and_preprocess()

    # Step 2: Classical baselines
    rf, csvm, metrics, fi_sorted = train_classical_baselines(
        X_train, X_test, y_train, y_test, le, feature_cols
    )

    # Save classical models
    joblib.dump(rf, "models/rf_model.joblib")
    joblib.dump(csvm, "models/classical_svm_model.joblib")
    joblib.dump(scaler, "models/scaler.joblib")
    joblib.dump(le, "models/label_encoder.joblib")
    with open("models/rf_feature_importance.json", "w") as f:
        json.dump(fi_sorted, f, indent=2)
    print("\n  [OK] Classical models saved.")

    # Save feature columns list
    with open("models/feature_cols.json", "w") as f:
        json.dump(feature_cols, f)

    # Step 3: Quantum SVM
    if USE_QUANTUM:
        try:
            (
                qsvm, qsvm_metrics, pca, pi_scaler,
                K_train, K_test, X_train_q, bench_results
            ) = train_quantum_svm(X_train, X_test, y_train, y_test, le)

            metrics["QSVM"] = qsvm_metrics

            # Save quantum artifacts
            joblib.dump(qsvm, "models/qsvm_model.joblib")
            joblib.dump(pca, "models/pca.joblib")
            joblib.dump(pi_scaler, "models/pi_scaler.joblib")
            np.save("models/kernel_matrix_train.npy", K_train)
            np.save("models/kernel_matrix_test.npy", K_test)
            np.save("models/X_train_quantum.npy", X_train_q)
            print("\n  [OK] Quantum models saved.")

        except Exception as e:
            print(f"\n  [ERROR] Quantum pipeline failed: {e}")
            print("  Falling back to classical-only mode.")
            metrics["QSVM"] = {
                "accuracy": 0,
                "f1_macro": 0,
                "precision_macro": 0,
                "recall_macro": 0,
                "train_time": 0,
                "confusion_matrix": [],
                "error": str(e),
            }
    else:
        print("\n  [SKIP] Quantum pipeline disabled (USE_QUANTUM=False)")

    # Save all metrics
    with open("models/metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    # Save test data for app verification
    np.save("models/X_test.npy", X_test)
    np.save("models/y_test.npy", y_test)

    print("\n" + "=" * 60)
    print("TRAINING COMPLETE")
    print("=" * 60)
    print("\nModel Performance Summary:")
    for model_name, m in metrics.items():
        print(f"  {model_name}:")
        print(f"    Accuracy:  {m.get('accuracy', 'N/A')}")
        print(f"    Macro F1:  {m.get('f1_macro', 'N/A')}")
        print(f"    Train Time: {m.get('train_time', 'N/A')}s")

    print(f"\nAll models and artifacts saved to models/")


if __name__ == "__main__":
    main()

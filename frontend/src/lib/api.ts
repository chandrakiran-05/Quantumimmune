export interface PatientFeatures {
  Age: number;
  Sex: number;
  CRP: number;
  ESR: number;
  RF: number;
  Anti_CCP: number;
  ANA_titer: number;
  Anti_dsDNA: number;
  Complement_C3: number;
  TSH: number;
  Anti_TPO: number;
  Fasting_Glucose: number;
  Anti_tTG: number;
  HLA_B27: number;
  Joint_Pain: number;
  Fatigue: number;
  GI_Symptom: number;
  Skin_Lesion: number;
}

export interface PredictionDetail {
  prediction: string;
  confidence: number;
  probabilities: Record<string, number>;
}

export interface PredictResponse {
  quantum_kernel_svm?: PredictionDetail;
  random_forest?: PredictionDetail;
  classical_svm?: PredictionDetail;
  qsvm_error?: string;
}

export interface ModelMetrics {
  accuracy: number;
  f1_macro: number;
  precision_macro: number;
  recall_macro: number;
  train_time: number;
  confusion_matrix: number[][];
}

export interface BenchmarkData {
  sequential_time: number;
  sequential_pairs: number;
  parallel_time: number;
  parallel_pairs: number;
  n_cores: number;
  speedup: number;
  sample_size: number;
  max_diff: number;
}

export interface MetricsResponse {
  metrics: Record<string, ModelMetrics>;
  benchmarks: BenchmarkData;
  classes: string[];
}

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000").replace(/\/$/, "");

export async function extractReport(file: File): Promise<{
  extracted_data: Record<string, number>;
  extraction_flags: Record<string, boolean>;
}> {
  const fd = new FormData();
  fd.append("file", file);
  
  const response = await fetch(`${BACKEND_URL}/extract-report`, {
    method: "POST",
    body: fd,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to extract report data from the backend.");
  }
  
  return response.json();
}

export async function predictCondition(features: PatientFeatures): Promise<PredictResponse> {
  const response = await fetch(`${BACKEND_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(features),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to execute prediction pipeline.");
  }

  return response.json();
}

export async function fetchModelMetrics(): Promise<MetricsResponse> {
  const response = await fetch(`${BACKEND_URL}/models/metrics`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to fetch model metrics from backend.");
  }

  return response.json();
}

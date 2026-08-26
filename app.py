"""
QuantumImmune Dx — Streamlit Frontend
Polished clinical/quantum-themed dashboard for autoimmune disease prediction.

Usage: streamlit run app.py
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
import json
import os
import joblib
from sklearn.preprocessing import StandardScaler, MinMaxScaler

# ──────────────────────────────────────────────────────────────────────────────
# Page Config
# ──────────────────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="QuantumImmune Dx",
    page_icon="🧬",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ──────────────────────────────────────────────────────────────────────────────
# Custom CSS — Deep Navy + Violet Theme
# ──────────────────────────────────────────────────────────────────────────────
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    /* Global */
    .stApp {
        background: linear-gradient(135deg, #0a0e27 0%, #1a1040 50%, #0d1137 100%);
        font-family: 'Inter', sans-serif;
    }

    /* Hide default Streamlit header/footer */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}

    /* Sidebar */
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #0f1338 0%, #1a1050 100%);
        border-right: 1px solid rgba(124, 58, 237, 0.3);
    }
    [data-testid="stSidebar"] .stMarkdown p,
    [data-testid="stSidebar"] .stMarkdown label,
    [data-testid="stSidebar"] label {
        color: #c4b5fd !important;
    }

    /* Tab styling */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
        background: rgba(15, 19, 56, 0.8);
        border-radius: 12px;
        padding: 4px;
        border: 1px solid rgba(124, 58, 237, 0.2);
    }
    .stTabs [data-baseweb="tab"] {
        background: transparent;
        color: #a78bfa;
        border-radius: 8px;
        padding: 10px 20px;
        font-weight: 500;
        font-family: 'Inter', sans-serif;
    }
    .stTabs [aria-selected="true"] {
        background: linear-gradient(135deg, #7c3aed, #a855f7) !important;
        color: white !important;
        font-weight: 600;
    }

    /* Card container */
    .glass-card {
        background: rgba(15, 19, 56, 0.6);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(124, 58, 237, 0.25);
        border-radius: 16px;
        padding: 24px;
        margin: 12px 0;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    /* Headers */
    .hero-title {
        font-family: 'Inter', sans-serif;
        font-weight: 800;
        font-size: 2.6em;
        background: linear-gradient(135deg, #c4b5fd, #a855f7, #7c3aed);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0;
        letter-spacing: -0.02em;
    }
    .hero-subtitle {
        font-family: 'Inter', sans-serif;
        color: #8b7ec8;
        font-size: 1.1em;
        font-weight: 400;
        margin-top: 4px;
    }

    /* Section headers */
    .section-title {
        font-family: 'Inter', sans-serif;
        font-weight: 700;
        font-size: 1.4em;
        color: #c4b5fd;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 2px solid rgba(124, 58, 237, 0.3);
    }

    /* Metric cards */
    .metric-card {
        background: linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(168, 85, 247, 0.08));
        border: 1px solid rgba(124, 58, 237, 0.3);
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        transition: transform 0.2s, box-shadow 0.2s;
    }
    .metric-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 40px rgba(124, 58, 237, 0.2);
    }
    .metric-value {
        font-size: 2.2em;
        font-weight: 800;
        background: linear-gradient(135deg, #a855f7, #c4b5fd);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .metric-label {
        color: #8b7ec8;
        font-size: 0.85em;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-top: 4px;
    }

    /* Disclaimer banner */
    .disclaimer-banner {
        background: linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(220, 38, 38, 0.08));
        border: 1px solid rgba(220, 38, 38, 0.4);
        border-radius: 12px;
        padding: 14px 20px;
        color: #fca5a5;
        font-size: 0.9em;
        font-weight: 500;
        margin: 12px 0;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    /* Prediction result */
    .prediction-result {
        background: linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(168, 85, 247, 0.1));
        border: 2px solid rgba(124, 58, 237, 0.5);
        border-radius: 16px;
        padding: 28px;
        text-align: center;
        margin: 16px 0;
    }
    .prediction-disease {
        font-size: 1.8em;
        font-weight: 800;
        color: #a855f7;
        margin-bottom: 8px;
    }
    .prediction-confidence {
        font-size: 1.1em;
        color: #c4b5fd;
        font-weight: 500;
    }

    /* Badge */
    .synthetic-badge {
        display: inline-block;
        background: rgba(234, 179, 8, 0.15);
        border: 1px solid rgba(234, 179, 8, 0.4);
        color: #fbbf24;
        border-radius: 20px;
        padding: 4px 12px;
        font-size: 0.75em;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    /* Simulated badge */
    .simulated-badge {
        display: inline-block;
        background: rgba(59, 130, 246, 0.15);
        border: 1px solid rgba(59, 130, 246, 0.4);
        color: #93c5fd;
        border-radius: 20px;
        padding: 4px 12px;
        font-size: 0.75em;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    /* Disclosure card */
    .disclosure-card {
        background: rgba(30, 27, 56, 0.6);
        border: 1px solid rgba(124, 58, 237, 0.2);
        border-radius: 12px;
        padding: 20px;
        margin: 8px 0;
        color: #a5a0c8;
        line-height: 1.7;
    }

    /* Override Streamlit text colors */
    .stMarkdown p, .stMarkdown li {
        color: #c4b5fd;
    }
    h1, h2, h3, h4, h5, h6 {
        color: #c4b5fd !important;
    }

    /* Button styling */
    .stButton>button {
        background: linear-gradient(135deg, #7c3aed, #a855f7);
        color: white;
        border: none;
        border-radius: 10px;
        font-weight: 600;
        font-family: 'Inter', sans-serif;
        padding: 8px 24px;
        transition: all 0.3s;
    }
    .stButton>button:hover {
        transform: translateY(-1px);
        box-shadow: 0 8px 24px rgba(124, 58, 237, 0.4);
    }

    /* Input fields */
    .stNumberInput input, .stSelectbox select {
        background: rgba(15, 19, 56, 0.8) !important;
        color: #c4b5fd !important;
        border: 1px solid rgba(124, 58, 237, 0.3) !important;
        border-radius: 8px !important;
    }

    /* Tech stack table */
    .tech-table {
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;
    }
    .tech-table th {
        background: rgba(124, 58, 237, 0.2);
        color: #c4b5fd;
        padding: 12px 16px;
        text-align: left;
        font-weight: 600;
        border-bottom: 2px solid rgba(124, 58, 237, 0.3);
    }
    .tech-table td {
        padding: 10px 16px;
        color: #a5a0c8;
        border-bottom: 1px solid rgba(124, 58, 237, 0.1);
    }
</style>
""", unsafe_allow_html=True)


# ──────────────────────────────────────────────────────────────────────────────
# Load Models & Data (Cached)
# ──────────────────────────────────────────────────────────────────────────────

@st.cache_resource
def load_models():
    """Load all trained models and artifacts."""
    models = {}
    base = "models"

    try:
        models["rf"] = joblib.load(os.path.join(base, "rf_model.joblib"))
    except Exception:
        models["rf"] = None

    try:
        models["csvm"] = joblib.load(os.path.join(base, "classical_svm_model.joblib"))
    except Exception:
        models["csvm"] = None

    try:
        models["qsvm"] = joblib.load(os.path.join(base, "qsvm_model.joblib"))
    except Exception:
        models["qsvm"] = None

    try:
        models["scaler"] = joblib.load(os.path.join(base, "scaler.joblib"))
    except Exception:
        models["scaler"] = None

    try:
        models["le"] = joblib.load(os.path.join(base, "label_encoder.joblib"))
    except Exception:
        models["le"] = None

    try:
        models["pca"] = joblib.load(os.path.join(base, "pca.joblib"))
    except Exception:
        models["pca"] = None

    try:
        models["pi_scaler"] = joblib.load(os.path.join(base, "pi_scaler.joblib"))
    except Exception:
        models["pi_scaler"] = None

    return models


@st.cache_data
def load_metrics():
    """Load model evaluation metrics."""
    try:
        with open("models/metrics.json", "r") as f:
            return json.load(f)
    except Exception:
        return {}


@st.cache_data
def load_feature_importance():
    """Load RF feature importance."""
    try:
        with open("models/rf_feature_importance.json", "r") as f:
            return json.load(f)
    except Exception:
        return {}


@st.cache_data
def load_runtime_benchmarks():
    """Load sequential vs parallel runtime benchmarks."""
    try:
        with open("models/runtime_benchmarks.json", "r") as f:
            return json.load(f)
    except Exception:
        return {}


@st.cache_data
def load_feature_cols():
    """Load feature column names."""
    try:
        with open("models/feature_cols.json", "r") as f:
            return json.load(f)
    except Exception:
        return [
            "Age", "Sex", "CRP", "ESR", "RF", "Anti_CCP", "ANA_titer",
            "Anti_dsDNA", "Complement_C3", "TSH", "Anti_TPO", "Fasting_Glucose",
            "Anti_tTG", "HLA_B27", "Joint_Pain", "Fatigue", "GI_Symptom", "Skin_Lesion"
        ]


@st.cache_resource
def load_quantum_train_data():
    """Load quantum training data for kernel-based inference."""
    try:
        return np.load("models/X_train_quantum.npy")
    except Exception:
        return None


# ──────────────────────────────────────────────────────────────────────────────
# Demo Patient Presets
# ──────────────────────────────────────────────────────────────────────────────

DEMO_PATIENTS = {
    "Rheumatoid Arthritis": {
        "Age": 55, "Sex": 1, "CRP": 42.0, "ESR": 48, "RF": 1, "Anti_CCP": 1,
        "ANA_titer": 1, "Anti_dsDNA": 0, "Complement_C3": 108, "TSH": 2.5,
        "Anti_TPO": 0, "Fasting_Glucose": 95, "Anti_tTG": 0, "HLA_B27": 0,
        "Joint_Pain": 8, "Fatigue": 6, "GI_Symptom": 1, "Skin_Lesion": 0,
    },
    "Systemic Lupus (SLE)": {
        "Age": 30, "Sex": 1, "CRP": 18.0, "ESR": 42, "RF": 0, "Anti_CCP": 0,
        "ANA_titer": 3, "Anti_dsDNA": 1, "Complement_C3": 62, "TSH": 2.4,
        "Anti_TPO": 0, "Fasting_Glucose": 90, "Anti_tTG": 0, "HLA_B27": 0,
        "Joint_Pain": 5, "Fatigue": 7, "GI_Symptom": 2, "Skin_Lesion": 1,
    },
    "Type 1 Diabetes": {
        "Age": 16, "Sex": 0, "CRP": 4.0, "ESR": 10, "RF": 0, "Anti_CCP": 0,
        "ANA_titer": 0, "Anti_dsDNA": 0, "Complement_C3": 112, "TSH": 2.8,
        "Anti_TPO": 0, "Fasting_Glucose": 240, "Anti_tTG": 0, "HLA_B27": 0,
        "Joint_Pain": 1, "Fatigue": 5, "GI_Symptom": 2, "Skin_Lesion": 0,
    },
    "Healthy Control": {
        "Age": 35, "Sex": 0, "CRP": 2.0, "ESR": 8, "RF": 0, "Anti_CCP": 0,
        "ANA_titer": 0, "Anti_dsDNA": 0, "Complement_C3": 115, "TSH": 2.2,
        "Anti_TPO": 0, "Fasting_Glucose": 88, "Anti_tTG": 0, "HLA_B27": 0,
        "Joint_Pain": 1, "Fatigue": 1, "GI_Symptom": 0, "Skin_Lesion": 0,
    },
}


# ──────────────────────────────────────────────────────────────────────────────
# Prediction Function
# ──────────────────────────────────────────────────────────────────────────────

def predict_patient(patient_data, models):
    """Run prediction on a patient using classical models."""
    feature_cols = load_feature_cols()
    X = np.array([[patient_data[col] for col in feature_cols]], dtype=float)

    # Scale
    if models["scaler"]:
        X_scaled = models["scaler"].transform(X)
    else:
        X_scaled = X

    results = {}

    # RF prediction
    if models["rf"]:
        rf_proba = models["rf"].predict_proba(X_scaled)[0]
        rf_pred = models["rf"].predict(X_scaled)[0]
        rf_label = models["le"].inverse_transform([rf_pred])[0] if models["le"] else str(rf_pred)
        results["rf"] = {
            "prediction": rf_label,
            "confidence": float(np.max(rf_proba)),
            "probabilities": {
                models["le"].inverse_transform([i])[0]: float(p) for i, p in enumerate(rf_proba)
            },
        }

    # Classical SVM prediction
    if models["csvm"]:
        csvm_proba = models["csvm"].predict_proba(X_scaled)[0]
        csvm_pred = models["csvm"].predict(X_scaled)[0]
        csvm_label = models["le"].inverse_transform([csvm_pred])[0] if models["le"] else str(csvm_pred)
        results["csvm"] = {
            "prediction": csvm_label,
            "confidence": float(np.max(csvm_proba)),
            "probabilities": {
                models["le"].inverse_transform([i])[0]: float(p) for i, p in enumerate(csvm_proba)
            },
        }

    # QSVM prediction (if available)
    if models["qsvm"] and models["pca"] and models["pi_scaler"]:
        try:
            from quantum_kernel import create_feature_map_circuit, compute_kernel_entry
            X_pca = models["pca"].transform(X_scaled)
            X_q = models["pi_scaler"].transform(X_pca)

            X_train_q = load_quantum_train_data()
            if X_train_q is not None:
                n_qubits = X_q.shape[1]
                kernel_circuit = create_feature_map_circuit(n_qubits, 2)

                # Compute kernel vector against training data
                K_new = np.zeros((1, X_train_q.shape[0]))
                for j in range(X_train_q.shape[0]):
                    K_new[0, j] = compute_kernel_entry(kernel_circuit, X_q[0], X_train_q[j])

                qsvm_proba = models["qsvm"].predict_proba(K_new)[0]
                qsvm_pred = models["qsvm"].predict(K_new)[0]
                qsvm_label = models["le"].inverse_transform([qsvm_pred])[0]
                results["qsvm"] = {
                    "prediction": qsvm_label,
                    "confidence": float(np.max(qsvm_proba)),
                    "probabilities": {
                        models["le"].inverse_transform([i])[0]: float(p) for i, p in enumerate(qsvm_proba)
                    },
                }
        except Exception as e:
            results["qsvm_error"] = str(e)

    return results


# ──────────────────────────────────────────────────────────────────────────────
# Plotly Theme
# ──────────────────────────────────────────────────────────────────────────────

PLOTLY_LAYOUT = dict(
    paper_bgcolor="rgba(0,0,0,0)",
    plot_bgcolor="rgba(15, 19, 56, 0.4)",
    font=dict(family="Inter, sans-serif", color="#c4b5fd"),
    title_font=dict(color="#c4b5fd", size=16),
    xaxis=dict(gridcolor="rgba(124, 58, 237, 0.15)", zerolinecolor="rgba(124, 58, 237, 0.2)"),
    yaxis=dict(gridcolor="rgba(124, 58, 237, 0.15)", zerolinecolor="rgba(124, 58, 237, 0.2)"),
    margin=dict(l=40, r=40, t=50, b=40),
)

VIOLET_COLORS = [
    "#7c3aed", "#a855f7", "#c084fc", "#d8b4fe", "#6d28d9",
    "#8b5cf6", "#5b21b6", "#4c1d95", "#a78bfa", "#e9d5ff",
    "#7e22ce", "#9333ea", "#581c87",
]


def apply_layout(fig, height=None, title=None, xaxis_extra=None, yaxis_extra=None, margin_extra=None, barmode=None, legend=None):
    layout_args = {k: v for k, v in PLOTLY_LAYOUT.items() if k not in ["xaxis", "yaxis", "margin"]}
    
    # Merge xaxis
    xaxis_base = PLOTLY_LAYOUT["xaxis"].copy()
    if xaxis_extra:
        xaxis_base.update(xaxis_extra)
    layout_args["xaxis"] = xaxis_base
    
    # Merge yaxis
    yaxis_base = PLOTLY_LAYOUT["yaxis"].copy()
    if yaxis_extra:
        yaxis_base.update(yaxis_extra)
    layout_args["yaxis"] = yaxis_base
    
    # Merge margin
    margin_base = PLOTLY_LAYOUT["margin"].copy()
    if margin_extra:
        margin_base.update(margin_extra)
    layout_args["margin"] = margin_base
    
    if height is not None:
        layout_args["height"] = height
    if title is not None:
        layout_args["title"] = title
    if barmode is not None:
        layout_args["barmode"] = barmode
    if legend is not None:
        layout_args["legend"] = legend
        
    fig.update_layout(**layout_args)


# ──────────────────────────────────────────────────────────────────────────────
# Header
# ──────────────────────────────────────────────────────────────────────────────

def render_header():
    st.markdown("""
    <div style="text-align: center; padding: 20px 0 10px 0;">
        <div style="display: inline-flex; align-items: center; gap: 16px;">
            <div style="
                width: 56px; height: 56px; border-radius: 14px;
                background: linear-gradient(135deg, #7c3aed, #a855f7);
                display: flex; align-items: center; justify-content: center;
                font-size: 28px; box-shadow: 0 8px 24px rgba(124, 58, 237, 0.4);
            ">🧬</div>
            <div>
                <div class="hero-title">QuantumImmune Dx</div>
                <div class="hero-subtitle">Quantum-Kernel ML System for Multi-Autoimmune Disease Detection</div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)


# ──────────────────────────────────────────────────────────────────────────────
# Tab 1: Overview
# ──────────────────────────────────────────────────────────────────────────────

def render_overview():
    st.markdown('<div class="section-title">Problem Statement</div>', unsafe_allow_html=True)
    st.markdown("""
    <div class="glass-card">
        <p style="font-size: 1.05em; line-height: 1.8; color: #c4b5fd;">
            Autoimmune diseases affect <strong>5–8% of the global population</strong> across 80+ distinct conditions.
            Diagnosis is delayed an average of <strong>4–7 years</strong> due to overlapping, non-specific biomarkers
            and symptom similarity across diseases in early stages. Classical ML models struggle with the high-dimensional,
            overlapping, imbalanced biomarker data characteristic of this diagnostic challenge.
        </p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown('<div class="section-title">Hypothesis</div>', unsafe_allow_html=True)
    st.markdown("""
    <div class="glass-card">
        <p style="font-size: 1.05em; line-height: 1.8; color: #c4b5fd;">
            <strong>Quantum feature maps</strong>, which embed data into an exponentially large Hilbert space via
            entangling circuits, can capture <strong>higher-order multi-marker interactions</strong> more efficiently
            than classical kernels — potentially improving separability in overlapping-biomarker, multi-class
            autoimmune classification, even under simulation.
        </p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown('<div class="section-title">System Architecture</div>', unsafe_allow_html=True)
    arch_path = os.path.join("assets", "architecture_diagram.png")
    if os.path.exists(arch_path):
        st.image(arch_path, use_container_width=True)
    else:
        st.info("Architecture diagram not found. Run the pipeline to generate it.")

    # Disease coverage
    st.markdown('<div class="section-title">Disease Coverage — 13 Classes</div>', unsafe_allow_html=True)
    diseases = [
        ("Rheumatoid Arthritis", "Joint/Systemic", "RF, Anti-CCP, CRP, ESR"),
        ("Systemic Lupus Erythematosus", "Systemic", "ANA, Anti-dsDNA, Complement C3"),
        ("Type 1 Diabetes", "Endocrine", "Fasting glucose, HbA1c"),
        ("Hashimoto's Thyroiditis", "Endocrine", "TSH (high), Anti-TPO"),
        ("Graves' Disease", "Endocrine", "TSH (low), Anti-TPO"),
        ("Multiple Sclerosis", "Neurological", "Fatigue score, oligoclonal proxy"),
        ("Psoriatic Arthritis", "Dermatological/Joint", "CRP, Skin lesion, Joint pain"),
        ("Celiac Disease", "Gastrointestinal", "Anti-tTG, GI symptoms"),
        ("Inflammatory Bowel Disease", "Gastrointestinal", "CRP, GI symptoms"),
        ("Sjogren's Syndrome", "Exocrine/Systemic", "ANA, RF, ESR"),
        ("Ankylosing Spondylitis", "Joint/Spine", "HLA-B27, ESR, Joint pain"),
        ("Autoimmune Hepatitis", "Hepatic", "ANA, Anti-dsDNA, GI symptoms"),
        ("Healthy", "Control", "Normal ranges across all markers"),
    ]

    disease_df = pd.DataFrame(diseases, columns=["Disease", "Category", "Key Biomarkers"])
    disease_df.index = range(1, len(disease_df) + 1)

    fig = go.Figure(data=[go.Table(
        header=dict(
            values=["#", "Disease", "Category", "Key Biomarkers"],
            fill_color="rgba(124, 58, 237, 0.3)",
            font=dict(color="#c4b5fd", size=13, family="Inter"),
            align="left",
            line_color="rgba(124, 58, 237, 0.2)",
            height=36,
        ),
        cells=dict(
            values=[list(range(1, 14)), disease_df["Disease"], disease_df["Category"], disease_df["Key Biomarkers"]],
            fill_color="rgba(15, 19, 56, 0.4)",
            font=dict(color="#a5a0c8", size=12, family="Inter"),
            align="left",
            line_color="rgba(124, 58, 237, 0.1)",
            height=30,
        ),
    )])
    apply_layout(fig, height=480, margin_extra=dict(l=0, r=0, t=10, b=10))
    st.plotly_chart(fig, use_container_width=True)


# ──────────────────────────────────────────────────────────────────────────────
# Tab 2: Live Prediction
# ──────────────────────────────────────────────────────────────────────────────

def render_prediction(models):
    # Disclaimer banner
    st.markdown("""
    <div class="disclaimer-banner">
        ⚠️ <strong>DISCLAIMER:</strong> Prototype for research/educational purposes only — not a medical diagnosis.
        All predictions are generated by ML models trained on synthetic data and should not be used for clinical decision-making.
    </div>
    """, unsafe_allow_html=True)

    # Sidebar inputs
    with st.sidebar:
        st.markdown('<div class="section-title">Patient Input</div>', unsafe_allow_html=True)

        # Demo presets
        st.markdown("**Quick Demo Presets**")
        preset_cols = st.columns(2)
        selected_preset = None
        with preset_cols[0]:
            if st.button("🦴 RA Patient", use_container_width=True):
                selected_preset = "Rheumatoid Arthritis"
            if st.button("🩸 T1D Patient", use_container_width=True):
                selected_preset = "Type 1 Diabetes"
        with preset_cols[1]:
            if st.button("🦋 SLE Patient", use_container_width=True):
                selected_preset = "Systemic Lupus (SLE)"
            if st.button("💚 Healthy", use_container_width=True):
                selected_preset = "Healthy Control"

        # Get default values
        if selected_preset:
            st.session_state["demo_preset"] = selected_preset
            preset_vals = DEMO_PATIENTS[selected_preset]
            st.session_state["age_input"] = int(preset_vals["Age"])
            st.session_state["sex_input"] = "Female" if preset_vals["Sex"] == 1 else "Male"
            st.session_state["crp_input"] = float(preset_vals["CRP"])
            st.session_state["esr_input"] = int(preset_vals["ESR"])
            st.session_state["rf_input"] = "Positive" if preset_vals["RF"] == 1 else "Negative"
            st.session_state["accp_input"] = "Positive" if preset_vals["Anti_CCP"] == 1 else "Negative"
            st.session_state["ana_input"] = ["Negative", "1:80", "1:160", "1:320+"][preset_vals["ANA_titer"]]
            st.session_state["dsdna_input"] = "Positive" if preset_vals["Anti_dsDNA"] == 1 else "Negative"
            st.session_state["c3_input"] = int(preset_vals["Complement_C3"])
            st.session_state["tsh_input"] = float(preset_vals["TSH"])
            st.session_state["tpo_input"] = "Positive" if preset_vals["Anti_TPO"] == 1 else "Negative"
            st.session_state["glu_input"] = int(preset_vals["Fasting_Glucose"])
            st.session_state["ttg_input"] = "Positive" if preset_vals["Anti_tTG"] == 1 else "Negative"
            st.session_state["hla_input"] = "Positive" if preset_vals["HLA_B27"] == 1 else "Negative"
            st.session_state["jp_input"] = int(preset_vals["Joint_Pain"])
            st.session_state["fat_input"] = int(preset_vals["Fatigue"])
            st.session_state["gi_input"] = int(preset_vals["GI_Symptom"])
            st.session_state["skin_input"] = "Yes" if preset_vals["Skin_Lesion"] == 1 else "No"
        
        defaults = DEMO_PATIENTS.get(st.session_state.get("demo_preset", ""), {})

        st.markdown("---")
        st.markdown("**Demographics**")
        age = st.number_input("Age", 5, 85, defaults.get("Age", 40), key="age_input")
        sex = st.selectbox("Sex", ["Female", "Male"], index=1 - defaults.get("Sex", 0), key="sex_input")
        sex_val = 1 if sex == "Female" else 0

        st.markdown("**Inflammation Markers**")
        crp = st.number_input("CRP (mg/L)", 0.0, 150.0, float(defaults.get("CRP", 3.0)), step=0.5, key="crp_input")
        esr = st.number_input("ESR (mm/hr)", 0, 100, defaults.get("ESR", 10), key="esr_input")

        st.markdown("**Autoantibody Panel**")
        rf = st.selectbox("Rheumatoid Factor (RF)", ["Negative", "Positive"], index=defaults.get("RF", 0), key="rf_input")
        anti_ccp = st.selectbox("Anti-CCP", ["Negative", "Positive"], index=defaults.get("Anti_CCP", 0), key="accp_input")
        ana_titer = st.selectbox("ANA Titer", ["Negative", "1:80", "1:160", "1:320+"],
                                  index=defaults.get("ANA_titer", 0), key="ana_input")
        anti_dsdna = st.selectbox("Anti-dsDNA", ["Negative", "Positive"], index=defaults.get("Anti_dsDNA", 0), key="dsdna_input")

        st.markdown("**Organ-Specific Labs**")
        c3 = st.number_input("Complement C3 (mg/dL)", 30, 180, defaults.get("Complement_C3", 110), key="c3_input")
        tsh = st.number_input("TSH (mIU/L)", 0.01, 15.0, float(defaults.get("TSH", 2.5)), step=0.1, key="tsh_input")
        anti_tpo = st.selectbox("Anti-TPO", ["Negative", "Positive"], index=defaults.get("Anti_TPO", 0), key="tpo_input")
        glucose = st.number_input("Fasting Glucose (mg/dL)", 60, 400, defaults.get("Fasting_Glucose", 90), key="glu_input")
        anti_ttg = st.selectbox("Anti-tTG", ["Negative", "Positive"], index=defaults.get("Anti_tTG", 0), key="ttg_input")
        hla_b27 = st.selectbox("HLA-B27", ["Negative", "Positive"], index=defaults.get("HLA_B27", 0), key="hla_input")

        st.markdown("**Symptom Scores**")
        joint_pain = st.slider("Joint Pain Score", 0, 10, defaults.get("Joint_Pain", 1), key="jp_input")
        fatigue = st.slider("Fatigue Score", 0, 10, defaults.get("Fatigue", 2), key="fat_input")
        gi_symptom = st.slider("GI Symptom Score", 0, 10, defaults.get("GI_Symptom", 1), key="gi_input")
        skin_lesion = st.selectbox("Skin Lesion", ["No", "Yes"], index=defaults.get("Skin_Lesion", 0), key="skin_input")

        run_prediction = st.button("🔬 Run Prediction", use_container_width=True, type="primary")

    # Build patient data dict
    patient_data = {
        "Age": age, "Sex": sex_val, "CRP": crp, "ESR": esr,
        "RF": 1 if rf == "Positive" else 0,
        "Anti_CCP": 1 if anti_ccp == "Positive" else 0,
        "ANA_titer": ["Negative", "1:80", "1:160", "1:320+"].index(ana_titer),
        "Anti_dsDNA": 1 if anti_dsdna == "Positive" else 0,
        "Complement_C3": c3, "TSH": tsh,
        "Anti_TPO": 1 if anti_tpo == "Positive" else 0,
        "Fasting_Glucose": glucose,
        "Anti_tTG": 1 if anti_ttg == "Positive" else 0,
        "HLA_B27": 1 if hla_b27 == "Positive" else 0,
        "Joint_Pain": joint_pain, "Fatigue": fatigue,
        "GI_Symptom": gi_symptom,
        "Skin_Lesion": 1 if skin_lesion == "Yes" else 0,
    }

    if run_prediction or st.session_state.get("demo_preset"):
        if st.session_state.get("demo_preset") and not run_prediction:
            # Auto-run on demo preset
            pass

        with st.spinner("Running prediction..."):
            results = predict_patient(patient_data, models)

        if not results:
            st.error("No models available. Please run `python train_models.py` first.")
            return

        # Use RF as primary prediction (most reliable)
        primary = results.get("rf", results.get("csvm", {}))
        if not primary:
            st.error("Prediction models not loaded.")
            return

        # Main prediction result
        col1, col2 = st.columns([2, 1])
        with col1:
            st.markdown(f"""
            <div class="prediction-result">
                <div class="prediction-disease">{primary['prediction']}</div>
                <div class="prediction-confidence">Confidence: {primary['confidence']:.1%}</div>
                <div style="margin-top: 12px;">
                    <span class="synthetic-badge">Training Data: Synthetic</span>
                    <span class="simulated-badge">Quantum: Simulated</span>
                </div>
            </div>
            """, unsafe_allow_html=True)

        with col2:
            # Model agreement
            st.markdown('<div class="glass-card">', unsafe_allow_html=True)
            st.markdown("**Model Predictions**")
            if "rf" in results:
                st.markdown(f"🌲 **Random Forest**: {results['rf']['prediction']} ({results['rf']['confidence']:.1%})")
            if "csvm" in results:
                st.markdown(f"📊 **Classical SVM**: {results['csvm']['prediction']} ({results['csvm']['confidence']:.1%})")
            if "qsvm" in results:
                st.markdown(f"⚛️ **QSVM**: {results['qsvm']['prediction']} ({results['qsvm']['confidence']:.1%})")
            elif "qsvm_error" in results:
                st.markdown("⚛️ **QSVM**: _Unavailable_")
            st.markdown('</div>', unsafe_allow_html=True)

        # Confidence bar chart
        st.markdown('<div class="section-title">Confidence Across All Classes</div>', unsafe_allow_html=True)
        probs = primary.get("probabilities", {})
        if probs:
            sorted_probs = dict(sorted(probs.items(), key=lambda x: x[1], reverse=True))
            classes = list(sorted_probs.keys())
            values = list(sorted_probs.values())

            colors = ["#a855f7" if c == primary["prediction"] else "rgba(124, 58, 237, 0.3)" for c in classes]

            fig = go.Figure(go.Bar(
                x=values, y=classes, orientation="h",
                marker=dict(color=colors, line=dict(color="rgba(168, 85, 247, 0.5)", width=1)),
                text=[f"{v:.1%}" for v in values],
                textposition="auto",
                textfont=dict(color="white", size=11),
            ))
            apply_layout(
                fig,
                height=420,
                yaxis_extra=dict(autorange="reversed"),
                xaxis_extra=dict(title="Confidence", tickformat=".0%"),
            )
            st.plotly_chart(fig, use_container_width=True)

        # Feature importance (proxy explanation)
        st.markdown('<div class="section-title">Top Contributing Markers</div>', unsafe_allow_html=True)
        st.markdown("""
        <div style="color: #8b7ec8; font-size: 0.85em; margin-bottom: 12px; font-style: italic;">
            Proxy explanation via Random Forest feature importance — QSVM has no native feature importance.
        </div>
        """, unsafe_allow_html=True)

        fi = load_feature_importance()
        if fi:
            top_features = dict(list(fi.items())[:8])
            fig_fi = go.Figure(go.Bar(
                x=list(top_features.values()),
                y=list(top_features.keys()),
                orientation="h",
                marker=dict(
                    color=list(top_features.values()),
                    colorscale=[[0, "rgba(124, 58, 237, 0.3)"], [1, "#a855f7"]],
                    line=dict(color="rgba(168, 85, 247, 0.5)", width=1),
                ),
                text=[f"{v:.3f}" for v in top_features.values()],
                textposition="auto",
                textfont=dict(color="white", size=11),
            ))
            apply_layout(
                fig_fi,
                height=320,
                yaxis_extra=dict(autorange="reversed"),
                xaxis_extra=dict(title="Importance"),
                title="Top 8 Feature Importances (Random Forest)",
            )
            st.plotly_chart(fig_fi, use_container_width=True)
    else:
        # Empty state
        st.markdown("""
        <div class="glass-card" style="text-align: center; padding: 60px;">
            <div style="font-size: 3em; margin-bottom: 16px;">🧬</div>
            <div style="font-size: 1.3em; color: #c4b5fd; font-weight: 600; margin-bottom: 8px;">
                Ready for Prediction
            </div>
            <div style="color: #8b7ec8; font-size: 0.95em;">
                Use the sidebar to enter patient data or select a demo preset, then click "Run Prediction".
            </div>
        </div>
        """, unsafe_allow_html=True)


# ──────────────────────────────────────────────────────────────────────────────
# Tab 3: Model Comparison
# ──────────────────────────────────────────────────────────────────────────────

def render_comparison():
    metrics = load_metrics()
    benchmarks = load_runtime_benchmarks()

    if not metrics:
        st.warning("No metrics found. Please run `python train_models.py` first.")
        return

    # Metrics table
    st.markdown('<div class="section-title">Performance Metrics</div>', unsafe_allow_html=True)

    metric_cols = st.columns(len(metrics))
    for idx, (model_name, m) in enumerate(metrics.items()):
        with metric_cols[idx]:
            st.markdown(f"""
            <div class="metric-card">
                <div style="color: #a855f7; font-weight: 700; font-size: 1.1em; margin-bottom: 12px;">{model_name}</div>
                <div class="metric-value">{m.get('accuracy', 0):.1%}</div>
                <div class="metric-label">Accuracy</div>
                <div style="margin-top: 12px; color: #a5a0c8; font-size: 0.9em;">
                    F1: {m.get('f1_macro', 0):.3f}<br>
                    Precision: {m.get('precision_macro', 0):.3f}<br>
                    Recall: {m.get('recall_macro', 0):.3f}
                </div>
            </div>
            """, unsafe_allow_html=True)

    # Comparison bar chart
    st.markdown("", unsafe_allow_html=True)
    model_names = list(metrics.keys())
    metric_types = ["accuracy", "f1_macro", "precision_macro", "recall_macro"]
    metric_labels = ["Accuracy", "Macro F1", "Precision", "Recall"]

    fig_comp = go.Figure()
    colors = ["#7c3aed", "#a855f7", "#c084fc", "#d8b4fe"]
    for i, (mt, ml) in enumerate(zip(metric_types, metric_labels)):
        fig_comp.add_trace(go.Bar(
            name=ml,
            x=model_names,
            y=[metrics[m].get(mt, 0) for m in model_names],
            marker_color=colors[i],
            text=[f"{metrics[m].get(mt, 0):.3f}" for m in model_names],
            textposition="auto",
            textfont=dict(color="white"),
        ))
    apply_layout(
        fig_comp,
        barmode="group",
        title="Model Comparison — All Metrics",
        yaxis_extra=dict(title="Score", range=[0, 1.05]),
        height=400,
        legend=dict(
            bgcolor="rgba(15, 19, 56, 0.8)",
            bordercolor="rgba(124, 58, 237, 0.3)",
            font=dict(color="#c4b5fd"),
        ),
    )
    st.plotly_chart(fig_comp, use_container_width=True)

    # Confusion matrices
    st.markdown('<div class="section-title">Confusion Matrices</div>', unsafe_allow_html=True)

    le = None
    models_data = load_models()
    if models_data and models_data.get("le"):
        le = models_data["le"]
        class_names = list(le.classes_)
    else:
        class_names = [f"Class {i}" for i in range(13)]

    # Short names for display
    short_names = []
    for name in class_names:
        if len(name) > 12:
            parts = name.split()
            short_names.append(parts[0][:8] if len(parts) == 1 else " ".join(p[:4] for p in parts[:2]))
        else:
            short_names.append(name)

    cm_models = {k: v for k, v in metrics.items() if v.get("confusion_matrix")}
    if cm_models:
        cm_cols = st.columns(len(cm_models))
        for idx, (model_name, m) in enumerate(cm_models.items()):
            with cm_cols[idx]:
                cm = np.array(m["confusion_matrix"])
                if cm.size > 0:
                    fig_cm = go.Figure(go.Heatmap(
                        z=cm,
                        x=short_names[:cm.shape[1]],
                        y=short_names[:cm.shape[0]],
                        colorscale=[
                            [0, "rgba(15, 19, 56, 0.8)"],
                            [0.5, "rgba(124, 58, 237, 0.5)"],
                            [1, "#a855f7"],
                        ],
                        text=cm,
                        texttemplate="%{text}",
                        textfont=dict(size=9, color="white"),
                        hovertemplate="True: %{y}<br>Predicted: %{x}<br>Count: %{z}<extra></extra>",
                    ))
                    apply_layout(
                        fig_cm,
                        title=f"{model_name}",
                        xaxis_extra=dict(title="Predicted", tickangle=45, tickfont=dict(size=8)),
                        yaxis_extra=dict(title="True", autorange="reversed", tickfont=dict(size=8)),
                        height=450,
                    )
                    st.plotly_chart(fig_cm, use_container_width=True)

    # Runtime benchmark (the "wow" chart)
    st.markdown('<div class="section-title">Quantum Kernel Computation — Sequential vs Parallel</div>', unsafe_allow_html=True)

    if benchmarks:
        col1, col2, col3 = st.columns(3)
        with col1:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-value">{benchmarks.get('sequential_time', 0):.2f}s</div>
                <div class="metric-label">Sequential Time</div>
            </div>
            """, unsafe_allow_html=True)
        with col2:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-value">{benchmarks.get('parallel_time', 0):.2f}s</div>
                <div class="metric-label">Parallel Time ({benchmarks.get('n_cores', '?')} cores)</div>
            </div>
            """, unsafe_allow_html=True)
        with col3:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-value">{benchmarks.get('speedup', 0):.1f}x</div>
                <div class="metric-label">Speedup</div>
            </div>
            """, unsafe_allow_html=True)

        # Bar chart
        fig_bench = go.Figure()
        fig_bench.add_trace(go.Bar(
            x=["Sequential (1 core)", f"Parallel ({benchmarks.get('n_cores', '?')} cores)"],
            y=[benchmarks.get("sequential_time", 0), benchmarks.get("parallel_time", 0)],
            marker=dict(
                color=["rgba(124, 58, 237, 0.5)", "#a855f7"],
                line=dict(color=["#7c3aed", "#c084fc"], width=2),
            ),
            text=[f"{benchmarks.get('sequential_time', 0):.3f}s", f"{benchmarks.get('parallel_time', 0):.3f}s"],
            textposition="auto",
            textfont=dict(color="white", size=14),
        ))
        apply_layout(
            fig_bench,
            title=f"Kernel Matrix Computation ({benchmarks.get('sample_size', '?')} samples, "
                  f"{benchmarks.get('sequential_pairs', '?')} pairs)",
            yaxis_extra=dict(title="Time (seconds)"),
            height=380,
        )

        # Add speedup annotation
        fig_bench.add_annotation(
            x=1, y=benchmarks.get("parallel_time", 0),
            text=f"<b>{benchmarks.get('speedup', 0):.1f}x faster</b>",
            showarrow=True, arrowhead=2,
            arrowcolor="#a855f7",
            font=dict(color="#a855f7", size=14),
            ax=60, ay=-40,
        )

        st.plotly_chart(fig_bench, use_container_width=True)

        st.markdown("""
        <div class="glass-card" style="font-size: 0.9em; color: #8b7ec8;">
            <strong>Note:</strong> This benchmark demonstrates multi-threaded parallelization of quantum kernel
            matrix computation on a classical CPU. The "parallel processing" approximates the concurrency concept
            of quantum computation — it does not represent actual quantum speedup.
            Quantum circuits are simulated, not run on real quantum hardware.
        </div>
        """, unsafe_allow_html=True)
    else:
        st.info("Runtime benchmarks not available. Run `python train_models.py` with quantum pipeline enabled.")


# ──────────────────────────────────────────────────────────────────────────────
# Tab 4: Methodology & Disclosures
# ──────────────────────────────────────────────────────────────────────────────

def render_methodology():
    st.markdown('<div class="section-title">System Architecture</div>', unsafe_allow_html=True)
    arch_path = os.path.join("assets", "architecture_diagram.png")
    if os.path.exists(arch_path):
        st.image(arch_path, use_container_width=True)

    st.markdown('<div class="section-title">Technology Stack</div>', unsafe_allow_html=True)
    st.markdown("""
    <table class="tech-table">
        <tr><th>Layer</th><th>Technology</th></tr>
        <tr><td>Language</td><td>Python 3.10+</td></tr>
        <tr><td>Quantum Simulation</td><td>PennyLane (lightning.qubit) — statevector simulator</td></tr>
        <tr><td>Classical ML</td><td>scikit-learn (Random Forest, SVM)</td></tr>
        <tr><td>Parallelization</td><td>concurrent.futures.ThreadPoolExecutor</td></tr>
        <tr><td>Data Handling</td><td>pandas, NumPy</td></tr>
        <tr><td>Frontend</td><td>Streamlit (wide layout, custom CSS)</td></tr>
        <tr><td>Visualization</td><td>Plotly (interactive charts)</td></tr>
        <tr><td>Model Persistence</td><td>joblib</td></tr>
    </table>
    """, unsafe_allow_html=True)

    st.markdown('<div class="section-title">Quantum Kernel Method</div>', unsafe_allow_html=True)
    st.markdown("""
    <div class="glass-card">
        <p style="color: #c4b5fd; line-height: 1.8;">
            <strong>Feature Map:</strong> Angle encoding (RY rotations) maps each feature to a qubit rotation angle,
            followed by entangling CNOT layers to capture feature interactions in an exponentially large Hilbert space.<br><br>
            <strong>Kernel Computation:</strong> The quantum kernel K(x₁, x₂) = |⟨φ(x₁)|φ(x₂)⟩|² measures
            state fidelity between two quantum-encoded data points. This is computed classically via statevector simulation.<br><br>
            <strong>Classification:</strong> The precomputed kernel matrix is fed to scikit-learn's SVC(kernel='precomputed')
            for multi-class classification via one-vs-rest strategy.<br><br>
            <strong>Circuit:</strong> 10 qubits, depth-2 encoding + circular CNOT entanglement.
            Features reduced from 18 to 10 via PCA before quantum encoding.
        </p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown('<div class="section-title">Honest Disclosures</div>', unsafe_allow_html=True)

    disclosures = [
        ("No Real Quantum Hardware",
         "All quantum circuits are simulated on a classical CPU using PennyLane's lightning.qubit statevector simulator. "
         "No real quantum processing unit (QPU) — such as IBM Quantum, IonQ, or Rigetti — was used at any point. "
         "This is explicitly a simulation-based proof-of-concept."),
        ("Parallel Processing ≠ Quantum Speedup",
         "The parallelized kernel matrix computation demonstrates multi-threaded classical concurrency across CPU cores. "
         "This approximates the concept of quantum parallel processing but does NOT provide actual quantum speedup or "
         "quantum advantage. The speedup shown is classical multi-core parallelism."),
        ("Synthetic Training Data",
         "All 650 training samples across 13 disease classes are synthetically generated using clinically realistic "
         "biomarker distributions sourced from published medical literature. No real patient data was used. "
         "Synthetic data may not fully capture real-world complexity, co-morbidities, or population variability."),
        ("Limited Dataset Size & Generalizability",
         "With only ~50 samples per class, the dataset is far too small for clinical validation. "
         "Results are indicative of method feasibility, not diagnostic accuracy. A production system would require "
         "thousands of real, validated patient records per disease class."),
        ("Proof-of-Concept, Not a Clinical Tool",
         "This prototype is built for a hackathon to explore whether quantum kernel methods show promise for "
         "multi-autoimmune classification. It is NOT a medical device, NOT validated for clinical use, and should "
         "NOT be used to make healthcare decisions. Any resemblance to diagnostic capability is purely illustrative."),
    ]

    for title, body in disclosures:
        st.markdown(f"""
        <div class="disclosure-card">
            <div style="color: #a855f7; font-weight: 700; font-size: 1.05em; margin-bottom: 8px;">⚡ {title}</div>
            <div>{body}</div>
        </div>
        """, unsafe_allow_html=True)


# ──────────────────────────────────────────────────────────────────────────────
# Main App
# ──────────────────────────────────────────────────────────────────────────────

def main():
    render_header()
    models = load_models()

    tab1, tab2, tab3, tab4 = st.tabs([
        "📋 Overview",
        "🔬 Live Prediction",
        "📊 Model Comparison",
        "📖 Methodology & Disclosures",
    ])

    with tab1:
        render_overview()
    with tab2:
        render_prediction(models)
    with tab3:
        render_comparison()
    with tab4:
        render_methodology()


if __name__ == "__main__":
    main()

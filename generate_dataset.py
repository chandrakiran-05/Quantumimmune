"""
QuantumImmune Dx — Synthetic Dataset Generator
Generates clinically realistic synthetic patient data for 13 autoimmune disease classes.

Each disease has characteristic biomarker distributions sourced from published clinical
reference ranges. All data is synthetic — explicitly labeled for transparency.

Usage: python generate_dataset.py
Output: data/autoimmune_dataset.csv (~650 rows, 13 classes × 50 patients)
"""

import numpy as np
import pandas as pd
import os

SEED = 42
SAMPLES_PER_CLASS = 50

# ──────────────────────────────────────────────────────────────────────────────
# Disease profiles: {feature: (mean, std)} or {feature: probability} for binary
# Based on published clinical literature reference ranges.
# ──────────────────────────────────────────────────────────────────────────────

HEALTHY_PROFILE = {
    "Age": (40, 15),
    "Sex": 0.5,  # P(female)
    "CRP": (3, 2),            # mg/L, normal <5
    "ESR": (10, 5),           # mm/hr, normal <20
    "RF": 0.05,               # P(positive)
    "Anti_CCP": 0.02,
    "ANA_titer": (0, 0.3),    # ordinal 0-3 (neg, 1:80, 1:160, 1:320+)
    "Anti_dsDNA": 0.02,
    "Complement_C3": (110, 15),  # mg/dL, normal 90-180
    "TSH": (2.5, 1.0),       # mIU/L, normal 0.4-4.0
    "Anti_TPO": 0.03,
    "Fasting_Glucose": (90, 8),  # mg/dL, normal 70-100
    "Anti_tTG": 0.02,
    "HLA_B27": 0.08,
    "Joint_Pain": (1, 1),     # 0-10
    "Fatigue": (2, 1.5),      # 0-10
    "GI_Symptom": (1, 1),     # 0-10
    "Skin_Lesion": 0.03,
}

DISEASE_PROFILES = {
    "Rheumatoid Arthritis": {
        "Age": (52, 12),
        "Sex": 0.7,  # More common in women
        "CRP": (35, 20),        # Elevated
        "ESR": (45, 18),        # Elevated
        "RF": 0.75,             # ~70-80% positive
        "Anti_CCP": 0.70,       # ~65-75% positive
        "ANA_titer": (1, 0.8),  # Sometimes mildly positive
        "Anti_dsDNA": 0.05,
        "Complement_C3": (105, 15),
        "TSH": (2.5, 1.0),
        "Anti_TPO": 0.05,
        "Fasting_Glucose": (95, 10),
        "Anti_tTG": 0.03,
        "HLA_B27": 0.10,
        "Joint_Pain": (7, 1.5),   # High
        "Fatigue": (6, 1.5),
        "GI_Symptom": (1.5, 1),
        "Skin_Lesion": 0.10,
    },
    "Systemic Lupus Erythematosus": {
        "Age": (32, 10),
        "Sex": 0.90,  # Predominantly women 15-45
        "CRP": (20, 15),
        "ESR": (40, 20),
        "RF": 0.20,
        "Anti_CCP": 0.05,
        "ANA_titer": (2.5, 0.6),  # High positive (1:160-1:320+)
        "Anti_dsDNA": 0.70,       # Key marker
        "Complement_C3": (65, 15), # LOW — hallmark
        "TSH": (2.5, 1.0),
        "Anti_TPO": 0.08,
        "Fasting_Glucose": (92, 10),
        "Anti_tTG": 0.03,
        "HLA_B27": 0.08,
        "Joint_Pain": (5, 2),
        "Fatigue": (7, 1.5),     # High fatigue
        "GI_Symptom": (2, 1.5),
        "Skin_Lesion": 0.55,     # Malar rash, discoid lesions
    },
    "Type 1 Diabetes": {
        "Age": (18, 8),           # Younger onset
        "Sex": 0.50,
        "CRP": (5, 3),
        "ESR": (12, 6),
        "RF": 0.04,
        "Anti_CCP": 0.03,
        "ANA_titer": (0.3, 0.4),
        "Anti_dsDNA": 0.03,
        "Complement_C3": (110, 15),
        "TSH": (2.8, 1.2),
        "Anti_TPO": 0.10,         # Slight increase (autoimmune clustering)
        "Fasting_Glucose": (210, 55),  # HIGH — hallmark
        "Anti_tTG": 0.08,         # Celiac co-occurrence
        "HLA_B27": 0.08,
        "Joint_Pain": (1.5, 1),
        "Fatigue": (5, 2),
        "GI_Symptom": (2, 1.5),
        "Skin_Lesion": 0.05,
    },
    "Hashimoto's Thyroiditis": {
        "Age": (45, 12),
        "Sex": 0.80,              # Much more common in women
        "CRP": (6, 4),
        "ESR": (18, 8),
        "RF": 0.08,
        "Anti_CCP": 0.03,
        "ANA_titer": (0.5, 0.5),
        "Anti_dsDNA": 0.04,
        "Complement_C3": (108, 15),
        "TSH": (8.0, 2.5),        # HIGH — hypothyroid hallmark
        "Anti_TPO": 0.90,         # Key marker
        "Fasting_Glucose": (95, 10),
        "Anti_tTG": 0.03,
        "HLA_B27": 0.07,
        "Joint_Pain": (2, 1.5),
        "Fatigue": (7, 1.5),      # Hypothyroid fatigue
        "GI_Symptom": (2, 1.5),
        "Skin_Lesion": 0.08,
    },
    "Graves' Disease": {
        "Age": (38, 12),
        "Sex": 0.80,
        "CRP": (8, 5),
        "ESR": (20, 10),
        "RF": 0.06,
        "Anti_CCP": 0.03,
        "ANA_titer": (0.5, 0.5),
        "Anti_dsDNA": 0.04,
        "Complement_C3": (110, 15),
        "TSH": (0.15, 0.10),      # Very LOW — hyperthyroid hallmark
        "Anti_TPO": 0.65,         # Often positive
        "Fasting_Glucose": (100, 12),
        "Anti_tTG": 0.03,
        "HLA_B27": 0.07,
        "Joint_Pain": (2, 1.5),
        "Fatigue": (5, 2),
        "GI_Symptom": (3, 2),     # Diarrhea common
        "Skin_Lesion": 0.15,      # Pretibial myxedema
    },
    "Multiple Sclerosis": {
        "Age": (33, 8),
        "Sex": 0.70,
        "CRP": (6, 4),
        "ESR": (15, 8),
        "RF": 0.05,
        "Anti_CCP": 0.03,
        "ANA_titer": (0.3, 0.4),
        "Anti_dsDNA": 0.03,
        "Complement_C3": (108, 15),
        "TSH": (2.5, 1.0),
        "Anti_TPO": 0.06,
        "Fasting_Glucose": (92, 10),
        "Anti_tTG": 0.03,
        "HLA_B27": 0.08,
        "Joint_Pain": (2, 1.5),
        "Fatigue": (8, 1.2),      # Extreme fatigue — hallmark
        "GI_Symptom": (2, 1.5),
        "Skin_Lesion": 0.05,
    },
    "Psoriatic Arthritis": {
        "Age": (42, 12),
        "Sex": 0.50,
        "CRP": (25, 15),          # Elevated
        "ESR": (30, 15),
        "RF": 0.10,               # Usually RF negative (differentiator from RA)
        "Anti_CCP": 0.05,
        "ANA_titer": (0.3, 0.4),
        "Anti_dsDNA": 0.03,
        "Complement_C3": (110, 15),
        "TSH": (2.5, 1.0),
        "Anti_TPO": 0.05,
        "Fasting_Glucose": (98, 12),
        "Anti_tTG": 0.03,
        "HLA_B27": 0.20,
        "Joint_Pain": (6, 2),
        "Fatigue": (5, 2),
        "GI_Symptom": (1.5, 1),
        "Skin_Lesion": 0.85,      # KEY — psoriatic plaques
    },
    "Celiac Disease": {
        "Age": (28, 15),
        "Sex": 0.60,
        "CRP": (8, 5),
        "ESR": (15, 8),
        "RF": 0.04,
        "Anti_CCP": 0.03,
        "ANA_titer": (0.2, 0.3),
        "Anti_dsDNA": 0.02,
        "Complement_C3": (108, 15),
        "TSH": (3.0, 1.5),       # Thyroid issues co-occur
        "Anti_TPO": 0.10,
        "Fasting_Glucose": (88, 8),
        "Anti_tTG": 0.90,        # KEY marker
        "HLA_B27": 0.08,
        "Joint_Pain": (2, 1.5),
        "Fatigue": (5, 2),
        "GI_Symptom": (8, 1.2),  # KEY — severe GI
        "Skin_Lesion": 0.20,     # Dermatitis herpetiformis
    },
    "Inflammatory Bowel Disease": {
        "Age": (30, 12),
        "Sex": 0.50,
        "CRP": (40, 25),         # Very elevated
        "ESR": (35, 18),
        "RF": 0.05,
        "Anti_CCP": 0.03,
        "ANA_titer": (0.3, 0.4),
        "Anti_dsDNA": 0.03,
        "Complement_C3": (105, 15),
        "TSH": (2.5, 1.0),
        "Anti_TPO": 0.05,
        "Fasting_Glucose": (92, 10),
        "Anti_tTG": 0.08,
        "HLA_B27": 0.12,
        "Joint_Pain": (3, 2),
        "Fatigue": (6, 2),
        "GI_Symptom": (8.5, 1.0), # KEY — severe GI symptoms
        "Skin_Lesion": 0.15,      # Erythema nodosum, pyoderma
    },
    "Sjögren's Syndrome": {
        "Age": (50, 12),
        "Sex": 0.90,              # 9:1 F:M ratio
        "CRP": (8, 5),
        "ESR": (30, 12),          # Often elevated
        "RF": 0.50,               # Often positive
        "Anti_CCP": 0.05,
        "ANA_titer": (2.0, 0.8),  # Often positive
        "Anti_dsDNA": 0.10,
        "Complement_C3": (95, 15),
        "TSH": (2.8, 1.2),
        "Anti_TPO": 0.12,
        "Fasting_Glucose": (92, 10),
        "Anti_tTG": 0.03,
        "HLA_B27": 0.07,
        "Joint_Pain": (4, 2),
        "Fatigue": (7, 1.5),      # Severe fatigue
        "GI_Symptom": (2, 1.5),
        "Skin_Lesion": 0.12,
    },
    "Ankylosing Spondylitis": {
        "Age": (28, 8),
        "Sex": 0.30,              # More common in men
        "CRP": (20, 12),
        "ESR": (30, 15),
        "RF": 0.05,               # Usually negative
        "Anti_CCP": 0.03,
        "ANA_titer": (0.2, 0.3),
        "Anti_dsDNA": 0.02,
        "Complement_C3": (110, 15),
        "TSH": (2.5, 1.0),
        "Anti_TPO": 0.05,
        "Fasting_Glucose": (92, 10),
        "Anti_tTG": 0.03,
        "HLA_B27": 0.90,         # KEY marker — 90%+ positive
        "Joint_Pain": (7, 1.5),   # Back/spinal pain
        "Fatigue": (5, 2),
        "GI_Symptom": (2, 1.5),
        "Skin_Lesion": 0.08,
    },
    "Autoimmune Hepatitis": {
        "Age": (42, 18),
        "Sex": 0.75,
        "CRP": (15, 10),
        "ESR": (35, 15),
        "RF": 0.15,
        "Anti_CCP": 0.03,
        "ANA_titer": (2.0, 0.8),  # Often high
        "Anti_dsDNA": 0.25,       # Can be positive
        "Complement_C3": (90, 15), # Sometimes low
        "TSH": (2.5, 1.0),
        "Anti_TPO": 0.06,
        "Fasting_Glucose": (95, 12),
        "Anti_tTG": 0.05,
        "HLA_B27": 0.08,
        "Joint_Pain": (3, 2),
        "Fatigue": (7, 1.5),      # Severe fatigue
        "GI_Symptom": (4, 2),     # Liver-related GI
        "Skin_Lesion": 0.10,
    },
}


def generate_patient(profile, rng):
    """Generate a single patient row from a disease profile."""
    patient = {}
    for feature, params in profile.items():
        if isinstance(params, tuple):
            mean, std = params
            val = rng.normal(mean, std)
        else:
            # Binary feature — params is probability
            val = 1 if rng.random() < params else 0

        patient[feature] = val

    return patient


def clip_features(df):
    """Clip features to clinically realistic ranges."""
    df["Age"] = df["Age"].clip(5, 85).round(0).astype(int)
    df["Sex"] = df["Sex"].astype(int)  # Already 0/1
    df["CRP"] = df["CRP"].clip(0, 150).round(1)
    df["ESR"] = df["ESR"].clip(0, 100).round(0).astype(int)
    df["RF"] = df["RF"].astype(int)
    df["Anti_CCP"] = df["Anti_CCP"].astype(int)
    df["ANA_titer"] = df["ANA_titer"].clip(0, 3).round(0).astype(int)
    df["Anti_dsDNA"] = df["Anti_dsDNA"].astype(int)
    df["Complement_C3"] = df["Complement_C3"].clip(30, 180).round(0).astype(int)
    df["TSH"] = df["TSH"].clip(0.01, 15).round(2)
    df["Anti_TPO"] = df["Anti_TPO"].astype(int)
    df["Fasting_Glucose"] = df["Fasting_Glucose"].clip(60, 400).round(0).astype(int)
    df["Anti_tTG"] = df["Anti_tTG"].astype(int)
    df["HLA_B27"] = df["HLA_B27"].astype(int)
    df["Joint_Pain"] = df["Joint_Pain"].clip(0, 10).round(0).astype(int)
    df["Fatigue"] = df["Fatigue"].clip(0, 10).round(0).astype(int)
    df["GI_Symptom"] = df["GI_Symptom"].clip(0, 10).round(0).astype(int)
    df["Skin_Lesion"] = df["Skin_Lesion"].astype(int)
    return df


def main():
    rng = np.random.default_rng(SEED)
    all_patients = []

    # Generate healthy patients
    print(f"Generating {SAMPLES_PER_CLASS} Healthy patients...")
    for _ in range(SAMPLES_PER_CLASS):
        patient = generate_patient(HEALTHY_PROFILE, rng)
        patient["Label"] = "Healthy"
        patient["data_source"] = "synthetic"
        all_patients.append(patient)

    # Generate disease patients
    for disease_name, profile in DISEASE_PROFILES.items():
        print(f"Generating {SAMPLES_PER_CLASS} {disease_name} patients...")
        for _ in range(SAMPLES_PER_CLASS):
            patient = generate_patient(profile, rng)
            patient["Label"] = disease_name
            patient["data_source"] = "synthetic"
            all_patients.append(patient)

    df = pd.DataFrame(all_patients)
    df = clip_features(df)

    # Ensure output directory exists
    os.makedirs("data", exist_ok=True)
    output_path = os.path.join("data", "autoimmune_dataset.csv")
    df.to_csv(output_path, index=False)

    print(f"\n[OK] Dataset saved to {output_path}")
    print(f"  Total patients: {len(df)}")
    print(f"  Classes: {df['Label'].nunique()}")
    print(f"\nClass distribution:")
    print(df["Label"].value_counts().to_string())
    print(f"\nFeature columns: {[c for c in df.columns if c not in ['Label', 'data_source']]}")


if __name__ == "__main__":
    main()

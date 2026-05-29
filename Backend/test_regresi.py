import pickle, numpy as np

# Load model (versi baru dengan Polynomial Features)
with open("models_ml/regression_model.pkl", "rb") as f: model  = pickle.load(f)
with open("models_ml/scaler.pkl",           "rb") as f: scaler = pickle.load(f)
with open("models_ml/poly_features.pkl",    "rb") as f: poly   = pickle.load(f)

# Encoding fase: Inkubasi=0, Primordia=1, Produksi=2
FASE = {"Inkubasi": 0, "Primordia": 1, "Produksi": 2}

def predict(suhu, kelembaban, led, infeksi, fase, label):
    fase_enc = FASE.get(fase, 2)
    inp  = np.array([[suhu, kelembaban, led, infeksi, fase_enc]])
    inp_poly   = poly.transform(inp)
    inp_scaled = scaler.transform(inp_poly)
    risk = float(np.clip(model.predict(inp_scaled)[0], 0, 100))
    kat  = "✅ Rendah" if risk < 40 else ("⚠️ Sedang" if risk < 70 else "🚨 Tinggi")
    print(f"{label:<45} → {risk:5.1f}% {kat}")

print("=" * 70)
print("  TEST PREDIKSI MODEL (Regresi Linear + Polynomial Features)")
print("=" * 70)

# Test cases
predict(25.0, 85.0,   30,  0.0, "Produksi",  "Kondisi ideal")
predict(28.0, 80.0,   15, 10.0, "Produksi",  "Normal + sedikit infeksi")
predict(30.0, 78.0,   97, 37.0, "Produksi",  "Suhu agak tinggi + infeksi sedang")
predict(33.0, 98.0,  250, 40.0, "Produksi",  "KRITIS - suhu & kelembaban tinggi")
predict(34.5, 80.0,  226, 45.5, "Produksi",  "SANGAT KRITIS")
predict(22.0, 87.0,  148, 14.6, "Primordia", "Fase Primordia - normal")
predict(22.3, 66.5,   80, 49.8, "Inkubasi",  "Fase Inkubasi + infeksi tinggi")
predict(25.6, 88.0,   11,  0.0, "Produksi",  "Suhu & kelembaban ideal, tanpa infeksi")
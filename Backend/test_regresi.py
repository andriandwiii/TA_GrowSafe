import pickle, numpy as np

# Load model
with open("models_ml/regression_model.pkl", "rb") as f: model = pickle.load(f)
with open("models_ml/scaler.pkl",            "rb") as f: scaler = pickle.load(f)

def predict(suhu, kelembaban, led, infeksi, label):
    inp  = scaler.transform([[suhu, kelembaban, led, infeksi]])
    risk = float(np.clip(model.predict(inp)[0], 0, 100))
    kat  = "✅ Rendah" if risk < 40 else ("⚠️ Sedang" if risk < 70 else "🚨 Tinggi")
    print(f"{label:<35} → {risk:.1f}% {kat}")

# Ubah nilai di sini sesuai kondisi yang ingin kamu test
predict(25.0, 85.0,  30,  0.0, "Kondisi ideal")
predict(33.0, 98.0, 250, 40.0, "KRITIS")
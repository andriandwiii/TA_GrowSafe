# ===================================================================
# File: train_model.py
# Lokasi: GrowSafe/Backend/train_model.py
# Deskripsi: Training script Regresi Linear dengan Polynomial Features.
#
# Fitur yang digunakan:
#   - 4 fitur asli: suhu, kelembaban, total_led_menyala, infected_area_percent
#   - 1 fitur baru: fase (di-encode: Inkubasi=0, Primordia=1, Produksi=2)
#   - Polynomial Features (degree=2): menangkap interaksi dan non-linearity
#     Contoh: suhu², kelembaban², suhu×kelembaban, suhu×infeksi, dll.
#
# Secara teknis TETAP Regresi Linear (linear terhadap koefisien),
# tapi bisa menangkap pola non-linear pada fitur.
#
# Evaluasi: MAE, RMSE, R², dan 5-Fold Cross-Validation.
# ===================================================================

import os
import pickle
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# ── Konfigurasi ───────────────────────────────────────────────────
CSV_PATH       = os.path.join("models_ml", "csv-file", "dataset_growsafe.csv")
OUTPUT_DIR     = "models_ml"
POLY_DEGREE    = 2       # Degree polynomial (2 = kuadratik)
TEST_SIZE      = 0.2     # 80% train, 20% test
RANDOM_STATE   = 42      # Untuk reproduktifitas
CV_FOLDS       = 5       # Jumlah fold cross-validation

# ── Encoding fase pertumbuhan ─────────────────────────────────────
FASE_ENCODING = {
    "Inkubasi":  0,
    "Primordia": 1,
    "Produksi":  2
}


def main():
    print("=" * 70)
    print("  TRAINING MODEL REGRESI LINEAR + POLYNOMIAL FEATURES")
    print("  GrowSafe — Prediksi Risiko Black Mold")
    print("=" * 70)

    # ── 1. Load Dataset ───────────────────────────────────────────
    print(f"\n📂 Memuat dataset dari: {CSV_PATH}")
    df = pd.read_csv(CSV_PATH)
    print(f"   Total data: {len(df)} baris")
    print(f"   Kolom: {list(df.columns)}")

    # ── 2. Preprocessing ─────────────────────────────────────────
    # Encode kolom 'fase' menjadi angka
    df["fase_encoded"] = df["fase"].map(FASE_ENCODING)

    # Cek apakah ada fase yang tidak dikenali
    unknown_fase = df[df["fase_encoded"].isna()]
    if len(unknown_fase) > 0:
        print(f"   ⚠️  {len(unknown_fase)} baris dengan fase tidak dikenali, akan diisi 2 (Produksi)")
        df["fase_encoded"] = df["fase_encoded"].fillna(2)

    # Definisikan fitur (X) dan target (y)
    feature_columns = ["suhu", "kelembaban", "total_led_menyala", "infected_area_percent", "fase_encoded"]
    X = df[feature_columns].values
    y = df["risiko_blackmold"].values

    print(f"\n📊 Statistik fitur:")
    for i, col in enumerate(feature_columns):
        vals = X[:, i]
        print(f"   {col:30s} → min={vals.min():.2f}, max={vals.max():.2f}, mean={vals.mean():.2f}")
    print(f"   {'risiko_blackmold (target)':30s} → min={y.min():.2f}, max={y.max():.2f}, mean={y.mean():.2f}")

    # ── 3. Split Train/Test ───────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )
    print(f"\n📐 Split data:")
    print(f"   Training : {len(X_train)} data ({(1-TEST_SIZE)*100:.0f}%)")
    print(f"   Testing  : {len(X_test)} data ({TEST_SIZE*100:.0f}%)")

    # ── 4. Polynomial Features ────────────────────────────────────
    print(f"\n🔧 Membuat Polynomial Features (degree={POLY_DEGREE})...")
    poly = PolynomialFeatures(degree=POLY_DEGREE, include_bias=False)
    X_train_poly = poly.fit_transform(X_train)
    X_test_poly  = poly.transform(X_test)

    feature_names = poly.get_feature_names_out(feature_columns)
    print(f"   Fitur asli     : {len(feature_columns)} fitur")
    print(f"   Setelah poly   : {len(feature_names)} fitur")
    print(f"   Fitur baru meliputi:")

    # Tampilkan beberapa fitur polynomial yang paling relevan
    interesting = [f for f in feature_names if "^2" in f or (" " in f and "fase" not in f)]
    for f in interesting[:10]:
        print(f"     • {f}")
    if len(interesting) > 10:
        print(f"     • ... dan {len(interesting) - 10} fitur lainnya")

    # ── 5. Scaling ────────────────────────────────────────────────
    print(f"\n⚖️  Menerapkan StandardScaler...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_poly)
    X_test_scaled  = scaler.transform(X_test_poly)

    # ── 6. Training ───────────────────────────────────────────────
    print(f"\n🚀 Melatih model Regresi Linear...")
    model = LinearRegression()
    model.fit(X_train_scaled, y_train)

    # ── 7. Evaluasi pada Test Set ─────────────────────────────────
    y_pred_train = np.clip(model.predict(X_train_scaled), 0, 100)
    y_pred_test  = np.clip(model.predict(X_test_scaled), 0, 100)

    # Metrik Training
    mae_train  = mean_absolute_error(y_train, y_pred_train)
    rmse_train = np.sqrt(mean_squared_error(y_train, y_pred_train))
    r2_train   = r2_score(y_train, y_pred_train)

    # Metrik Testing
    mae_test  = mean_absolute_error(y_test, y_pred_test)
    rmse_test = np.sqrt(mean_squared_error(y_test, y_pred_test))
    r2_test   = r2_score(y_test, y_pred_test)

    print(f"\n{'='*70}")
    print(f"  📈 HASIL EVALUASI MODEL")
    print(f"{'='*70}")
    print(f"\n  {'Metrik':<30} {'Training':>12} {'Testing':>12}")
    print(f"  {'─'*54}")
    print(f"  {'MAE (Mean Absolute Error)':<30} {mae_train:>11.4f}% {mae_test:>11.4f}%")
    print(f"  {'RMSE (Root Mean Sq. Error)':<30} {rmse_train:>11.4f}% {rmse_test:>11.4f}%")
    print(f"  {'R² Score':<30} {r2_train:>12.4f} {r2_test:>12.4f}")

    # ── 8. Cross-Validation ───────────────────────────────────────
    print(f"\n🔄 {CV_FOLDS}-Fold Cross-Validation...")

    # Perlu transform seluruh X untuk cross-validation
    X_poly_all   = poly.transform(X)
    X_scaled_all = scaler.transform(X_poly_all)

    cv_r2   = cross_val_score(model, X_scaled_all, y, cv=CV_FOLDS, scoring="r2")
    cv_mae  = -cross_val_score(model, X_scaled_all, y, cv=CV_FOLDS, scoring="neg_mean_absolute_error")
    cv_rmse = np.sqrt(-cross_val_score(model, X_scaled_all, y, cv=CV_FOLDS, scoring="neg_mean_squared_error"))

    print(f"\n  {'Fold':<8} {'R²':>10} {'MAE':>10} {'RMSE':>10}")
    print(f"  {'─'*40}")
    for i in range(CV_FOLDS):
        print(f"  {'Fold ' + str(i+1):<8} {cv_r2[i]:>10.4f} {cv_mae[i]:>9.4f}% {cv_rmse[i]:>9.4f}%")
    print(f"  {'─'*40}")
    print(f"  {'Rata-rata':<8} {cv_r2.mean():>10.4f} {cv_mae.mean():>9.4f}% {cv_rmse.mean():>9.4f}%")
    print(f"  {'Std Dev':<8} {cv_r2.std():>10.4f} {cv_mae.std():>9.4f}% {cv_rmse.std():>9.4f}%")

    # ── 9. Contoh Prediksi ────────────────────────────────────────
    print(f"\n{'='*70}")
    print(f"  🧪 CONTOH PREDIKSI")
    print(f"{'='*70}")

    test_cases = [
        # [suhu, kelembaban, led, infeksi, fase_encoded]
        ([25.0, 85.0,  30,   0.0, 2], "Kondisi ideal (Produksi)"),
        ([28.0, 80.0,  15,  10.0, 2], "Normal dengan sedikit infeksi"),
        ([30.0, 78.0,  97,  37.0, 2], "Suhu tinggi + infeksi sedang"),
        ([33.0, 98.0, 250,  40.0, 2], "KRITIS — suhu & kelembaban tinggi"),
        ([34.5, 80.0, 226,  45.5, 2], "SANGAT KRITIS"),
        ([22.0, 87.0, 148,  14.6, 1], "Fase Primordia"),
        ([22.3, 66.5,  80,  49.8, 0], "Fase Inkubasi + infeksi tinggi"),
    ]

    for features, label in test_cases:
        x_input = np.array([features])
        x_poly  = poly.transform(x_input)
        x_scaled = scaler.transform(x_poly)
        pred = float(np.clip(model.predict(x_scaled)[0], 0, 100))
        kat  = "✅ Rendah" if pred < 40 else ("⚠️ Sedang" if pred < 70 else "🚨 Tinggi")
        print(f"  {label:<40} → {pred:5.1f}% {kat}")

    # ── 10. Simpan Model ──────────────────────────────────────────
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    model_path  = os.path.join(OUTPUT_DIR, "regression_model.pkl")
    scaler_path = os.path.join(OUTPUT_DIR, "scaler.pkl")
    poly_path   = os.path.join(OUTPUT_DIR, "poly_features.pkl")

    with open(model_path,  "wb") as f: pickle.dump(model, f)
    with open(scaler_path, "wb") as f: pickle.dump(scaler, f)
    with open(poly_path,   "wb") as f: pickle.dump(poly, f)

    print(f"\n{'='*70}")
    print(f"  💾 MODEL BERHASIL DISIMPAN")
    print(f"{'='*70}")
    print(f"  📦 {model_path}  ({os.path.getsize(model_path):,} bytes)")
    print(f"  📦 {scaler_path} ({os.path.getsize(scaler_path):,} bytes)")
    print(f"  📦 {poly_path}   ({os.path.getsize(poly_path):,} bytes)")

    # ── 11. Simpan Laporan ────────────────────────────────────────
    report_path = os.path.join(OUTPUT_DIR, "training_report.txt")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("LAPORAN TRAINING MODEL REGRESI LINEAR\n")
        f.write("GrowSafe — Prediksi Risiko Black Mold\n")
        f.write("=" * 50 + "\n\n")
        f.write(f"Dataset           : {CSV_PATH}\n")
        f.write(f"Jumlah data       : {len(df)}\n")
        f.write(f"Fitur asli        : {len(feature_columns)}\n")
        f.write(f"Polynomial degree : {POLY_DEGREE}\n")
        f.write(f"Total fitur       : {len(feature_names)}\n")
        f.write(f"Train/Test split  : {(1-TEST_SIZE)*100:.0f}% / {TEST_SIZE*100:.0f}%\n\n")
        f.write(f"METRIK EVALUASI\n")
        f.write(f"-" * 50 + "\n")
        f.write(f"Training MAE  : {mae_train:.4f}%\n")
        f.write(f"Training RMSE : {rmse_train:.4f}%\n")
        f.write(f"Training R²   : {r2_train:.4f}\n\n")
        f.write(f"Testing MAE   : {mae_test:.4f}%\n")
        f.write(f"Testing RMSE  : {rmse_test:.4f}%\n")
        f.write(f"Testing R²    : {r2_test:.4f}\n\n")
        f.write(f"CROSS-VALIDATION ({CV_FOLDS}-Fold)\n")
        f.write(f"-" * 50 + "\n")
        f.write(f"Rata-rata R²  : {cv_r2.mean():.4f} (±{cv_r2.std():.4f})\n")
        f.write(f"Rata-rata MAE : {cv_mae.mean():.4f}% (±{cv_mae.std():.4f})\n")
        f.write(f"Rata-rata RMSE: {cv_rmse.mean():.4f}% (±{cv_rmse.std():.4f})\n\n")
        f.write(f"DAFTAR FITUR POLYNOMIAL\n")
        f.write(f"-" * 50 + "\n")
        for i, name in enumerate(feature_names):
            f.write(f"  {i+1:2d}. {name}\n")

    print(f"  📄 {report_path}")
    print(f"\n✅ Training selesai!\n")


if __name__ == "__main__":
    main()

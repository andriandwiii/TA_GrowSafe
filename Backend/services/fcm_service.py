# ===================================================================
# File: fcm_service.py
# Lokasi: GrowSafe/Backend/services/fcm_service.py
# Deskripsi: Layanan Firebase Cloud Messaging (FCM) untuk mengirim
#            push notification peringatan dini ke aplikasi mobile.
#
# SETUP:
# 1. Buat project di https://console.firebase.google.com
# 2. Download file serviceAccountKey.json
# 3. Taruh file tersebut di folder Backend/
# 4. Install: pip install firebase-admin
# ===================================================================

import os

# ── Inisialisasi Firebase Admin SDK ───────────────────────────────
try:
    import firebase_admin
    from firebase_admin import credentials, messaging

    SERVICE_ACCOUNT_PATH = "serviceAccountKey.json"

    if not firebase_admin._apps:  # cegah inisialisasi duplikat
        if os.path.exists(SERVICE_ACCOUNT_PATH):
            cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
            firebase_admin.initialize_app(cred)
            print("✅ Firebase Admin SDK berhasil diinisialisasi.")
        else:
            print("⚠️  serviceAccountKey.json tidak ditemukan. FCM tidak aktif.")

    FCM_AVAILABLE = True

except ImportError:
    FCM_AVAILABLE = False
    print("⚠️  firebase-admin belum diinstall. Jalankan: pip install firebase-admin")


# ── Kirim Notifikasi ke Satu Device ───────────────────────────────
def send_notification(
    fcm_token: str,
    judul: str,
    isi: str,
    data: dict = None
) -> bool:
    """
    Kirim push notification ke satu perangkat via FCM token.
    
    Args:
        fcm_token : token FCM perangkat penerima (disimpan di tabel users)
        judul     : judul notifikasi
        isi       : isi pesan notifikasi
        data      : data tambahan (opsional), misal {"id_prediksi": "PRD001"}

    Returns:
        True jika berhasil, False jika gagal
    """
    if not FCM_AVAILABLE:
        print("FCM tidak aktif, notifikasi tidak dikirim.")
        return False

    try:
        message = messaging.Message(
            notification=messaging.Notification(
                title=judul,
                body=isi,
            ),
            data=data or {},
            token=fcm_token,
        )
        response = messaging.send(message)
        print(f"✅ Notifikasi berhasil dikirim: {response}")
        return True

    except Exception as e:
        print(f"❌ Gagal mengirim notifikasi FCM: {e}")
        return False


# ── Buat Konten Notifikasi Berdasarkan Kategori Risiko ─────────────
def buat_konten_notifikasi(kategori: str, risk_persen: float, nama_kumbung: str) -> dict:
    """
    Generate judul dan isi notifikasi berdasarkan kategori risiko.
    """
    if kategori == "Tinggi":
        judul = f"🚨 BAHAYA! Risiko Black Mold Sangat Tinggi"
        isi   = (
            f"Kumbung '{nama_kumbung}' menunjukkan risiko black mold {risk_persen:.1f}%! "
            f"Segera periksa dan isolasi baglog yang terinfeksi."
        )
    elif kategori == "Sedang":
        judul = f"⚠️ Peringatan Risiko Black Mold"
        isi   = (
            f"Kumbung '{nama_kumbung}' menunjukkan risiko black mold {risk_persen:.1f}%. "
            f"Lakukan tindakan pencegahan segera."
        )
    else:
        judul = f"✅ Kondisi Kumbung Normal"
        isi   = (
            f"Kumbung '{nama_kumbung}' dalam kondisi baik. "
            f"Risiko black mold hanya {risk_persen:.1f}%."
        )

    return {"judul": judul, "isi": isi}
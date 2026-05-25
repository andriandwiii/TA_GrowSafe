# ===================================================================
# File: id_generator.py
# Lokasi: GrowSafe/Backend/services/id_generator.py
# Deskripsi: Generate ID unik untuk setiap tabel.
#            Format: PREFIX + angka 3 digit, contoh: USR001, KMB002
#            Angka diambil dari jumlah data terakhir di DB + 1
#            agar tidak tabrakan.
# ===================================================================

from sqlalchemy.orm import Session
from models.user        import Pengguna
from models.kumbung     import Kumbung
from models.sensor_data import SensorData
from models.deteksi_yolo import DeteksiYolo
from models.prediksi    import Prediksi
from models.notifikasi  import Notifikasi


def generate_id_pengguna(db: Session) -> str:
    """Format: USR001, USR002, ..."""
    last_item = db.query(Pengguna).order_by(Pengguna.id_pengguna.desc()).first()
    if not last_item:
        return "USR001"
    last_num = int(last_item.id_pengguna.replace("USR", ""))
    return f"USR{str(last_num + 1).zfill(3)}"


def generate_id_kumbung(db: Session) -> str:
    """Format: KMB001, KMB002, ..."""
    last_item = db.query(Kumbung).order_by(Kumbung.id_kumbung.desc()).first()
    if not last_item:
        return "KMB001"
    last_num = int(last_item.id_kumbung.replace("KMB", ""))
    return f"KMB{str(last_num + 1).zfill(3)}"


def generate_id_sensor(db: Session) -> str:
    """Format: SNS001, SNS002, ..."""
    last_item = db.query(SensorData).order_by(SensorData.id_sensor.desc()).first()
    if not last_item:
        return "SNS001"
    last_num = int(last_item.id_sensor.replace("SNS", ""))
    return f"SNS{str(last_num + 1).zfill(3)}"


def generate_id_yolo(db: Session) -> str:
    """Format: YLO001, YLO002, ..."""
    last_item = db.query(DeteksiYolo).order_by(DeteksiYolo.id_yolo.desc()).first()
    if not last_item:
        return "YLO001"
    last_num = int(last_item.id_yolo.replace("YLO", ""))
    return f"YLO{str(last_num + 1).zfill(3)}"


def generate_id_prediksi(db: Session) -> str:
    """Format: PRD001, PRD002, ..."""
    last_item = db.query(Prediksi).order_by(Prediksi.id_prediksi.desc()).first()
    if not last_item:
        return "PRD001"
    last_num = int(last_item.id_prediksi.replace("PRD", ""))
    return f"PRD{str(last_num + 1).zfill(3)}"


def generate_id_notifikasi(db: Session) -> str:
    """Format: NTF001, NTF002, ..."""
    last_item = db.query(Notifikasi).order_by(Notifikasi.id_notifikasi.desc()).first()
    if not last_item:
        return "NTF001"
    last_num = int(last_item.id_notifikasi.replace("NTF", ""))
    return f"NTF{str(last_num + 1).zfill(3)}"
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
    count = db.query(Pengguna).count()
    return f"USR{str(count + 1).zfill(3)}"


def generate_id_kumbung(db: Session) -> str:
    """Format: KMB001, KMB002, ..."""
    count = db.query(Kumbung).count()
    return f"KMB{str(count + 1).zfill(3)}"


def generate_id_sensor(db: Session) -> str:
    """Format: SNS001, SNS002, ..."""
    count = db.query(SensorData).count()
    return f"SNS{str(count + 1).zfill(3)}"


def generate_id_yolo(db: Session) -> str:
    """Format: YLO001, YLO002, ..."""
    count = db.query(DeteksiYolo).count()
    return f"YLO{str(count + 1).zfill(3)}"


def generate_id_prediksi(db: Session) -> str:
    """Format: PRD001, PRD002, ..."""
    count = db.query(Prediksi).count()
    return f"PRD{str(count + 1).zfill(3)}"


def generate_id_notifikasi(db: Session) -> str:
    """Format: NTF001, NTF002, ..."""
    count = db.query(Notifikasi).count()
    return f"NTF{str(count + 1).zfill(3)}"
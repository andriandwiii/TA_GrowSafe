# ===================================================================
# File: sensor_data.py
# Lokasi: GrowSafe/Backend/models/sensor_data.py
# ===================================================================

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from database import Base

class SensorData(Base):
    __tablename__ = "sensor_data"

    id = Column(Integer, primary_key=True, autoincrement=True)
    id_sensor = Column(String(15), nullable=False, unique=True)
    id_kumbung = Column(
        String(10),
        ForeignKey("kumbung.id_kumbung", ondelete="CASCADE"),
        nullable=False
    )
    suhu              = Column(Float,   nullable=True)
    kelembaban        = Column(Float,   nullable=True)
    total_led_menyala = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    __table_args__ = (
        Index("ix_sensor_data_id_sensor_id_kumbung", "id_sensor", "id_kumbung"),
    )
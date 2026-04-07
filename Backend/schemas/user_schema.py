# ===================================================================
# File: user_schema.py (Diperbarui dengan Validasi)
# Lokasi: GuavaScan/Backend/schemas/user_schema.py
# Deskripsi: Menambahkan validasi untuk memastikan password tidak kosong.
# ===================================================================

from pydantic import BaseModel, EmailStr, Field # 1. Impor Field dari Pydantic
from datetime import datetime

class UserCreate(BaseModel):
    """
    Skema untuk data yang diterima dari pengguna saat mendaftar.
    """
    username: str
    email: EmailStr
    
    # 2. Tambahkan validasi pada kolom password
    # Field(..., min_length=8) berarti:
    # ...      -> Kolom ini wajib diisi (required).
    # min_length=8 -> Panjang minimal password adalah 8 karakter.
    # Ini secara otomatis akan menolak string kosong.
    password: str = Field(..., min_length=8)

class UserResponse(BaseModel):
    """
    Skema untuk data pengguna yang dikirim kembali sebagai respons dari API.
    """
    id_pengguna: int
    username: str
    email: EmailStr
    tanggal_dibuat: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    """
    Skema untuk respons token yang diberikan setelah login berhasil.
    """
    access_token: str
    token_type: str

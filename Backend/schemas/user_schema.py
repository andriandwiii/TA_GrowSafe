from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# ── Request: Register ──────────────────────────────────────────────
class UserCreate(BaseModel):
    nama: str
    username: str
    email: EmailStr
    password: str

# ── Request: Login ─────────────────────────────────────────────────
class UserLogin(BaseModel):
    username: str   # bisa diisi username atau email
    password: str

# ── Request: Update Profile ────────────────────────────────────────
class UserUpdate(BaseModel):
    nama:     Optional[str] = None
    username: Optional[str] = None
    email:    Optional[EmailStr] = None
    password: Optional[str] = None

# ── Response: Data User (tanpa password) ───────────────────────────
class UserResponse(BaseModel):
    id_pengguna: str
    nama:        str
    username:    str
    email:       str
    created_at:  datetime

    class Config:
        from_attributes = True

# ── Response: Token JWT ────────────────────────────────────────────
class Token(BaseModel):
    access_token: str
    token_type:   str
    user:         UserResponse  # sekalian kembalikan data user saat login
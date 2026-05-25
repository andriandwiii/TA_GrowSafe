import re

with open(r'd:\SEMESTER 6\TA\Growsafe\Frontend\app\detailPemantauan.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Hapus semua komentar JSX { /* ... */ } yang mungkin punya spasi di luarnya
# Kita ubah dari  { /* ... */ }  menjadi string kosong
content = re.sub(r'\s*\{\s*/\*.*?\*/\s*\}\s*', '', content)

with open(r'd:\SEMESTER 6\TA\Growsafe\Frontend\app\detailPemantauan.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

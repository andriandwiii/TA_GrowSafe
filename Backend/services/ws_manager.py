from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        # Menyimpan koneksi aktif berdasarkan id_kumbung
        # Format: {"KMB001": [ws1, ws2], "KMB002": [ws3]}
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, id_kumbung: str):
        await websocket.accept()
        if id_kumbung not in self.active_connections:
            self.active_connections[id_kumbung] = []
        self.active_connections[id_kumbung].append(websocket)
        print(f"📡 Klien terhubung ke WebSocket Kumbung: {id_kumbung}")

    def disconnect(self, websocket: WebSocket, id_kumbung: str):
        if id_kumbung in self.active_connections:
            if websocket in self.active_connections[id_kumbung]:
                self.active_connections[id_kumbung].remove(websocket)
            if len(self.active_connections[id_kumbung]) == 0:
                del self.active_connections[id_kumbung]
        print(f"🔌 Klien terputus dari WebSocket Kumbung: {id_kumbung}")

    async def broadcast_to_kumbung(self, id_kumbung: str, message: dict):
        """Kirim pesan (data sensor) ke semua aplikasi HP yang sedang membuka kumbung ini."""
        if id_kumbung in self.active_connections:
            # Gunakan copy dari list untuk menghindari error jika ada klien yang disconnect di tengah loop
            for connection in list(self.active_connections[id_kumbung]):
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"⚠️ Error kirim data WS: {e}")
                    self.disconnect(connection, id_kumbung)

manager = ConnectionManager()

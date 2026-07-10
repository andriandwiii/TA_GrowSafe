from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.ws_manager import manager

router = APIRouter()

@router.websocket("/{id_kumbung}")
async def websocket_endpoint(websocket: WebSocket, id_kumbung: str):
    """
    Endpoint ini akan dihubungi oleh aplikasi React Native.
    Begitu terhubung, koneksi dibiarkan terbuka terus menerus (keep-alive).
    """
    await manager.connect(websocket, id_kumbung)
    try:
        while True:
            # Terima pesan (ping) dari HP agar koneksi tidak ditutup oleh browser/ngrok
            data = await websocket.receive_text()
            print(f"Pesan dari client HP ({id_kumbung}): {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket, id_kumbung)

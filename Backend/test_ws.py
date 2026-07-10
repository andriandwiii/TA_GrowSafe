import asyncio
import websockets

async def test():
    try:
        async with websockets.connect('ws://localhost:8000/ws/sensor/KMB001') as ws:
            print('BERHASIL KONEK KE LOKAL!')
    except Exception as e:
        print('GAGAL KONEK LOKAL:', e)

asyncio.run(test())

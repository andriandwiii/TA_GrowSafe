#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <esp_task_wdt.h>  // Watchdog Timer bawaan ESP32

// ================= PENGATURAN WIFI =================
const char* ssid = "Redmi 10";         // Ganti dengan nama WiFi / Hotspot
const char* password = "andriandwi"; // Ganti dengan password WiFi

// ================= PENGATURAN LOKAL GROWSAFE =======
// Ganti IP di bawah ini dengan IP IPv4 laptop Anda (lihat di cmd -> ipconfig)
const char* SERVER_URL = "https://possum-albatross-veggie.ngrok-free.dev/sensor/"; 
const String ID_KUMBUNG = "KMB001"; // Sesuaikan dengan ID kumbung di database Anda

// ================= PENGATURAN THINGSPEAK ===========
// Anda harus mendaftar di thingspeak.com, buat Channel baru
// Lalu salin "Write API Key" ke variabel di bawah ini:
const String THINGSPEAK_API_KEY = "9ESP9TMI5JC2LR70";

// ================= PENGATURAN PIN ==================
#define DHTPIN 4      // Pin Data DHT terhubung ke D4 (GPIO 4)
#define DHTTYPE DHT22 // Sensor DHT22 (akurasi: ±0.5°C, ±2-5% RH)
#define LED_PIN 5     // Pin LED Merah peringatan terhubung ke D5 (GPIO 5)

DHT dht(DHTPIN, DHTTYPE);

// ================= PENGATURAN WATCHDOG =============
// Jika ESP32 stuck/hang selama 30 detik, akan otomatis restart
#define WDT_TIMEOUT 30  // detik

// ================= VARIABEL GLOBAL =================
unsigned long previousMillis = 0;
// Interval pengiriman data: 20 detik (20000 ms)
// PERHATIAN: ThingSpeak versi gratis memiliki batas limit pengiriman 15 detik!
// Jadi jangan diatur di bawah 15000 ms.
const long interval = 20000; 

int total_menit_led_menyala = 0;
bool is_led_on = false;
unsigned long ledTurnedOnTime = 0;

// Counter untuk percobaan reconnect WiFi
int wifiReconnectAttempts = 0;
const int MAX_RECONNECT_ATTEMPTS = 10;

void setup() {
  Serial.begin(115200);
  
  // ── Aktifkan Watchdog Timer ──────────────────────
  // Jika program hang/crash selama 30 detik, ESP32 otomatis restart
  esp_task_wdt_config_t twdt_config = {
      .timeout_ms = WDT_TIMEOUT * 1000,
      .idle_core_mask = (1 << portNUM_PROCESSORS) - 1,    // Bitmask of all cores
      .trigger_panic = true,
  };
  esp_task_wdt_init(&twdt_config);
  esp_task_wdt_add(NULL);                // Pantau task utama (loop)
  Serial.println("✅ Watchdog Timer aktif (30 detik)");
  
  // Inisialisasi Pin
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  
  // Inisialisasi DHT
  dht.begin();

  // Koneksi ke WiFi
  connectToWiFi();
}

// ── Fungsi koneksi WiFi (dipakai di setup & reconnect) ──
void connectToWiFi() {
  Serial.println();
  Serial.print("Menghubungkan ke ");
  Serial.println(ssid);
  
  WiFi.mode(WIFI_STA);       // Mode station (client)
  WiFi.setAutoReconnect(true); // ESP32 akan coba reconnect otomatis di background
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("");
    Serial.println("✅ WiFi terhubung!");
    Serial.print("Alamat IP ESP32: ");
    Serial.println(WiFi.localIP());
    wifiReconnectAttempts = 0; // Reset counter
  } else {
    Serial.println("");
    Serial.println("⚠️ WiFi gagal terhubung! Akan coba lagi nanti...");
  }
}

void loop() {
  // ── Feed Watchdog (tandai bahwa program masih hidup) ──
  esp_task_wdt_reset();
  
  unsigned long currentMillis = millis();

  // ── Cek koneksi WiFi & Auto-Reconnect ──────────
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ WiFi terputus! Mencoba reconnect...");
    
    WiFi.disconnect();
    WiFi.begin(ssid, password);
    
    // Tunggu maksimal 10 detik untuk reconnect
    int waitCount = 0;
    while (WiFi.status() != WL_CONNECTED && waitCount < 20) {
      delay(500);
      Serial.print(".");
      waitCount++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\n✅ WiFi berhasil reconnect!");
      Serial.print("IP: ");
      Serial.println(WiFi.localIP());
      wifiReconnectAttempts = 0;
    } else {
      wifiReconnectAttempts++;
      Serial.print("\n❌ Reconnect gagal. Percobaan ke-");
      Serial.print(wifiReconnectAttempts);
      Serial.print("/");
      Serial.println(MAX_RECONNECT_ATTEMPTS);
      
      // Jika sudah terlalu banyak gagal, restart ESP32
      if (wifiReconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        Serial.println("🔄 Terlalu banyak gagal, restart ESP32...");
        delay(1000);
        ESP.restart();
      }
      
      delay(5000); // Tunggu 5 detik sebelum loop berikutnya
      return;
    }
  }

  // Membaca DHT22
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  // Jika gagal membaca DHT (error hardware/kabel kendor)
  if (isnan(h) || isnan(t)) {
    Serial.println("❌ Gagal membaca dari sensor DHT!");
    delay(2000);
    return;
  }

  // --- LOGIKA KONTROL PERINGATAN (LED) ---
  if (t > 28.0 || h < 80.0) {
    // Kondisi buruk, nyalakan LED
    if (!is_led_on) {
      digitalWrite(LED_PIN, HIGH);
      is_led_on = true;
      ledTurnedOnTime = millis(); // Catat waktu kapan mulai menyala
      Serial.println("🔴 PERINGATAN: Kondisi buruk, LED menyala!");
    }
  } else {
    // Kondisi membaik, matikan LED
    if (is_led_on) {
      digitalWrite(LED_PIN, LOW);
      is_led_on = false;
      // Hitung berapa lama tadi LED menyala
      unsigned long duration = millis() - ledTurnedOnTime;
      // Tambahkan ke total akumulasi menit (dibagi 60000)
      total_menit_led_menyala += (duration / 60000); 
      Serial.println("🟢 AMAN: Kondisi normal, LED mati.");
    }
  }

  // --- LOGIKA PENGIRIMAN DATA ---
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;

    // Kalkulasi sementara menit LED menyala
    int temp_total_led = total_menit_led_menyala;
    if (is_led_on) {
      unsigned long current_duration = millis() - ledTurnedOnTime;
      temp_total_led += (current_duration / 60000);
    }

    Serial.println("===================================");
    Serial.print("Suhu: "); Serial.print(t); Serial.print("°C | ");
    Serial.print("Kelembaban: "); Serial.print(h); Serial.print("% | ");
    Serial.print("LED: "); Serial.print(temp_total_led); Serial.println(" menit");

    // 1. Kirim ke Backend Lokal GrowSafe
    sendDataToLocalServer(t, h, temp_total_led);

    // 2. Kirim ke Dashboard Cloud ThingSpeak
    sendDataToThingSpeak(t, h, temp_total_led);
  }
}

// === FUNGSI 1: Kirim ke Backend FastAPI (MySQL lokal) ===
void sendDataToLocalServer(float suhu, float kelembaban, int total_led) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(SERVER_URL);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(10000); // Timeout 10 detik

    StaticJsonDocument<200> doc;
    doc["id_kumbung"] = ID_KUMBUNG;
    doc["suhu"] = suhu;
    doc["kelembaban"] = kelembaban;
    doc["total_led_menyala"] = total_led;

    String requestBody;
    serializeJson(doc, requestBody);

    int httpResponseCode = http.POST(requestBody);
    if (httpResponseCode > 0) {
      Serial.print("[GrowSafe] ✅ Berhasil mengirim! Code: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("[GrowSafe] ❌ Error POST request. Code: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("[GrowSafe] ⚠️ WiFi tidak terhubung, data tidak dikirim.");
  }
}

// === FUNGSI 2: Kirim ke ThingSpeak (Cloud Dashboard) ===
void sendDataToThingSpeak(float suhu, float kelembaban, int total_led) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    // Susun URL ThingSpeak (Field1=Suhu, Field2=Kelembaban, Field3=Durasi LED)
    // Gunakan HTTP agar tidak perlu konfigurasi sertifikat SSL/HTTPS yang berat di ESP32
    String url = "http://api.thingspeak.com/update?api_key=" + THINGSPEAK_API_KEY + 
                 "&field1=" + String(suhu) + 
                 "&field2=" + String(kelembaban) + 
                 "&field3=" + String(total_led);
                 
    http.begin(url);
    http.setTimeout(10000); // Timeout 10 detik
    int httpResponseCode = http.GET();
    
    if (httpResponseCode > 0) {
      Serial.print("[ThingSpeak] ✅ Berhasil mengirim! Entry ID: ");
      Serial.println(http.getString());
    } else {
      Serial.print("[ThingSpeak] ❌ Error GET request. Code: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  }
}

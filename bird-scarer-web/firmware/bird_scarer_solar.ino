/*
  เครื่องไล่นกพิราบ - ชุด B (โซลาร์ + LiFePO4 + เรดาร์)
  บอร์ด: ESP32 DevKit (ESP32-WROOM-32E)

  อุปกรณ์:
    - เรดาร์ HLK-LD2410C (ใช้ขา OUT)
    - DFPlayer Mini + microSD (FAT32)
    - แอมป์ PAM8610 + ลำโพงฮอร์น 8Ω
    - บั๊กคอนเวอร์เตอร์ MP1584 (12V -> 5V)
    - โซลาร์ชาร์จเจอร์ PWM (รองรับ LiFePO4) + แบต LiFePO4 12V + แผง 20W

  ไลบรารี (Arduino IDE > Library Manager):
    - DFRobotDFPlayerMini (by DFRobot)
  ใช้ ESP32 Arduino core 2.x ขึ้นไป

  ---------------- การต่อสาย ----------------
  ไฟเลี้ยง:
    แผงโซลาร์   -> ขั้ว PV ของชาร์จเจอร์
    แบต LiFePO4 -> ขั้ว BAT ของชาร์จเจอร์ (ใส่ฟิวส์ 5A ใกล้ขั้วแบต)
    ขั้ว LOAD ของชาร์จเจอร์ -> ฟิวส์ 2A -> แอมป์ PAM8610 (12V)
                           -> MP1584 IN  (ปรับ OUT ให้ได้ 5.0V ก่อนต่อบอร์ด)
    MP1584 OUT 5V -> ESP32 VIN, LD2410C VCC, DFPlayer VCC
    GND ทุกตัวต่อร่วมกัน

  สัญญาณ:
    LD2410C OUT        -> GPIO 27
    DFPlayer TX        -> GPIO 16
    DFPlayer RX        -> 1kΩ -> GPIO 17
    DFPlayer BUSY      -> GPIO 26   (LOW = กำลังเล่น)
    DFPlayer DAC_R     -> PAM8610 IN (ช่องใดช่องหนึ่ง), DFPlayer GND -> PAM8610 GND
    PAM8610 SD         -> GPIO 25   (LOW = ปิดแอมป์)
    PAM8610 OUT        -> ลำโพงฮอร์น

  วัดแรงดันแบต (ตัวแบ่งแรงดัน):
    LOAD+ -> 100kΩ -> GPIO 34 -> 22kΩ -> GND
    (ใส่ตัวเก็บประจุ 100nF คร่อม GPIO34-GND ช่วยให้ค่านิ่ง)

  ไฟล์เสียงใน microSD: root ของการ์ด ชื่อ 0001.mp3, 0002.mp3, ...
  ---------------------------------------------
*/

#include <WiFi.h>
#include <time.h>
#include <DFRobotDFPlayerMini.h>

// ================= ตั้งค่า =================
const char* WIFI_SSID = "";            // เว้นว่าง = ไม่ใช้ WiFi (ทำงานตลอดเวลา)
const char* WIFI_PASS = "";

// ขา
const int RADAR_PIN = 27;
const int BUSY_PIN  = 26;
const int AMP_SD_PIN = 25;
const int VBAT_PIN  = 34;
const bool AMP_ON_LEVEL = HIGH;        // ถ้าโมดูลแอมป์กลับขั้ว ให้เปลี่ยนเป็น LOW

// เสียง
const int NUM_TRACKS = 5;
const int VOL_MIN = 15;                // 0-30 (ลำโพงฮอร์นดังมาก เริ่มต่ำไว้ก่อน)
const int VOL_MAX = 22;
const unsigned long MAX_PLAY_MS = 8000;  // ตัดเสียงถ้าเล่นนานเกินนี้

// จังหวะ
const unsigned long COOLDOWN_MIN_MS = 20000;
const unsigned long COOLDOWN_MAX_MS = 60000;
const unsigned long RADAR_CONFIRM_MS = 300;   // ต้องเจอต่อเนื่องเท่านี้ก่อนไล่ (กันสัญญาณหลอก)

// เวลาทำงาน (ใช้เมื่อซิงก์เวลาผ่าน WiFi ได้)
const int ACTIVE_FROM_HOUR = 6;
const int ACTIVE_TO_HOUR   = 18;       // ถึง 18:59
const long GMT_OFFSET_SEC  = 7 * 3600;
const unsigned long RESYNC_MS = 24UL * 3600UL * 1000UL;
const unsigned long SYNC_RETRY_MS = 30UL * 60UL * 1000UL;  // ซิงก์ไม่สำเร็จ ลองใหม่ทุก 30 นาที

// แบตเตอรี่ LiFePO4 12V (4S)
const float VBAT_DIVIDER   = (100.0 + 22.0) / 22.0;
const float VBAT_CAL       = 1.00;     // ปรับให้ตรงกับมัลติมิเตอร์
const float VBAT_LOW       = 12.4;     // ต่ำกว่านี้ = หยุดไล่ เก็บไฟ
const float VBAT_RESUME    = 12.9;     // กลับมาทำงานเมื่อชาร์จถึง
// ===========================================

HardwareSerial dfSerial(2);
DFRobotDFPlayerMini player;

bool timeSynced = false;
bool lowBattery = false;
unsigned long lastScareMs = 0;   // เทียบเวลาแบบ millis() - lastScareMs ปลอดภัยเมื่อ millis() วนกลับ (~49.7 วัน)
unsigned long cooldownMs = 0;
unsigned long lastSyncMs = 0;
unsigned long radarHighSince = 0;
unsigned long lastBatLogMs = 0;
int lastTrack = 0;

// ---------- แบตเตอรี่ ----------
float readBattery() {
  uint32_t mv = 0;
  for (int i = 0; i < 16; i++) mv += analogReadMilliVolts(VBAT_PIN);
  return (mv / 16.0) / 1000.0 * VBAT_DIVIDER * VBAT_CAL;
}

void updateBattery() {
  float v = readBattery();
  if (!lowBattery && v < VBAT_LOW)   { lowBattery = true;  Serial.printf("[BAT] LOW %.2fV - paused\n", v); }
  if (lowBattery && v > VBAT_RESUME) { lowBattery = false; Serial.printf("[BAT] OK %.2fV - resumed\n", v); }
  if (millis() - lastBatLogMs > 600000UL) {  // log ทุก 10 นาที
    lastBatLogMs = millis();
    Serial.printf("[BAT] %.2fV\n", v);
  }
}

// ---------- เวลา ----------
void syncTime() {
  if (strlen(WIFI_SSID) == 0) return;
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  for (int i = 0; i < 30 && WiFi.status() != WL_CONNECTED; i++) delay(500);
  if (WiFi.status() == WL_CONNECTED) {
    configTime(GMT_OFFSET_SEC, 0, "pool.ntp.org", "time.google.com");
    struct tm t;
    if (getLocalTime(&t, 5000)) {
      timeSynced = true;
      Serial.printf("[TIME] %02d:%02d\n", t.tm_hour, t.tm_min);
    }
  } else {
    Serial.println("[TIME] WiFi failed");
  }
  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);      // ปิด WiFi ประหยัดไฟ
  lastSyncMs = millis();
}

bool isActiveHours() {
  if (!timeSynced) return true;
  struct tm t;
  if (!getLocalTime(&t, 100)) return true;
  return t.tm_hour >= ACTIVE_FROM_HOUR && t.tm_hour <= ACTIVE_TO_HOUR;
}

// ---------- เสียง ----------
void ampOn()  { digitalWrite(AMP_SD_PIN, AMP_ON_LEVEL);  delay(150); }  // รอแอมป์ตื่น กันเสียงป๊อป
void ampOff() { digitalWrite(AMP_SD_PIN, !AMP_ON_LEVEL); }

int pickTrack() {
  if (NUM_TRACKS <= 1) return 1;
  int tr;
  do { tr = random(1, NUM_TRACKS + 1); } while (tr == lastTrack);
  lastTrack = tr;
  return tr;
}

void playAndWait(int track) {
  player.play(track);
  unsigned long start = millis();
  // รอให้ BUSY เป็น LOW (เริ่มเล่น) แล้วรอจนกลับเป็น HIGH (เล่นจบ)
  while (digitalRead(BUSY_PIN) == HIGH && millis() - start < 1000) delay(10);
  while (digitalRead(BUSY_PIN) == LOW && millis() - start < MAX_PLAY_MS) delay(20);
  if (millis() - start >= MAX_PLAY_MS) player.stop();
}

void scare() {
  int vol = random(VOL_MIN, VOL_MAX + 1);
  player.volume(vol);
  ampOn();

  int track = pickTrack();
  Serial.printf("[SCARE] track %d vol %d\n", track, vol);
  playAndWait(track);

  if (random(100) < 30) {               // 30% เล่นต่ออีกเสียง
    delay(random(1500, 4000));
    playAndWait(pickTrack());
    Serial.println("[SCARE] combo");
  }

  delay(100);
  ampOff();
  lastScareMs = millis();
  cooldownMs = random(COOLDOWN_MIN_MS, COOLDOWN_MAX_MS);
}

// ---------- main ----------
void setup() {
  Serial.begin(115200);
  pinMode(RADAR_PIN, INPUT);
  pinMode(BUSY_PIN, INPUT_PULLUP);
  pinMode(AMP_SD_PIN, OUTPUT);
  ampOff();
  analogSetPinAttenuation(VBAT_PIN, ADC_11db);
  randomSeed(esp_random());

  dfSerial.begin(9600, SERIAL_8N1, 16, 17);
  delay(1500);
  bool playerOk = false;
  for (int i = 1; i <= 5 && !playerOk; i++) {
    playerOk = player.begin(dfSerial);
    if (!playerOk) {
      Serial.printf("DFPlayer not found (try %d/5) - check wiring / SD card\n", i);
      delay(2000);
    }
  }
  if (!playerOk) {
    // ไม่ค้างถาวร: รีสตาร์ตแล้วลองใหม่ (เช่น SD ตอบช้าหลังไฟกลับมา)
    Serial.println("DFPlayer not found - restarting in 10 s");
    delay(10000);
    ESP.restart();
  }
  player.volume(VOL_MIN);
  Serial.println("DFPlayer ready");

  syncTime();
  updateBattery();
  Serial.printf("[BAT] %.2fV\n", readBattery());
  Serial.println("Ready");
}

void loop() {
  updateBattery();

  if (strlen(WIFI_SSID) > 0) {
    unsigned long syncEvery = timeSynced ? RESYNC_MS : SYNC_RETRY_MS;
    if (millis() - lastSyncMs > syncEvery) syncTime();
  }

  bool detected = digitalRead(RADAR_PIN) == HIGH;
  if (detected) {
    if (radarHighSince == 0) radarHighSince = millis();
  } else {
    radarHighSince = 0;
  }

  bool confirmed = detected && (millis() - radarHighSince >= RADAR_CONFIRM_MS);

  bool cooledDown = millis() - lastScareMs >= cooldownMs;

  if (confirmed && !lowBattery && cooledDown && isActiveHours()) {
    scare();
    radarHighSince = 0;
  }

  delay(50);
}

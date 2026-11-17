# เครื่องไล่นกพิราบ พลังงานโซลาร์ – เว็บคู่มือประกอบ

เว็บหน้าเดียวภาษาไทย สอนประกอบเครื่องไล่นกพิราบด้วย ESP32 + เรดาร์ HLK-LD2410C + DFPlayer + แอมป์ PAM8610 + ลำโพงฮอร์น ใช้ไฟจากแผงโซลาร์และแบต LiFePO4

เขียนด้วย HTML + CSS + JavaScript ล้วน ไม่มี build step ไม่มี framework (โหลดจากภายนอกแค่ฟอนต์ IBM Plex Sans Thai จาก Google Fonts)

## โครงไฟล์

```
index.html                 หน้าเว็บ (ทุก section)
css/style.css              สไตล์ทั้งหมด รวม dark mode และ print stylesheet
js/app.js                  ตาราง BOM, ขั้นตอน, ซูมผังต่อสาย, แสดงโค้ด
data/bom.json              รายการอุปกรณ์ (แก้ราคา/เพิ่มรายการได้ที่นี่)
data/steps.json            ขั้นตอนการประกอบ 14 ขั้น
firmware/bird_scarer_solar.ino   โค้ด ESP32 (ต้องวางเอง ดูด้านล่าง)
img/device.svg             ภาพเครื่องในส่วนหัว
img/system.svg             แผนภาพบล็อกระบบ
img/wiring.svg             ผังต่อสาย
img/favicon.svg            ไอคอนแท็บ
staticwebapp.config.json   ตั้งค่า MIME ของไฟล์ .ino สำหรับ Azure Static Web Apps
```

SVG ทุกไฟล์ใช้ class แทนสีตายตัว หน้าเว็บโหลดมาแทรกในหน้า (inline) แล้วใช้สีจาก CSS variables ใน `css/style.css` จึงเปลี่ยนสีตาม dark mode ได้

## สิ่งที่ต้องใส่เอง

1. **ไฟล์เฟิร์มแวร์** – วาง `bird_scarer_solar.ino` ไว้ที่ `firmware/bird_scarer_solar.ino` หน้าเว็บจะแสดงโค้ด ปุ่มคัดลอก/ดาวน์โหลด และอ่านค่าใน `#define` / `const` ส่วนต้นไฟล์มาทำตาราง "ค่าที่ปรับได้" ให้เอง ถ้ายังไม่มีไฟล์ หน้าเว็บจะแจ้งว่ายังไม่พบไฟล์
2. **รูปถ่ายจริง** (ถ้าต้องการ) – ใส่ไว้ใน `img/` แล้วเพิ่ม `<img>` ใน `index.html` หรือในข้อความของ `data/steps.json`
3. **ราคา** – ราคาใน `data/bom.json` เป็นราคาประมาณ แก้ได้ ยอดรวมจะคำนวณใหม่เอง

## รันในเครื่อง

ต้องเปิดผ่านเว็บเซิร์ฟเวอร์ (ดับเบิลคลิก `index.html` ตรงๆ จะโหลดไฟล์ JSON/SVG ไม่ได้) เลือกวิธีใดวิธีหนึ่ง:

```bash
npx serve .
```

```bash
python -m http.server 8000
```

แล้วเปิด http://localhost:3000 (serve) หรือ http://localhost:8000 (python)

สถานะที่ติ๊กไว้ (ซื้อแล้ว / ทำเสร็จแล้ว) เก็บใน `localStorage` ของเบราว์เซอร์ อยู่เฉพาะเครื่องและเบราว์เซอร์นั้น

## Deploy ขึ้น GitHub Pages

1. สร้าง repository ใหม่บน GitHub แล้ว push ไฟล์ทั้งหมดขึ้นไป

   ```bash
   git init
   git add .
   git commit -m "Bird scarer build guide"
   git branch -M main
   git remote add origin https://github.com/<ชื่อผู้ใช้>/<ชื่อ-repo>.git
   git push -u origin main
   ```

2. ไปที่ repository → **Settings** → **Pages**
3. **Source** เลือก *Deploy from a branch* → Branch `main` โฟลเดอร์ `/ (root)` → **Save**
4. รอ 1–2 นาที เว็บจะอยู่ที่ `https://<ชื่อผู้ใช้>.github.io/<ชื่อ-repo>/`

ทุก path ในเว็บเป็นแบบ relative จึงใช้ใต้ sub-path ของ GitHub Pages ได้เลย

## Deploy ขึ้น Azure Static Web Apps

**วิธีที่ 1: เชื่อมกับ GitHub (อัปเดตอัตโนมัติทุกครั้งที่ push)**

1. push โปรเจกต์ขึ้น GitHub ตามข้างบน
2. ใน Azure Portal → **Create a resource** → **Static Web App**
3. เลือก Plan *Free*, Source *GitHub* แล้วเลือก repository และ branch `main`
4. Build Details: Build preset **Custom**, App location `/`, Api location (เว้นว่าง), Output location (เว้นว่าง)
5. กด **Review + create** Azure จะสร้าง GitHub Actions workflow ให้ และ deploy ทุกครั้งที่ push

**วิธีที่ 2: deploy จากเครื่องด้วย SWA CLI**

1. สร้าง Static Web App ใน Azure Portal (Source เลือก *Other*) แล้วคัดลอก **Deployment token** จากหน้า Overview → *Manage deployment token*
2. รันในโฟลเดอร์โปรเจกต์:

   ```bash
   npx @azure/static-web-apps-cli deploy . --env production --deployment-token <TOKEN>
   ```

ไฟล์ `staticwebapp.config.json` กำหนดให้ไฟล์ `.ino` ส่งเป็น `text/plain` เพื่อให้หน้าเว็บอ่านและดาวน์โหลดได้

## แก้ไขเนื้อหา

- **รายการอุปกรณ์**: แก้ `data/bom.json` ฟิลด์ `name`, `qty`, `price` (บาท/ชิ้น), `category`, `searchKeyword`, `note` หมวด `เครื่องมือ` จะไม่ถูกนับในยอด "ไม่รวมเครื่องมือ"
- **ขั้นตอน**: แก้ `data/steps.json` แต่ละขั้นมี `title`, `time`, `summary`, `needs`, `items`, `warnings`, `tips` ข้อความรองรับ `` `โค้ด` `` และ `**ตัวหนา**`
- ถ้าเปลี่ยน `id` ของขั้นตอน ความคืบหน้าที่ผู้ใช้ติ๊กไว้ในขั้นนั้นจะหายไป

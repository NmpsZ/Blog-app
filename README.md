# Blog-app

## 🚀 เทคโนโลยีที่ใช้ (Tech Stack)

### ฝั่งหน้าบ้าน (Frontend)
- **React 18** และ **TypeScript** (สร้างด้วย Vite)
- **Tailwind CSS** สำหรับการตกแต่ง UI ที่สวยงามและตอบสนองได้ดี
- **React Router v6** สำหรับการจัดการหน้าเว็บ
- **React Query** สำหรับการดึงข้อมูลและจัดการ Cache
- **Axios** สำหรับการเชื่อมต่อ API

### ฝั่งหลังบ้าน (Backend)
- **Node.js & Express** และ **TypeScript**
- **Prisma ORM** สำหรับการเชื่อมต่อและจัดการฐานข้อมูล
- **Supabase (PostgreSQL & Storage)** เป็นระบบฐานข้อมูลหลักและพื้นที่เก็บรูปภาพบนคลาวด์
- **JWT (JSON Web Tokens) & bcrypt** สำหรับระบบรักษาความปลอดภัยและยืนยันตัวตน (Authentication)
- **Zod** สำหรับการตรวจสอบความถูกต้องของข้อมูล (Data Validation)

## ✨ ฟีเจอร์หลัก (Key Features)

### 📖 หน้าสำหรับผู้ใช้งานทั่วไป (Public Pages)
- **หน้ารวมบทความ**: แสดงรายการบทความทั้งหมดในรูปแบบ Grid ที่สวยงาม พร้อมรูปปก คำโปรย และยอดผู้เข้าชม
- **ระบบค้นหาและแบ่งหน้า**: ค้นหาบทความจากชื่อเรื่องได้ทันที และแบ่งหน้าแสดงผลหน้าละ 10 รายการ
- **หน้ารายละเอียดบทความ**: อ่านเนื้อหาแบบเต็ม พร้อมรูปปกและแกลเลอรีรูปภาพเพิ่มเติม (สูงสุด 6 รูป)
- **ระบบความคิดเห็น (Comment System)**: ผู้อ่านสามารถแสดงความคิดเห็นได้ (จำกัดเฉพาะข้อความภาษาไทยและตัวเลขเท่านั้น) โดยความคิดเห็นจะยังไม่แสดงจนกว่าแอดมินจะกดยอมรับ (Approve)
  - **แนวทางการ Validation**: ข้อความคอมเมนต์ถูกจำกัดให้กรอกได้เฉพาะ **ภาษาไทย, ตัวเลข และช่องว่าง** เท่านั้น โดยมีการตรวจสอบความถูกต้อง (Validate) 2 ชั้น:
    1. **Frontend (React)**: ป้องกันและแจ้งเตือนผู้ใช้ทันทีก่อนกดยืนยัน
    2. **Backend (Zod API)**: ตรวจสอบขั้นเด็ดขาดก่อนบันทึกลงฐานข้อมูล เพื่อป้องกันการยิง API ตรงๆ
  - **Regex ที่ใช้**: `/^[ก-๙\s0-9]+$/u`

### 🛡️ ระบบจัดการหลังบ้าน (Admin Panel)
- **เข้าสู่ระบบอย่างปลอดภัย**: ป้องกันการเข้าถึงด้วยระบบ JWT
- **จัดการบทความ**: สามารถสร้าง แก้ไข และลบบทความได้
- **ควบคุมการเผยแพร่**: เปิด/ปิด การเผยแพร่บทความ (Publish/Unpublish) ได้ตลอดเวลา
- **แก้ไข URL Slug**: รองรับการปรับแต่ง URL ของบทความให้เหมาะสมกับ SEO
- **จัดการความคิดเห็น**: แอดมินสามารถดูรายการความคิดเห็นทั้งหมด และเลือกกด อนุมัติ (Approve) หรือ ปฏิเสธ (Reject) ได้ (ความคิดเห็นที่ถูก Reject จะถูกซ่อนจากหน้าเว็บทันที)

## 🛠️ การ Deployment (ขึ้นใช้งานจริง)

ระบบถูกออกแบบมาให้รองรับการนำไปใช้งานจริงบนคลาวด์ โดยแยกส่วนประกอบดังนี้:

### 1. ฐานข้อมูลและรูปภาพ (Supabase)
ใช้ **Supabase** สำหรับระบบฐานข้อมูล (PostgreSQL) และการจัดเก็บไฟล์รูปภาพ (Supabase Storage)
- สร้าง Project ใน Supabase
- สร้าง Storage Bucket ชื่อ `blog-images` และตั้งเป็น **Public**
- นำค่า `DATABASE_URL`, `SUPABASE_URL`, และ `SUPABASE_ANON_KEY` ไปใช้งานต่อในระบบหลังบ้าน

### 2. ฝั่งหลังบ้าน (Backend - Web Service บน Render)
- เชื่อมต่อ Github Repo ใน **Render** และเลือกประเภทเป็น **Web Service**
- **Build Command**: `npm install && npm run build:backend`
- **Start Command**: `cd apps/backend && npm start`
- ใส่ค่าตัวแปรใน **Environment Variables**:
  - `DATABASE_URL` = ลิ้งก์ฐานข้อมูล Supabase
  - `SUPABASE_URL` = URL โปรเจกต์ของ Supabase
  - `SUPABASE_ANON_KEY` = คีย์แบบ Public ของ Supabase
  - `JWT_SECRET` = รหัสผ่านความปลอดภัย (ตั้งเอง)
  - `PORT` = `4000` (หรือพอร์ตที่ต้องการ)

### 3. ฝั่งหน้าบ้าน (Frontend - Static Site บน Render)
- สร้าง **Static Site** ใหม่ใน Render
- **Build Command**: `npm install && npm run build:frontend`
- **Publish Directory**: `apps/frontend/dist`
- ใส่ค่าตัวแปรใน **Environment Variables**:
  - `VITE_API_URL` = ลิ้งก์ URL ของ Backend ที่ได้จากข้อ 2
- ตั้งค่า **Rewrite Rules** (สำหรับ React Router):
  - **Source:** `/*`
  - **Destination:** `/index.html`
  - **Action:** `Rewrite`

---

## 🔐 บัญชีแอดมินทดลอง (Demo Admin)
- **ชื่อผู้ใช้ (Username)**: `dev`
- **รหัสผ่าน (Password)**: `1234`

---

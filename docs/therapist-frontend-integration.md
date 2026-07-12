# Therapist Frontend Integration Notes

รอบนี้ frontend ใช้ service เดิมของโครงการและไม่ได้สร้าง API endpoint ใหม่ เอกสารนี้ระบุข้อมูลที่ backend/database ต้องส่งให้ view model ฝั่งนักแก้ไขการพูดในอนาคต

## Patient Progress

ใช้โดย component:

- `TherapistPatientDetailClient`
- `ProgressChart`
- `PatientProgressSummaryCards`
- `ProgressInsights`
- `TrainingHistory`
- `ReportPreview`

ข้อมูลที่ต้องการต่อ session:

- `date: string` วันที่ฝึกในรูปแบบ `YYYY-MM-DD`
- คะแนนตามหมวดที่ระบบมีอยู่ เช่น spontaneous, comprehension, repetition, naming
- จำนวนข้อเต็มต่อหมวด หรือ `CategoryScore.maxScore`
- ถ้ามีข้อมูลเพิ่มเติมให้ส่งแบบ optional เช่น `hintCount`, `averageResponseMs`, `sessionId`

Frontend รองรับ `null`, `undefined`, และ empty array โดยแสดง Empty State แทนการ crash

## Report

รายงานใช้ filter ชุดเดียวกับกราฟ:

- หมวดการฝึก
- ช่วงเวลา
- ข้อมูล summary
- points ที่ถูก filter แล้ว
- ข้อสังเกตแบบ rule-based

ตอนนี้ PDF ใช้ flow `window.print()` และให้ผู้ใช้ Save as PDF จาก browser ยังไม่มี backend PDF endpoint

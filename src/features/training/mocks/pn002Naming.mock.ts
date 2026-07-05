import type {
  NamingCategory,
  NamingQuestion,
  NamingResponse,
  NamingSessionState,
  NamingSet,
  TrainingModule,
} from "../types/pn002Naming.types";

const MODULE_ID = "PN002" as const;
const CATEGORY_ID = "animals" as const;
const CATEGORY_NAME = "สัตว์" as const;

export const imageSrcByAnswer: Partial<Record<string, string>> = {
  หมา: "/images/assessment/dog.png",
  นก: "/images/assessment/bird.png",
  วัว: "/images/assessment/cow.png",
  ลา: "/images/assessment/donkey.png",
  ควาย: "/images/assessment/buffalo.png",
  จระเข้: "/images/assessment/crocodile.png",
  แรด: "/images/assessment/rhino.png",
  ปลาหมึก: "/images/assessment/squid.png",
  เต่า: "/images/assessment/turtle.png",
  งู: "/images/assessment/snake.png",
  ค้างคาว: "/images/assessment/bat.png",
  ผึ้ง: "/images/assessment/bee.png",
  ยุง: "/images/assessment/mosquito.png",
  แมลงวัน: "/images/assessment/fly.png",
  แมงมุม: "/images/assessment/spider.png",
  แมว: "/images/assessment/cat.png",
  เป็ด: "/images/assessment/duck.png",
  ช้าง: "/images/assessment/elephant.png",
  ม้า: "/images/assessment/horse.png",
  แพะ: "/images/assessment/goat.png",
  กระต่าย: "/images/assessment/rabbit.png",
  ฮิปโป: "/images/assessment/hippo.png",
};

const acceptableAnswersByAnswer: Partial<Record<string, string[]>> = {
  หมา: ["หมา", "สุนัข"],
  แมว: ["แมว"],
  จระเข้: ["จระเข้"],
  ช้าง: ["ช้าง"],
  กระต่าย: ["กระต่าย"],
  มด: ["มด"],
};

const featureHintByAnswer: Partial<Record<string, string>> = {
  หมา: "มีสี่ขา ชอบอยู่กับคน",
  นก: "บินได้ มีปีกและมีขน",
  วัว: "มีสี่ขา ให้น้ำนมหรือช่วยงานในไร่",
  ลา: "คล้ายม้า ตัวไม่ใหญ่มาก",
  ควาย: "มีเขา ชอบอยู่ใกล้น้ำหรือทุ่งนา",
  จระเข้: "เป็นสัตว์เลื้อยคลาน อยู่ในน้ำได้",
  แรด: "ตัวใหญ่ มีนออยู่บนจมูก",
  ปลาหมึก: "อยู่ในทะเล มีหลายหนวด",
  เต่า: "มีกระดอง เดินช้า",
  งู: "ตัวยาว ไม่มีขา",
  ค้างคาว: "บินได้ ออกหากินตอนกลางคืน",
  ผึ้ง: "บินได้ ทำรังและมีน้ำผึ้ง",
  ยุง: "ตัวเล็ก บินได้ และชอบกัด",
  แมลงวัน: "ตัวเล็ก บินวนใกล้อาหาร",
  แมงมุม: "มีหลายขา ชอบทำใย",
  แมว: "มีหนวด มีหาง ร้องเหมียว",
  เป็ด: "เดินได้ ว่ายน้ำได้ ร้องก้าบ",
  ช้าง: "ตัวใหญ่ มีงวงและงา",
  ม้า: "มีสี่ขา วิ่งเร็ว",
  แพะ: "มีเขา กินหญ้า",
  กระต่าย: "หูยาว กระโดดได้",
  ฮิปโป: "ตัวใหญ่ อยู่ในน้ำได้",
  ฉลาม: "เป็นปลาตัวใหญ่ อยู่ในทะเล",
  โลมา: "อยู่ในทะเล กระโดดขึ้นจากน้ำได้",
  กบ: "กระโดดได้ อยู่ใกล้น้ำ",
  ปู: "มีก้าม เดินด้านข้าง",
  หอย: "มีเปลือกแข็ง",
  นกยูง: "มีหางสวย กางหางได้",
  มด: "ตัวเล็ก อยู่รวมกันเป็นแถว",
  ผีเสื้อ: "มีปีกสีสวย บินได้",
  ปลา: "อยู่ในน้ำ ว่ายน้ำได้",
  ไก่: "มีปีก ขันตอนเช้า",
  หมู: "ตัวอ้วน จมูกแบน",
  ลิง: "ปีนต้นไม้ได้ ชอบกล้วย",
  เสือ: "มีลาย ตัวใหญ่ คล้ายแมว",
  หมี: "ตัวใหญ่ มีขนหนา",
  สิงโต: "ตัวใหญ่ มีแผงคอ",
  ยีราฟ: "คอยาวมาก",
  ม้าลาย: "คล้ายม้า มีลายขาวดำ",
  กวาง: "มีเขา วิ่งเร็ว",
  อูฐ: "มีโหนก อยู่ในทะเลทราย",
  แกะ: "มีขนฟู กินหญ้า",
  หนู: "ตัวเล็ก หางยาว",
  กระรอก: "ตัวเล็ก หางฟู ปีนต้นไม้ได้",
  จิ้งจก: "ตัวเล็ก เกาะผนังได้",
};

const setLabels = {
  "set-1": [
    "หมา",
    "นก",
    "วัว",
    "ลา",
    "ควาย",
    "จระเข้",
    "แรด",
    "ปลาหมึก",
    "เต่า",
    "งู",
    "ค้างคาว",
    "ผึ้ง",
    "ยุง",
    "แมลงวัน",
    "แมงมุม",
  ],
  "set-2": [
    "แมว",
    "เป็ด",
    "ช้าง",
    "ม้า",
    "แพะ",
    "กระต่าย",
    "ฮิปโป",
    "ฉลาม",
    "โลมา",
    "กบ",
    "ปู",
    "หอย",
    "นกยูง",
    "มด",
    "ผีเสื้อ",
  ],
  "set-3": [
    "ปลา",
    "ไก่",
    "หมู",
    "ลิง",
    "เสือ",
    "หมี",
    "สิงโต",
    "ยีราฟ",
    "ม้าลาย",
    "กวาง",
    "อูฐ",
    "แกะ",
    "หนู",
    "กระรอก",
    "จิ้งจก",
  ],
} as const;

function createQuestion(
  setId: NamingSet["id"],
  answer: string,
  index: number,
): NamingQuestion {
  return {
    id: `pn002-${setId}-${String(index + 1).padStart(2, "0")}`,
    moduleId: MODULE_ID,
    categoryId: CATEGORY_ID,
    categoryName: CATEGORY_NAME,
    internalLevel: "easy",
    setId,
    order: index + 1,
    label: answer,
    promptText: "ภาพนี้คืออะไร",
    answer,
    acceptableAnswers: acceptableAnswersByAnswer[answer] ?? [answer],
    imageSrc: imageSrcByAnswer[answer],
    hints: [
      { level: 1, type: "category", text: "เป็นสัตว์" },
      {
        level: 2,
        type: "feature",
        text:
          featureHintByAnswer[answer] ??
          "ลองนึกถึงรูปร่างและที่อยู่ของสัตว์ตัวนี้",
      },
      {
        level: 3,
        type: "initial_sound",
        text: `ขึ้นต้นด้วยเสียง ${answer.slice(0, 1)}`,
      },
    ],
  };
}

function createSet(setId: NamingSet["id"], title: string): NamingSet {
  const questions = setLabels[setId].map((answer, index) =>
    createQuestion(setId, answer, index),
  );

  return {
    id: setId,
    moduleId: MODULE_ID,
    categoryId: CATEGORY_ID,
    categoryName: CATEGORY_NAME,
    title,
    totalQuestions: questions.length,
    internalLevel: "easy",
    questions,
  };
}

export const mockPn002NamingSets: NamingSet[] = [
  createSet("set-1", "ชุดที่ 1"),
  createSet("set-2", "ชุดที่ 2"),
  createSet("set-3", "ชุดที่ 3"),
];

export const mockPn002NamingCategory: NamingCategory = {
  id: CATEGORY_ID,
  moduleId: MODULE_ID,
  name: CATEGORY_NAME,
  title: "หมวดสัตว์",
  description: "ฝึกพูดชื่อสัตว์จากรูปภาพ",
  totalSets: mockPn002NamingSets.length,
  totalQuestions: mockPn002NamingSets.reduce(
    (total, set) => total + set.totalQuestions,
    0,
  ),
  sets: mockPn002NamingSets.map(({ id, title, totalQuestions }) => ({
    id,
    title,
    totalQuestions,
  })),
};

export const mockPn002NamingModule: TrainingModule = {
  id: MODULE_ID,
  title: "แบบฝึกเรียกชื่อภาพ",
  subtitle: "ฝึกพูดชื่อจากรูปภาพ",
  categories: [mockPn002NamingCategory],
};

export const mockNamingSessions: NamingSessionState[] = [];

export const mockNamingResponses: NamingResponse[] = [];

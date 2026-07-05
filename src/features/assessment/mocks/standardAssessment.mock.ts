import type {
  AssessmentCategorySummary,
  SavedAssessmentAnswer,
  StandardAssessmentCategory,
  StandardAssessmentIntro,
  StandardAssessmentQuestion,
  StandardAssessmentResult,
  StandardAssessmentSession,
} from "../types/assessment.types";

const categoryLabels: Record<StandardAssessmentCategory, string> = {
  spontaneous: "การพูดอิสระ",
  comprehension: "ความเข้าใจภาษา",
  repetition: "พูดตาม",
  naming: "การเรียกชื่อ",
};

function createQuestion(
  question: Omit<StandardAssessmentQuestion, "categoryLabel">,
): StandardAssessmentQuestion {
  return {
    ...question,
    categoryLabel: categoryLabels[question.category],
  };
}

const questions: StandardAssessmentQuestion[] = [
  // 1-6 spontaneous (voice_question)
  createQuestion({ id: "q-01", order: 1, category: "spontaneous", interactionType: "voice_question", promptText: "คุณชื่ออะไร", hints: [
    { level: 1, type: "repeat_question", text: "คำถามคือ คุณชื่ออะไร" },
    { level: 2, type: "feature", text: "ตอบเป็นชื่อของคุณ" },
  ] }),
  createQuestion({ id: "q-02", order: 2, category: "spontaneous", interactionType: "voice_question", promptText: "คุณนามสกุลอะไร", hints: [
    { level: 1, type: "repeat_question", text: "คำถามคือ คุณนามสกุลอะไร" },
    { level: 2, type: "feature", text: "ตอบเป็นนามสกุลของคุณ" },
  ] }),
  createQuestion({ id: "q-03", order: 3, category: "spontaneous", interactionType: "voice_question", promptText: "บ้านของคุณอยู่ที่จังหวัดอะไร", hints: [
    { level: 1, type: "repeat_question", text: "คำถามคือ บ้านของคุณอยู่ที่จังหวัดอะไร" },
    { level: 2, type: "feature", text: "ตอบเป็นชื่อจังหวัด" },
  ] }),
  createQuestion({ id: "q-04", order: 4, category: "spontaneous", interactionType: "voice_question", promptText: "หนึ่งสัปดาห์มีกี่วัน", expectedAnswer: "เจ็ดวัน", hints: [
    { level: 1, type: "repeat_question", text: "คำถามคือ หนึ่งสัปดาห์มีกี่วัน" },
    { level: 2, type: "answer", text: "คำตอบคือ เจ็ดวัน" },
  ] }),
  createQuestion({ id: "q-05", order: 5, category: "spontaneous", interactionType: "voice_question", promptText: "เกลือมีรสอะไร", expectedAnswer: "เค็ม", hints: [
    { level: 1, type: "repeat_question", text: "คำถามคือ เกลือมีรสอะไร" },
    { level: 2, type: "answer", text: "คำตอบคือ เค็ม" },
  ] }),
  createQuestion({ id: "q-06", order: 6, category: "spontaneous", interactionType: "voice_question", promptText: "คุณทำอะไรเมื่อหิวข้าว", expectedAnswer: "กินข้าว", hints: [
    { level: 1, type: "repeat_question", text: "คำถามคือ คุณทำอะไรเมื่อหิวข้าว" },
    { level: 2, type: "answer", text: "คำตอบคือ กินข้าว" },
  ] }),

  // 7-10 comprehension (image_choice)
  createQuestion({
    id: "q-07",
    order: 7,
    category: "comprehension",
    interactionType: "image_choice",
    promptText: "กล้วย",
    expectedAnswer: "กล้วย",
    choices: [
      { id: "banana", label: "กล้วย", imageSrc: "/images/assessment/banana.png", isCorrect: true },
      { id: "apple", label: "แอปเปิ้ล", imageSrc: "/images/assessment/apple.png", isCorrect: false },
      { id: "lime", label: "มะนาว", imageSrc: "/images/assessment/lime.png", isCorrect: false },
    ],
    hints: [
      { level: 1, type: "repeat_question", text: "ลองฟังอีกครั้ง: กล้วย" },
      { level: 2, type: "repeat_question", text: "คำถามคือ ให้ชี้รูป กล้วย" },
      { level: 3, type: "answer", text: "คำตอบคือ กล้วย" },
    ],
  }),
  createQuestion({
    id: "q-08",
    order: 8,
    category: "comprehension",
    interactionType: "image_choice",
    promptText: "เก้าอี้",
    expectedAnswer: "เก้าอี้",
    choices: [
      { id: "chair", label: "เก้าอี้", imageSrc: "/images/assessment/chair.png", isCorrect: true },
      { id: "table", label: "โต๊ะ", imageSrc: "/images/assessment/table.png", isCorrect: false },
      { id: "spoon", label: "ช้อน", imageSrc: "/images/assessment/spoon.png", isCorrect: false },
    ],
    hints: [
      { level: 1, type: "repeat_question", text: "ลองฟังอีกครั้ง: เก้าอี้" },
      { level: 2, type: "repeat_question", text: "คำถามคือ ให้ชี้รูป เก้าอี้" },
      { level: 3, type: "answer", text: "คำตอบคือ เก้าอี้" },
    ],
  }),
  createQuestion({
    id: "q-09",
    order: 9,
    category: "comprehension",
    interactionType: "image_choice",
    promptText: "แมว",
    expectedAnswer: "แมว",
    choices: [
      { id: "cat", label: "แมว", imageSrc: "/images/assessment/cat.png", isCorrect: true },
      { id: "dog", label: "หมา", imageSrc: "/images/assessment/dog.png", isCorrect: false },
      { id: "rabbit", label: "กระต่าย", imageSrc: "/images/assessment/rabbit.png", isCorrect: false },
    ],
    hints: [
      { level: 1, type: "repeat_question", text: "ลองฟังอีกครั้ง: แมว" },
      { level: 2, type: "repeat_question", text: "คำถามคือ ให้ชี้รูป แมว" },
      { level: 3, type: "answer", text: "คำตอบคือ แมว" },
    ],
  }),
  createQuestion({
    id: "q-10",
    order: 10,
    category: "comprehension",
    interactionType: "image_choice",
    promptText: "พัดลม",
    expectedAnswer: "พัดลม",
    choices: [
      { id: "fan", label: "พัดลม", imageSrc: "/images/assessment/fan.png", isCorrect: true },
      { id: "phone", label: "โทรศัพท์", imageSrc: "/images/assessment/phone.png", isCorrect: false },
      { id: "comb", label: "หวี", imageSrc: "/images/assessment/comb.png", isCorrect: false },
    ],
    hints: [
      { level: 1, type: "repeat_question", text: "ลองฟังอีกครั้ง: พัดลม" },
      { level: 2, type: "repeat_question", text: "คำถามคือ ให้ชี้รูป พัดลม" },
      { level: 3, type: "answer", text: "คำตอบคือ พัดลม" },
    ],
  }),

  // 11-16 comprehension yes/no
  createQuestion({ id: "q-11", order: 11, category: "comprehension", interactionType: "yes_no_choice", promptText: "คุณเป็นผู้ชายใช่หรือไม่", expectedAnswer: "ใช่", choices: [{ id: "yes", label: "ใช่", isCorrect: true }, { id: "no", label: "ไม่ใช่", isCorrect: false }], hints: [
    { level: 1, type: "repeat_question", text: "ลองฟังอีกครั้ง: คุณเป็นผู้ชายใช่หรือไม่" },
    { level: 2, type: "repeat_question", text: "คำถามคือ คุณเป็นผู้ชาย ใช่หรือไม่" },
    { level: 3, type: "answer", text: "คำตอบคือ ใช่" },
  ]}),
  createQuestion({ id: "q-12", order: 12, category: "comprehension", interactionType: "yes_no_choice", promptText: "บ้านของคุณอยู่ที่ลำปางใช่หรือไม่", expectedAnswer: "ใช่", choices: [{ id: "yes", label: "ใช่", isCorrect: true }, { id: "no", label: "ไม่ใช่", isCorrect: false }], hints: [
    { level: 1, type: "repeat_question", text: "ลองฟังอีกครั้ง: บ้านของคุณอยู่ที่ลำปางใช่หรือไม่" },
    { level: 2, type: "repeat_question", text: "คำถามคือ บ้านของคุณอยู่ที่ลำปาง ใช่หรือไม่" },
    { level: 3, type: "answer", text: "คำตอบคือ ใช่" },
  ]}),
  createQuestion({ id: "q-13", order: 13, category: "comprehension", interactionType: "yes_no_choice", promptText: "ช้างตัวเล็กกว่ามดใช่หรือไม่", expectedAnswer: "ไม่ใช่", choices: [{ id: "yes", label: "ใช่", isCorrect: false }, { id: "no", label: "ไม่ใช่", isCorrect: true }], hints: [
    { level: 1, type: "repeat_question", text: "ลองฟังอีกครั้ง: ช้างตัวเล็กกว่ามดใช่หรือไม่" },
    { level: 2, type: "repeat_question", text: "คำถามคือ ช้างตัวเล็กกว่ามด ใช่หรือไม่" },
    { level: 3, type: "answer", text: "คำตอบคือ ไม่ใช่" },
  ]}),
  createQuestion({ id: "q-14", order: 14, category: "comprehension", interactionType: "yes_no_choice", promptText: "เดือนพฤษภาคมมาก่อนเดือนมีนาคมใช่หรือไม่", expectedAnswer: "ไม่ใช่", choices: [{ id: "yes", label: "ใช่", isCorrect: false }, { id: "no", label: "ไม่ใช่", isCorrect: true }], hints: [
    { level: 1, type: "repeat_question", text: "ลองฟังอีกครั้ง: เดือนพฤษภาคมมาก่อนเดือนมีนาคมใช่หรือไม่" },
    { level: 2, type: "repeat_question", text: "คำถามคือ เดือนพฤษภาคมมาก่อนเดือนมีนาคม ใช่หรือไม่" },
    { level: 3, type: "answer", text: "คำตอบคือ ไม่ใช่" },
  ]}),
  createQuestion({ id: "q-15", order: 15, category: "comprehension", interactionType: "yes_no_choice", promptText: "คุณกินส้มโดยไม่ปอกเปลือกใช่หรือไม่", expectedAnswer: "ไม่ใช่", choices: [{ id: "yes", label: "ใช่", isCorrect: false }, { id: "no", label: "ไม่ใช่", isCorrect: true }], hints: [
    { level: 1, type: "repeat_question", text: "ลองฟังอีกครั้ง: คุณกินส้มโดยไม่ปอกเปลือกใช่หรือไม่" },
    { level: 2, type: "repeat_question", text: "คำถามคือ คุณกินส้มโดยไม่ปอกเปลือก ใช่หรือไม่" },
    { level: 3, type: "answer", text: "คำตอบคือ ไม่ใช่" },
  ]}),
  createQuestion({ id: "q-16", order: 16, category: "comprehension", interactionType: "yes_no_choice", promptText: "อากาศร้อนมากในช่วงเดือนธันวาคมใช่หรือไม่", expectedAnswer: "ไม่ใช่", choices: [{ id: "yes", label: "ใช่", isCorrect: false }, { id: "no", label: "ไม่ใช่", isCorrect: true }], hints: [
    { level: 1, type: "repeat_question", text: "ลองฟังอีกครั้ง: อากาศร้อนมากในช่วงเดือนธันวาคมใช่หรือไม่" },
    { level: 2, type: "repeat_question", text: "คำถามคือ อากาศร้อนมากในช่วงเดือนธันวาคม ใช่หรือไม่" },
    { level: 3, type: "answer", text: "คำตอบคือ ไม่ใช่" },
  ]}),

  // 17-23 repetition (repeat_after)
  createQuestion({ id: "q-17", order: 17, category: "repetition", interactionType: "repeat_after", promptText: "เตียง", expectedAnswer: "เตียง", hints: [
    { level: 1, type: "slow_repetition", text: "พูดช้าลง: เตียง" },
    { level: 2, type: "slow_repetition", text: "พูดช้าลงอีกครั้ง: เตียง" },
    { level: 3, type: "normal_repetition", text: "พูดความเร็วปกติ: เตียง" },
  ] }),
  createQuestion({ id: "q-18", order: 18, category: "repetition", interactionType: "repeat_after", promptText: "แตงโม", expectedAnswer: "แตงโม", hints: [
    { level: 1, type: "slow_repetition", text: "พูดช้าลง: แตง / โม" },
    { level: 2, type: "slow_repetition", text: "พูดช้าลงอีกครั้ง: แตง / โม" },
    { level: 3, type: "normal_repetition", text: "พูดความเร็วปกติ: แตงโม" },
  ] }),
  createQuestion({ id: "q-19", order: 19, category: "repetition", interactionType: "repeat_after", promptText: "โทรศัพท์", expectedAnswer: "โทรศัพท์", hints: [
    { level: 1, type: "slow_repetition", text: "พูดช้าลง: โทร / ศัพท์" },
    { level: 2, type: "slow_repetition", text: "พูดช้าลงอีกครั้ง: โทร / ศัพท์" },
    { level: 3, type: "normal_repetition", text: "พูดความเร็วปกติ: โทรศัพท์" },
  ] }),
  createQuestion({ id: "q-20", order: 20, category: "repetition", interactionType: "repeat_after", promptText: "รถติดบนถนน", expectedAnswer: "รถติดบนถนน", hints: [
    { level: 1, type: "slow_repetition", text: "พูดช้าลง: รถ / ติด / บน / ถนน" },
    { level: 2, type: "slow_repetition", text: "พูดช้าลงอีกครั้ง: รถ / ติด / บน / ถนน" },
    { level: 3, type: "normal_repetition", text: "พูดความเร็วปกติ: รถติดบนถนน" },
  ] }),
  createQuestion({ id: "q-21", order: 21, category: "repetition", interactionType: "repeat_after", promptText: "เมื่อคืนฝนตกหนักมาก", expectedAnswer: "เมื่อคืนฝนตกหนักมาก", hints: [
    { level: 1, type: "slow_repetition", text: "พูดช้าลง: เมื่อคืน / ฝน / ตก / หนัก / มาก" },
    { level: 2, type: "slow_repetition", text: "พูดช้าลงอีกครั้ง: เมื่อคืน / ฝน / ตก / หนัก / มาก" },
    { level: 3, type: "normal_repetition", text: "พูดความเร็วปกติ: เมื่อคืนฝนตกหนักมาก" },
  ] }),
  createQuestion({ id: "q-22", order: 22, category: "repetition", interactionType: "repeat_after", promptText: "แม่ไปซื้อกับข้าวที่ตลาด", expectedAnswer: "แม่ไปซื้อกับข้าวที่ตลาด", hints: [
    { level: 1, type: "slow_repetition", text: "พูดช้าลง: แม่ / ไป / ซื้อ / กับข้าว / ที่ / ตลาด" },
    { level: 2, type: "slow_repetition", text: "พูดช้าลงอีกครั้ง: แม่ / ไป / ซื้อ / กับข้าว / ที่ / ตลาด" },
    { level: 3, type: "normal_repetition", text: "พูดความเร็วปกติ: แม่ไปซื้อกับข้าวที่ตลาด" },
  ] }),
  createQuestion({ id: "q-23", order: 23, category: "repetition", interactionType: "repeat_after", promptText: "การฝึกพูดทุกวันช่วยให้พูดเก่งขึ้น", expectedAnswer: "การฝึกพูดทุกวันช่วยให้พูดเก่งขึ้น", hints: [
    { level: 1, type: "slow_repetition", text: "พูดช้าลง: การฝึกพูด / ทุกวัน / ช่วยให้ / พูดเก่งขึ้น" },
    { level: 2, type: "slow_repetition", text: "พูดช้าลงอีกครั้ง: การฝึกพูด / ทุกวัน / ช่วยให้ / พูดเก่งขึ้น" },
    { level: 3, type: "normal_repetition", text: "พูดความเร็วปกติ: การฝึกพูดทุกวันช่วยให้พูดเก่งขึ้น" },
  ] }),

  // 24-30 naming (name_image)
  createQuestion({ id: "q-24", order: 24, category: "naming", interactionType: "name_image", promptText: "ภาพนี้คืออะไร", expectedAnswer: "แมว", imageSrc: "/images/assessment/cat.png", hints: [
    { level: 1, type: "feature", text: "มีหนวด มีหาง ร้องเหมียว" },
    { level: 2, type: "initial_sound", text: "ขึ้นต้นด้วยเสียง ม" },
    { level: 3, type: "answer", text: "คำตอบคือ แมว" },
  ] }),
  createQuestion({ id: "q-25", order: 25, category: "naming", interactionType: "name_image", promptText: "ภาพนี้คืออะไร", expectedAnswer: "จระเข้", imageSrc: "/images/assessment/crocodile.png", hints: [
    { level: 1, type: "feature", text: "เป็นสัตว์เลื้อยคลาน อยู่ในน้ำได้" },
    { level: 2, type: "initial_sound", text: "ขึ้นต้นด้วยเสียง จ" },
    { level: 3, type: "answer", text: "คำตอบคือ จระเข้" },
  ] }),
  createQuestion({ id: "q-26", order: 26, category: "naming", interactionType: "name_image", promptText: "ภาพนี้คืออะไร", expectedAnswer: "กางเกง", imageSrc: "/images/assessment/pants.png", hints: [
    { level: 1, type: "feature", text: "เป็นเสื้อผ้าสำหรับใส่ที่ขา" },
    { level: 2, type: "initial_sound", text: "ขึ้นต้นด้วยเสียง ก" },
    { level: 3, type: "answer", text: "คำตอบคือ กางเกง" },
  ] }),
  createQuestion({ id: "q-27", order: 27, category: "naming", interactionType: "name_image", promptText: "ภาพนี้คืออะไร", expectedAnswer: "หวี", imageSrc: "/images/assessment/comb.png", hints: [
    { level: 1, type: "feature", text: "ของใช้สำหรับจัดผมให้เรียบ" },
    { level: 2, type: "initial_sound", text: "ขึ้นต้นด้วยเสียง ห" },
    { level: 3, type: "answer", text: "คำตอบคือ หวี" },
  ] }),
  createQuestion({ id: "q-28", order: 28, category: "naming", interactionType: "name_image", promptText: "ภาพนี้คืออะไร", expectedAnswer: "โทรศัพท์", imageSrc: "/images/assessment/phone.png", hints: [
    { level: 1, type: "feature", text: "ใช้โทรคุยหรือส่งข้อความ" },
    { level: 2, type: "initial_sound", text: "ขึ้นต้นด้วยเสียง ท" },
    { level: 3, type: "answer", text: "คำตอบคือ โทรศัพท์" },
  ] }),
  createQuestion({ id: "q-29", order: 29, category: "naming", interactionType: "name_image", promptText: "ภาพนี้คืออะไร", expectedAnswer: "แอปเปิ้ล", imageSrc: "/images/assessment/apple.png", hints: [
    { level: 1, type: "feature", text: "ผลไม้สีแดง รูปร่างกลม" },
    { level: 2, type: "initial_sound", text: "ขึ้นต้นด้วยเสียง แอ" },
    { level: 3, type: "answer", text: "คำตอบคือ แอปเปิ้ล" },
  ] }),
  createQuestion({ id: "q-30", order: 30, category: "naming", interactionType: "name_image", promptText: "ภาพนี้คืออะไร", expectedAnswer: "ไข่ต้ม", imageSrc: "/images/assessment/boiled-egg.png", hints: [
    { level: 1, type: "feature", text: "อาหารจากไข่ที่สุกแล้ว" },
    { level: 2, type: "initial_sound", text: "ขึ้นต้นด้วยเสียง ไข" },
    { level: 3, type: "answer", text: "คำตอบคือ ไข่ต้ม" },
  ] }),
];

const categorySummaries: AssessmentCategorySummary[] = [
  {
    category: "spontaneous",
    label: categoryLabels.spontaneous,
    summaryText: "บันทึกคำตอบหมวดการพูดอิสระครบแล้ว",
    noteText: "ยังไม่มีการตีความผลทางคลินิกในรอบนี้",
  },
  {
    category: "comprehension",
    label: categoryLabels.comprehension,
    summaryText: "บันทึกคำตอบหมวดความเข้าใจภาษาครบแล้ว",
    noteText: "ผลจริงจะประมวลผลผ่าน backend ในอนาคต",
  },
  {
    category: "repetition",
    label: categoryLabels.repetition,
    summaryText: "บันทึกคำตอบหมวดพูดตามครบแล้ว",
    noteText: "รอบนี้ยังไม่ใช้ ASR หรือ scoring จริง",
  },
  {
    category: "naming",
    label: categoryLabels.naming,
    summaryText: "บันทึกคำตอบหมวดการเรียกชื่อครบแล้ว",
    noteText: "นักแก้ไขการพูดจะเป็นผู้กำหนดการตีความจริงภายหลัง",
  },
];

export const mockStandardAssessmentSession: StandardAssessmentSession = {
  sessionId: "standard-assessment-mock-session-001",
  totalQuestions: questions.length,
  questions,
};

export const mockStandardAssessmentIntro: StandardAssessmentIntro = {
  title: "แบบประเมินมาตรฐาน",
  subtitle:
    "เริ่มทำแบบประเมินเพื่อให้ระบบวางแผนการฝึกที่เหมาะกับคุณ",
  infoItems: [
    `ทั้งหมด ${mockStandardAssessmentSession.totalQuestions} ข้อ`,
    "ใช้เวลาประมาณ 10-15 นาที",
    "ตอบตามที่ทำได้ ไม่ต้องกังวล",
  ],
  startButtonText: "เริ่มทำแบบประเมิน",
  startFeedbackMessage: "เยี่ยมเลย เริ่มกันเลย!",
};

export const mockStandardAssessmentResult: StandardAssessmentResult = {
  sessionId: mockStandardAssessmentSession.sessionId,
  title: "จบการประเมิน",
  subtitle: "ระบบบันทึกผลการประเมินของคุณเรียบร้อยแล้ว",
  completedQuestions: mockStandardAssessmentSession.totalQuestions,
  totalQuestions: mockStandardAssessmentSession.totalQuestions,
  summaryTitle: `ทำครบ ${mockStandardAssessmentSession.totalQuestions} ข้อ`,
  summaryText: "ระบบจะนำผลไปใช้จัดแผนการฝึกครั้งถัดไป",
  categorySummaries,
  homeButtonText: "กลับหน้าหลัก",
};

export const mockSavedStandardAssessmentAnswers: SavedAssessmentAnswer[] = [];

import {
  mockSavedStandardAssessmentAnswers,
  mockStandardAssessmentIntro,
  mockStandardAssessmentResult,
  mockStandardAssessmentSession,
} from "../mocks/standardAssessment.mock";
import type {
  AssessmentAnswer,
  AssessmentServiceResult,
  SavedAssessmentAnswer,
  StandardAssessmentIntro,
  StandardAssessmentResult,
  StandardAssessmentSession,
} from "../types/assessment.types";

const MOCK_API_DELAY_MS = 250;

async function waitForMockApi() {
  await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY_MS));
}

export async function getStandardAssessmentIntro(): Promise<
  AssessmentServiceResult<StandardAssessmentIntro>
> {
  await waitForMockApi();

  return {
    success: true,
    data: mockStandardAssessmentIntro,
  };
}

export async function getStandardAssessmentSession(): Promise<
  AssessmentServiceResult<StandardAssessmentSession>
> {
  await waitForMockApi();

  return {
    success: true,
    data: {
      ...mockStandardAssessmentSession,
      questions: mockStandardAssessmentSession.questions.map((question) => {
        const questionWithoutHints = { ...question };
        delete questionWithoutHints.hints;
        delete questionWithoutHints.hintText;
        return questionWithoutHints;
      }),
    },
  };
}

export async function saveStandardAssessmentAnswer(
  answer: AssessmentAnswer,
): Promise<AssessmentServiceResult<SavedAssessmentAnswer>> {
  await waitForMockApi();

  if (!answer.questionId) {
    return {
      success: false,
      errorMessage: "ไม่พบคำถามสำหรับบันทึกคำตอบ",
    };
  }

  const savedAnswer: SavedAssessmentAnswer = {
    answerId: `mock-answer-${mockSavedStandardAssessmentAnswers.length + 1}`,
    questionId: answer.questionId,
    answerType: answer.answerType,
    selectedOptionId: answer.selectedOptionId,
    mockRecordingState: answer.mockRecordingState,
    hintLevelUsed: answer.hintLevelUsed,
    hintCountUsed: answer.hintCountUsed,
    responseTimeMs: answer.responseTimeMs,
    isCorrect: answer.isCorrect,
    skipped: answer.skipped,
    savedAt: new Date().toISOString(),
  };

  mockSavedStandardAssessmentAnswers.push(savedAnswer);

  return {
    success: true,
    data: savedAnswer,
  };
}

export async function getStandardAssessmentResult(): Promise<
  AssessmentServiceResult<StandardAssessmentResult>
> {
  await waitForMockApi();

  return {
    success: true,
    data: mockStandardAssessmentResult,
  };
}

import {
  mockNamingResponses,
  mockNamingSessions,
  mockPn002NamingCategory,
  mockPn002NamingModule,
  mockPn002NamingSets,
  imageSrcByAnswer,
} from "../mocks/pn002Naming.mock";
import type {
  NamingCategory,
  NamingQuestion,
  NamingResponse,
  NamingSessionState,
  NamingSessionSummary,
  NamingSet,
  TrainingModule,
  TrainingServiceResult,
} from "../types/pn002Naming.types";

const MOCK_API_DELAY_MS = 180;

async function waitForMockApi() {
  await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY_MS));
}

function createSuccess<T>(data: T): TrainingServiceResult<T> {
  return { success: true, data };
}

function createFailure<T>(errorMessage: string): TrainingServiceResult<T> {
  return { success: false, errorMessage };
}

export async function getPn002NamingModule(): Promise<
  TrainingServiceResult<TrainingModule>
> {
  await waitForMockApi();

  return createSuccess(mockPn002NamingModule);
}

export async function getNamingCategories(): Promise<
  TrainingServiceResult<NamingCategory[]>
> {
  await waitForMockApi();

  return createSuccess([mockPn002NamingCategory]);
}

export async function getNamingAnimalSets(): Promise<
  TrainingServiceResult<NamingSet[]>
> {
  await waitForMockApi();

  return createSuccess(mockPn002NamingSets);
}

export async function getNamingSetById(
  setId: string,
): Promise<TrainingServiceResult<NamingSet>> {
  await waitForMockApi();

  const set = mockPn002NamingSets.find((item) => item.id === setId);

  if (!set) {
    return createFailure("ไม่พบชุดแบบฝึก");
  }

  // Return a deep clone and ensure imageSrc is refreshed from current mapping
  const cloned: NamingSet = JSON.parse(JSON.stringify(set));
  cloned.questions = cloned.questions.map((q) => ({
    ...q,
    imageSrc: imageSrcByAnswer[q.answer] ?? q.imageSrc,
  }));

  return createSuccess(cloned);
}

export async function getNamingQuestionById(
  questionId: string,
): Promise<TrainingServiceResult<NamingQuestion>> {
  await waitForMockApi();

  const question = mockPn002NamingSets
    .flatMap((set) => set.questions)
    .find((item) => item.id === questionId);

  if (!question) {
    return createFailure("ไม่พบข้อแบบฝึก");
  }

  // ensure imageSrc uses current mapping
  const clonedQuestion = { ...question, imageSrc: imageSrcByAnswer[question.answer] ?? question.imageSrc };

  return createSuccess(clonedQuestion);
}

export async function createMockNamingSession(
  setId: NamingSet["id"],
): Promise<TrainingServiceResult<NamingSessionState>> {
  await waitForMockApi();

  const set = mockPn002NamingSets.find((item) => item.id === setId);

  if (!set) {
    return createFailure("ไม่พบชุดแบบฝึก");
  }

  const session: NamingSessionState = {
    sessionId: `pn002-session-${setId}-${Date.now()}`,
    moduleId: "PN002",
    categoryId: "animals",
    setId,
    startedAt: new Date().toISOString(),
    currentQuestionIndex: 0,
    totalQuestions: set.totalQuestions,
    responses: [],
  };

  mockNamingSessions.push(session);

  return createSuccess(session);
}

export async function getMockNamingSessionById(
  sessionId: string,
): Promise<TrainingServiceResult<NamingSessionState>> {
  await waitForMockApi();

  const session = mockNamingSessions.find((item) => item.sessionId === sessionId);

  if (!session) {
    return createFailure("ไม่พบข้อมูล session");
  }

  return createSuccess(session);
}

export async function submitMockNamingAnswer(
  response: Omit<NamingResponse, "responseId" | "submittedAt">,
): Promise<TrainingServiceResult<NamingResponse>> {
  await waitForMockApi();

  // TODO: replace mock data with backend API integration.
  const savedResponse: NamingResponse = {
    ...response,
    responseId: `pn002-response-${mockNamingResponses.length + 1}`,
    submittedAt: new Date().toISOString(),
  };

  mockNamingResponses.push(savedResponse);

  const session = mockNamingSessions.find(
    (item) => item.sessionId === response.sessionId,
  );

  if (session) {
    session.responses.push(savedResponse);
  }

  return createSuccess(savedResponse);
}

export async function getMockNamingSessionSummary(
  sessionId: string,
): Promise<TrainingServiceResult<NamingSessionSummary>> {
  await waitForMockApi();

  const session = mockNamingSessions.find((item) => item.sessionId === sessionId);

  if (!session) {
    return createFailure("ไม่พบข้อมูล session");
  }

  const set = mockPn002NamingSets.find((item) => item.id === session.setId);
  const responses = mockNamingResponses.filter(
    (response) => response.sessionId === sessionId,
  );
  const wordsToReview =
    set?.questions
      .filter((question) => {
        const response = responses.find(
          (item) => item.questionId === question.id,
        );

        return !response || response.skipped || response.isCorrect === false;
      })
      .slice(0, 6)
      .map((question) => question.answer) ?? [];

  return createSuccess({
    sessionId,
    setId: session.setId,
    categoryName: "สัตว์",
    completedQuestions: responses.length,
    totalQuestions: session.totalQuestions,
    correctCount: responses.filter((response) => response.isCorrect).length,
    skippedCount: responses.filter((response) => response.skipped).length,
    wordsToReview,
    completedAt: new Date().toISOString(),
  });
}

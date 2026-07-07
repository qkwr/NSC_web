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
const NAMING_SESSIONS_STORAGE_KEY = "nsc_pn002_naming_sessions";
const NAMING_RESPONSES_STORAGE_KEY = "nsc_pn002_naming_responses";

async function waitForMockApi() {
  await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY_MS));
}

function createSuccess<T>(data: T): TrainingServiceResult<T> {
  return { success: true, data };
}

function createFailure<T>(errorMessage: string): TrainingServiceResult<T> {
  return { success: false, errorMessage };
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readStoredNamingSessions(): NamingSessionState[] {
  if (!canUseLocalStorage()) {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(NAMING_SESSIONS_STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredNamingSessions(sessions: NamingSessionState[]) {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(
    NAMING_SESSIONS_STORAGE_KEY,
    JSON.stringify(sessions),
  );
}

function readStoredNamingResponses(): NamingResponse[] {
  if (!canUseLocalStorage()) {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(NAMING_RESPONSES_STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredNamingResponses(responses: NamingResponse[]) {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(
    NAMING_RESPONSES_STORAGE_KEY,
    JSON.stringify(responses),
  );
}

function getAllNamingSessions() {
  const storedSessions = readStoredNamingSessions();
  const storedSessionIds = new Set(storedSessions.map((session) => session.sessionId));

  return [
    ...mockNamingSessions.filter((session) => !storedSessionIds.has(session.sessionId)),
    ...storedSessions,
  ];
}

function getAllNamingResponses() {
  const storedResponses = readStoredNamingResponses();
  const storedResponseIds = new Set(
    storedResponses.map((response) => response.responseId),
  );

  return [
    ...mockNamingResponses.filter(
      (response) => !storedResponseIds.has(response.responseId),
    ),
    ...storedResponses,
  ];
}

function upsertStoredNamingSession(session: NamingSessionState) {
  const storedSessions = readStoredNamingSessions();
  const existingIndex = storedSessions.findIndex(
    (item) => item.sessionId === session.sessionId,
  );

  if (existingIndex === -1) {
    writeStoredNamingSessions([...storedSessions, session]);
    return;
  }

  const nextSessions = [...storedSessions];
  nextSessions[existingIndex] = session;
  writeStoredNamingSessions(nextSessions);
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
  patientId = "patient-001",
): Promise<TrainingServiceResult<NamingSessionState>> {
  await waitForMockApi();

  const set = mockPn002NamingSets.find((item) => item.id === setId);

  if (!set) {
    return createFailure("ไม่พบชุดแบบฝึก");
  }

  const session: NamingSessionState = {
    sessionId: `pn002-session-${setId}-${Date.now()}`,
    patientId,
    moduleId: "PN002",
    categoryId: "animals",
    setId,
    startedAt: new Date().toISOString(),
    currentQuestionIndex: 0,
    totalQuestions: set.totalQuestions,
    responses: [],
  };

  if (canUseLocalStorage()) {
    upsertStoredNamingSession(session);
  } else {
    mockNamingSessions.push(session);
  }

  return createSuccess(session);
}

export async function getMockNamingSessionById(
  sessionId: string,
): Promise<TrainingServiceResult<NamingSessionState>> {
  await waitForMockApi();

  const session = getAllNamingSessions().find(
    (item) => item.sessionId === sessionId,
  );

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
    responseId: `pn002-response-${getAllNamingResponses().length + 1}`,
    submittedAt: new Date().toISOString(),
  };

  if (canUseLocalStorage()) {
    writeStoredNamingResponses([...readStoredNamingResponses(), savedResponse]);
  } else {
    mockNamingResponses.push(savedResponse);
  }

  const session = getAllNamingSessions().find(
    (item) => item.sessionId === response.sessionId,
  );

  if (session) {
    const hasExistingResponse = session.responses.some(
      (item) => item.questionId === savedResponse.questionId,
    );

    if (!hasExistingResponse) {
      session.responses.push(savedResponse);
    }

    if (canUseLocalStorage()) {
      upsertStoredNamingSession(session);
    }
  }

  return createSuccess(savedResponse);
}

export async function getMockNamingSessionSummary(
  sessionId: string,
): Promise<TrainingServiceResult<NamingSessionSummary>> {
  await waitForMockApi();

  const session = getAllNamingSessions().find(
    (item) => item.sessionId === sessionId,
  );

  if (!session) {
    return createFailure("ไม่พบข้อมูล session");
  }

  const set = mockPn002NamingSets.find((item) => item.id === session.setId);
  const responses = getAllNamingResponses().filter(
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

export function getSavedNamingResponsesForPatient(patientId: string) {
  const sessions = getAllNamingSessions().filter(
    (session) => session.patientId === patientId,
  );
  const sessionIds = new Set(sessions.map((session) => session.sessionId));
  const questions = mockPn002NamingSets.flatMap((set) => set.questions);

  return getAllNamingResponses()
    .filter((response) => sessionIds.has(response.sessionId))
    .map((response) => {
      const session = sessions.find((item) => item.sessionId === response.sessionId);
      const question = questions.find((item) => item.id === response.questionId);

      return {
        response,
        session,
        question,
      };
    });
}

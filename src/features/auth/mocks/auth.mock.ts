import type { AuthUser } from "../types/auth.types";

export type MockAuthRecord = {
  accessCode: string;
  user: AuthUser;
};

export const mockAuthRecords: MockAuthRecord[] = [
  {
    accessCode: "PN001",
    user: {
      id: "patient-001",
      accessCode: "PN001",
      role: "patient",
      displayName: "Patient 001",
    },
  },
  {
    accessCode: "PN002",
    user: {
      id: "patient-002",
      accessCode: "PN002",
      role: "patient",
      displayName: "Patient 002",
    },
  },
  {
    accessCode: "TH001",
    user: {
      id: "therapist-001",
      accessCode: "TH001",
      role: "therapist",
      displayName: "Therapist 001",
    },
  },
];

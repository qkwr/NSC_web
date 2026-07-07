import type { AuthUser } from "../types/auth.types";

export type MockAuthRecord = {
  accessCode: string;
  user: AuthUser;
};

export const mockAuthRecords: MockAuthRecord[] = [
  {
    accessCode: "P-482913",
    user: {
      id: "patient-001",
      accessCode: "P-482913",
      role: "patient",
      displayName: "Patient 001",
    },
  },
  {
    accessCode: "P-739204",
    user: {
      id: "patient-002",
      accessCode: "P-739204",
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

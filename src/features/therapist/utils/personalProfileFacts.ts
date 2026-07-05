import type { PatientProfile } from "../types/therapist.types";

export type PersonalProfileFact = {
  key: keyof PatientProfile;
  label: string;
  value: string | number | boolean;
  exampleQuestion: string;
  expectedAnswer: boolean;
};

function getFirstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

function getThaiCount(value: number) {
  const words: Record<number, string> = {
    0: "ศูนย์",
    1: "หนึ่ง",
    2: "สอง",
    3: "สาม",
    4: "สี่",
    5: "ห้า",
  };

  return words[value] ?? String(value);
}

export function getPersonalProfileFacts(
  patientProfile: PatientProfile,
): PersonalProfileFact[] {
  const spouseFirstName = getFirstName(patientProfile.spouseName);
  const facts: PersonalProfileFact[] = [
    {
      key: "province",
      label: "จังหวัดภูมิลำเนา",
      value: patientProfile.province,
      exampleQuestion: `คุณอยู่จังหวัด${patientProfile.province}ใช่หรือไม่`,
      expectedAnswer: true,
    },
    {
      key: "occupation",
      label: "อาชีพ",
      value: patientProfile.occupation,
      exampleQuestion: `คุณทำอาชีพ${patientProfile.occupation}ใช่หรือไม่`,
      expectedAnswer: true,
    },
    {
      key: "spouseName",
      label: "ชื่อคู่สมรส",
      value: patientProfile.spouseName,
      exampleQuestion: `ภรรยาของคุณชื่อ${spouseFirstName}ใช่หรือไม่`,
      expectedAnswer: true,
    },
    {
      key: "childrenCount",
      label: "จำนวนลูก",
      value: patientProfile.childrenCount,
      exampleQuestion: `คุณมีลูก${getThaiCount(patientProfile.childrenCount)}คนใช่หรือไม่`,
      expectedAnswer: true,
    },
  ];

  return facts.filter((fact) => fact.value !== "" && fact.value !== null);
}

export function evaluateYesNoProfileAnswer({
  actualValue,
  askedValue,
  patientAnsweredYes,
}: {
  actualValue: string | number | boolean;
  askedValue: string | number | boolean;
  patientAnsweredYes: boolean;
}) {
  const factIsTrue = String(actualValue).trim() === String(askedValue).trim();

  return factIsTrue === patientAnsweredYes;
}

// Example:
// If the system asks "คุณอยู่จังหวัดลำปางใช่หรือไม่",
// compare the asked value with patientProfile.province in the database.
// province === "ลำปาง" and answer "ใช่" => correct.
// province !== "ลำปาง" and answer "ไม่ใช่" => correct.

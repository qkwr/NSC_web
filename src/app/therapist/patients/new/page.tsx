"use client";

import { useRouter } from "next/navigation";
import PatientForm, {
  createEmptyPatientProfile,
} from "@/features/therapist/components/PatientForm";
import { createPatient } from "@/features/therapist/services/therapistDashboardService";
import type {
  PatientProfile,
  TherapistPatientDetail,
} from "@/features/therapist/types/therapist.types";

const emptyPatient = createEmptyPatientProfile();

function createPatientDetailFromProfile(
  profile: PatientProfile,
): TherapistPatientDetail {
  const now = new Date().toISOString();

  return {
    id: profile.id,
    code: profile.patientCode,
    name: profile.fullName,
    age: profile.age,
    patientProfile: profile,
    caregiverName: profile.caregiverName,
    lastSessionAt: now,
    latestSessionAt: now,
    latestTrainingSet: "",
    latestAssessmentDate: "",
    needsFollowUp: false,
    pn001ProgressPercent: 0,
    pn002ProgressPercent: 0,
    pn001Summary: {
      title: "แบบประเมินมาตรฐาน",
      completedQuestions: 0,
      totalQuestions: 30,
      note: "",
    },
    pn002Naming: {
      categoryName: "สัตว์",
      latestSetTitle: "",
      completedQuestions: 0,
      totalQuestions: 45,
      correctWords: [],
      missedWords: [],
      wordsToReview: [],
    },
  };
}

export default function NewTherapistPatientPage() {
  const router = useRouter();

  async function handleCreatePatient(profile: PatientProfile) {
    const result = await createPatient(createPatientDetailFromProfile(profile));

    if (!result.success) {
      window.alert(result.errorMessage);
      return false;
    }

    router.push("/therapist/patients");
    return true;
  }

  return (
    <PatientForm
      mode="create"
      initialValues={emptyPatient}
      onSubmit={handleCreatePatient}
      cancelHref="/therapist/patients"
    />
  );
}

import { NamingTrainingSessionClient } from "@/features/training/components/NamingTrainingSessionClient";
import { mockPn002NamingSets } from "@/features/training/mocks/pn002Naming.mock";
import type { NamingSet } from "@/features/training/types/pn002Naming.types";

type PageProps = {
  params: Promise<{
    setId: NamingSet["id"];
  }>;
};

export function generateStaticParams() {
  return mockPn002NamingSets.map((set) => ({ setId: set.id }));
}

export default async function PatientNamingSetSessionPage({ params }: PageProps) {
  const { setId } = await params;

  return <NamingTrainingSessionClient setId={setId} />;
}

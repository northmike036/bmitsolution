import TeamPerformance from "@/components/admin/TeamPerformance";
import { notFound } from "next/navigation";
const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  if (!id) {
    return notFound();
  }
  return <TeamPerformance teamId={id} />;
};

export default page;

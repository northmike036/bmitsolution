import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // adjust path if needed
import { redirect } from "next/navigation";
import PosterSummary from "@/components/poster/poster-summary";

export default async function PosterPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.type !== "poster") {
    redirect("/login");
  }

  return (
    <div className="text-black">
      <PosterSummary />
    </div>
  );
}

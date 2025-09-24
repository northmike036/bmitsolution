import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // adjust path if needed
import { redirect } from "next/navigation";
import SellerSummary from "@/components/seller/sellerSummary";

export default async function PosterPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.type !== "seller") {
    redirect("/login");
  }

  return <div>
    <SellerSummary />
  </div>;
}

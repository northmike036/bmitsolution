import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import UpdateForm from "@/components/poster/updateForm";
type PageProps = {
  postId: string;
};
const page = async ({ params }: { params: Promise<PageProps> }) => {
  const { postId } = await params;
  const lead = await prisma.post.findUnique({ where: { id: postId } });
  if (!lead) {
    return notFound();
  }
  const cleanedNumber = lead.phone.replace(/^\+1/, "");

  return (
    <UpdateForm
      phoneNumber={cleanedNumber}
      message={lead.message}
      clientName={lead.clientName}
      agentName={lead.agentName}
      location={lead.location}
      rent={lead.rent}
      screenshot={lead.screenshot}
      postType={lead.postType}
      id={postId}
    />
  );
};

export default page;

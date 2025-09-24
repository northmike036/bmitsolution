import { DisplayNotification } from "@/components/notification/displayNotification";
type PageProps = {
  id: string;
};
const page = async ({ params }: { params: Promise<PageProps> }) => {
  const { id } = await params;
  return <DisplayNotification id={id} />;
};

export default page;

import SellerLayout from "@/components/layouts/seller-layout";
import { ReactNode } from "react";

export default function SellerLayoutWrapper({ children }: { children: ReactNode }) {
  return <SellerLayout>{children}</SellerLayout>;
}

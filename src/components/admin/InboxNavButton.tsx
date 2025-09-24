"use client";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
const InboxNavButton = ({
  type,
  path,
  amount,
}: {
  type: string;
  path: string;
  amount: number;
}) => {
  const pathname = usePathname();
  return (
    <Button
      className={`cursor-pointer hover:bg-gray-500 ${
        pathname === path ? "bg-gray-500 text-white" : ""
      }`}
    >
      {type} - {amount}
    </Button>
  );
};

export default InboxNavButton;

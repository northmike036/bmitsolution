"use client";
import { Button } from "@/components/ui/button";

export default function ExportButton() {
  const handleExport = () => {
    window.open("/api/post/export", "_blank");
  };

  return (
    <div className="max-h-[80vh] h-full flex justify-center items-center">
      <Button className="cursor-pointer" onClick={handleExport}>
        Export Leads to Excel
      </Button>
    </div>
  );
}

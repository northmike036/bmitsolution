"use client";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

export const DisplayMessage = ({
  type,
  message,
}: {
  type: string;
  message: string | undefined;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible>
      <CollapsibleTrigger
        className="text-sm font-medium text-gray-500 w-full flex justify-between items-center"
        onClick={() => setOpen(!open)}
      >
        <p>{type}</p>
        <p>
          {open ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </p>
      </CollapsibleTrigger>
      <CollapsibleContent className="whitespace-pre-wrap break-words break-all">
        {message}
      </CollapsibleContent>
    </Collapsible>
  );
};

"use client";

import { Input } from "./ui/input";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export function PasswordInput(props: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input {...props} type={show ? "text" : "password"} />
      <button
        type="button"
        className="absolute top-1/2 right-2 -translate-y-1/2"
        onClick={() => setShow((prev) => !prev)}
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}

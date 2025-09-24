"use client"
import { signOut } from "next-auth/react";
import React from "react";
import { Button } from "./button";

type LogoutProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const Logout = (props: LogoutProps) => {
  return (
    <Button onClick={() => signOut()} {...props}>
      Logout
    </Button>
  )
}

export default Logout
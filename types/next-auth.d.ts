import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      userName: string;
      type: "poster" | "seller" | "sellerAdmin" | "root";
      sessionVersion: number;
    };
  }

  interface User {
    id: string;
    name: string;
    userName: string;
    type: "poster" | "seller" | "sellerAdmin" | "root";
    sessionVersion: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    type: "poster" | "seller" | "sellerAdmin" | "root";
    sessionVersion: number;
  }
}

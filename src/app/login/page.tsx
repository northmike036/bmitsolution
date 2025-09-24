"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import AuthLayout from "@/components/layouts/auth-layout";
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from "next/navigation";


export default function LoginPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ userName: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  const res = await signIn("credentials", {
    redirect: false,
    userName: form.userName,
    password: form.password,
  });

  setLoading(false);

  if (res?.error) {
    toast({
      variant: "destructive",
      title: "Login failed",
      description: res.error,
    });
  } else {
    try {
      // Get current session to know the user type
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const userType = session?.user?.type;

      // Redirect based on user type
      switch (userType) {
        case "root":
           router.push("/admin")
          break;
        case "poster":
           router.push("/poster")
          break;
        case "seller":
           router.push("/seller")
          break;
        default:
           router.push("/")
      }
    } catch (err) {
      console.error("Error getting session:", err);
      window.location.reload(); // fallback
    }
  }
};


  return (
    <AuthLayout>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <h1 className="text-2xl font-semibold text-center mb-2">BM IT Solution</h1>
          <h2 className="text-xl font-semibold text-center">Login </h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              placeholder="Username"
              value={form.userName}
              onChange={(e) => setForm({ ...form, userName: e.target.value })}
              required
            />
            <PasswordInput
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

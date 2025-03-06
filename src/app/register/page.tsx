"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { registerUser } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function RegistrationPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email format");
      return;
    }

    try {
      await registerUser(email);
      setSuccess("Registration successful!");
      toast({
        title: "Registration successful!",
        description: "Redirecting to login page.",
      });

      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      const errorMessage = error.message.includes("User already exists")
        ? "An account with this email already exists."
        : "Registration failed.";

      setError(errorMessage);
      toast({
        title: errorMessage,
        description: error.message || "An error occurred.",
      });
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center py-10">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Register</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            {success && (
              <p className="text-sm text-green-500 mt-2">{success}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Register
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

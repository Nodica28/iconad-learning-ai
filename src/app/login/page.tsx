"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
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
      const response = await loginUser(email);

      if (!response.authenticated) {
        setError("Email not found.");
        toast({
          title: "Login failed.",
          description: "Please check your email and try again.",
        });
        return;
      }

      localStorage.setItem("user", JSON.stringify(response));

      setSuccess("Login successful!");
      toast({
        title: "Login successful.",
        description: "Redirecting please wait.",
      });

      const redirectPath = response.matches?.length > 0 ? "/conversation" : "/";
      setTimeout(() => {
        router.push(redirectPath);
      }, 3000);
    } catch (error: any) {
      setError("Login failed.");
      toast({
        title: "Login failed.",
        description: error.message || "An error occurred.",
      });
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center py-10">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your email to sign in to your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
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
              Sign In
            </Button>
          </CardFooter>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500 mt-2 text-center">
              Don&apos;t have an account?{" "}
              <a href="/register" className="text-blue-500 hover:underline">
                Register Here
              </a>
              .
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

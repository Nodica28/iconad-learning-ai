"use client";
import React from "react";
import { useRouter } from "next/navigation";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    // Check for user in localStorage
    const user = localStorage.getItem("user");
    const currentPath = window.location.pathname;

    // Paths to exclude from redirection
    const excludedPaths = ["/login", "/register"];

    if (!excludedPaths.includes(currentPath)) {
      if (!user) {
        // Show a toast notification when no user is found
        toast({
          title: "Unauthorized",
          description: "Please log in to access this page.",
        });

        // Redirect to login page
        router.push("/login");

        return; // Exit early if no user is found
      }

      const { email } = JSON.parse(user);

      if (!email || typeof email !== "string" || email.trim() === "") {
        // Redirect if no email is found
        router.push("/login");

        // Show a toast notification
        toast({
          title: "Unauthorized",
          description: "Please log in to access this page.",
        });
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} p-10`}>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}

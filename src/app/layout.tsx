"use client";
import React from "react";
import { useRouter } from "next/navigation";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { getUserData } from "@/lib/api";

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
    const checkUser = async () => {
      const user = localStorage.getItem("user");
      const currentPath = window.location.pathname;
      const excludedPaths = ["/login", "/register"];

      if (!excludedPaths.includes(currentPath)) {
        if (!user) {
          toast({
            title: "Unauthorized",
            description: "Please log in to access this page.",
          });
          router.push("/login");
          return;
        }

        const { email } = JSON.parse(user);

        if (!email || typeof email !== "string" || email.trim() === "") {
          router.push("/login");
          toast({
            title: "Unauthorized",
            description: "Please log in to access this page.",
          });
        } else {
          try {
            const updatedUser = await getUserData();
            localStorage.setItem("user", JSON.stringify(updatedUser));
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        }
      }
    };
    checkUser();
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

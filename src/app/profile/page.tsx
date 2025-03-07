"use client";
import ChildProfileContainer from "@/components/child-profile/ChildProfileContainer";
import { useEffect } from "react";
import { getUserData } from "@/lib/api";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { updateUserInfo } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [lastProgress, setLastProgress] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [originalLastProgress, setOriginalLastProgress] = useState("");
  const router = useRouter();
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserData();

        if (data) {
          setUserData(data);
          const userEmail = data.email || "";
          const userLastProgress = data.lastProgress || "";

          setEmail(userEmail);
          setLastProgress(userLastProgress);
          setOriginalEmail(userEmail);
          setOriginalLastProgress(userLastProgress);
        } else {
          console.log("No user data available");
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveUserInfo = async () => {
    try {
      console.log("Saving user info:", { email, lastProgress });
      const response = await updateUserInfo(email, lastProgress);
      // Only store in localStorage if response exists and is valid
      if (response !== undefined) {
        localStorage.setItem("user", JSON.stringify(response));

        // Update the userData state with the new response
        setUserData(response);
      }

      setOriginalEmail(email);
      setOriginalLastProgress(lastProgress);
    } catch (error) {
      console.error("Error saving user info:", error);
      // Optionally add error handling UI here
    }
  };

  // Check if there are any changes to enable/disable the save button
  const hasChanges =
    email !== originalEmail || lastProgress !== originalLastProgress;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {userData && (
        <>
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastProgress">Last Progress</Label>
                <Input
                  id="lastProgress"
                  value={lastProgress}
                  onChange={(e) => setLastProgress(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleSaveUserInfo}
                disabled={!hasChanges}
              >
                Save User Info
              </Button>
            </CardFooter>
          </Card>

          <ChildProfileContainer />
        </>
      )}
    </div>
  );
}

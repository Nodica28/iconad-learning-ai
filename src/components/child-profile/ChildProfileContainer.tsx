import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Activity, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserData } from "@/lib/api";
const formatTraitKey = (key: string): string => {
  return key
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const ChildProfileContainer = () => {
  const [userData, setUserData] = useState<any>(null);
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [interests, setInterests] = useState("");
  const [learningStyle, setLearningStyle] = useState("");
  const [challenges, setChallenges] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserData();

        if (data) {
          setUserData(data);
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

  useEffect(() => {
    if (userData && userData.childTraits) {
      // Set child age from the data
      const ageData =
        userData.childTraits["Basic Information"]["What is your child's age?"];
      setChildAge(formatTraitKey(ageData));

      // Set interests from favorite topics
      const favoriteTopics =
        userData.childTraits["Interest-Based Questions"][
          "What are your child's favorite topics or interests?"
        ];
      setInterests(formatTraitKey(favoriteTopics));

      // Set learning style based on available data
      const communicationSkills =
        userData.childTraits["Communication and Language"][
          "How would you describe your child's communication skills?"
        ];
      const playPreference =
        userData.childTraits["Personal, Social, and Emotional Development"][
          "How does your child prefer to play?"
        ];
      setLearningStyle(
        `Communication: ${formatTraitKey(communicationSkills)}, Play style: ${formatTraitKey(playPreference)}`
      );

      // Set challenges based on special needs and focus requirements
      const specialNeeds =
        userData.childTraits["Special Needs and Considerations"][
          "Does your child have any special needs or considerations we should be aware of?"
        ];
      const focusLevel =
        userData.childTraits["Engagement and Focus"][
          "What level of focus does your child typically need to enjoy an activity?"
        ];
      setChallenges(
        `${formatTraitKey(specialNeeds)}, Focus level: ${formatTraitKey(focusLevel)}`
      );
    }
  }, [userData]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4">
        <User className="h-5 w-5 text-primary" />
        Child Profile
      </h2>

      <Card>
        <CardHeader>
          <CardTitle>Child Information</CardTitle>
          <CardDescription>
            Update your child&apos;s information to get better recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="childName">Child&apos;s Name</Label>
              <Input
                id="childName"
                placeholder="Enter your child's name"
                value={childName}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="childAge">Child&apos;s Age</Label>
              <Input
                id="childAge"
                placeholder="Enter your child's age"
                value={childAge}
                readOnly
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests">Interests</Label>
            <Textarea
              id="interests"
              placeholder="What does your child enjoy? (e.g., dinosaurs, space, music, drawing)"
              rows={3}
              value={interests}
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="learningStyle">Learning Style</Label>
            <Textarea
              id="learningStyle"
              placeholder="How does your child learn best? (e.g., visual, hands-on, through stories)"
              rows={3}
              value={learningStyle}
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="challenges">Learning Challenges</Label>
            <Textarea
              id="challenges"
              placeholder="Any specific challenges your child faces when learning?"
              rows={3}
              value={challenges}
              readOnly
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="gap-2 w-full"
            onClick={() => router.push("/check")}
          >
            Reanalyze Child
            <Activity className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ChildProfileContainer;

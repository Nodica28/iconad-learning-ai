"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Brain,
  Search,
  Sparkles,
  ArrowRight,
  BookMarked,
  Palette,
  Music,
  Code,
  Activity,
  MessageSquare,
  Upload,
  User,
} from "lucide-react";
import ChildProfileContainer from "@/components/child-profile/ChildProfileContainer";
export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock recommended learning materials
  const recommendedMaterials = [
    {
      id: 1,
      title: "Introduction to Colors and Shapes",
      description:
        "A fun interactive guide to basic shapes and colors for young learners.",
      category: "Visual Learning",
      ageRange: "3-5 years",
      tags: ["colors", "shapes", "interactive"],
      icon: <Palette className="h-8 w-8 text-primary" />,
    },
    {
      id: 2,
      title: "Musical Alphabet Adventure",
      description:
        "Learn the alphabet through catchy songs and musical activities.",
      category: "Audio Learning",
      ageRange: "4-6 years",
      tags: ["music", "alphabet", "songs"],
      icon: <Music className="h-8 w-8 text-primary" />,
    },
    {
      id: 3,
      title: "My First Coding Journey",
      description:
        "Simple coding concepts explained through interactive stories and games.",
      category: "STEM",
      ageRange: "6-8 years",
      tags: ["coding", "logic", "games"],
      icon: <Code className="h-8 w-8 text-primary" />,
    },
    {
      id: 4,
      title: "Nature Explorer's Guide",
      description:
        "Discover the wonders of nature with this interactive guide to plants and animals.",
      category: "Science",
      ageRange: "5-7 years",
      tags: ["nature", "animals", "plants"],
      icon: <Activity className="h-8 w-8 text-primary" />,
    },
  ];

  // Mock categories
  const categories = [
    { name: "Visual Learning", icon: <Palette className="h-5 w-5" /> },
    { name: "Audio Learning", icon: <Music className="h-5 w-5" /> },
    { name: "STEM", icon: <Code className="h-5 w-5" /> },
    { name: "Science", icon: <Activity className="h-5 w-5" /> },
    { name: "Language", icon: <BookMarked className="h-5 w-5" /> },
    { name: "Mathematics", icon: <Brain className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <section className="bg-accent rounded-xl p-8 text-accent-foreground">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold">
            Welcome to Iconad Learning with AI
          </h1>
          <p className="text-lg">
            Discover personalized learning materials tailored to your
            child&apos;s unique traits, interests, and learning style.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <Button
              size="lg"
              className="gap-2"
              onClick={() => router.push("/check")}
            >
              Start a Child Analysis
              <Activity className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={() => router.push("/upload")}
            >
              Upload Materials <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Search section */}
      <section className="max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            placeholder="Search for learning materials..."
            className="pl-10 py-6"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Main content */}
      <Tabs defaultValue="recommended" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="recommended" className="gap-2">
            <Sparkles className="h-4 w-4" /> Recommended
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <BookOpen className="h-4 w-4" /> Categories
          </TabsTrigger>
          <TabsTrigger value="childProfile" className="gap-2">
            <User className="h-4 w-4" /> Child Profile
          </TabsTrigger>
        </TabsList>

        {/* Recommended tab */}
        <TabsContent value="recommended" className="space-y-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Recommended Learning Materials
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedMaterials.map((material) => (
              <Card
                key={material.id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    {material.icon}
                    <span className="text-sm font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                      {material.ageRange}
                    </span>
                  </div>
                  <CardTitle className="text-xl mt-2">
                    {material.title}
                  </CardTitle>
                  <CardDescription>{material.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{material.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {material.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full justify-between">
                    View Material <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Categories tab */}
        <TabsContent value="categories" className="space-y-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Browse by Category
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant="outline"
                className="h-auto py-6 flex flex-col gap-3 hover:bg-accent hover:text-accent-foreground"
              >
                {category.icon}
                <span>{category.name}</span>
              </Button>
            ))}
          </div>
        </TabsContent>

        {/* Child Profile tab */}
        <TabsContent value="childProfile" className="space-y-6">
          <ChildProfileContainer />
        </TabsContent>
      </Tabs>

      {/* Features section */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          How Iconad Learning Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-card">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Personalized Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Our AI analyzes your child&apos;s traits, interests, and
                learning style to recommend the perfect materials.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Ongoing Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Share your child&apos;s progress and get new recommendations if
                current materials aren&apos;t working well.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Community Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Upload your own learning materials to help other parents and
                expand our knowledge base.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

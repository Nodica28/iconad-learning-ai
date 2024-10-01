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
import { fileUpload } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function AIFileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<any>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      const fileSizeLimit = 5 * 1024 * 1024; // 5MB size limit
      const allowedFormats = [
        "image/png",
        "image/jpeg",
        "image/gif",
        "image/webp",
      ];

      if (!allowedFormats.includes(selectedFile.type)) {
        toast({
          title: "Error",
          description:
            "File format not supported. Please upload a PNG, JPEG, GIF, or WEBP image.",
        });
        return;
      }

      if (selectedFile.size > fileSizeLimit) {
        toast({
          title: "Error",
          description:
            "File size exceeds 5MB limit. Please choose a smaller file.",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);

    const fileData = new FormData();
    fileData.append("file", file);

    try {
      const response = await fileUpload(fileData);
      setResponse(response);
    } catch (error) {
      console.error("Error uploading file:", error);
      setResponse({ error: "Failed to upload file" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>AI File Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="file"
            onChange={handleFileChange}
            accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full h-14 file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
          />
          <Button
            type="submit"
            disabled={!file || isLoading}
            className="w-full"
          >
            {isLoading ? "Analyzing..." : "Analyze File"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <h3 className="text-lg font-semibold mb-2">AI Response:</h3>
        <div className="space-y-2 w-full">
          {response ? (
            <div className="p-2 rounded-lg bg-green-100 w-full">
              <p className="font-semibold">AI:</p>
              <pre className="whitespace-pre-wrap break-words">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          ) : (
            "No response yet."
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

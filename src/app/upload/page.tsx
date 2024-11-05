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
import { Copy } from "lucide-react";

export default function AIFileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const allowedFormats = [
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedFormats.includes(selectedFile.type)) {
      toast({
        title: "Error",
        description:
          "Unsupported file format. Please upload a PNG, JPEG, GIF, WEBP, PDF, or DOCX.",
      });
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size exceeds 20MB limit.",
      });
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fileUpload(formData);

      setResponse(response);
    } catch (error) {
      console.error("Error uploading file:", error);
      setResponse("Failed to upload file");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResponse = async () => {
    if (response) {
      try {
        await navigator.clipboard.writeText(response);
        toast({
          title: "Copied",
          description: "Response copied to clipboard.",
        });
      } catch (err) {
        console.error("Failed to copy:", err);
      }
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
            accept=".png,.jpeg,.jpg,.gif,.webp,.pdf,.docx"
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
      <CardFooter className="flex flex-col items-start w-full space-y-2">
        <div className="flex items-center w-full justify-between">
          <h3 className="text-lg font-semibold">AI Response:</h3>
          {response && (
            <button
              onClick={handleCopyResponse}
              className="text-violet-700 hover:text-violet-900"
            >
              <Copy />
            </button>
          )}
        </div>
        <div className="space-y-2 w-full max-h-48 overflow-y-auto">
          {response ? (
            <div className="p-2 rounded-lg bg-green-100 w-full">
              <pre className="whitespace-pre-wrap break-words">{response}</pre>
            </div>
          ) : (
            "No response yet."
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

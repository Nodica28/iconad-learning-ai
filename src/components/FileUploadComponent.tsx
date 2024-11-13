"use client";
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
import { analyzeFile, saveMaterial } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Copy } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function AIFileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [material, setMaterial] = useState<string | null>(null);
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
      const analyzedMaterial = await analyzeFile(formData);

      setMaterial(analyzedMaterial);
    } catch (error) {
      console.error("Error uploading file:", error);
      setMaterial("Failed to upload file");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResponse = async () => {
    const responseTextarea = document.getElementById(
      "responseTextarea"
    ) as HTMLTextAreaElement;
    const responseText = responseTextarea?.value;
    if (responseText) {
      try {
        await navigator.clipboard.writeText(responseText);
        toast({
          title: "Copied",
          description: "Response copied to clipboard.",
        });
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  const handleCancel = () => {
    setFile(null);
    setMaterial(null);
  };

  const handleAddToDatabase = async () => {
    if (!file || !material) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("material", material);

      const response = await saveMaterial(formData);

      console.log(response);

      toast({
        title: "Success",
        description: "Data added to the database.",
      });
    } catch (error) {
      console.error("Failed to add to the database:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full h-full shadow-md">
      <CardHeader>
        <CardTitle>AI File Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
            {isLoading ? <Spinner /> : "Analyze File"}
          </Button>
        </form>
        <div className="flex items-center w-full justify-between">
          <h3 className="text-lg font-semibold">AI Response:</h3>
          {material && (
            <button
              onClick={handleCopyResponse}
              className="text-violet-700 hover:text-violet-900"
            >
              <Copy />
            </button>
          )}
        </div>
        <div className="space-y-2 w-full max-h-48">
          {material ? (
            <textarea
              id="responseTextarea"
              className="p-2 rounded-lg bg-green-100 w-full h-48 resize-none"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
            />
          ) : (
            "No material yet."
          )}
        </div>
      </CardContent>
      <CardFooter className="flex w-full gap-4">
        <Button
          variant={"outline"}
          className="w-1/2"
          onClick={handleCancel}
          disabled={!file}
        >
          Cancel
        </Button>
        <Button
          variant={"default"}
          className="w-1/2"
          onClick={handleAddToDatabase}
          disabled={!file || !material || isLoading}
        >
          {isLoading ? <Spinner /> : "Add to Database"}
        </Button>
      </CardFooter>
    </Card>
  );
}

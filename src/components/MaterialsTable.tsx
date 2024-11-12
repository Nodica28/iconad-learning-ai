"use client";
import { useState, useEffect } from "react";
import { Edit, Trash2, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMaterials } from "@/lib/api";

type LearningMaterial = {
  _id: string;
  title: string;
  age_group: [];
  content_type: [];
  skill_level: string;
  duration: string;
};

export default function MaterialsTable() {
  const [learningMaterials, setLearningMaterials] = useState<
    LearningMaterial[]
  >([]);

  const fetchMaterials = async () => {
    try {
      const response = await getMaterials();
      setLearningMaterials(response.materials);
    } catch (error) {
      console.error("Failed to fetch materials:", error);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleEdit = (id: string) => {
    console.log(`Edit material with id: ${id}`);
    // Implement edit functionality
  };

  const handleDelete = (id: string) => {
    console.log(`Delete material with id: ${id}`);
    // Implement delete functionality
  };

  const handleAccess = (id: string) => {
    console.log(`Access material with id: ${id}`);
  };

  return (
    <div className="h-full container mx-auto py-10 border rounded-lg shadow-md overflow-hidden">
      {/* Added overflow-x-auto to enable horizontal scrolling */}
      <div className="flex justify-between p-2">
        <p className="text-2xl font-semibold">Learning Materials</p>:
        <Button variant="outline" onClick={fetchMaterials}>
          <RefreshCw className="h-4 w-4 mr-2" />
          <span>Refresh</span>
        </Button>
      </div>
      <div className="overflow-x-auto">
        {" "}
        {/* Add wrapping div with overflow-x-auto */}
        <Table className="min-w-full">
          {" "}
          {/* Set min-w-full to allow the table to take full width */}
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Age Group</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {learningMaterials.map((material) => (
              <TableRow key={material._id}>
                <TableCell className="font-medium">{material.title}</TableCell>
                <TableCell>{material.age_group.join(", ")}</TableCell>
                <TableCell>{material.content_type.join(", ")}</TableCell>
                <TableCell>
                  {material.skill_level.charAt(0).toUpperCase() +
                    material.skill_level.slice(1)}
                </TableCell>
                <TableCell>
                  {material.duration.charAt(0).toUpperCase() +
                    material.duration.slice(1)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(material._id)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(material._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleAccess(material._id)}
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">Access</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

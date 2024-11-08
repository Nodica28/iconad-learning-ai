"use client";
import { Edit, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type LearningMaterial = {
  id: number;
  title: string;
  ageGroup: string;
  category: string;
  difficulty: string;
  duration: string;
};

const learningMaterials: LearningMaterial[] = [
  {
    id: 1,
    title: "Introduction to Algebra",
    ageGroup: "12-14",
    category: "Mathematics",
    difficulty: "Intermediate",
    duration: "45 minutes",
  },
  {
    id: 2,
    title: "Basic Chemistry Experiments",
    ageGroup: "10-12",
    category: "Science",
    difficulty: "Beginner",
    duration: "60 minutes",
  },
  {
    id: 3,
    title: "World War II Overview",
    ageGroup: "14-16",
    category: "History",
    difficulty: "Advanced",
    duration: "90 minutes",
  },
  // Add more learning materials as needed
];

export default function MaterialsTable() {
  const handleEdit = (id: number) => {
    console.log(`Edit material with id: ${id}`);
    // Implement edit functionality
  };

  const handleDelete = (id: number) => {
    console.log(`Delete material with id: ${id}`);
    // Implement delete functionality
  };

  const handleAccess = (id: number) => {
    console.log(`Access material with id: ${id}`);
    // Implement access functionality
  };

  return (
    <div className="h-full container mx-auto py-10 border rounded-lg overflow-hidden shadow-md">
      <Table>
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
            <TableRow key={material.id}>
              <TableCell className="font-medium">{material.title}</TableCell>
              <TableCell>{material.ageGroup}</TableCell>
              <TableCell>{material.category}</TableCell>
              <TableCell>{material.difficulty}</TableCell>
              <TableCell>{material.duration}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(material.id)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(material.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleAccess(material.id)}
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
  );
}

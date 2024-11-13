import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ExternalLink } from "lucide-react";
import { LearningMaterial } from "@/types/materials";
import { getPresignedUrl } from "@/lib/api";

interface MaterialsTableBodyProps {
  learningMaterials: LearningMaterial[];
  setMaterialToEdit: (material: LearningMaterial) => void;
  setIsEditDialogOpen: (state: boolean) => void;
  setMaterialToDelete: (material: LearningMaterial) => void;
  setIsDialogOpen: (state: boolean) => void;
  isLoading: boolean;
}

export default function MaterialsTableBody({
  learningMaterials,
  setMaterialToEdit,
  setIsEditDialogOpen,
  setMaterialToDelete,
  setIsDialogOpen,
  isLoading,
}: MaterialsTableBodyProps) {
  const handleAccess = async (id: string) => {
    try {
      const { presignedUrl } = await getPresignedUrl(id);
      window.open(presignedUrl, "_blank");
    } catch (error) {
      console.error("Failed to access material:", error);
    } finally {
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full">
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
                    onClick={() => {
                      setMaterialToEdit(material);
                      setIsEditDialogOpen(true);
                    }}
                    disabled={isLoading}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setMaterialToDelete(material);
                      setIsDialogOpen(true);
                    }}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      handleAccess(material.document_link);
                    }}
                    disabled={isLoading}
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

"use client";
import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getMaterials, updateMaterial, deleteMaterial } from "@/lib/api";
import { LearningMaterial } from "@/types/materials";
import MaterialsTableBody from "@/components/materials-table/MaterialsTableBody";
import EditDialog from "@/components/materials-table/EditDialog";
import DeleteDialog from "@/components/materials-table/DeleteDialog";

export default function MaterialsTable() {
  const [learningMaterials, setLearningMaterials] = useState<
    LearningMaterial[]
  >([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] =
    useState<LearningMaterial | null>(null);
  const [materialToEdit, setMaterialToEdit] = useState<LearningMaterial | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setIsLoading(true);
    try {
      const response = await getMaterials();
      setLearningMaterials(response.materials);
    } catch (error) {
      console.error("Failed to fetch materials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full container mx-auto py-10 border rounded-lg shadow-md overflow-hidden">
      <div className="flex justify-between p-2">
        <p className="text-2xl font-semibold">Learning Materials</p>:
        <Button variant="outline" onClick={fetchMaterials} disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          <span>Refresh</span>
        </Button>
      </div>
      <div className="overflow-y-auto max-h-96">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : (
          <MaterialsTableBody
            learningMaterials={learningMaterials}
            setMaterialToEdit={setMaterialToEdit}
            setIsEditDialogOpen={setIsEditDialogOpen}
            setMaterialToDelete={setMaterialToDelete}
            setIsDialogOpen={setIsDialogOpen}
            isLoading={isLoading}
          />
        )}
      </div>
      <EditDialog
        isEditDialogOpen={isEditDialogOpen}
        materialToEdit={materialToEdit}
        setIsEditDialogOpen={setIsEditDialogOpen}
        handleFieldChange={(field: keyof LearningMaterial, value) => {
          if (materialToEdit) {
            const updatedValue = Array.isArray(materialToEdit[field])
              ? (value as string[]) // Ensure the value matches the expected type
              : (value as string); // Ensure the value matches the expected type

            setMaterialToEdit({ ...materialToEdit, [field]: updatedValue });
            setHasChanges(true);
          }
        }}
        handleConfirmEdit={async () => {
          if (materialToEdit && hasChanges) {
            setIsLoading(true);
            try {
              await updateMaterial(materialToEdit);
              await fetchMaterials();
              setIsEditDialogOpen(false);
              setHasChanges(false);
            } catch (error) {
              console.error("Failed to update material:", error);
            } finally {
              setIsLoading(false);
            }
          }
        }}
        hasChanges={hasChanges}
        isLoading={isLoading}
      />
      <DeleteDialog
        isDialogOpen={isDialogOpen}
        materialToDelete={materialToDelete}
        setIsDialogOpen={setIsDialogOpen}
        confirmDelete={async () => {
          if (materialToDelete) {
            setIsLoading(true);
            try {
              await deleteMaterial(materialToDelete._id);
              setLearningMaterials((prevMaterials) =>
                prevMaterials.filter(
                  (material) => material._id !== materialToDelete._id
                )
              );
            } catch (error) {
              console.error("Failed to delete material:", error);
            } finally {
              setIsLoading(false);
              setIsDialogOpen(false);
              setMaterialToDelete(null);
            }
          }
        }}
        isLoading={isLoading}
      />
    </div>
  );
}

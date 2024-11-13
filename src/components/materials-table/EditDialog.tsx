import {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { LearningMaterial } from "@/types/materials";
import { DialogDescription } from "@radix-ui/react-dialog";

interface EditDialogProps {
  isEditDialogOpen: boolean;
  materialToEdit: LearningMaterial | null;
  setIsEditDialogOpen: (state: boolean) => void;
  handleFieldChange: (field: string, value: string) => void;
  handleConfirmEdit: () => void;
  hasChanges: boolean;
  isLoading: boolean;
}

export default function EditDialog({
  isEditDialogOpen,
  materialToEdit,
  setIsEditDialogOpen,
  handleFieldChange,
  handleConfirmEdit,
  hasChanges,
  isLoading,
}: EditDialogProps) {
  return (
    <>
      {isEditDialogOpen && materialToEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>Edit Material</DialogTitle>
            <DialogDescription>
              Edit the details of the learning material.
            </DialogDescription>
            <div className="space-y-4">
              <div>
                <label>Title:</label>
                <Input
                  value={materialToEdit.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                />
              </div>
              <div>
                <label>Skill Level:</label>
                <Input
                  value={materialToEdit.skill_level}
                  onChange={(e) =>
                    handleFieldChange("skill_level", e.target.value)
                  }
                />
              </div>
              <div>
                <label>Duration:</label>
                <Input
                  value={materialToEdit.duration}
                  onChange={(e) =>
                    handleFieldChange("duration", e.target.value)
                  }
                />
              </div>
              {/* Include other fields as needed */}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>

              <Button
                variant="default"
                onClick={handleConfirmEdit}
                disabled={!hasChanges || isLoading}
              >
                {isLoading ? <Spinner /> : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

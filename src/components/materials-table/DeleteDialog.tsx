import {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { LearningMaterial } from "@/types/materials";

interface DeleteDialogProps {
  isDialogOpen: boolean;
  materialToDelete: LearningMaterial | null;
  setIsDialogOpen: (state: boolean) => void;
  confirmDelete: () => void;
  isLoading: boolean;
}

export default function DeleteDialog({
  isDialogOpen,
  materialToDelete,
  setIsDialogOpen,
  confirmDelete,
  isLoading,
}: DeleteDialogProps) {
  return (
    <>
      {isDialogOpen && materialToDelete && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the material:{" "}
              <strong>{materialToDelete.title}</strong>?
            </DialogDescription>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isLoading}
              >
                {isLoading ? <Spinner /> : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

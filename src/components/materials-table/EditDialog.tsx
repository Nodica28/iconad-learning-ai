import React, { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { LearningMaterial } from "@/types/materials";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Plus, Check, X } from "lucide-react";

interface EditDialogProps {
  isEditDialogOpen: boolean;
  materialToEdit: LearningMaterial | null;
  setIsEditDialogOpen: (state: boolean) => void;
  handleFieldChange: (
    field: keyof LearningMaterial,
    value: string | string[]
  ) => void;
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
  const handleAddTag = (field: keyof LearningMaterial, tag: string) => {
    if (materialToEdit && !materialToEdit[field].includes(tag)) {
      const updatedTags = [...materialToEdit[field], tag];
      handleFieldChange(field, updatedTags);
    }
  };

  const handleRemoveTag = (field: keyof LearningMaterial, tag: string) => {
    if (materialToEdit && Array.isArray(materialToEdit[field])) {
      const updatedTags = (materialToEdit[field] as string[]).filter(
        (t) => t !== tag
      );
      handleFieldChange(field, updatedTags); // Pass array directly
    }
  };

  return (
    <>
      {isEditDialogOpen && materialToEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogOverlay />
          <DialogContent className="w-full overflow-y-auto h-full">
            <DialogTitle>Edit Material</DialogTitle>
            <DialogDescription>
              Edit the details of the learning material.
            </DialogDescription>
            <div className="space-y-4">
              <FieldWithInput
                label="Title"
                value={materialToEdit.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
              />
              <TagField
                label="Age Group"
                tags={materialToEdit.age_group}
                fieldName="age_group"
                handleAddTag={handleAddTag}
                handleRemoveTag={handleRemoveTag}
              />
              <TagField
                label="Developmental Areas"
                tags={materialToEdit.developmental_areas}
                fieldName="developmental_areas"
                handleAddTag={handleAddTag}
                handleRemoveTag={handleRemoveTag}
              />
              <TagField
                label="Learning Objectives"
                tags={materialToEdit.learning_objective_tags}
                fieldName="learning_objective_tags"
                handleAddTag={handleAddTag}
                handleRemoveTag={handleRemoveTag}
              />
              <TagField
                label="Interests"
                tags={materialToEdit.interest_tags}
                fieldName="interest_tags"
                handleAddTag={handleAddTag}
                handleRemoveTag={handleRemoveTag}
              />
              <TagField
                label="Content Types"
                tags={materialToEdit.content_type}
                fieldName="content_type"
                handleAddTag={handleAddTag}
                handleRemoveTag={handleRemoveTag}
              />
              <TagField
                label="Engagement Levels"
                tags={materialToEdit.engagement_level}
                fieldName="engagement_level"
                handleAddTag={handleAddTag}
                handleRemoveTag={handleRemoveTag}
              />
              <FieldWithInput
                label="Duration"
                value={materialToEdit.duration}
                onChange={(e) => handleFieldChange("duration", e.target.value)}
              />
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

interface FieldWithInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function FieldWithInput({ label, value, onChange }: FieldWithInputProps) {
  return (
    <div>
      <label>{label}:</label>
      <Input value={value} onChange={onChange} />
    </div>
  );
}

interface TagFieldProps {
  label: string;
  tags: string[];
  fieldName: keyof LearningMaterial;
  handleAddTag: (field: keyof LearningMaterial, tag: string) => void;
  handleRemoveTag: (field: keyof LearningMaterial, tag: string) => void;
}

function TagField({
  label,
  tags,
  fieldName,
  handleAddTag,
  handleRemoveTag,
}: TagFieldProps) {
  const [localNewTagValue, setLocalNewTagValue] = useState("");

  return (
    <div className="space-y-2">
      <label>{label}:</label>
      <div className="flex flex-wrap items-center space-x-2">
        {tags.map((tag) => (
          <Badge key={tag} className="flex items-center space-x-1 mb-2">
            <span>{tag}</span>
            <X
              className="cursor-pointer"
              onClick={() => handleRemoveTag(fieldName, tag)}
            />
          </Badge>
        ))}
        <div className="flex items-center border">
          <Input
            className="border-0"
            value={localNewTagValue}
            onChange={(e) => setLocalNewTagValue(e.target.value)}
          />
          {localNewTagValue && (
            <Check
              className="cursor-pointer mx-2"
              onClick={() => {
                handleAddTag(fieldName, localNewTagValue);
                setLocalNewTagValue(""); // Clear input after adding tag
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

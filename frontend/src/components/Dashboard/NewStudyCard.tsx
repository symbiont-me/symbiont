"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HttpStatus } from "@/const";
import { useState } from "react";
import { useStudyContext } from "@/app/context/StudyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Sparkles, Image as ImageIcon } from "lucide-react";

// TODO maybe separate the modal into a separate component

type NewStudyCardProps = {
  onNewStudyCreated: () => void;
};

const NewStudyCard = ({ onNewStudyCreated }: NewStudyCardProps) => {
  const router = useRouter();
  const studyContext = useStudyContext();
  const [studyName, setStudyName] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = React.useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleClose = () => {
    setOpen(false);
    // Reset form
    setStudyName("");
    setImage("");
    setDescription("");
  };

  async function handleCreateStudy() {
    if (!studyContext) {
      return;
    }
    if (!studyName || !description) {
      return;
    }
    setIsCreating(true);
    try {
      await studyContext.createStudy(studyName, description, image);
      onNewStudyCreated();
      handleClose();
    } catch (error) {
      console.error("Error creating study:", error);
    } finally {
      setIsCreating(false);
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    if (name === "studyName") {
      setStudyName(value);
    } else if (name === "image") {
      setImage(value);
    } else if (name === "description") {
      setDescription(value);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card 
          className="w-80 h-80 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all duration-300 cursor-pointer group hover:shadow-lg"
          data-testid="new-study-button"
        >
          <CardContent className="h-full flex flex-col items-center justify-center space-y-4 p-8">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Plus className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Create New Study</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Start a new research study and begin collecting data
              </p>
            </div>
            <div className="flex items-center text-xs text-blue-600 group-hover:text-blue-700">
              <Sparkles className="h-4 w-4 mr-1" />
              AI-Powered Research
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-blue-600" />
            </div>
            <span>Create New Study</span>
          </DialogTitle>
          <DialogDescription>
            Create a new study and begin collecting data for your research.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="studyName">Study Name *</Label>
            <Input
              id="studyName"
              name="studyName"
              placeholder="Enter your study name"
              value={studyName}
              onChange={handleInputChange}
              data-testid="study-name-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              name="description"
              placeholder="Describe your study"
              value={description}
              onChange={handleInputChange}
              data-testid="study-description-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="flex items-center space-x-1">
              <ImageIcon className="h-4 w-4" />
              <span>Cover Image URL (optional)</span>
            </Label>
            <Input
              id="image"
              name="image"
              placeholder="https://example.com/image.jpg"
              value={image}
              onChange={handleInputChange}
              data-testid="study-image-input"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            data-testid="create-study-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateStudy}
            disabled={!studyName || !description || isCreating}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="create-study-submit"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : (
              "Create Study"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewStudyCard;

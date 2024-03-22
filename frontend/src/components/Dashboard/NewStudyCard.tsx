"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HttpStatus } from "@/const";
import { useState } from "react";
import { useStudyContext } from "@/app/context/StudyContext";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

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

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  async function handleCreateStudy() {
    if (!studyContext) {
      return;
    }
    if (!studyName || !description) {
      return;
    }
    studyContext.createStudy(studyName, description, image);
    onNewStudyCreated();
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
    <div
      className="  mt-2 ml-2 mr-2 rounded-xl flex flex-col items-center justify-center border border-gray-500"
      style={{ width: 345, height: 388 }}
    >
      <React.Fragment>
        <Button variant="outlined" onClick={handleClickOpen}>
          +
        </Button>
        <Typography
          variant="subtitle1"
          component="h5"
          style={{ marginTop: "25px" }}
        >
          New Study
        </Typography>
        <Dialog
          open={open}
          onClose={handleClose}
          // TODO remove if not needed
          PaperProps={{
            component: "form",
            onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const formJson = Object.fromEntries((formData as any).entries());
              // const email = formJson.email;
              // console.log(email);
              handleClose();
            },
          }}
        >
          <DialogTitle>Create Study</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Create a new study and begin collecting data and writing your
              paper.
            </DialogContentText>
            <TextField
              autoFocus
              required
              margin="dense"
              id="studyName"
              name="studyName"
              label="Study Name"
              type="text"
              fullWidth
              variant="standard"
              value={studyName}
              onChange={handleInputChange}
            />
            <TextField
              autoFocus
              margin="dense"
              id="image"
              name="image"
              label="Image"
              type="text"
              fullWidth
              variant="standard"
              value={image}
              onChange={handleInputChange}
            />
            <TextField
              autoFocus
              required
              margin="dense"
              id="description"
              name="description"
              label="Description"
              type="text"
              fullWidth
              variant="standard"
              value={description}
              onChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" onClick={handleCreateStudy}>
              Create Study
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>{" "}
    </div>
  );
};

export default NewStudyCard;

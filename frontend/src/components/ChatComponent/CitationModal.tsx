import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Citation } from "@/types";

type CitationLabelProps = {
  index: number;
  citation: Citation;
};

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "60%",
  height: "80%",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 12,
  overflow: "auto",
  textAlign: "justify",
};

function removeTimeStampFromResourceName(resourceName: string) {
  return resourceName.split("_").slice(1).join("_");
}

const CitationModal = ({ index, citation }: CitationLabelProps) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  return (
    <div>
      <p onClick={handleOpen}>[{index + 1}]</p>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {removeTimeStampFromResourceName(citation.source)}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {citation.page > 0 ? `Page: ${citation.page}` : ""}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {citation.text}
          </Typography>
        </Box>
      </Modal>
    </div>
  );
};

export default CitationModal;

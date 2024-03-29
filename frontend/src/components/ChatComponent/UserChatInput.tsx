import { TextField } from "@mui/material";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import FileCopyIcon from "@mui/icons-material/FileCopyOutlined";
import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";
import ShareIcon from "@mui/icons-material/Share";

// TODO use styles from DaisyUI
type UserChatInputProps = {
  input: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};
const actions = [
  { icon: <FileCopyIcon />, name: "Copy" },
  { icon: <SaveIcon />, name: "Save" },
  { icon: <PrintIcon />, name: "Print" },
  { icon: <ShareIcon />, name: "Share" },
];

// TODO implement SpeedDial actions
const UserChatInput = ({
  input,
  handleInputChange,
  handleSubmit,
}: UserChatInputProps) => {
  return (
    <>
      <SpeedDial
        ariaLabel="SpeedDial"
        sx={{
          position: "absolute",
          bottom: 16,
          left: 265,
        }}
        icon={<SpeedDialIcon />}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
          />
        ))}
      </SpeedDial>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-row">
          <TextField
            id="standard-basic"
            variant="standard"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask any question..."
            className="w-full"
            InputProps={{ style: { fontSize: 12 } }} // Set the font size of input text
            InputLabelProps={{ style: { fontSize: 12 } }} // Set the font size of the label when it's shrunk
          />
          <Button
            variant="text"
            endIcon={<SendIcon />}
            type="submit"
            sx={{ width: "10px" }}
          />
        </div>
      </form>
    </>
  );
};

export default UserChatInput;

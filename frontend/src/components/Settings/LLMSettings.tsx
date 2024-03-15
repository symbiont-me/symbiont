"use client";
import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { Input } from "@mui/material";
import { Select } from "@mui/material";
import { MenuItem } from "@mui/material";
import { FormControl } from "@mui/material";
import { InputLabel } from "@mui/material";
import { LLMModels } from "@/types";
import { UserAuth } from "@/app/context/AuthContext";
import axios from "axios";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type FullScreenSettingsDialogProps = {
  settingsOpen: boolean;
  handleSettingsClose: () => void;
};

async function setModelSettings(
  model: string,
  apiKey: string,
  userToken: string
) {
  const endpoint = "http://127.0.0.1:8000/set-llm-settings";
  const body = JSON.stringify({ model, apiKey });
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${userToken}`,
  };
  try {
    await axios.post(endpoint, body, { headers });
  } catch (error) {
    console.error(error);
  }
}

export default function FullScreenSettingsDialog({
  settingsOpen,
  handleSettingsClose,
}: FullScreenSettingsDialogProps) {
  const authContext = UserAuth();
  const [userToken, setUserToken] = React.useState("");
  const [model, setModel] = React.useState(LLMModels.GPT_3_5_TURBO);
  const [apiKey, setApiKey] = React.useState("");
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    if (!authContext || !authContext.user) {
      return;
    }
    authContext.user.getIdToken().then((token) => {
      setUserToken(token);
    });
  }, [authContext]);

  async function saveSettings() {
    if (!authContext || !authContext.user || !userToken) {
      return;
    }
    await setModelSettings(model, apiKey, userToken);
    handleSettingsClose();
  }

  const handleChange = (event: SelectChangeEvent) => {
    setModel(event.target.value as string);
  };

  return (
    <React.Fragment>
      <Dialog
        fullScreen
        open={open}
        onClose={handleSettingsClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleSettingsClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              LLM Settings
            </Typography>
            <Button autoFocus color="inherit" onClick={saveSettings}>
              save
            </Button>
          </Toolbar>
        </AppBar>
        <List sx={{ padding: "24px" }}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">LLM Model</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={model}
              label="llm-models"
              onChange={handleChange}
            >
              {Object.entries(LLMModels).map(([key, value]) => (
                <MenuItem key={key} value={value}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Divider />
          <Input placeholder="API Key" sx={{ marginTop: "16px" }} />
        </List>
      </Dialog>
    </React.Fragment>
  );
}

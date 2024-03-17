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
import { SelectChangeEvent } from "@mui/material/Select";
import axios from "axios";
import Cookie from "js-cookie";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function setCookie(key: string, value: string) {
  if (typeof window !== "undefined") {
    Cookie.set(key, value, {
      expires: 1,
      path: "/",
    });
  }
}

type FullScreenSettingsDialogProps = {
  settingsOpen: boolean;
  handleSettingsClose: () => void;
};

async function updateModelSettings(
  model: string,
  apiKey: string,
  userToken: string
) {
  console.log("Setting LLM Model to: ", model);
  console.log("Setting API Key to: ", apiKey);

  const endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/set-llm-settings`;
  const body = {
    llm_name: model,
    api_key: apiKey,
  };
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${userToken}`,
  };
  try {
    await axios.post(endpoint, JSON.stringify(body), { headers });
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
  const modelCookie = Cookie.get("llm_model");
  const apiKeyCookie = Cookie.get("api_key");
  const [model, setModel] = React.useState<string>(
    modelCookie || LLMModels.GPT_3_5_TURBO
  );
  const [apiKey, setApiKey] = React.useState<string>(apiKeyCookie || "");
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

    setCookie("llm_model", model);
    setCookie("api_key", apiKey);

    await updateModelSettings(model, apiKey, userToken);
    handleSettingsClose();
  }

  const handleChange = (event: SelectChangeEvent) => {
    setModel(event.target.value as string);
  };

  function handleApiKey(event: React.ChangeEvent<HTMLInputElement>) {
    setApiKey(event.target.value);
  }

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
          <Input
            placeholder="API Key"
            sx={{ marginTop: "16px" }}
            onChange={handleApiKey}
            value={apiKey}
          />
        </List>
      </Dialog>
    </React.Fragment>
  );
}

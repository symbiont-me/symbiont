"use client";
import * as React from "react";
import { useEffect, useState } from "react";
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

async function updateLlmSettings(
  model: string,
  apiKey: string,
  userToken: string
) {
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
    await axios.post(endpoint, JSON.stringify(body), {
      headers,
      withCredentials: true,
    });
  } catch (error) {
    console.error(error);
  }
}

async function getLlmSettings(userToken: string) {
  const endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/get-llm-settings`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${userToken}`,
  };

  const response = await axios.get(endpoint, {
    headers,
    withCredentials: true,
  });

  return response.data;
}

export default function FullScreenSettingsDialog({
  settingsOpen,
  handleSettingsClose,
}: FullScreenSettingsDialogProps) {
  const authContext = UserAuth();
  const [userToken, setUserToken] = useState("");

  const [model, setModel] = useState<string>(LLMModels.GPT_3_5_TURBO);
  const [apiKey, setApiKey] = useState<string>("");
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!authContext || !authContext.user) {
      return;
    }
    authContext.user.getIdToken().then((token) => {
      setUserToken(token);
    });
  }, [authContext]);

  useEffect(() => {
    if (!userToken) {
      return;
    }
    getLlmSettings(userToken).then((res) => {
      if (!res) {
        return;
      }
      setModel(res.llm_name);
      setApiKey(res.api_key);
    });
  }, [userToken]);

  async function saveSettings() {
    if (!authContext || !authContext.user || !userToken) {
      return;
    }
    await updateLlmSettings(model, apiKey, userToken);
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
              sx={{ width: "70%" }}
            >
              {Object.entries(LLMModels).map(([key, value]) => (
                <MenuItem key={key} value={value}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Input
            placeholder="API Key"
            sx={{ marginTop: "16px", width: "70%" }}
            onChange={handleApiKey}
            value={apiKey}
          />
          <Typography
            sx={{
              marginTop: "8px",
              color: "gray",
              fontSize: 12,
              fontStyle: "italic",
            }}
          >
            we do not store your api keys
          </Typography>
        </List>
      </Dialog>
    </React.Fragment>
  );
}

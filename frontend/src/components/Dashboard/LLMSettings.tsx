import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Card,
  CardContent,
  Alert,
  Collapse,
} from "@mui/material";
import { useAuthContext } from "../../context/AuthContext";

interface LLMSettings {
  llm_name: string;
  api_key: string;
  max_tokens: number;
  temperature: number;
  timeout: number;
  custom_api_url?: string;
  custom_model_name?: string;
}

const LLMSettings = () => {
  const { user } = useAuthContext();
  const [settings, setSettings] = useState<LLMSettings>({
    llm_name: "",
    api_key: "",
    max_tokens: 1500,
    temperature: 0.7,
    timeout: 60,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [showCustomFields, setShowCustomFields] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    setShowCustomFields(settings.llm_name.startsWith("custom/"));
  }, [settings.llm_name]);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/get-llm-settings", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setSettings(data);
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/set-llm-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ text: "Settings saved successfully!", type: "success" });
      } else {
        const error = await response.json();
        setMessage({
          text: error.detail || "Failed to save settings",
          type: "error",
        });
      }
    } catch (error) {
      setMessage({ text: "Failed to save settings", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const predefinedModels = [
    // OpenAI Models
    { value: "gpt-5-2025-08-07", label: "GPT-5" },
    { value: "gpt-5-mini-2025-08-07", label: "GPT-5 Mini" },
    { value: "gpt-5-nano-2025-08-07", label: "GPT-5 Nano" },
    { value: "gpt-5-pro-2025-10-06", label: "GPT-5 Pro" },
    { value: "gpt-4.1-2025-04-14", label: "GPT-4.1" },
    { value: "gpt-4o-2024-08-06", label: "GPT-4o" },
    { value: "gpt-4o-mini-2024-07-18", label: "GPT-4o Mini" },
    
    // Anthropic Models
    { value: "claude-sonnet-4-5-20250929", label: "Claude Sonnet 4.5" },
    { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
    { value: "claude-opus-4-1-20250805", label: "Claude Opus 4.1" },
    
    // Google Models
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
    
    // Custom Models
    { value: "custom/open-source", label: "Custom open source model" },
  ];

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        LLM Settings
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Model</InputLabel>
              <Select
                value={settings.llm_name}
                label="Model"
                onChange={(e) =>
                  setSettings({ ...settings, llm_name: e.target.value })
                }
              >
                {predefinedModels.map((model) => (
                  <MenuItem key={model.value} value={model.value}>
                    {model.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="API Key"
              type="password"
              fullWidth
              value={settings.api_key}
              onChange={(e) =>
                setSettings({ ...settings, api_key: e.target.value })
              }
              helperText="Your API key for the selected model provider"
            />

            <Collapse in={showCustomFields}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Custom API URL"
                  fullWidth
                  value={settings.custom_api_url || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, custom_api_url: e.target.value })
                  }
                  placeholder="https://api.netmind.ai/inference-api/openai/v1"
                  helperText="OpenAI-compatible API endpoint URL"
                />

                <TextField
                  label="Model Name"
                  fullWidth
                  value={settings.custom_model_name || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      custom_model_name: e.target.value,
                    })
                  }
                  placeholder="deepseek-ai/DeepSeek-V3.2-Exp"
                  helperText="The specific model identifier"
                />
              </Box>
            </Collapse>

            <TextField
              label="Max Tokens"
              type="number"
              fullWidth
              value={settings.max_tokens}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  max_tokens: parseInt(e.target.value) || 1500,
                })
              }
              inputProps={{ min: 1, max: 4000 }}
            />

            <Box>
              <Typography gutterBottom>
                Temperature: {settings.temperature}
              </Typography>
              <Slider
                value={settings.temperature}
                onChange={(_, value) =>
                  setSettings({ ...settings, temperature: value as number })
                }
                min={0}
                max={1}
                step={0.1}
                valueLabelDisplay="auto"
              />
            </Box>

            <TextField
              label="Timeout (seconds)"
              type="number"
              fullWidth
              value={settings.timeout}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  timeout: parseInt(e.target.value) || 60,
                })
              }
              inputProps={{ min: 1, max: 300 }}
            />

            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading || !settings.llm_name || !settings.api_key}
              sx={{ mt: 2 }}
            >
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Custom Model Example
        </Typography>
        <Typography variant="body2" color="text.secondary">
          For open source models like DeepSeek, use:
          <br />
          • API URL: https://api.netmind.ai/inference-api/openai/v1
          <br />
          • Model Name: deepseek-ai/DeepSeek-V3.2-Exp
          <br />• API Key: Your provider's API key
        </Typography>
      </Box>
    </Box>
  );
};

export default LLMSettings;

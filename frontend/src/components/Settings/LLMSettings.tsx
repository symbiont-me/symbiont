"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, X, Settings, Check, AlertCircle } from "lucide-react";
import { LLMModels } from "@/types";
import { UserAuth } from "@/app/context/AuthContext";
import axios from "axios";
import Session from "supertokens-auth-react/recipe/session";

// Helper function to format model display names
function formatModelDisplayName(key: string): string {
  // Special cases for better formatting
  const specialCases: Record<string, string> = {
    'CUSTOM_OPEN_SOURCE': 'Custom open source model',
    'GPT_5_2025_08_07': 'GPT-5',
    'GPT_5_MINI_2025_08_07': 'GPT-5 Mini',
    'GPT_5_NANO_2025_08_07': 'GPT-5 Nano',
    'GPT_5_PRO_2025_10_06': 'GPT-5 Pro',
    'GPT_4_1_2025_04_14': 'GPT-4.1',
    'GPT_4O_MINI_2024_07_18': 'GPT-4o Mini',
    'GPT_4O_2024_08_06': 'GPT-4o',
    'CLAUDE_SONNET_4_5_20250929': 'Claude Sonnet 4.5',
    'CLAUDE_HAIKU_4_5_20251001': 'Claude Haiku 4.5',
    'CLAUDE_OPUS_4_1_20250805': 'Claude Opus 4.1',
    'GEMINI_2_5_PRO': 'Gemini 2.5 Pro',
    'GEMINI_2_5_FLASH': 'Gemini 2.5 Flash',
    'GEMINI_2_5_FLASH_LITE': 'Gemini 2.5 Flash Lite',
  };
  
  return specialCases[key] || key
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

type FullScreenSettingsDialogProps = {
  settingsOpen: boolean;
  handleSettingsClose: () => void;
};

async function updateLlmSettings(
  model: string,
  apiKey: string,
  customApiUrl: string,
  customModelName: string,
  userToken: string
) {
  const endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/set-llm-settings`;
  const body = {
    llm_name: model,
    api_key: apiKey,
    custom_api_url: customApiUrl || undefined,
    custom_model_name: customModelName || undefined,
  };

  console.log("User token: ", userToken);
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
  const [customApiUrl, setCustomApiUrl] = useState<string>("");
  const [customModelName, setCustomModelName] = useState<string>("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<{model?: string; apiKey?: string; customApiUrl?: string; customModelName?: string}>({});

  useEffect(() => {
    async function fetchAccessToken() {
      const accessToken = await Session.getAccessToken();
      if (accessToken) {
        setUserToken(accessToken);
      }
    }
    fetchAccessToken();
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
      setCustomApiUrl(res.custom_api_url || "");
      setCustomModelName(res.custom_model_name || "");
    });
  }, [userToken]);

  async function saveSettings() {
    if (!authContext || !userToken) {
      return;
    }

    // Validate inputs
    const newErrors: {model?: string; apiKey?: string; customApiUrl?: string; customModelName?: string} = {};
    if (!model) {
      newErrors.model = "Please select a model";
    }
    if (!apiKey || !apiKey.trim()) {
      newErrors.apiKey = "Please enter an API key";
    }
    if (model === LLMModels.CUSTOM_OPEN_SOURCE) {
      if (!customApiUrl || !customApiUrl.trim()) {
        newErrors.customApiUrl = "Please enter a custom API URL";
      }
      if (!customModelName || !customModelName.trim()) {
        newErrors.customModelName = "Please enter a model name";
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSaving(true);
    try {
      await updateLlmSettings(model, apiKey, customApiUrl, customModelName, userToken);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        handleSettingsClose();
      }, 1500);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setErrors({ apiKey: "Failed to save settings. Please try again." });
    } finally {
      setIsSaving(false);
    }
  }

  const handleChange = (value: string) => {
    setModel(value);
    if (errors.model) {
      setErrors(prev => ({ ...prev, model: undefined }));
    }
  };

  function handleApiKey(event: React.ChangeEvent<HTMLInputElement>) {
    setApiKey(event.target.value);
    if (errors.apiKey) {
      setErrors(prev => ({ ...prev, apiKey: undefined }));
    }
  }

  const handleToggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  return (
    <Dialog open={settingsOpen} onOpenChange={handleSettingsClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] w-[95vw] sm:w-full p-0 gap-0 bg-gradient-to-b from-slate-50 to-white">
        {/* Modern Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
              <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg sm:text-xl font-semibold text-white m-0 truncate">
                LLM Settings
              </DialogTitle>
              <p className="text-blue-100 text-xs sm:text-sm mt-0.5 hidden sm:block">Configure your language model preferences</p>
            </div>
          </div>
          <button
            onClick={handleSettingsClose}
            data-testid="llm-settings-close"
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors flex-shrink-0"
            aria-label="Close settings dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content with better spacing */}
        <div className="p-4 sm:p-8 overflow-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6 sm:space-y-8">
            {/* Success Message */}
            {saveSuccess && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-green-700 font-medium">Settings saved successfully!</span>
              </div>
            )}

            {/* LLM Model Selection */}
            <div className="space-y-3">
              <Label htmlFor="llm-model" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Language Model
              </Label>
              <p className="text-sm text-gray-600 -mt-1">
                Choose the AI model that best fits your needs
              </p>
              <Select value={model} onValueChange={handleChange}>
                <SelectTrigger 
                  id="llm-model"
                  className={`w-full h-12 border-2 transition-all duration-200 ${
                    errors.model 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-200'
                  } bg-white rounded-xl shadow-sm`}
                  data-testid="llm-model-select"
                >
                  <SelectValue placeholder="Select a language model" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 shadow-xl">
                  {Object.entries(LLMModels).map(([key, value]) => (
                    <SelectItem key={key} value={value} className="h-12 rounded-lg mx-1">
                      <div className="flex flex-col">
                        <span className="font-medium">{formatModelDisplayName(key)}</span>
                        <span className="text-xs text-gray-500">{value}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.model && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.model}</span>
                </div>
              )}
            </div>

            {/* API Key Input */}
            <div className="space-y-3">
              <Label htmlFor="api-key" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                API Key
              </Label>
              <p className="text-sm text-gray-600 -mt-1">
                Your API key is encrypted and never stored on our servers
              </p>
              <div className="relative">
                <Input
                  id="api-key"
                  placeholder="sk-..."
                  type={showApiKey ? "text" : "password"}
                  className={`h-12 pr-12 border-2 transition-all duration-200 rounded-xl shadow-sm ${
                    errors.apiKey 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-200'
                  } bg-white`}
                  onChange={handleApiKey}
                  value={apiKey}
                  data-testid="api-key-input"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-md hover:bg-blue-50"
                  onClick={handleToggleApiKeyVisibility}
                  aria-label="toggle api key visibility"
                >
                  {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.apiKey && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.apiKey}</span>
                </div>
              )}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-xs text-blue-700 flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                  Your API keys are handled securely and never stored permanently
                </div>
              </div>
            </div>

            {/* Custom Model Fields */}
            {model === LLMModels.CUSTOM_OPEN_SOURCE && (
              <div className="space-y-6 border-t border-gray-200 pt-6">
                <div className="space-y-3">
                  <Label htmlFor="custom-api-url" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Custom API URL
                  </Label>
                  <p className="text-sm text-gray-600 -mt-1">
                    OpenAI-compatible API endpoint URL
                  </p>
                  <Input
                    id="custom-api-url"
                    placeholder="https://api.netmind.ai/inference-api/openai/v1"
                    className={`h-12 border-2 transition-all duration-200 rounded-xl shadow-sm ${
                      errors.customApiUrl 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-200'
                    } bg-white`}
                    onChange={(e) => {
                      setCustomApiUrl(e.target.value);
                      if (errors.customApiUrl) {
                        setErrors(prev => ({ ...prev, customApiUrl: undefined }));
                      }
                    }}
                    value={customApiUrl}
                    data-testid="custom-api-url-input"
                  />
                  {errors.customApiUrl && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.customApiUrl}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="custom-model-name" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Model Name
                  </Label>
                  <p className="text-sm text-gray-600 -mt-1">
                    The specific model identifier (e.g., deepseek-ai/DeepSeek-V3.2-Exp)
                  </p>
                  <Input
                    id="custom-model-name"
                    placeholder="deepseek-ai/DeepSeek-V3.2-Exp"
                    className={`h-12 border-2 transition-all duration-200 rounded-xl shadow-sm ${
                      errors.customModelName 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-200'
                    } bg-white`}
                    onChange={(e) => {
                      setCustomModelName(e.target.value);
                      if (errors.customModelName) {
                        setErrors(prev => ({ ...prev, customModelName: undefined }));
                      }
                    }}
                    value={customModelName}
                    data-testid="custom-model-name-input"
                  />
                  {errors.customModelName && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.customModelName}</span>
                    </div>
                  )}
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="text-sm text-orange-800">
                    <div className="font-medium mb-2">Example Configuration:</div>
                    <div className="text-xs space-y-1 font-mono">
                      <div>• API URL: https://api.netmind.ai/inference-api/openai/v1</div>
                      <div>• Model: deepseek-ai/DeepSeek-V3.2-Exp</div>
                      <div>• API Key: Your provider's API key</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <Button 
                variant="outline"
                onClick={handleSettingsClose}
                className="w-full sm:w-auto px-6 h-12 border-2 border-gray-200 hover:border-gray-300 rounded-xl font-medium transition-all duration-200"
              >
                Cancel
              </Button>
              <Button 
                onClick={saveSettings}
                disabled={isSaving || !model || !apiKey || !apiKey.trim()}
                data-testid="llm-settings-save"
                className="w-full sm:flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={isSaving ? "Saving settings" : "Save LLM settings"}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" aria-hidden="true"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" aria-hidden="true" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"""
Shared models configuration for consistent model management across frontend and backend.
Reads from the shared-models-config.json file at repository root.
"""
import json
import os
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Get the repository root (parent of backend directory)
REPO_ROOT = Path(__file__).parent.parent.parent
CONFIG_FILE = REPO_ROOT / "shared-models-config.json"

class SharedModelsConfig:
    """Utility class to read and work with shared models configuration."""
    
    def __init__(self):
        self._config = None
        self._load_config()
    
    def _load_config(self):
        """Load the shared models configuration from JSON file."""
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                self._config = json.load(f)
        except FileNotFoundError:
            raise FileNotFoundError(
                f"Shared models config file not found at {CONFIG_FILE}. "
                "Make sure shared-models-config.json exists at repository root."
            )
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in shared models config: {e}")
    
    def get_all_models(self) -> List[Dict]:
        """Get all models from all providers as a flat list."""
        all_models = []
        for provider_models in self._config["models"].values():
            all_models.extend(provider_models)
        return all_models
    
    def get_models_by_provider(self, provider: str) -> List[Dict]:
        """Get all models for a specific provider."""
        return self._config["models"].get(provider, [])
    
    def get_model_by_id(self, model_id: str) -> Optional[Dict]:
        """Get a specific model by its ID."""
        for model in self.get_all_models():
            if model["id"] == model_id:
                return model
        return None
    
    def get_display_name(self, model_id: str) -> Optional[str]:
        """Get the display name for a model ID."""
        model = self.get_model_by_id(model_id)
        return model["displayName"] if model else None
    
    def detect_provider(self, model_name: str) -> Optional[str]:
        """Detect the provider for a given model name using regex patterns."""
        provider_detection = self._config.get("providerDetection", {})
        
        for provider, config in provider_detection.items():
            pattern = config.get("pattern", "")
            if pattern and re.match(pattern, model_name):
                return provider
        
        return None
    
    def is_openai_model(self, model_name: str) -> bool:
        """Check if a model is an OpenAI model."""
        return self.detect_provider(model_name) == "openai"
    
    def is_anthropic_model(self, model_name: str) -> bool:
        """Check if a model is an Anthropic model."""
        return self.detect_provider(model_name) == "anthropic"
    
    def is_google_model(self, model_name: str) -> bool:
        """Check if a model is a Google model."""
        return self.detect_provider(model_name) == "google"
    
    def is_custom_model(self, model_name: str) -> bool:
        """Check if a model is a custom model."""
        return self.detect_provider(model_name) == "custom"


# Singleton instance
_shared_models_config = None

def get_shared_models_config() -> SharedModelsConfig:
    """Get the singleton instance of SharedModelsConfig."""
    global _shared_models_config
    if _shared_models_config is None:
        _shared_models_config = SharedModelsConfig()
    return _shared_models_config

# Convenience functions for backward compatibility
def isOpenAImodel(llm_name: str) -> bool:
    """Check if a model is an OpenAI model."""
    return get_shared_models_config().is_openai_model(llm_name)

def isAnthropicModel(llm_name: str) -> bool:
    """Check if a model is an Anthropic model."""
    return get_shared_models_config().is_anthropic_model(llm_name)

def isGoogleModel(llm_name: str) -> bool:
    """Check if a model is a Google model."""
    return get_shared_models_config().is_google_model(llm_name)

def isCustomModel(llm_name: str) -> bool:
    """Check if a model is a custom model."""
    return get_shared_models_config().is_custom_model(llm_name)
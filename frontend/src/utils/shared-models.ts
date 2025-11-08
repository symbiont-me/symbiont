/**
 * Shared models configuration for consistent model management across frontend and backend.
 * Reads from the shared-models-config.json file at repository root.
 */

// Import the shared config directly
import sharedModelsConfig from '../../../shared-models-config.json';

export interface ModelConfig {
  id: string;
  displayName: string;
  provider: string;
  category: string;
}

export interface ProviderDetection {
  pattern: string;
  description: string;
}

export interface SharedModelsConfig {
  models: {
    openai: ModelConfig[];
    anthropic: ModelConfig[];
    google: ModelConfig[];
    custom: ModelConfig[];
  };
  providerDetection: {
    [provider: string]: ProviderDetection;
  };
}

class SharedModelsConfigUtil {
  private config: SharedModelsConfig;

  constructor() {
    this.config = sharedModelsConfig as SharedModelsConfig;
  }

  /**
   * Get all models from all providers as a flat list
   */
  getAllModels(): ModelConfig[] {
    const allModels: ModelConfig[] = [];
    Object.values(this.config.models).forEach(providerModels => {
      allModels.push(...providerModels);
    });
    return allModels;
  }

  /**
   * Get all models for a specific provider
   */
  getModelsByProvider(provider: keyof SharedModelsConfig['models']): ModelConfig[] {
    return this.config.models[provider] || [];
  }

  /**
   * Get a specific model by its ID
   */
  getModelById(modelId: string): ModelConfig | undefined {
    return this.getAllModels().find(model => model.id === modelId);
  }

  /**
   * Get the display name for a model ID
   */
  getDisplayName(modelId: string): string | undefined {
    const model = this.getModelById(modelId);
    return model?.displayName;
  }

  /**
   * Detect the provider for a given model name using regex patterns
   */
  detectProvider(modelName: string): string | null {
    const providerDetection = this.config.providerDetection;
    
    for (const [provider, config] of Object.entries(providerDetection)) {
      const pattern = config.pattern;
      if (pattern && new RegExp(pattern).test(modelName)) {
        return provider;
      }
    }
    
    return null;
  }

  /**
   * Check if a model is an OpenAI model
   */
  isOpenAIModel(modelName: string): boolean {
    return this.detectProvider(modelName) === 'openai';
  }

  /**
   * Check if a model is an Anthropic model
   */
  isAnthropicModel(modelName: string): boolean {
    return this.detectProvider(modelName) === 'anthropic';
  }

  /**
   * Check if a model is a Google model
   */
  isGoogleModel(modelName: string): boolean {
    return this.detectProvider(modelName) === 'google';
  }

  /**
   * Check if a model is a custom model
   */
  isCustomModel(modelName: string): boolean {
    return this.detectProvider(modelName) === 'custom';
  }

  /**
   * Get models formatted for UI dropdown/select components
   */
  getModelsForUI(): Array<{ value: string; label: string }> {
    return this.getAllModels().map(model => ({
      value: model.id,
      label: model.displayName
    }));
  }

  /**
   * Get models grouped by provider for organized UI display
   */
  getGroupedModelsForUI(): Array<{
    provider: string;
    models: Array<{ value: string; label: string }>;
  }> {
    return [
      {
        provider: 'OpenAI',
        models: this.getModelsByProvider('openai').map(m => ({ 
          value: m.id, 
          label: m.displayName 
        }))
      },
      {
        provider: 'Anthropic',
        models: this.getModelsByProvider('anthropic').map(m => ({ 
          value: m.id, 
          label: m.displayName 
        }))
      },
      {
        provider: 'Google',
        models: this.getModelsByProvider('google').map(m => ({ 
          value: m.id, 
          label: m.displayName 
        }))
      },
      {
        provider: 'Custom',
        models: this.getModelsByProvider('custom').map(m => ({ 
          value: m.id, 
          label: m.displayName 
        }))
      }
    ].filter(group => group.models.length > 0);
  }
}

// Singleton instance
let sharedModelsConfigUtil: SharedModelsConfigUtil | null = null;

export function getSharedModelsConfig(): SharedModelsConfigUtil {
  if (sharedModelsConfigUtil === null) {
    sharedModelsConfigUtil = new SharedModelsConfigUtil();
  }
  return sharedModelsConfigUtil;
}

// Create enum from shared config for backward compatibility
const models = sharedModelsConfig as SharedModelsConfig;
export const LLMModels = Object.fromEntries(
  Object.values(models.models)
    .flat()
    .map(model => [
      model.id.toUpperCase().replace(/[.-]/g, '_').replace(/\//g, '_'),
      model.id
    ])
);

// Convenience functions for backward compatibility
export function isOpenAIModel(modelName: string): boolean {
  return getSharedModelsConfig().isOpenAIModel(modelName);
}

export function isAnthropicModel(modelName: string): boolean {
  return getSharedModelsConfig().isAnthropicModel(modelName);
}

export function isGoogleModel(modelName: string): boolean {
  return getSharedModelsConfig().isGoogleModel(modelName);
}

export function isCustomModel(modelName: string): boolean {
  return getSharedModelsConfig().isCustomModel(modelName);
}
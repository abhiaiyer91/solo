/**
 * Centralized configuration for the Journey server
 *
 * All environment variables and configuration values should be accessed through this module
 * to ensure consistency and make it easy to identify what config is required.
 */

// Server configuration
export const config = {
  // Server
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,

  // URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  backendUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000',

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // AI/Mastra
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,

  // Feature flags
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
} as const

/**
 * Validate that required configuration is present
 * Call this at startup to fail fast if config is missing
 */
export function validateConfig(): { valid: boolean; missing: string[] } {
  const missing: string[] = []

  if (!config.databaseUrl) {
    missing.push('DATABASE_URL')
  }

  return {
    valid: missing.length === 0,
    missing,
  }
}

/**
 * Get a summary of the current configuration (safe for logging)
 */
export function getConfigSummary(): Record<string, string | boolean> {
  return {
    port: String(config.port),
    frontendUrl: config.frontendUrl,
    backendUrl: config.backendUrl,
    databaseConfigured: !!config.databaseUrl,
    aiConfigured: !!config.anthropicApiKey,
    isProduction: config.isProduction,
  }
}

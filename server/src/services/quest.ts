// Quest service - re-exports from modular files for backward compatibility
// This file maintains the original API surface for existing imports

// Core query functions
export {
  evaluateRequirement,
  getTodayQuests,
  getTodayQuestsWithRotating,
  getQuestById,
  getAllQuestTemplates,
} from './quest-core.js'

// Progress tracking
export {
  updateQuestProgress,
  autoEvaluateQuestsFromHealth,
} from './quest-progress.js'

// Quest lifecycle management
export {
  resetQuest,
  removeQuest,
  deactivateQuestByTemplate,
  activateQuest,
} from './quest-lifecycle.js'

// Analytics/history
export {
  getQuestHistory,
  getQuestStatistics,
} from './quest-history.js'

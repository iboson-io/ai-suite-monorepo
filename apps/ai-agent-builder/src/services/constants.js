// API Configuration Constants
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
export const SOCKET_BASE_URL = import.meta.env.VITE_SOCKET_BASE_URL ?? ''
export const WORKFLOW_SOCKET_BASE_URL = import.meta.env.VITE_WORKFLOW_SOCKET_BASE_URL ?? ''

  export const USER_API_URL=API_BASE_URL
  export const AGENT_API_URL=API_BASE_URL
  export const CHAT_API_URL=API_BASE_URL
  export const API_DEPLOYMENT_URL=API_BASE_URL
  export const PAYMENT_API_URL=API_BASE_URL
  export const NOTIFICATION_API_URL=API_BASE_URL
  export const CHAT_AI_API_URL=API_BASE_URL
  export const CHAT_AI_API_URL_WS=SOCKET_BASE_URL
  export const WORKFLOW_API_URL = API_BASE_URL
 export const WORKFLOW_AGENT_WS_URL = WORKFLOW_SOCKET_BASE_URL
 export const WORKFLOW_AGENT_WS_PATH = '/workflow-agent'
// for testing locally
// export const USER_API_URL = 'http://localhost:3001'
// export const AGENT_API_URL = 'http://localhost:3006'
// export const CHAT_API_URL = 'http://localhost:3003'
// export const API_DEPLOYMENT_URL = 'http://localhost:3004'
// export const PAYMENT_API_URL = 'http://localhost:3005'
// export const NOTIFICATION_API_URL = 'http://localhost:3007'
// export const CHAT_AI_API_URL = 'http://localhost:3003'
// export const CHAT_AI_API_URL_WS = 'ws://localhost:8000'
// export const WORKFLOW_API_URL = 'http://localhost:3010'
// export const WORKFLOW_AGENT_WS_URL = 'ws://localhost:8000'
// export const WORKFLOW_AGENT_WS_PATH = '/workflow-agent'

// Google OAuth Configuration (client secret belongs on the server only)
export const GOOGLE_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
  SCOPES: ['email', 'profile'],
  REDIRECT_URI: `${API_BASE_URL}/auth/google/callback`,
}

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication endpoints
  SIGNUP: '/api/auth/register',
  LOGIN: '/api/auth/login',
  LOGIN_WITH_CODE: '/auth/login/code',
  SEND_VERIFICATION_CODE: '/auth/send-code',
  GOOGLE_AUTH: '/api/auth/google',
  VALIDATE_EMAIL: '/auth/validate-email',
  VERIFY_EMAIL: '/api/auth/verify-email',
  RESEND_VERIFICATION: '/api/auth/resend-verification',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  CONFIRM_RESET_PASSWORD: '/api/auth/reset-password',
  UPDATE_PASSWORD: '/api/user/update-password',

  // Agent endpoints
  GET_AGENT_DATA: '/api/agents',
  GET_AGENT_ANALYTICS: '/agents/analytics',
  CREATE_AGENT: '/api/agents',
  DELETE_AGENT: '/api/agents',
  UPDATE_AGENT_STATUS: '/api/agents',
  UPDATE_AGENT: '/api/agents',
  DELETE_AGENT_FILE: '/api/agents',
  ENHANCE_PROMPT: '/api/agents/enhance-prompt',
  CREATE_AGENT_GROUP: '/api/agent-groups',
  GET_GROUP_AGENTS_BY_ID: '/api/agent-groups',

  // Chat endpoints
  CREATE_CHAT: '/api/chats',
  GET_CHATS: '/api/chats',
  GET_CHAT_MESSAGES: '/api/chats',
  DELETE_CHAT: '/api/chats',

  GET_PROFILE: '/api/user/profile',
  UPDATE_PROFILE_PICTURE: '/api/user/profile-picture',
  UPDATE_PROFILE: '/api/user/profile',
  DELETE_PROFILE_PICTURE: '/api/user/profile-picture',

  // Notification endpoints
  GET_NOTIFICATIONS: '/api/notifications',
  MARK_NOTIFICATION_READ: '/api/notifications',
  MARK_ALL_NOTIFICATIONS_READ: '/api/notifications/read-all',
  DELETE_NOTIFICATION: '/api/notifications',
  CLEAR_ALL_NOTIFICATIONS: '/api/notifications/all',

  // Plan endpoints
  GET_CURRENT_PLAN: '/api/subscriptions/current',
  GET_AVAILABLE_PLANS: '/api/subscriptions/plans',
  GET_PURCHASE_HISTORY: '/api/payments/purchase-history',
  UPGRADE_PLAN: '/api/plans/upgrade',
  CREATE_SUBSCRIPTION: '/api/subscriptions',

  // Deployment endpoints
  REGENERATE_API_KEY: '/api/deployments/{deployment_id}/regenerate-key',

  // Support endpoints
  SUBMIT_SUPPORT_TICKET: '/api/support/tickets',

  // Merge.dev endpoints
  MERGE_APPS: '/api/merge-apps',
  MERGE_CONNECTED_APPS: '/api/merge-apps/connected-apps',
  AGENT_MERGE_APPS: '/api/agents',

  // OpenAI Realtime API endpoints
  CREATE_REALTIME_SESSION: '/session',
  REALTIME_WEBSOCKET: '/realtime',
}

// Other application constants can be added here
export const APP_CONFIG = {
  APP_NAME: 'AI Agent',
  VERSION: '1.0.0',
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB to match backend
  MAX_SCHEMA_FILES: 10, // Maximum schema files per upload
  MAX_DOCUMENT_FILES: 10, // Maximum document files per upload
  ALLOWED_SCHEMA_EXTENSIONS: ['.json', '.yaml', '.yml'],
  ALLOWED_DOCUMENT_EXTENSIONS: ['.pdf', '.docx'],
}

// ElevenLabs API Configuration
export const ELEVENLABS_CONFIG = {
  apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY ?? '',
  voiceId: '21m00Tcm4TlvDq8ikWAM', // Default voice ID (you can change this)
  //JBFqnCBsd6RMkjVDRZzb
  modelId: 'eleven_flash_v2_5', // Using Flash v2.5 for ultra-low latency (~75ms)
  voiceSettings: {
    stability: 0.5,
    similarityBoost: 0.5,
    style: 0.0,
    useSpeakerBoost: true,
  },
  baseUrl: 'https://api.elevenlabs.io/v1',
}

// OpenAI TTS API Configuration
export const OPENAI_TTS_CONFIG = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY ?? '',
  voiceId: 'alloy', // Default voice ID
  model: 'gpt-4o-mini-tts', // Default model (tts-1 for standard, tts-1-hd for high quality)
  baseUrl: 'https://api.openai.com/v1',
  // Available OpenAI voices
  availableVoices: [
    { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced voice' },
    { id: 'echo', name: 'Echo', description: 'Clear, confident voice' },
    { id: 'fable', name: 'Fable', description: 'Warm, expressive voice' },
    { id: 'onyx', name: 'Onyx', description: 'Deep, rich voice' },
    { id: 'nova', name: 'Nova', description: 'Bright, energetic voice' },
    { id: 'shimmer', name: 'Shimmer', description: 'Soft, gentle voice' },
  ],
}

// Audio Provider Configuration
export const AUDIO_PROVIDER_CONFIG = {
  currentProvider: 'openai', // Default provider changed to OpenAI
  providers: {
    elevenlabs: {
      name: 'ElevenLabs',
      description: 'High-quality, natural voices',
      icon: '🎤',
    },
    openai: {
      name: 'OpenAI',
      description: 'Fast, reliable voices',
      icon: '🤖',
    },
  },
}

// Subscription tiers and limits
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PRO: 'pro',
  TEAM: 'team',
} as const;

export const SUBSCRIPTION_LIMITS = {
  [SUBSCRIPTION_TIERS.FREE]: {
    outputs: 5,
    icps: -1, // unlimited
    features: ['objection-killer', 'message-generator', 'qualification-framework'],
  },
  [SUBSCRIPTION_TIERS.PRO]: {
    outputs: -1, // unlimited
    icps: -1, // unlimited
    features: ['objection-killer', 'message-generator', 'qualification-framework'],
  },
  [SUBSCRIPTION_TIERS.TEAM]: {
    outputs: -1, // unlimited
    icps: -1, // unlimited
    features: ['objection-killer', 'message-generator', 'qualification-framework'],
    seats: 5,
  },
} as const;

// Output types
export const OUTPUT_TYPES = {
  OBJECTION: 'objection',
  MESSAGE: 'message', 
  QUALIFICATION: 'qualification',
} as const;

// Feature names for tracking
export const FEATURES = {
  OBJECTION_KILLER: 'objection-killer',
  MESSAGE_GENERATOR: 'message-generator',
  QUALIFICATION_FRAMEWORK: 'qualification-framework',
  ICP_BUILDER: 'icp-builder',
} as const;
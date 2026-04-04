/**
 * Constraint validation and auto-fix logic for suit configurations.
 * Enforces rules like: shawl lapel locks button config, double-breasted disables ticket pocket.
 */

import { SuitConfig } from '@/types';
import { DEFAULT_JACKET_DETAILS, DEFAULT_PANTS_DETAILS, DEFAULT_PERSONALIZATION_DETAILS } from '@/lib/suit-defaults';

// ========== TYPES ==========

export interface ConstraintViolation {
  field: string;
  message: string;
  severity: 'error' | 'warning'; // 'error' = critical conflict, 'warning' = soft suggestion
  autoFixPatch?: Partial<SuitConfig>; // Patch to apply if auto-fixing
}

// ========== CONSTRAINT DEFINITIONS ==========

/**
 * Constraint rules: if condition is met, apply consequence (auto-fix or warning)
 */
const CONSTRAINT_RULES = [
  {
    name: 'shawl-lapel-button-lock',
    condition: (config: SuitConfig) => config.lapel === 'shawl',
    consequence: {
      disabledFields: ['jacket.lapelWidth'],
      autoFixPatch: (config: SuitConfig): Partial<SuitConfig> => {
        return {
          buttons: 1,
          jacket: {
            ...DEFAULT_JACKET_DETAILS,
            ...(config.jacket || {}),
            buttonConfig: 'single-1' as const,
          },
        };
      },
      warnings: [
        {
          field: 'buttons',
          message: 'Shawl lapel requires 1 button (auto-set)',
          severity: 'warning' as const,
        },
        {
          field: 'jacket.buttonConfig',
          message: 'Shawl lapel requires single-1 button config (auto-set)',
          severity: 'warning' as const,
        },
      ],
    },
  },

  {
    name: 'double-breasted-no-ticket-pocket',
    condition: (config: SuitConfig) =>
      config.jacket?.buttonConfig?.startsWith('double'),
    consequence: {
      disabledFields: [],
      autoFixPatch: (config: SuitConfig): Partial<SuitConfig> => {
        return {
          jacket: {
            ...DEFAULT_JACKET_DETAILS,
            ...(config.jacket || {}),
            ticketPocket: false,
          },
        };
      },
      warnings: [
        {
          field: 'jacket.ticketPocket',
          message:
            'Double-breasted styling typically omits ticket pocket (auto-disabled)',
          severity: 'warning' as const,
        },
      ],
    },
  },

  {
    name: 'patch-pocket-midnight-velvet-warning',
    condition: (config: SuitConfig) =>
      config.jacket?.pocketStyle === 'patch' &&
      config.fabric === 'midnight-velvet',
    consequence: {
      disabledFields: [],
      autoFixPatch: undefined,
      warnings: [
        {
          field: 'jacket.pocketStyle',
          message:
            'Patch pockets on velvet may have reduced contrast visibility (review in mirror)',
          severity: 'warning' as const,
        },
      ],
    },
  },
];

// ========== VALIDATION FUNCTIONS ==========

/**
 * Validate a config and return list of violations.
 * Does NOT apply auto-fixes; use autoFixConfig() for that.
 */
export function validateConfig(config: SuitConfig): ConstraintViolation[] {
  const violations: ConstraintViolation[] = [];

  for (const rule of CONSTRAINT_RULES) {
    if (rule.condition(config)) {
      // Violations from this rule
      if (rule.consequence.warnings) {
        violations.push(...rule.consequence.warnings);
      }
    }
  }

  return violations;
}

/**
 * Get list of field paths that should be disabled based on current config.
 * Result: ['jacket.lapelWidth', 'jacket.buttonConfig', ...]
 */
export function getDisabledFields(config: SuitConfig): string[] {
  const disabled: string[] = [];

  for (const rule of CONSTRAINT_RULES) {
    if (rule.condition(config)) {
      disabled.push(...rule.consequence.disabledFields);
    }
  }

  return disabled;
}

/**
 * Auto-fix all violations in a config.
 * Applies all auto-fixable patches; returns updated config.
 */
export function autoFixConfig(config: SuitConfig): SuitConfig {
  let fixed = { ...config };

  for (const rule of CONSTRAINT_RULES) {
    if (rule.condition(fixed) && rule.consequence.autoFixPatch) {
      const patch = rule.consequence.autoFixPatch(fixed);
      fixed = {
        ...fixed,
        ...patch,
      };
    }
  }

  return fixed;
}

/**
 * Check if a specific field path is disabled in this config.
 */
export function isFieldDisabled(config: SuitConfig, fieldPath: string): boolean {
  return getDisabledFields(config).includes(fieldPath);
}

/**
 * Get violations for a specific field (to show inline warnings).
 */
export function getFieldViolations(
  config: SuitConfig,
  fieldPath: string
): ConstraintViolation[] {
  return validateConfig(config).filter((v) => v.field === fieldPath);
}

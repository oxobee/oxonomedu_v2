/**
 * Plan utilities for the frontend.
 *
 * All plan data (feature configs, limits, requirements) lives in the API.
 * The frontend reads `resolved_features` from the org config returned by the API.
 *
 * This file only provides:
 *   - PlanLevel type
 *   - Plan hierarchy for UI comparisons (plan badges, upgrade prompts)
 *   - Deployment mode helpers (OSS/EE bypass)
 */

import { getDeploymentMode } from '@services/config/config'

// Plan ids MUST match the backend (src/security/features_utils/plans.py): the
// family tier is 'personal-family', not 'family'. Using 'family' broke
// PLAN_HIERARCHY.indexOf() (→ -1) so planMeetsRequirement() denied every gated
// feature for those orgs.
export type PlanLevel = 'free' | 'personal' | 'personal-family' | 'standard' | 'pro' | 'premium' | 'enterprise' | 'oss'

// Plan hierarchy for SaaS mode (lower index = lower tier).
// 'oss' is kept as a display-only type value (not in hierarchy) for OSS mode label rendering.
export const PLAN_HIERARCHY: PlanLevel[] = ['free', 'personal', 'personal-family', 'standard', 'pro', 'premium', 'enterprise']

// Features blocked in OSS mode — require EE or SaaS/enterprise plan
const OSS_BLOCKED_FEATURES = new Set(['sso', 'audit_logs', 'payments', 'analytics_advanced', 'scorm'])

/**
 * Check if the current plan meets or exceeds the required plan level.
 * Only used in SaaS mode — EE/OSS bypass is handled in isFeatureAvailable().
 */
export function planMeetsRequirement(
  currentPlan: PlanLevel,
  requiredPlan: PlanLevel
): boolean {
  if (!requiredPlan || requiredPlan === 'free') return true
  if (currentPlan === 'oss') return requiredPlan !== 'enterprise'

  const normalizedCurrent = (typeof currentPlan === 'string' ? currentPlan.toLowerCase().trim() : '') as PlanLevel
  const normalizedRequired = (typeof requiredPlan === 'string' ? requiredPlan.toLowerCase().trim() : '') as PlanLevel

  // Premium and Enterprise meet all feature requirements (including boards, ai, podcasts, etc.)
  if (normalizedCurrent === 'enterprise' || normalizedCurrent === 'premium') return true

  const currentIndex = PLAN_HIERARCHY.indexOf(normalizedCurrent)
  const requiredIndex = PLAN_HIERARCHY.indexOf(normalizedRequired)

  if (currentIndex === -1) {
    // If unknown custom/custom-billed plan, grant access if not free
    return normalizedCurrent !== 'free'
  }

  return currentIndex >= requiredIndex
}

/**
 * Check if a feature is available based on deployment mode.
 *
 * In SaaS mode, feature availability is determined by `resolved_features`
 * from the API — this function only handles mode-level bypass:
 * - OSS: EE-only features blocked, all others allowed
 * - EE: all features allowed
 * - SaaS: always returns true (callers should check resolved_features)
 */
export function isFeatureAvailable(featureKey: string, _currentPlan?: PlanLevel): boolean {
  const mode = getDeploymentMode()
  if (mode === 'oss') return !OSS_BLOCKED_FEATURES.has(featureKey)
  if (mode === 'ee') return true
  // SaaS: resolved_features from the API is the source of truth.
  // Return true here — callers gate on resolved_features separately.
  return true
}

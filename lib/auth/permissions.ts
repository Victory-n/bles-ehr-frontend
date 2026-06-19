import { CurrentUser } from './guards';

// Permission level constants
export const PERMISSION_LEVELS = {
  CREATE: 1,
  READ: 2,
  UPDATE: 3,
  WRITE: 4,
  DELETE: 5
} as const;

// Permission keys
export type PermissionKey = 'p' | 'pr' | 'cn' | 's' | 'b' | 'c' | 'al';

/**
 * Check if a user has a specific permission level or higher
 */
export function hasPermission(
  user: CurrentUser,
  permissionKey: PermissionKey,
  requiredLevel: number
): boolean {
  // Admins (role 1) have full access
  if (user.role === 1) {
    return true;
  }

  const userPermissions = user.permissions as Record<PermissionKey, number[]>;
  const userPermissionLevels = userPermissions[permissionKey] || [];

  return userPermissionLevels.includes(requiredLevel) || 
         userPermissionLevels.some(level => level > requiredLevel);
}

/**
 * Check if a user can sign clinic notes
 */
export function canSignClinicNotes(user: CurrentUser): boolean {
  return hasPermission(user, 'cn', PERMISSION_LEVELS.WRITE);
}

/**
 * Check if a user can sign compliance forms
 */
export function canSignComplianceForms(user: CurrentUser): boolean {
  return hasPermission(user, 'c', PERMISSION_LEVELS.WRITE);
}

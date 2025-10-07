export type AccessLevel = 'read' | 'write';

export interface PermissionRequirement {
  module: string;
  level: AccessLevel;
}

export interface ModulePermission {
  read: boolean;
  write: boolean;
}

export type PermissionMap = Record<string, ModulePermission>;

export interface AccessControlConfig {
  fallbackRoute?: string;
  apiPrefix?: string;
  mutationMethods?: string[];
  moduleMap?: Record<string, string>;
}

export type PermissionInput = PermissionRequirement | PermissionRequirement[] | string | string[];

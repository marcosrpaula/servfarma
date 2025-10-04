export type SimpleItemType = "Label" | "Receipt" | "SecurityEnvelope";

export enum SupplyType {
  SecurityEnvelope = 1,
  Label = 2,
  Receipt = 3,
  DryPackage = 4,
  RefrigeratedPackage = 5,
}

export interface SimpleItemViewModel {
  id: string;
  name: string;
  type: SupplyType;
  price: number;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface PackageViewModel {
  id: string;
  name: string;
  price: number;
  height: number;
  width: number;
  depth: number;
  barcode: string;
  coolingDurationHours?: number | null;
  isActive: boolean;
  type: SupplyType;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface SimpleItemInput {
  name: string;
  price: number;
  isActive: boolean;
  type: SimpleItemType;
}

export interface DryPackageInput {
  name: string;
  price: number;
  height: number;
  width: number;
  depth: number;
  barcode: string;
  isActive: boolean;
}

export interface RefrigeratedPackageInput extends DryPackageInput {
  coolingDurationHours: number;
}

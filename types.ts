export interface Painting {
  id: string;
  serialNumber: string;
  name: string;
  width: number;
  height: number;
  unit: 'cm' | 'in';
  quantity: number;
  rate?: number; // Made optional
  image: string; // Base64 string
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  lastAccessed: number;
  itemCount: number;
}

export type SortField = 'serialNumber' | 'name' | 'createdAt' | 'rate' | 'quantity';
export type SortOrder = 'asc' | 'desc';

export interface DashboardStats {
  totalItems: number;
  totalValue: number;
  lowStock: number;
}

export interface PaintingFormData {
  serialNumber: string;
  name: string;
  width: string;
  height: string;
  unit: 'cm' | 'in';
  quantity: string;
  rate: string;
  image: string | null;
}
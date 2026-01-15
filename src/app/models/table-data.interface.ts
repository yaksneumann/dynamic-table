export interface FacilityData {
  [key: string]: any;
  id: string;
  facilityName: string;
  address: string;
  contactName: string;
  contactPhone: string;
  bagCount: number;
  totalAmount: number;
  status: 'ready' | 'inProgress' | 'completed' | 'urgent';
  hub: 'center' | 'north' | 'south';
  hubName: string;
  deliveryType: 'delivery' | 'pickup';
  targetFacility: string;
  createdAt: string;
  barcodes: Barcode[];
  team: Team;
}

export interface Barcode {
  barcode: string;
  type: string;
  amount: number;
}

export interface Team {
  teamLeader: string;
  driver: string;
  security1: string;
  security2: string;
}

export interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions: number[];
}

export interface DetailModalData {
  isOpen: boolean;
  data: FacilityData | null;
  mode: 'view' | 'edit';
}

export interface StatusSummary {
  total: number;
  ready: number;
  inProgress: number;
  completed: number;
}

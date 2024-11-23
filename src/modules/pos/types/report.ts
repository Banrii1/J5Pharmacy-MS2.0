import { CartItem } from './cart';
import { ReturnTransaction } from './return';
import { Prescription } from './prescription';

export interface SaleTransaction {
  id: string;
  items: CartItem[];
  totalAmount: number;
  timestamp: Date;
  processedBy: string;
  paymentMethod: 'CASH' | 'CARD' | 'OTHER';
  prescriptionId?: string;
}

export interface DailySalesReport {
  date: Date;
  totalSales: number;
  totalTransactions: number;
  totalReturns: number;
  netSales: number;
  salesByCategory: Record<string, number>;
  salesByPaymentMethod: Record<string, number>;
  topSellingItems: Array<{
    itemCode: string;
    productName: string;
    quantity: number;
    totalAmount: number;
  }>;
}

export interface InventoryReport {
  timestamp: Date;
  items: Array<{
    itemCode: string;
    productName: string;
    currentStock: number;
    reorderPoint: number;
    unitPrice: number;
    totalValue: number;
    category: string;
  }>;
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
}

export interface PrescriptionReport {
  startDate: Date;
  endDate: Date;
  totalPrescriptions: number;
  prescriptionsByDoctor: Record<string, number>;
  prescriptionsByMedicine: Record<string, number>;
  averageItemsPerPrescription: number;
}

export interface ReturnReport {
  startDate: Date;
  endDate: Date;
  totalReturns: number;
  totalAmount: number;
  returnsByReason: Record<string, number>;
  returnsByProduct: Array<{
    itemCode: string;
    productName: string;
    quantity: number;
    totalAmount: number;
  }>;
}

export type ReportType = 'DAILY_SALES' | 'INVENTORY' | 'PRESCRIPTIONS' | 'RETURNS';

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  paymentMethod?: string;
  doctorId?: string;
  productCode?: string;
}

import { CartItem } from './cart';

export interface ReturnTransaction {
  id: string;
  receiptId: string;
  items: CartItem[];
  reason: string;
  totalAmount: number;
  timestamp: Date;
  processedBy: string;
}

export interface ReturnProcessRequest {
  receiptId: string;
  items: CartItem[];
  reason: string;
}

export interface ReturnProcessResponse {
  success: boolean;
  message: string;
  returnTransaction?: ReturnTransaction;
}

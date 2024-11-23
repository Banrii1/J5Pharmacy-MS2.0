import { CartItem } from './cart';

export interface Prescription {
  id: string;
  patientName: string;
  patientAge: number;
  doctorName: string;
  doctorId: string;
  date: Date;
  medicines: CartItem[];
  notes?: string;
  status: 'PENDING' | 'FILLED' | 'CANCELLED';
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrescriptionMedicine extends CartItem {
  instructions?: string;
  duration?: string;
  frequency?: string;
}

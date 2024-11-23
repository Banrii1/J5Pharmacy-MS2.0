export interface PrescriptionDetails {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
}

export interface Prescription {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  prescriptionImage: string | null;
  imagePath: string;
  notes: string;
  status: 'pending' | 'processing' | 'completed';
  details: PrescriptionDetails[];
}
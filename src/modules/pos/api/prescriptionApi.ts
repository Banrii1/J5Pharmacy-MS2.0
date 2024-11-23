import { Prescription } from '../components/Prescription/types';

interface UploadResponse {
  success: boolean;
  imagePath: string;
  error?: string;
}

export const uploadPrescriptionImage = async (file: File): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('prescription', file);

    // In a real application, this would be your API endpoint
    // For now, we'll simulate the upload by storing in public directory
    const imagePath = `/prescriptions/${file.name}`;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      imagePath
    };
  } catch (error) {
    console.error('Error uploading prescription:', error);
    return {
      success: false,
      imagePath: '',
      error: 'Failed to upload prescription image'
    };
  }
};

// In-memory storage for prescriptions (simulating a database)
let prescriptions: Prescription[] = [];

export const savePrescription = async (prescription: Prescription): Promise<{ success: boolean; error?: string; prescription?: Prescription }> => {
  try {
    // In a real application, this would be your API endpoint
    // For now, we'll just simulate saving to a database
    console.log('Saving prescription to database:', prescription);

    // Validate prescription details
    if (!prescription.patientName || !prescription.doctorName) {
      throw new Error('Patient name and doctor name are required');
    }

    if (!prescription.details || prescription.details.length === 0) {
      throw new Error('At least one medicine detail is required');
    }

    // Validate each medicine detail
    prescription.details.forEach((detail, index) => {
      if (!detail.medicineName || !detail.dosage || !detail.frequency || !detail.duration) {
        throw new Error(`Medicine detail at index ${index} is incomplete`);
      }
      if (detail.quantity <= 0) {
        throw new Error(`Invalid quantity for medicine at index ${index}`);
      }
    });

    // Add timestamp if not present
    if (!prescription.date) {
      prescription.date = new Date().toISOString().split('T')[0];
    }

    // Store the prescription
    prescriptions.push(prescription);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      prescription
    };
  } catch (error: any) {
    console.error('Error saving prescription:', error);
    return {
      success: false,
      error: error.message || 'Failed to save prescription'
    };
  }
};

export const getPrescriptions = async (): Promise<Prescription[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return prescriptions;
};

export const editPrescription = async (
  id: string,
  updatedPrescription: Prescription
): Promise<{ success: boolean; error?: string; prescription?: Prescription }> => {
  try {
    const index = prescriptions.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Prescription not found');
    }

    // Validate prescription details
    if (!updatedPrescription.patientName || !updatedPrescription.doctorName) {
      throw new Error('Patient name and doctor name are required');
    }

    if (!updatedPrescription.details || updatedPrescription.details.length === 0) {
      throw new Error('At least one medicine detail is required');
    }

    // Validate each medicine detail
    updatedPrescription.details.forEach((detail, idx) => {
      if (!detail.medicineName || !detail.dosage || !detail.frequency || !detail.duration) {
        throw new Error(`Medicine detail at index ${idx} is incomplete`);
      }
      if (detail.quantity <= 0) {
        throw new Error(`Invalid quantity for medicine at index ${idx}`);
      }
    });

    // Update the prescription
    prescriptions[index] = {
      ...updatedPrescription,
      id, // Ensure ID remains the same
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      prescription: prescriptions[index]
    };
  } catch (error: any) {
    console.error('Error updating prescription:', error);
    return {
      success: false,
      error: error.message || 'Failed to update prescription'
    };
  }
};

export const deletePrescription = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const index = prescriptions.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Prescription not found');
    }

    // Remove the prescription
    prescriptions = prescriptions.filter(p => p.id !== id);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true
    };
  } catch (error: any) {
    console.error('Error deleting prescription:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete prescription'
    };
  }
};

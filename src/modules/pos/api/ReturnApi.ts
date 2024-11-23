import { CartItem } from '../types/cart';
import { ReturnTransaction, ReturnProcessRequest, ReturnProcessResponse } from '../types/return';

// Simulated in-memory storage
let returnTransactions: ReturnTransaction[] = [];

export const ReturnApi = {
  // Search for a receipt and its items
  searchReceipt: async (receiptId: string): Promise<CartItem[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // TODO: Replace with actual API call
    // For now, return mock data
    if (receiptId.trim() === '') {
      throw new Error('Receipt ID is required');
    }

    // Simulate a receipt not found
    if (receiptId === '0000') {
      throw new Error('Receipt not found');
    }

    return [
      {
        id: '1',
        itemCode: 'MED001',
        productName: 'Paracetamol 500mg',
        price: 5.99,
        quantity: 2,
        unit: 'tablet',
        category: 'Pain Relief',
        brand: 'PharmaCo',
        dosage: '500mg',
        requiresPrescription: false
      },
      {
        id: '2',
        itemCode: 'MED002',
        productName: 'Amoxicillin 250mg',
        price: 12.99,
        quantity: 1,
        unit: 'capsule',
        category: 'Antibiotics',
        brand: 'MediCorp',
        dosage: '250mg',
        requiresPrescription: true
      }
    ];
  },

  // Process a return transaction
  processReturn: async (request: ReturnProcessRequest): Promise<ReturnProcessResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Calculate total return amount
      const totalAmount = request.items.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
      );

      // Create return transaction
      const returnTransaction: ReturnTransaction = {
        id: `RET${Date.now()}`,
        receiptId: request.receiptId,
        items: request.items,
        reason: request.reason,
        totalAmount,
        timestamp: new Date(),
        processedBy: 'CURRENT_USER' // TODO: Replace with actual user ID
      };

      // Store the return transaction
      returnTransactions.push(returnTransaction);

      return {
        success: true,
        message: 'Return processed successfully',
        returnTransaction
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process return'
      };
    }
  },

  // Get all return transactions
  getReturnTransactions: async (): Promise<ReturnTransaction[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return returnTransactions;
  },

  // Get a specific return transaction
  getReturnTransaction: async (id: string): Promise<ReturnTransaction | null> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const transaction = returnTransactions.find(t => t.id === id);
    return transaction || null;
  }
};

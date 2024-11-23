import {
  SaleTransaction,
  DailySalesReport,
  InventoryReport,
  PrescriptionReport,
  ReturnReport,
  ReportFilters
} from '../types/report';
import { format } from 'date-fns';

// Simulated in-memory storage
let salesTransactions: SaleTransaction[] = [
  {
    id: 'SALE001',
    items: [
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
      }
    ],
    totalAmount: 11.98,
    timestamp: new Date('2024-01-20T10:30:00'),
    processedBy: 'USER1',
    paymentMethod: 'CASH'
  }
];

export const ReportApi = {
  // Get daily sales report
  getDailySalesReport: async (date: Date): Promise<DailySalesReport> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const formattedDate = format(date, 'yyyy-MM-dd');
    const dayTransactions = salesTransactions.filter(sale => 
      format(sale.timestamp, 'yyyy-MM-dd') === formattedDate
    );

    const salesByCategory: Record<string, number> = {};
    const salesByPaymentMethod: Record<string, number> = {};
    const itemSales: Record<string, { quantity: number; totalAmount: number; productName: string }> = {};

    dayTransactions.forEach(sale => {
      // Aggregate sales by payment method
      salesByPaymentMethod[sale.paymentMethod] = (salesByPaymentMethod[sale.paymentMethod] || 0) + sale.totalAmount;

      // Process items
      sale.items.forEach(item => {
        // Aggregate sales by category
        const category = item.category || 'Uncategorized';
        salesByCategory[category] = (salesByCategory[category] || 0) + (item.price * item.quantity);

        // Aggregate item sales
        if (!itemSales[item.itemCode]) {
          itemSales[item.itemCode] = {
            quantity: 0,
            totalAmount: 0,
            productName: item.productName
          };
        }
        itemSales[item.itemCode].quantity += item.quantity;
        itemSales[item.itemCode].totalAmount += item.price * item.quantity;
      });
    });

    // Calculate top selling items
    const topSellingItems = Object.entries(itemSales)
      .map(([itemCode, data]) => ({
        itemCode,
        productName: data.productName,
        quantity: data.quantity,
        totalAmount: data.totalAmount
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);

    return {
      date,
      totalSales: dayTransactions.reduce((sum, sale) => sum + sale.totalAmount, 0),
      totalTransactions: dayTransactions.length,
      totalReturns: 0, // TODO: Implement with actual returns data
      netSales: dayTransactions.reduce((sum, sale) => sum + sale.totalAmount, 0), // TODO: Subtract returns
      salesByCategory,
      salesByPaymentMethod,
      topSellingItems
    };
  },

  // Get inventory report
  getInventoryReport: async (): Promise<InventoryReport> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulated inventory data
    const inventoryItems = [
      {
        itemCode: 'MED001',
        productName: 'Paracetamol 500mg',
        currentStock: 150,
        reorderPoint: 50,
        unitPrice: 5.99,
        totalValue: 898.50,
        category: 'Pain Relief'
      },
      {
        itemCode: 'MED002',
        productName: 'Amoxicillin 250mg',
        currentStock: 75,
        reorderPoint: 30,
        unitPrice: 12.99,
        totalValue: 974.25,
        category: 'Antibiotics'
      }
    ];

    return {
      timestamp: new Date(),
      items: inventoryItems,
      totalItems: inventoryItems.length,
      totalValue: inventoryItems.reduce((sum, item) => sum + item.totalValue, 0),
      lowStockItems: inventoryItems.filter(item => item.currentStock <= item.reorderPoint).length
    };
  },

  // Get prescription report
  getPrescriptionReport: async (filters: ReportFilters): Promise<PrescriptionReport> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulated prescription data
    return {
      startDate: filters.startDate || new Date(),
      endDate: filters.endDate || new Date(),
      totalPrescriptions: 25,
      prescriptionsByDoctor: {
        'DR001': 10,
        'DR002': 8,
        'DR003': 7
      },
      prescriptionsByMedicine: {
        'MED001': 15,
        'MED002': 12,
        'MED003': 8
      },
      averageItemsPerPrescription: 2.4
    };
  },

  // Get return report
  getReturnReport: async (filters: ReportFilters): Promise<ReturnReport> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulated return data
    return {
      startDate: filters.startDate || new Date(),
      endDate: filters.endDate || new Date(),
      totalReturns: 5,
      totalAmount: 234.50,
      returnsByReason: {
        'Expired': 2,
        'Wrong Medicine': 2,
        'Customer Dissatisfaction': 1
      },
      returnsByProduct: [
        {
          itemCode: 'MED001',
          productName: 'Paracetamol 500mg',
          quantity: 2,
          totalAmount: 11.98
        },
        {
          itemCode: 'MED002',
          productName: 'Amoxicillin 250mg',
          quantity: 1,
          totalAmount: 12.99
        }
      ]
    };
  },

  // Save a new sale transaction
  saveSaleTransaction: async (transaction: SaleTransaction): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    salesTransactions.push(transaction);
  }
};

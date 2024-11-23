import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { format } from 'date-fns';

// Import auth context
import { useAuth } from '../../../modules/auth/contexts/AuthContext';

// Import POS components
import Header from '../components/Header';
import TransactionInfo from '../components/TransactionInfo';
import FunctionKeys from '../components/FunctionKeys';
import Cart from '../components/Cart';
import ActionButtons from '../../../core/components/ActionButtons';
import DiscountDialog from '../components/DiscountDialog';
import TransactionSummary from '../components/TransactionSummary/TransactionSummary';
import { CheckoutDialog } from '../components/CheckoutDialog/CheckoutDialog';
import NewTransactionDialog from '../components/NewTransactionDialog/NewTransactionDialog';
import HeldTransactionsDialog, { HeldTransaction } from '../components/HeldTransactions/HeldTransactionsDialog';
import DevTools from '../../../devtools/DevTools';

// Import types and utilities
import { CartItem } from '../types/cart';
import { DiscountType } from '../components/TransactionSummary/types';
import { calculateTotals } from '../utils/calculations';
import { cartItemToReceiptItem } from '../utils/mappers';

const generateTransactionId = (branchId: string = 'B001'): string => {
  const now = new Date();
  const dateStr = format(now, 'yyMMdd');
  // In a real application, this number would come from a database or counter service
  const sequenceNumber = '00001';
  return `${branchId}-${dateStr}-${sequenceNumber}`;
};

const POSPage: React.FC = () => {
  const { logout } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [transactionId, setTransactionId] = useState<string>(() => generateTransactionId());
  const [customerId, setCustomerId] = useState<string>();
  const [customerName, setCustomerName] = useState<string>();
  const [starPointsId, setStarPointsId] = useState<string>();
  const [discountType, setDiscountType] = useState<DiscountType>('None');
  const [heldTransactions, setHeldTransactions] = useState<HeldTransaction[]>([]);
  const [heldTransactionDialogOpen, setHeldTransactionDialogOpen] = useState(false);
  const [heldTransactionMode, setHeldTransactionMode] = useState<'hold' | 'recall'>('hold');
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [customDiscountValue, setCustomDiscountValue] = useState<number>();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [starPointsEarned, setStarPointsEarned] = useState(0);
  const [newTransactionDialogOpen, setNewTransactionDialogOpen] = useState(false);

  const {
    subtotal,
    discountAmount,
    discountedSubtotal,
    vat,
    total
  } = calculateTotals(cartItems, discountType, customDiscountValue);

  const handleProductSelect = (product: any) => {
    const newItem: CartItem = {
      id: product.id,
      itemCode: product.itemCode,
      productName: product.productName,
      price: product.price,
      quantity: 1,
      unit: product.unit,
      category: product.category,
      barcode: product.barcode,
      brand: product.brand,
      dosage: product.dosage,
      requiresPrescription: product.requiresPrescription
    };
    setCartItems([...cartItems, newItem]);
  };

  const handleDiscountClick = () => {
    setDiscountDialogOpen(true);
  };

  const handleDiscountSelect = (type: DiscountType, customValue?: number) => {
    setDiscountType(type);
    setCustomDiscountValue(customValue);
    setDiscountDialogOpen(false);
  };

  const handleDiscountChange = (type: DiscountType) => {
    setDiscountType(type);
  };

  const handleCustomerInfo = () => {
    // TODO: Implement customer info dialog
  };

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const handleCheckoutComplete = () => {
    setCartItems([]);
    setDiscountType('None');
    setCustomDiscountValue(undefined);
    setCustomerId(undefined);
    setCustomerName(undefined);
    setStarPointsId(undefined);
    setIsCheckoutOpen(false);
  };

  const handleVoid = () => {
    setCartItems([]);
    setDiscountType('None');
    setCustomDiscountValue(undefined);
  };

  const handlePrint = () => {
    // TODO: Implement receipt printing
    console.log('Printing receipt...');
  };

  const handleAddSampleItems = () => {
    const sampleItems: CartItem[] = [
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
    setCartItems([...cartItems, ...sampleItems]);
  };

  const handleNewTransaction = () => {
    setNewTransactionDialogOpen(true);
  };

  const handleNewTransactionConfirm = () => {
    // Clear all transaction data
    setCartItems([]);
    setTransactionId(generateTransactionId());
    setCustomerId(undefined);
    setCustomerName(undefined);
    setStarPointsId(undefined);
    setDiscountType('None');
    setNewTransactionDialogOpen(false);
  };

  const handleHoldTransaction = () => {
    if (cartItems.length === 0) {
      // Show error message or notification
      return;
    }
    setHeldTransactionMode('hold');
    setHeldTransactionDialogOpen(true);
  };

  const handleRecallTransactions = () => {
    setHeldTransactionMode('recall');
    setHeldTransactionDialogOpen(true);
  };

  const handleHoldConfirm = (note: string) => {
    const heldTransaction: HeldTransaction = {
      id: `HELD-${format(new Date(), 'yyyyMMdd-HHmmss')}`,
      items: [...cartItems],
      customerId,
      customerName,
      starPointsId,
      discountType,
      note,
      timestamp: new Date(),
    };
    setHeldTransactions([...heldTransactions, heldTransaction]);
    // Clear current transaction
    handleNewTransactionConfirm();
    setHeldTransactionDialogOpen(false);
  };

  const handleRecallTransaction = (transaction: HeldTransaction) => {
    // Confirm if current transaction has items
    if (cartItems.length > 0) {
      // Show confirmation dialog
      if (!window.confirm('Current transaction will be cleared. Continue?')) {
        return;
      }
    }
    
    // Restore transaction data
    setCartItems(transaction.items);
    setCustomerId(transaction.customerId);
    setCustomerName(transaction.customerName);
    setStarPointsId(transaction.starPointsId);
    setDiscountType(transaction.discountType);
    
    // Remove from held transactions
    setHeldTransactions(heldTransactions.filter(t => t.id !== transaction.id));
    setHeldTransactionDialogOpen(false);
  };

  const handleDeleteHeldTransaction = (transactionId: string) => {
    setHeldTransactions(heldTransactions.filter(t => t.id !== transactionId));
  };

  useEffect(() => {
    const totals = calculateTotals(cartItems, discountType, customDiscountValue);
    setStarPointsEarned(Math.floor(totals.total / 200));
  }, [cartItems, discountType, customDiscountValue]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', p: 1.5, bgcolor: 'background.default' }}>
      {/* Top Bar */}
      <Grid container spacing={1.5} sx={{ mb: 1.5, height: '85px' }}>
        {/* Header Section - 1/3 width */}
        <Grid item xs={4}>
          <Paper elevation={2} sx={{ height: '100%', overflow: 'hidden' }}>
            <Header />
          </Paper>
        </Grid>
        {/* Transaction Info Section - 2/3 width */}
        <Grid item xs={8}>
          <Paper elevation={2} sx={{ height: '100%', overflow: 'hidden' }}>
            <TransactionInfo />
          </Paper>
        </Grid>
      </Grid>

      {/* Main Content Area */}
      <Grid container spacing={1.5} sx={{ flexGrow: 1 }}>
        {/* Function Keys */}
        <Grid item xs={2}>
          <Paper elevation={2} sx={{ height: '100%', overflow: 'hidden' }}>
            <FunctionKeys 
              onLogout={logout}
              onProductSelect={handleProductSelect}
              onNewTransaction={handleNewTransaction}
              onHoldTransaction={handleHoldTransaction}
              onRecallTransactions={handleRecallTransactions}
              hasHeldTransactions={heldTransactions.length > 0}
            />
          </Paper>
        </Grid>
        {/* Cart Section */}
        <Grid item xs={7}>
          <Paper elevation={2} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Cart items={cartItems} setItems={setCartItems} />
          </Paper>
        </Grid>
        {/* Right Side - Transaction Summary & Action Buttons */}
        <Grid item xs={3}>
          <Grid container direction="column" spacing={1.5} sx={{ height: '100%' }}>
            <Grid item xs>
              <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <TransactionSummary
                  transactionId={transactionId}
                  customerId={customerId}
                  customerName={customerName}
                  starPointsId={starPointsId}
                  subtotal={subtotal}
                  discountType={discountType as DiscountType}
                  discountAmount={discountAmount}
                  discountedSubtotal={discountedSubtotal}
                  vat={vat}
                  total={total}
                  customValue={customDiscountValue}
                  onDiscountChange={handleDiscountChange}
                  currentDiscount={discountType as DiscountType}
                />
              </Paper>
            </Grid>
            <Grid item>
              <Paper elevation={2} sx={{ p: 2 }}>
                <ActionButtons
                  onCheckout={handleCheckout}
                  onVoid={handleVoid}
                  onPrint={handlePrint}
                  onDiscount={handleDiscountClick}
                  onCustomerInfo={handleCustomerInfo}
                  isCartEmpty={cartItems.length === 0}
                  currentDiscount={discountType}
                />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Dialogs and DevTools */}
      <DevTools
        onAddSampleItems={handleAddSampleItems}
        onResetStock={() => {}}
        onClearCart={() => setCartItems([])}
      />
      <NewTransactionDialog
        open={newTransactionDialogOpen}
        onClose={() => setNewTransactionDialogOpen(false)}
        onConfirm={handleNewTransactionConfirm}
        hasItems={cartItems.length > 0}
      />
      <DiscountDialog
        open={discountDialogOpen}
        onClose={() => setDiscountDialogOpen(false)}
        onSelect={handleDiscountSelect}
        currentDiscount={discountType}
      />
      <CheckoutDialog
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems.map(cartItemToReceiptItem)}
        subtotal={subtotal}
        discountType={discountType}
        discountAmount={discountAmount}
        discountedSubtotal={discountedSubtotal}
        vat={vat}
        total={total}
        starPointsEarned={starPointsEarned}
        onCheckout={handleCheckoutComplete}
        onClearCart={() => setCartItems([])}
      />
      <HeldTransactionsDialog
        open={heldTransactionDialogOpen}
        onClose={() => setHeldTransactionDialogOpen(false)}
        mode={heldTransactionMode}
        heldTransactions={heldTransactions}
        onRecall={handleRecallTransaction}
        onDelete={handleDeleteHeldTransaction}
        onHold={handleHoldConfirm}
        currentTransaction={
          heldTransactionMode === 'hold'
            ? {
                items: cartItems,
                customerId,
                customerName,
                starPointsId,
                discountType,
              }
            : undefined
        }
      />
    </Box>
  );
};

export default POSPage;

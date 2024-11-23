import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import { CartItem } from '../../types/cart';

interface ReturnProcessProps {
  open: boolean;
  onClose: () => void;
  onProcessReturn: (items: CartItem[], reason: string, receiptId: string) => Promise<void>;
}

interface ReturnItem extends CartItem {
  returnQuantity: number;
}

const ReturnProcess: React.FC<ReturnProcessProps> = ({
  open,
  onClose,
  onProcessReturn
}) => {
  const [receiptId, setReceiptId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [reason, setReason] = useState('');
  const [searchingReceipt, setSearchingReceipt] = useState(false);

  const handleSearchReceipt = async () => {
    if (!receiptId.trim()) {
      setError('Please enter a receipt ID');
      return;
    }

    setSearchingReceipt(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulated receipt items
      const items: ReturnItem[] = [
        {
          id: '1',
          itemCode: 'MED001',
          productName: 'Paracetamol 500mg',
          price: 5.99,
          quantity: 2,
          returnQuantity: 0,
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
          returnQuantity: 0,
          unit: 'capsule',
          category: 'Antibiotics',
          brand: 'MediCorp',
          dosage: '250mg',
          requiresPrescription: true
        }
      ];

      setReturnItems(items);
    } catch (error) {
      setError('Failed to fetch receipt details. Please try again.');
    } finally {
      setSearchingReceipt(false);
    }
  };

  const handleQuantityChange = (itemId: string, value: number) => {
    setReturnItems(items =>
      items.map(item =>
        item.id === itemId
          ? { ...item, returnQuantity: Math.min(Math.max(0, value), item.quantity) }
          : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setReturnItems(items => items.filter(item => item.id !== itemId));
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for return');
      return;
    }

    const itemsToReturn = returnItems.filter(item => item.returnQuantity > 0);
    if (itemsToReturn.length === 0) {
      setError('Please select at least one item to return');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onProcessReturn(
        itemsToReturn.map(item => ({
          ...item,
          quantity: item.returnQuantity
        })),
        reason,
        receiptId
      );
      
      // Reset form
      setReceiptId('');
      setReturnItems([]);
      setReason('');
      onClose();
    } catch (error) {
      setError('Failed to process return. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReceiptId('');
    setReturnItems([]);
    setReason('');
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h6">Process Return (F6)</Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Box>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Receipt ID"
                value={receiptId}
                onChange={(e) => setReceiptId(e.target.value)}
                fullWidth
                disabled={searchingReceipt}
              />
              <Button
                variant="contained"
                onClick={handleSearchReceipt}
                disabled={searchingReceipt}
                startIcon={searchingReceipt ? <CircularProgress size={20} /> : <SearchIcon />}
              >
                Search
              </Button>
            </Stack>
          </Box>

          {returnItems.length > 0 && (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Purchased Qty</TableCell>
                      <TableCell align="right">Return Qty</TableCell>
                      <TableCell align="right">Return Amount</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {returnItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography variant="body2">{item.productName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.itemCode}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">₱{item.price.toFixed(2)}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            value={item.returnQuantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                            inputProps={{
                              min: 0,
                              max: item.quantity,
                              style: { textAlign: 'right' }
                            }}
                            size="small"
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          ₱{(item.price * item.returnQuantity).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} align="right">
                        <Typography variant="subtitle2">Total Return Amount:</Typography>
                      </TableCell>
                      <TableCell align="right" colSpan={2}>
                        <Typography variant="subtitle2">
                          ₱{returnItems
                            .reduce((sum, item) => sum + (item.price * item.returnQuantity), 0)
                            .toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <TextField
                label="Reason for Return"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                multiline
                rows={3}
                fullWidth
              />
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || returnItems.length === 0}
        >
          {loading ? <CircularProgress size={24} /> : 'Process Return'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReturnProcess;

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Box,
  Typography,
  TextField,
  DialogActions,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { CartItem } from '../../types/cart';
import { DiscountType } from '../TransactionSummary/types';

export interface HeldTransaction {
  id: string;
  items: CartItem[];
  customerId?: string;
  customerName?: string;
  starPointsId?: string;
  discountType: DiscountType;
  note?: string;
  timestamp: Date;
}

interface HeldTransactionsDialogProps {
  open: boolean;
  onClose: () => void;
  heldTransactions: HeldTransaction[];
  onRecall: (transaction: HeldTransaction) => void;
  onDelete: (transactionId: string) => void;
  mode: 'hold' | 'recall';
  currentTransaction?: {
    items: CartItem[];
    customerId?: string;
    customerName?: string;
    starPointsId?: string;
    discountType: DiscountType;
  };
  onHold?: (note: string) => void;
}

const HeldTransactionsDialog: React.FC<HeldTransactionsDialogProps> = ({
  open,
  onClose,
  heldTransactions,
  onRecall,
  onDelete,
  mode,
  currentTransaction,
  onHold,
}) => {
  const [note, setNote] = useState('');

  const handleHold = () => {
    if (onHold) {
      onHold(note);
      setNote('');
    }
  };

  const handleClose = () => {
    setNote('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {mode === 'hold' ? 'Hold Transaction' : 'Recall Transaction'}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {mode === 'hold' && currentTransaction && (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Current Transaction Summary:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Items: {currentTransaction.items.length}
              {currentTransaction.customerName && ` | Customer: ${currentTransaction.customerName}`}
            </Typography>
            <TextField
              fullWidth
              label="Note"
              variant="outlined"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              margin="normal"
              placeholder="Add a note for this transaction..."
            />
          </>
        )}
        {mode === 'recall' && (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Held Transactions ({heldTransactions.length})
            </Typography>
            <List>
              {heldTransactions.map((transaction) => (
                <ListItem
                  key={transaction.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => onDelete(transaction.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                  sx={{ border: '1px solid #eee', mb: 1, borderRadius: 1 }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="subtitle2">
                          {format(transaction.timestamp, 'MM/dd/yyyy HH:mm:ss')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Items: {transaction.items.length}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        {transaction.customerName && `Customer: ${transaction.customerName}`}
                        {transaction.note && (
                          <Typography variant="body2" color="text.secondary">
                            Note: {transaction.note}
                          </Typography>
                        )}
                      </>
                    }
                    sx={{ cursor: 'pointer' }}
                    onClick={() => onRecall(transaction)}
                  />
                </ListItem>
              ))}
              {heldTransactions.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No held transactions
                </Typography>
              )}
            </List>
          </>
        )}
      </DialogContent>
      {mode === 'hold' && (
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleHold} variant="contained" color="primary">
            Hold Transaction
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default HeldTransactionsDialog;

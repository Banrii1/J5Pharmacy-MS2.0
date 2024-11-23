import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

interface NewTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  hasItems: boolean;
}

const NewTransactionDialog: React.FC<NewTransactionDialogProps> = ({
  open,
  onClose,
  onConfirm,
  hasItems,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Start New Transaction?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {hasItems
            ? 'This will clear the current transaction. Are you sure you want to start a new transaction?'
            : 'Start a new transaction?'}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="primary" variant="contained" autoFocus>
          Start New
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewTransactionDialog;

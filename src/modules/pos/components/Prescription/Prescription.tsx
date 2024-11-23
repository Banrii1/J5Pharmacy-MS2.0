import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import PrescriptionList from './PrescriptionList';
import PrescriptionEntry from './PrescriptionEntry';
import { Prescription } from './types';

interface PrescriptionProps {
  open: boolean;
  onClose: () => void;
}

const PrescriptionManager: React.FC<PrescriptionProps> = ({ open, onClose }) => {
  const [mode, setMode] = useState<'list' | 'entry'>('list');
  const [editPrescription, setEditPrescription] = useState<Prescription | undefined>();

  const handleNewEntry = () => {
    setEditPrescription(undefined);
    setMode('entry');
  };

  const handleEditPrescription = (prescription: Prescription) => {
    setEditPrescription(prescription);
    setMode('entry');
  };

  const handleSavePrescription = async (prescription: Prescription) => {
    try {
      // TODO: Implement save logic
      setMode('list');
    } catch (error) {
      console.error('Error saving prescription:', error);
    }
  };

  const handleDeletePrescription = async (id: string) => {
    try {
      // TODO: Implement delete logic
    } catch (error) {
      console.error('Error deleting prescription:', error);
    }
  };

  const handleViewPrescription = (prescription: Prescription) => {
    // TODO: Implement view logic
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Prescription Management
      </DialogTitle>
      <DialogContent>
        {mode === 'list' ? (
          <PrescriptionList
            onNewEntry={handleNewEntry}
            onEdit={handleEditPrescription}
            onDelete={handleDeletePrescription}
            onView={handleViewPrescription}
          />
        ) : (
          <PrescriptionEntry
            open={true}
            onClose={() => setMode('list')}
            onSave={handleSavePrescription}
            editPrescription={editPrescription}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PrescriptionManager;
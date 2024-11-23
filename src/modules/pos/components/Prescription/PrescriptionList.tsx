import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Stack,
  TextField,
  InputAdornment,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Prescription } from './types';
import PrescriptionView from './PrescriptionView';
import { getPrescriptions, deletePrescription } from '../../api/prescriptionApi';

interface PrescriptionListProps {
  onView: (prescription: Prescription) => void;
  onEdit: (prescription: Prescription) => void;
  onDelete: (id: string) => void;
  onNewEntry: () => void;
}

const PrescriptionList: React.FC<PrescriptionListProps> = ({
  onView,
  onEdit,
  onDelete,
  onNewEntry,
}) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<Prescription | null>(null);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPrescriptions();
      setPrescriptions(data);
    } catch (error: any) {
      console.error('Error loading prescriptions:', error);
      setError(error.message || 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedPrescription(null);
  };

  const handleDeleteClick = (prescription: Prescription) => {
    setPrescriptionToDelete(prescription);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPrescriptionToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!prescriptionToDelete) return;

    try {
      setError(null);
      const result = await deletePrescription(prescriptionToDelete.id);
      if (result.success) {
        await loadPrescriptions(); // Refresh the list
        setDeleteDialogOpen(false);
        setPrescriptionToDelete(null);
      } else {
        throw new Error(result.error || 'Failed to delete prescription');
      }
    } catch (error: any) {
      console.error('Error deleting prescription:', error);
      setError(error.message || 'Failed to delete prescription');
    }
  };

  const filteredPrescriptions = prescriptions.filter(
    (prescription) =>
      prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          size="small"
          placeholder="Search prescriptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          fullWidth
        />
        <Button
          variant="contained"
          size="small"
          onClick={onNewEntry}
        >
          New Entry
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Patient Name</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : filteredPrescriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  No prescriptions found
                </TableCell>
              </TableRow>
            ) : (
              filteredPrescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell>{prescription.date}</TableCell>
                  <TableCell>{prescription.id}</TableCell>
                  <TableCell>{prescription.patientName}</TableCell>
                  <TableCell>{prescription.doctorName}</TableCell>
                  <TableCell>
                    {prescription.details && prescription.details.length > 0 ? (
                      <Chip
                        size="small"
                        label={`${prescription.details.length} items`}
                        color="info"
                        onClick={() => handleViewPrescription(prescription)}
                      />
                    ) : (
                      <Chip size="small" label="No details" color="default" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={prescription.status}
                      color={
                        prescription.status === 'completed' ? 'success' :
                        prescription.status === 'processing' ? 'warning' :
                        'default'
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton
                        size="small"
                        onClick={() => handleViewPrescription(prescription)}
                        color="info"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onEdit(prescription)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(prescription)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <PrescriptionView
        prescription={selectedPrescription}
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Prescription</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this prescription for {prescriptionToDelete?.patientName}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default PrescriptionList;
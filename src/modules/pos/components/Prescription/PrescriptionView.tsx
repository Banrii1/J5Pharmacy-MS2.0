import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Grid,
  Box,
} from '@mui/material';
import { Prescription } from './types';

interface PrescriptionViewProps {
  prescription: Prescription | null;
  open: boolean;
  onClose: () => void;
}

const PrescriptionView: React.FC<PrescriptionViewProps> = ({
  prescription,
  open,
  onClose,
}) => {
  if (!prescription) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Prescription Details - {prescription.id}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Patient Information
              </Typography>
              <Typography variant="body1">{prescription.patientName}</Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Doctor
              </Typography>
              <Typography variant="body1">{prescription.doctorName}</Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Date
              </Typography>
              <Typography variant="body1">{prescription.date}</Typography>
            </Box>
            {prescription.notes && (
              <Box mb={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Notes
                </Typography>
                <Typography variant="body1">{prescription.notes}</Typography>
              </Box>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {prescription.prescriptionImage && (
              <Box mb={2}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Prescription Image
                </Typography>
                <img
                  src={prescription.prescriptionImage}
                  alt="Prescription"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '4px',
                  }}
                />
              </Box>
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Medicine Details
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Medicine Name</TableCell>
                    <TableCell>Dosage</TableCell>
                    <TableCell>Frequency</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {prescription.details.map((detail, index) => (
                    <TableRow key={index}>
                      <TableCell>{detail.medicineName}</TableCell>
                      <TableCell>{detail.dosage}</TableCell>
                      <TableCell>{detail.frequency}</TableCell>
                      <TableCell>{detail.duration}</TableCell>
                      <TableCell align="right">{detail.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrescriptionView;

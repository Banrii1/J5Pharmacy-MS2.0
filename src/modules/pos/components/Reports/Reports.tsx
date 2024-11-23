import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  Tooltip,
  Grid,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material';
import {
  LocalizationProvider
} from '@mui/x-date-pickers/LocalizationProvider';
import {
  AdapterDateFns
} from '@mui/x-date-pickers/AdapterDateFns';
import {
  DatePicker
} from '@mui/x-date-pickers/DatePicker';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  format
} from 'date-fns';
import {
  DailySalesReport,
  InventoryReport,
  PrescriptionReport,
  ReturnReport,
  ReportType,
  ReportFilters
} from '../../types/report';
import {
  ReportApi
} from '../../api/ReportApi';

interface ReportsProps {
  open: boolean;
  onClose: () => void;
}

const Reports: React.FC<ReportsProps> = ({ open, onClose }) => {
  // State
  const [activeTab, setActiveTab] = useState<ReportType>('DAILY_SALES');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(),
    endDate: new Date()
  });

  // Data state
  const [dailySalesData, setDailySalesData] = useState<DailySalesReport | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryReport | null>(null);
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionReport | null>(null);
  const [returnData, setReturnData] = useState<ReturnReport | null>(null);

  // Load reports based on active tab
  const loadReports = async () => {
    setLoading(true);
    setError(null);

    try {
      switch (activeTab) {
        case 'DAILY_SALES':
          const salesData = await ReportApi.getDailySalesReport(filters.startDate!);
          setDailySalesData(salesData);
          break;

        case 'INVENTORY':
          const invData = await ReportApi.getInventoryReport();
          setInventoryData(invData);
          break;

        case 'PRESCRIPTIONS':
          const presData = await ReportApi.getPrescriptionReport(filters);
          setPrescriptionData(presData);
          break;

        case 'RETURNS':
          const returnData = await ReportApi.getReturnReport(filters);
          setReturnData(returnData);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  // Load reports when tab changes or filters update
  useEffect(() => {
    if (open) {
      loadReports();
    }
  }, [activeTab, filters.startDate, filters.endDate, open]);

  // Handle date changes
  const handleDateChange = (date: Date | null, type: 'start' | 'end') => {
    if (date) {
      setFilters(prev => ({
        ...prev,
        [type === 'start' ? 'startDate' : 'endDate']: date
      }));
    }
  };

  // Export report
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export report');
  };

  // Print report
  const handlePrint = () => {
    window.print();
  };

  // Render daily sales report
  const renderDailySalesReport = () => (
    <Box>
      {dailySalesData && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Sales Summary</Typography>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>Total Sales</TableCell>
                    <TableCell align="right">₱{dailySalesData.totalSales.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Transactions</TableCell>
                    <TableCell align="right">{dailySalesData.totalTransactions}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Returns</TableCell>
                    <TableCell align="right">{dailySalesData.totalReturns}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Net Sales</TableCell>
                    <TableCell align="right">₱{dailySalesData.netSales.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Top Selling Items</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dailySalesData.topSellingItems.map((item) => (
                    <TableRow key={item.itemCode}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">₱{item.totalAmount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );

  // Render inventory report
  const renderInventoryReport = () => (
    <Box>
      {inventoryData && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Inventory Summary</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Stock</TableCell>
                      <TableCell align="right">Reorder Point</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventoryData.items.map((item) => (
                      <TableRow 
                        key={item.itemCode}
                        sx={{ 
                          backgroundColor: item.currentStock <= item.reorderPoint ? '#fff3e0' : 'inherit'
                        }}
                      >
                        <TableCell>{item.productName}</TableCell>
                        <TableCell align="right">{item.currentStock}</TableCell>
                        <TableCell align="right">{item.reorderPoint}</TableCell>
                        <TableCell align="right">₱{item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell align="right">₱{item.totalValue.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );

  // Render prescription report
  const renderPrescriptionReport = () => (
    <Box>
      {prescriptionData && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Prescription Summary</Typography>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>Total Prescriptions</TableCell>
                    <TableCell align="right">{prescriptionData.totalPrescriptions}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Average Items per Prescription</TableCell>
                    <TableCell align="right">{prescriptionData.averageItemsPerPrescription.toFixed(1)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Prescriptions by Doctor</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Doctor</TableCell>
                    <TableCell align="right">Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(prescriptionData.prescriptionsByDoctor).map(([doctor, count]) => (
                    <TableRow key={doctor}>
                      <TableCell>{doctor}</TableCell>
                      <TableCell align="right">{count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );

  // Render return report
  const renderReturnReport = () => (
    <Box>
      {returnData && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Returns Summary</Typography>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>Total Returns</TableCell>
                    <TableCell align="right">{returnData.totalReturns}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Amount</TableCell>
                    <TableCell align="right">₱{returnData.totalAmount.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Returns by Product</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {returnData.returnsByProduct.map((item) => (
                    <TableRow key={item.itemCode}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">₱{item.totalAmount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="lg" 
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
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Reports (F7)</Typography>
            <Box>
              <Tooltip title="Print Report">
                <IconButton onClick={handlePrint}>
                  <PrintIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export Report">
                <IconButton onClick={handleExport}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh">
                <IconButton onClick={loadReports}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                aria-label="report tabs"
              >
                <Tab label="Daily Sales" value="DAILY_SALES" />
                <Tab label="Inventory" value="INVENTORY" />
                <Tab label="Prescriptions" value="PRESCRIPTIONS" />
                <Tab label="Returns" value="RETURNS" />
              </Tabs>
            </Box>

            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={2}>
                {(activeTab === 'DAILY_SALES' || activeTab === 'PRESCRIPTIONS' || activeTab === 'RETURNS') && (
                  <>
                    <DatePicker
                      label="Start Date"
                      value={filters.startDate}
                      onChange={(newDate: Date | null) => handleDateChange(newDate, 'start')}
                    />
                    {(activeTab === 'PRESCRIPTIONS' || activeTab === 'RETURNS') && (
                      <DatePicker
                        label="End Date"
                        value={filters.endDate}
                        onChange={(newDate: Date | null) => handleDateChange(newDate, 'end')}
                      />
                    )}
                  </>
                )}
              </Stack>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                {activeTab === 'DAILY_SALES' && renderDailySalesReport()}
                {activeTab === 'INVENTORY' && renderInventoryReport()}
                {activeTab === 'PRESCRIPTIONS' && renderPrescriptionReport()}
                {activeTab === 'RETURNS' && renderReturnReport()}
              </Box>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  );
};

export default Reports;

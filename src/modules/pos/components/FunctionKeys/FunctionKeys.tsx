import React, { useState } from 'react';
import { Box, List, ListItem, ListItemButton, ListItemText, Typography, Badge, Dialog, DialogTitle, DialogContent, Button, Stack } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PauseIcon from '@mui/icons-material/Pause';
import RestoreIcon from '@mui/icons-material/Restore';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

// Import components
import ProductSearch from '../ProductSearch/ProductSearch';
import PrescriptionEntry from '../Prescription/PrescriptionEntry';
import PrescriptionList from '../Prescription/PrescriptionList';
import { Prescription } from '../Prescription/types';
import { savePrescription } from '../../api/prescriptionApi';
import { ReturnApi } from '../../api/ReturnApi';
import ReturnProcess from '../ReturnProcess/ReturnProcess';
import Reports from '../Reports/Reports';
import { CartItem } from '../../types/cart';

// Function key type definition
interface FunctionKey {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  disabled?: boolean;
}

// Styled components
const FunctionKeysContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.palette.background.paper,
}));

const StyledList = styled(List)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1),
  flexGrow: 1,
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.background.paper,
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.primary.light,
    borderRadius: '4px',
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: 0,
  marginBottom: theme.spacing(0.75),
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  minHeight: '48px',
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  transition: theme.transitions.create(['background-color', 'transform', 'box-shadow'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateX(4px)',
    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
    '& .MuiListItemText-primary': {
      color: theme.palette.primary.main,
    },
    '& .MuiListItemText-secondary': {
      color: theme.palette.primary.main,
      opacity: 0.8,
    },
    '& .MuiSvgIcon-root': {
      color: theme.palette.primary.main,
    }
  },
  '&:active': {
    transform: 'translateX(2px)',
    boxShadow: `0 1px 4px ${alpha(theme.palette.primary.main, 0.2)}`,
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
  },
  '& .MuiListItemText-primary': {
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  '& .MuiListItemText-secondary': {
    color: theme.palette.text.secondary,
  },
  '& .MuiSvgIcon-root': {
    color: theme.palette.primary.main,
  }
}));

const KeyText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1rem',
  marginRight: theme.spacing(1),
  whiteSpace: 'nowrap',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  '& .MuiSvgIcon-root': {
    fontSize: '1.3rem',
  },
}));

const ListItemContent = styled(ListItemText)(({ theme }) => ({
  margin: 0,
  '& .MuiListItemText-primary': {
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
  },
  '& .MuiListItemText-secondary': {
    fontSize: '0.75rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

interface FunctionKeysProps {
  onLogout?: () => void;
  onProductSelect?: (product: any) => void;
  onNewTransaction?: () => void;
  onHoldTransaction?: () => void;
  onRecallTransactions?: () => void;
  hasHeldTransactions?: boolean;
}

const FunctionKeys: React.FC<FunctionKeysProps> = ({
  onLogout = () => console.log('Logout clicked'),
  onProductSelect = () => console.log('Product selected'),
  onNewTransaction = () => console.log('New transaction clicked'),
  onHoldTransaction = () => console.log('Hold transaction clicked'),
  onRecallTransactions = () => console.log('Recall transactions clicked'),
  hasHeldTransactions = false,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [prescriptionMode, setPrescriptionMode] = useState<'menu' | 'entry' | 'list'>('menu');
  const [prescriptionToEdit, setPrescriptionToEdit] = useState<Prescription | undefined>(undefined);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);

  const handleSearchOpen = () => {
    setSearchOpen(true);
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
  };

  const handlePrescriptionOpen = () => {
    setPrescriptionOpen(true);
    setPrescriptionMode('menu');
  };

  const handlePrescriptionClose = () => {
    setPrescriptionOpen(false);
    setPrescriptionMode('menu');
    setPrescriptionToEdit(undefined);
  };

  const handlePrescriptionModeSelect = (selectedMode: 'entry' | 'list') => {
    setPrescriptionMode(selectedMode);
  };

  const handlePrescriptionBack = () => {
    if (prescriptionMode === 'entry') {
      setPrescriptionToEdit(undefined);
    }
    setPrescriptionMode('menu');
  };

  const handlePrescriptionSave = async (prescription: Prescription) => {
    try {
      // Don't save here, just update the UI state
      setPrescriptionMode('list');
      setPrescriptionToEdit(undefined);
    } catch (error) {
      console.error('Error handling prescription save:', error);
    }
  };

  const handlePrescriptionEdit = (prescription: Prescription) => {
    setPrescriptionToEdit(prescription);
    setPrescriptionMode('entry');
  };

  const handlePrescriptionDelete = async (id: string) => {
    try {
      // TODO: Implement delete functionality in prescriptionApi
      console.log('Deleting prescription:', id);
      // After successful deletion, you might want to refresh the list
    } catch (error) {
      console.error('Error deleting prescription:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleReturnOpen = () => {
    setReturnDialogOpen(true);
  };

  const handleReturnClose = () => {
    setReturnDialogOpen(false);
  };

  const handleReturnProcess = async (items: CartItem[], reason: string, receiptId: string) => {
    try {
      const response = await ReturnApi.processReturn({
        items,
        reason,
        receiptId
      });

      if (response.success) {
        // TODO: Show success notification
        console.log('Return processed successfully:', response.returnTransaction);
      } else {
        // TODO: Show error notification
        console.error('Failed to process return:', response.message);
      }
    } catch (error) {
      console.error('Error processing return:', error);
    }
  };

  const handleReportsOpen = () => {
    setReportsOpen(true);
  };

  const handleReportsClose = () => {
    setReportsOpen(false);
  };

  const renderPrescriptionContent = () => {
    switch (prescriptionMode) {
      case 'menu':
        return (
          <Box sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom align="center">
              F5 Prescription Management
            </Typography>
            <Stack spacing={2} sx={{ mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => handlePrescriptionModeSelect('entry')}
              >
                New Prescription Entry
              </Button>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => handlePrescriptionModeSelect('list')}
              >
                View Prescription Book
              </Button>
            </Stack>
          </Box>
        );
      case 'entry':
        return (
          <PrescriptionEntry
            open={true}
            onClose={handlePrescriptionBack}
            onSave={handlePrescriptionSave}
            editPrescription={prescriptionToEdit}
          />
        );
      case 'list':
        return (
          <>
            <DialogTitle>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button onClick={handlePrescriptionBack}>Back</Button>
                <Typography variant="h6">Prescription Book</Typography>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <PrescriptionList
                onNewEntry={() => setPrescriptionMode('entry')}
                onEdit={handlePrescriptionEdit}
                onDelete={handlePrescriptionDelete}
                onView={(prescription) => {
                  // View is handled by the PrescriptionView component in PrescriptionList
                }}
              />
            </DialogContent>
          </>
        );
    }
  };

  const functionKeys: FunctionKey[] = [
    {
      key: 'F1',
      label: 'Search Product',
      description: 'Search for products',
      icon: <SearchIcon />,
      action: handleSearchOpen,
    },
    {
      key: 'F2',
      label: 'New Transaction',
      description: 'Start a new transaction',
      icon: <AddIcon />,
      action: onNewTransaction,
    },
    {
      key: 'F3',
      label: 'Hold Transaction',
      description: 'Temporarily hold current transaction',
      icon: <PauseIcon />,
      action: onHoldTransaction,
    },
    {
      key: 'F4',
      label: 'Recall Transaction',
      description: 'Recall a held transaction',
      icon: <RestoreIcon />,
      action: onRecallTransactions,
      disabled: !hasHeldTransactions,
    },
    {
      key: 'F5',
      label: 'Prescription',
      description: 'Manage prescriptions',
      icon: <AssignmentReturnIcon />,
      action: handlePrescriptionOpen,
    },
    {
      key: 'F6',
      label: 'Process Return',
      description: 'Process a product return',
      icon: <AssignmentReturnIcon />,
      action: handleReturnOpen,
    },
    {
      key: 'F7',
      label: 'View Reports',
      description: 'Access sales and inventory reports',
      icon: <AssessmentIcon />,
      action: handleReportsOpen,
    },
    {
      key: 'F8',
      label: 'System Settings',
      description: 'Configure system settings',
      icon: <SettingsIcon />,
      action: () => console.log('Settings clicked'),
    },
    {
      key: 'F9',
      label: 'Notifications',
      description: 'View system notifications',
      icon: <Badge badgeContent={4} color="error"><NotificationsIcon /></Badge>,
      action: () => console.log('Notifications clicked')
    }
  ];

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      if (key === 'F12') {
        event.preventDefault();
        onLogout();
      } else {
        const functionKey = functionKeys.find(fk => fk.key === key);
        if (functionKey) {
          event.preventDefault();
          functionKey.action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [functionKeys, onLogout]);

  return (
    <FunctionKeysContainer>
      <StyledList>
        {functionKeys.map((fKey) => (
          <StyledListItem key={fKey.key}>
            <StyledListItemButton onClick={fKey.action} disabled={fKey.disabled}>
              <IconWrapper>
                {fKey.icon}
              </IconWrapper>
              <ListItemContent
                primary={
                  <Box display="flex" alignItems="center">
                    <KeyText className="KeyText">{fKey.key}</KeyText>
                    <Typography variant="body2" noWrap>{fKey.label}</Typography>
                  </Box>
                }
                secondary={fKey.description}
              />
            </StyledListItemButton>
          </StyledListItem>
        ))}
      </StyledList>
      
      {/* Logout Button - Separated at the bottom */}
      <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
        <StyledListItemButton 
          onClick={onLogout}
          sx={(theme) => ({ 
            backgroundColor: alpha(theme.palette.error.main, 0.02),
            borderColor: alpha(theme.palette.error.main, 0.3),
            borderWidth: '1px',
            borderStyle: 'solid',
            '& .MuiListItemText-primary': {
              color: theme.palette.error.main,
            },
            '& .MuiListItemText-secondary': {
              color: alpha(theme.palette.error.main, 0.7),
            },
            '& .MuiSvgIcon-root': {
              color: theme.palette.error.main,
            },
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.08),
              transform: 'translateX(4px)',
              boxShadow: `0 2px 8px ${alpha(theme.palette.error.main, 0.15)}`,
              borderColor: theme.palette.error.main,
              '& .MuiListItemText-primary': {
                color: theme.palette.error.main,
              },
              '& .MuiListItemText-secondary': {
                color: theme.palette.error.main,
                opacity: 0.8,
              },
              '& .MuiSvgIcon-root': {
                color: theme.palette.error.main,
              }
            },
            '&:active': {
              transform: 'translateX(2px)',
              boxShadow: `0 1px 4px ${alpha(theme.palette.error.main, 0.2)}`,
              backgroundColor: alpha(theme.palette.error.main, 0.12),
            }
          })}
        >
          <IconWrapper>
            <LogoutIcon />
          </IconWrapper>
          <ListItemContent
            primary={
              <Box display="flex" alignItems="center">
                <KeyText className="KeyText" sx={{ color: 'inherit' }}>F12</KeyText>
                <Typography variant="body2" noWrap>Logout</Typography>
              </Box>
            }
            secondary="Exit the system"
          />
        </StyledListItemButton>
      </Box>
      {/* Product Search Dialog */}
      <ProductSearch
        open={searchOpen}
        onClose={handleSearchClose}
        onSelectProduct={onProductSelect}
      />

      {/* Prescription Management Dialog */}
      <Dialog
        open={prescriptionOpen}
        onClose={handlePrescriptionClose}
        maxWidth="md"
        fullWidth
      >
        {renderPrescriptionContent()}
      </Dialog>

      {/* Return Process Dialog */}
      <ReturnProcess
        open={returnDialogOpen}
        onClose={handleReturnClose}
        onProcessReturn={handleReturnProcess}
      />

      {/* Reports Dialog */}
      <Reports
        open={reportsOpen}
        onClose={handleReportsClose}
      />
    </FunctionKeysContainer>
  );
};

export default FunctionKeys;
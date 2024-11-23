import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  InputAdornment,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

// Mock data - Replace with actual API call
const mockProducts = [
  {
    id: '1',
    itemCode: 'MED001',
    productName: 'Paracetamol',
    price: 5.99,
    stock: 100,
    unit: 'tablet',
    category: 'Pain Relief',
    brand: 'Generic',
    dosage: '500mg',
    requiresPrescription: false
  },
  {
    id: '2',
    itemCode: 'MED002',
    productName: 'Amoxicillin',
    price: 12.99,
    stock: 50,
    unit: 'capsule',
    category: 'Antibiotics',
    brand: 'Generic',
    dosage: '500mg',
    requiresPrescription: true
  },
  {
    id: '3',
    itemCode: 'MED003',
    productName: 'Ibuprofen',
    price: 7.99,
    stock: 75,
    unit: 'tablet',
    category: 'Pain Relief',
    brand: 'Generic',
    dosage: '200mg',
    requiresPrescription: false
  },
];

interface Product {
  id: string;
  itemCode: string;
  productName: string;
  price: number;
  stock: number;
  unit: string;
  category?: string;
  barcode?: string;
  brand?: string;
  dosage?: string;
  requiresPrescription?: boolean;
}

interface ProductSearchProps {
  open: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ open, onClose, onSelectProduct }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Replace with actual API call
    setProducts(mockProducts);
  }, []);

  useEffect(() => {
    const filtered = products.filter(
      (product) =>
        product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.itemCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleProductSelect = (product: Product) => {
    onSelectProduct(product);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Search Product (F1)</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          fullWidth
          placeholder="Search by product name or SKU..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Item Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Stock</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow
                  key={product.id}
                  hover
                  onClick={() => handleProductSelect(product)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{product.itemCode}</TableCell>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell align="right">${product.price.toFixed(2)}</TableCell>
                  <TableCell align="right">{product.stock}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSearch;

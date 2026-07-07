/**
 * Transactions Page
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  TextField,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useTransactions, useCategories } from '../hooks';
import { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils';

function TransactionsPage(): React.ReactElement {
  const { transactions, loading, error, createTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { categories } = useCategories();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchDescription, setSearchDescription] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: 'EXPENSE' as any,
  });

  // Filter transactions based on search criteria
  const filteredTransactions = transactions.filter(tx => {
    const matchesDescription = !searchDescription || 
      (tx.description?.toLowerCase().includes(searchDescription.toLowerCase()));
    const matchesCategory = !searchCategory || 
      (searchCategory === 'NO_CATEGORY' ? !tx.categoryId : (tx.categoryId === searchCategory));
    return matchesDescription && matchesCategory;
  });

  // Group transactions by date and sort
  const groupedTransactions = filteredTransactions.reduce((groups: Record<string, Transaction[]>, tx) => {
    const date = new Date(tx.transactionDate).toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(tx);
    return groups;
  }, {});

  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  const handleOpenDialog = (transaction?: any) => {
    if (transaction) {
      setEditingId(transaction.id);
      setFormData(transaction);
    } else {
      setEditingId(null);
      setFormData({ type: 'EXPENSE' as any });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Cents') ? parseInt(value) * 100 || 0 : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateTransaction(editingId, formData);
      } else {
        await createTransaction(formData);
      }
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving transaction:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(id);
      } catch (err) {
        console.error('Error deleting transaction:', err);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Typography variant="h4">Transactions</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Add Transaction
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Search Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
        <TextField
          placeholder="Search description..."
          value={searchDescription}
          onChange={(e) => setSearchDescription(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ flex: 1 }}
        />
        <Select
          value={searchCategory}
          onChange={(e) => setSearchCategory(e.target.value)}
          displayEmpty
          variant="outlined"
          size="small"
          sx={{ flex: 1, minWidth: 150 }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map(category => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
          <MenuItem value="NO_CATEGORY">No Category</MenuItem>
        </Select>
      </Box>

      {/* Desktop Table View */}
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        {sortedDates.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', color: '#999', py: 4 }}>
            No transactions found
          </Typography>
        ) : (
          sortedDates.map(date => (
            <Box key={date} sx={{ mb: 3 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600, 
                  color: '#666', 
                  mb: 1.5,
                  fontSize: '0.95rem',
                  borderBottom: '1px solid #e0e0e0',
                  pb: 1,
                }}
              >
                {date}
              </Typography>
              <TableContainer component={Card}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell>Category</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groupedTransactions[date].map(transaction => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {transaction.categoryId
                            ? categories.find(c => c.id === transaction.categoryId)?.name || '—'
                            : '—'}
                        </TableCell>
                        <TableCell>{transaction.description || '—'}</TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.type}
                            color={transaction.type === 'EXPENSE' ? 'error' : transaction.type === 'INCOME' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(transaction.amountCents)}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(transaction)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(transaction.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))
        )}
      </Box>

      {/* Mobile Card View */}
      <Box sx={{ display: { xs: 'grid', sm: 'none' }, gridTemplateColumns: '1fr', gap: 2 }}>
        {sortedDates.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', color: '#999', py: 4 }}>
            No transactions found
          </Typography>
        ) : (
          sortedDates.map(date => (
            <Box key={date}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600, 
                  color: '#666', 
                  mb: 1.5,
                  fontSize: '0.9rem',
                }}
              >
                {date}
              </Typography>
              {groupedTransactions[date].map(transaction => (
                <Card
                  key={transaction.id}
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                        {transaction.categoryId
                          ? categories.find(c => c.id === transaction.categoryId)?.name || '—'
                          : '—'}
                      </Typography>
                    </Box>
                    <Chip
                      label={transaction.type}
                      color={transaction.type === 'EXPENSE' ? 'error' : transaction.type === 'INCOME' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>

                  {transaction.description && (
                    <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem' }}>
                      {transaction.description}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 600, 
                        fontSize: '1.1rem',
                        color: transaction.type === 'EXPENSE' ? '#d32f2f' : '#388e3c'
                      }}
                    >
                      {transaction.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(transaction.amountCents)}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(transaction)}
                        sx={{ p: '4px' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(transaction.id)}
                        sx={{ p: '4px' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>
          ))
        )}
      </Box>

      {/* Dialog for adding/editing transactions */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            '@media (max-width:600px)': {
              m: 1,
              maxWidth: 'calc(100% - 16px)',
            },
          },
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {editingId ? 'Edit Transaction' : 'Add New Transaction'}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date"
                name="transactionDate"
                type="date"
                value={formData.transactionDate || ''}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Select
                fullWidth
                name="type"
                value={formData.type || 'EXPENSE'}
                onChange={handleChange}
              >
                <MenuItem value="EXPENSE">Expense</MenuItem>
                <MenuItem value="INCOME">Income</MenuItem>
                <MenuItem value="BALANCE_ADJUSTMENT">Balance Adjustment</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12}>
              <Select
                fullWidth
                name="categoryId"
                value={formData.categoryId || ''}
                onChange={handleChange}
              >
                <MenuItem value="">No Category</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount (RM)"
                name="amountCents"
                type="number"
                inputProps={{ step: '0.01' }}
                value={formData.amountCents ? formData.amountCents / 100 : ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" fullWidth onClick={handleSubmit}>
                  Save
                </Button>
                <Button variant="outlined" fullWidth onClick={handleCloseDialog}>
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Dialog>
    </Box>
  );
}

export default TransactionsPage;

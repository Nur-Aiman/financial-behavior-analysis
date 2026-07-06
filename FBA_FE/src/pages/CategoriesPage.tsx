/**
 * Categories Page
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
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
  FormControlLabel,
  Checkbox,
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
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { useCategories, useTransactions, useProfile } from '../hooks';
import { SpendingCategory, Transaction } from '../types';
import { formatCurrency } from '../utils';
import { categoryAPI } from '../api';

function CategoriesPage(): React.ReactElement {
  const { categories, loading, error, createCategory, updateCategory, deactivateCategory, deleteCategory } = useCategories();
  const { createTransaction, transactions } = useTransactions();
  const { profile } = useProfile();
  const [openDialog, setOpenDialog] = useState(false);
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SpendingCategory>>({
    type: 'DAILY_TIME_BASED' as any,
  });
  const [transactionData, setTransactionData] = useState<Partial<Transaction>>({
    type: 'EXPENSE' as any,
  });
  const [displayCategories, setDisplayCategories] = useState<SpendingCategory[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Calculate category summary stats
  const calculateSummary = () => {
    const activeCats = displayCategories.filter(c => c.active);
    const totalAllocated = activeCats.reduce((sum, c) => sum + (c.allocatedAmountCents || 0), 0);
    const totalSpent = activeCats.reduce((sum, c) => sum + (((c as any).spent || 0) || 0), 0);
    const totalRemaining = activeCats.reduce((sum, c) => sum + (((c as any).remaining || 0) || 0), 0);
    
    // Calculate balance: expected salary - total spent
    const totalExpenses = transactions
      ?.filter(tx => tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + tx.amountCents, 0) || 0;
    const calculatedBalance = (profile?.expectedSalaryCents || 0) - totalExpenses;
    const currentBalance = profile?.currentBalanceCents || 0;

    // Use preference from profile: if useCalculatedBalance is true, use calculated balance, otherwise current balance
    const balanceToUse = profile?.useCalculatedBalance ? calculatedBalance : currentBalance;

    return {
      totalAllocated,
      totalSpent,
      totalRemaining,
      currentBalance,
      calculatedBalance,
      balanceToUse,
    };
  };

  const summary = calculateSummary();

  // Helper function to get status color
  const getStatusColor = (status: string): { backgroundColor: string; textColor: string } => {
    switch (status.toLowerCase()) {
      case 'overbudget':
        return { backgroundColor: '#d32f2f', textColor: 'white' };
      case 'paid':
        return { backgroundColor: '#2e7d32', textColor: 'white' };
      case 'in use':
        return { backgroundColor: '#1976d2', textColor: 'white' };
      case 'active':
        return { backgroundColor: '#fbc02d', textColor: '#000' };
      default:
        return { backgroundColor: 'transparent', textColor: '#999' };
    }
  };

  // Helper function to render status chip
  const renderStatusChip = (category: SpendingCategory, size: 'small' | 'medium' = 'small') => {
    const status = getCategoryStatus(category);
    const colors = getStatusColor(status);
    return (
      <Chip
        label={status}
        size={size}
        sx={{
          backgroundColor: colors.backgroundColor,
          color: colors.textColor,
          fontWeight: 500,
          ...(status === 'Inactive' && { border: '1px solid #ccc' }),
        }}
      />
    );
  };

  // Helper function to get category status
  const getCategoryStatus = (category: SpendingCategory): string => {
    const spent = (category as any).spent || 0;
    const remaining = (category as any).remaining || 0;
    const allocated = category.allocatedAmountCents || 0;
    const isOverbudget = allocated > 0 && spent > allocated;
    const isPaid = allocated > 0 && spent >= allocated && !isOverbudget;

    if (isOverbudget) return 'Overbudget';
    if (isPaid) return 'Paid';
    if (spent > 0 && remaining > 0) return 'In Use';
    if (category.active) return 'Active';
    return 'Inactive';
  };

  React.useEffect(() => {
    let filtered = categories;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(cat =>
        getCategoryStatus(cat).toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setDisplayCategories(filtered);
  }, [categories, searchTerm, statusFilter]);

  const handleOpenDialog = (category?: SpendingCategory) => {
    if (category) {
      setEditingId(category.id);
      setFormData(category);
    } else {
      setEditingId(null);
      setFormData({ type: 'DAILY_TIME_BASED' as any });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name.includes('Cents') ? parseInt(value) * 100 || 0 : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateCategory(editingId, formData);
      } else {
        await createCategory(formData);
      }
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving category:', err);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await deactivateCategory(id);
    } catch (err) {
      console.error('Error deactivating category:', err);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this category? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      await deleteCategory(id);
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  const handleOpenTransactionDialog = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setTransactionData({
      type: 'EXPENSE' as any,
      categoryId: categoryId,
      transactionDate: new Date().toISOString().split('T')[0],
    });
    setOpenTransactionDialog(true);
  };

  const handleCloseTransactionDialog = () => {
    setOpenTransactionDialog(false);
    setSelectedCategoryId(null);
    setTransactionData({ type: 'EXPENSE' as any });
  };

  const handleTransactionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value } = e.target;
    setTransactionData(prev => ({
      ...prev,
      [name]: name === 'amountCents' ? parseInt(value) * 100 || 0 : value,
    }));
  };

  const handleAddTransaction = async () => {
    if (!selectedCategoryId || !transactionData.amountCents || !transactionData.merchant) {
      alert('Please fill in amount and merchant fields');
      return;
    }

    try {
      await createTransaction({
        ...transactionData,
        categoryId: selectedCategoryId,
      });
      handleCloseTransactionDialog();
    } catch (err) {
      console.error('Error creating transaction:', err);
      alert('Failed to add spending. Please try again.');
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (id: string) => {
    setDragOverId(id);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, dropId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedId || draggedId === dropId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    // Find indices
    const draggedIndex = displayCategories.findIndex(cat => cat.id === draggedId);
    const dropIndex = displayCategories.findIndex(cat => cat.id === dropId);

    if (draggedIndex === -1 || dropIndex === -1) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    // Reorder the array
    const newCategories = [...displayCategories];
    const [draggedCategory] = newCategories.splice(draggedIndex, 1);
    newCategories.splice(dropIndex, 0, draggedCategory);

    setDisplayCategories(newCategories);
    setDraggedId(null);
    setDragOverId(null);

    // Save the new order to backend
    const categoryIds = newCategories.map(cat => cat.id);
    categoryAPI
      .reorder(categoryIds)
      .catch(err => {
        console.error('Error saving category order:', err);
        // Revert to previous order on error
        setDisplayCategories(displayCategories);
      });
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
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
        <Typography variant="h4">Spending Categories</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Add Category
        </Button>
      </Box>

      {/* Category Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ backgroundColor: '#e3f2fd' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: '#666' }}>
                Total Allocated
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mt: 1 }}>
                {formatCurrency(summary.totalAllocated)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ backgroundColor: '#ffebee' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: '#666' }}>
                Total Spent
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#d32f2f', mt: 1 }}>
                {formatCurrency(summary.totalSpent)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ backgroundColor: '#e8f5e9' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: '#666' }}>
                Total Remaining
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2e7d32', mt: 1 }}>
                {formatCurrency(summary.totalRemaining)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            backgroundColor: profile?.useCalculatedBalance ? '#e8f5e9' : '#e3f2fd',
            border: '2px solid ' + (profile?.useCalculatedBalance ? '#2e7d32' : '#1976d2')
          }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: '#666' }}>
                Active Balance
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  color: profile?.useCalculatedBalance ? '#2e7d32' : '#1976d2',
                  mt: 1 
                }}
              >
                {formatCurrency(summary.balanceToUse)}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: profile?.useCalculatedBalance ? '#2e7d32' : '#1976d2', fontWeight: 500 }}>
                {profile?.useCalculatedBalance ? '(Calculated)' : '(Current)'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter Bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' } }}>
        <TextField
          placeholder="Search by category name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ 
            flex: 1,
            minWidth: '200px',
            '@media (max-width:600px)': {
              width: '100%',
            },
          }}
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
          sx={{
            minWidth: '150px',
            '@media (max-width:600px)': {
              width: '100%',
            },
          }}
        >
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="overbudget">Overbudget</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="in use">In Use</MenuItem>
          <MenuItem value="paid">Paid</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </Select>
        {(searchTerm || statusFilter !== 'all') && (
          <Button
            variant="outlined"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
            sx={{
              '@media (max-width:600px)': {
                width: '100%',
              },
            }}
          >
            Clear Filters
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* No Results Message */}
      {displayCategories.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No categories found {searchTerm || statusFilter !== 'all' ? 'matching your filters' : ''}.
        </Alert>
      )}

      {/* Desktop Table View */}
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ width: 40 }}></TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Allocated</TableCell>
                <TableCell align="right">Spent</TableCell>
                <TableCell align="right">Remaining</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayCategories.map(category => (
                <TableRow
                  key={category.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, category.id)}
                  onDragOver={handleDragOver}
                  onDragEnter={() => handleDragEnter(category.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, category.id)}
                  onDragEnd={handleDragEnd}
                  sx={{
                    cursor: 'grab',
                    backgroundColor: draggedId === category.id ? 'rgba(25, 118, 210, 0.08)' : 
                                     dragOverId === category.id ? 'rgba(25, 118, 210, 0.12)' : 'inherit',
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      backgroundColor: dragOverId === category.id ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.02)',
                    },
                    opacity: draggedId === category.id ? 0.6 : 1,
                  }}
                >
                  <TableCell sx={{ width: 40, cursor: 'grab', color: '#999' }}>
                    <DragIcon sx={{ fontSize: 20 }} />
                  </TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.type}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(category.allocatedAmountCents)}
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{
                      color: ((category as any).spent || 0) > (category.allocatedAmountCents || 0) ? '#d32f2f' : 'inherit',
                      fontWeight: ((category as any).spent || 0) > (category.allocatedAmountCents || 0) ? 600 : 'normal',
                    }}
                  >
                    {(category as any).spentAmount ? (category as any).spentAmount : formatCurrency((category as any).spent || 0)}
                  </TableCell>
                  <TableCell align="right">
                    {(category as any).remainingAmount ? (category as any).remainingAmount : formatCurrency((category as any).remaining || 0)}
                  </TableCell>
                  <TableCell>
                    {renderStatusChip(category, 'small')}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenTransactionDialog(category.id)}
                      color="primary"
                      title="Add Spending"
                    >
                      <AddIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(category)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(category.id)}
                      color="error"
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

      {/* Mobile Card View */}
      <Box sx={{ display: { xs: 'grid', sm: 'none' }, gridTemplateColumns: '1fr', gap: 2 }}>
        {displayCategories.map(category => {
          return (
            <Card
              key={category.id}
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    {category.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {category.type}
                  </Typography>
                </Box>
                {renderStatusChip(category, 'small')}
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
                    Allocated
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatCurrency(category.allocatedAmountCents)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
                    Spent
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: ((category as any).spent || 0) > (category.allocatedAmountCents || 0) ? 700 : 500,
                      color: ((category as any).spent || 0) > (category.allocatedAmountCents || 0) ? '#d32f2f' : 'inherit',
                    }}
                  >
                    {(category as any).spentAmount ? (category as any).spentAmount : formatCurrency((category as any).spent || 0)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
                    Remaining
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {(category as any).remainingAmount ? (category as any).remainingAmount : formatCurrency((category as any).remaining || 0)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  fullWidth
                  onClick={() => handleOpenTransactionDialog(category.id)}
                  sx={{ fontSize: '0.875rem' }}
                >
                  Add Spending
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={() => handleOpenDialog(category)}
                  sx={{ fontSize: '0.875rem' }}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  fullWidth
                  onClick={() => handleDelete(category.id)}
                  sx={{ fontSize: '0.875rem' }}
                >
                  Delete
                </Button>
              </Box>
            </Card>
          );
        })}
      </Box>

      {/* Dialog for adding/editing categories */}
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
            {editingId ? 'Edit Category' : 'Add New Category'}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category Name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Select
                fullWidth
                name="type"
                value={formData.type || 'DAILY_TIME_BASED'}
                onChange={handleChange}
              >
                <MenuItem value="DAILY_TIME_BASED">Daily Time-Based</MenuItem>
                <MenuItem value="USAGE_BASED">Usage-Based</MenuItem>
                <MenuItem value="FIXED_ONE_TIME">Fixed One-Time</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Allocated Amount (RM)"
                name="allocatedAmountCents"
                type="number"
                inputProps={{ step: '0.01' }}
                value={formData.allocatedAmountCents ? formData.allocatedAmountCents / 100 : ''}
                onChange={handleChange}
              />
            </Grid>
            {formData.type === 'DAILY_TIME_BASED' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Preferred Daily Amount (RM)"
                  name="preferredDailyAmountCents"
                  type="number"
                  inputProps={{ step: '0.01' }}
                  value={formData.preferredDailyAmountCents ? formData.preferredDailyAmountCents / 100 : ''}
                  onChange={handleChange}
                />
              </Grid>
            )}
            {formData.type === 'FIXED_ONE_TIME' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Expected Amount (RM)"
                    name="expectedAmountCents"
                    type="number"
                    inputProps={{ step: '0.01' }}
                    value={formData.expectedAmountCents ? formData.expectedAmountCents / 100 : ''}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Due Date"
                    name="dueDate"
                    type="date"
                    value={formData.dueDate || ''}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="active"
                    checked={formData.active !== false}
                    onChange={handleChange}
                  />
                }
                label="Active"
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

      {/* Dialog for adding transaction to category */}
      <Dialog 
        open={openTransactionDialog} 
        onClose={handleCloseTransactionDialog} 
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
            {selectedCategoryId ? `Add Spending to ${categories.find(c => c.id === selectedCategoryId)?.name}` : 'Add Spending'}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount (RM)"
                name="amountCents"
                type="number"
                inputProps={{ step: '0.01', min: '0' }}
                value={transactionData.amountCents ? transactionData.amountCents / 100 : ''}
                onChange={handleTransactionChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Merchant/Shop"
                name="merchant"
                value={transactionData.merchant || ''}
                onChange={handleTransactionChange}
                placeholder="e.g., Shell Petrol Station, Tesco, etc."
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date"
                name="transactionDate"
                type="date"
                value={transactionData.transactionDate || new Date().toISOString().split('T')[0]}
                onChange={handleTransactionChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={transactionData.description || ''}
                onChange={handleTransactionChange}
                placeholder="Optional description"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={transactionData.notes || ''}
                onChange={handleTransactionChange}
                placeholder="Optional notes"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={handleAddTransaction}
                  color="success"
                >
                  Add Spending
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={handleCloseTransactionDialog}
                >
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

export default CategoriesPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Link,
  Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditOutlined from '@ant-design/icons/EditOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import { fetchContracts, deleteContract } from 'api/contracts';
import { useAuth } from 'context/AuthContext';
import { config } from 'utils/config';

const ContractList = () => {
  const { token, employee } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState(null);
  const navigate = useNavigate();

  const isEmployee = Boolean(employee);

  useEffect(() => {
    loadContracts();
  }, [employee]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const data = await fetchContracts(token);

      // Filter contracts for employees to only show their own
      let filteredContracts = data.data;
      if (isEmployee) {
        filteredContracts = data.data.filter((contract) => contract.employee?.documentId === employee.documentId);
      }

      setContracts(filteredContracts);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (contract) => {
    setContractToDelete(contract);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!contractToDelete) return;

    try {
      await deleteContract(token, contractToDelete.documentId);
      setContracts(contracts.filter((contract) => contract.documentId !== contractToDelete.documentId));
      setDeleteDialogOpen(false);
      setContractToDelete(null);
    } catch (error) {
      console.error('Error deleting contract:', error);
      setError('Αποτυχία διαγραφής συμβολαίου');
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setContractToDelete(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'terminated':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return `€${parseFloat(amount).toLocaleString()}`;
  };

  const getFileUrl = (file) => {
    if (!file) return null;
    return config.API_URL.replace(/\/api\/?$/, '') + (file.url.startsWith('/') ? file.url : '/' + file.url);
  };

  const columns = [
    {
      field: 'employee',
      headerName: 'Υπάλληλος',
      width: 200,
      renderCell: (params) => (params.row.employee ? `${params.row.employee.firstName} ${params.row.employee.lastName}` : '-')
    },
    {
      field: 'title',
      headerName: 'Τίτλος',
      width: 180,
      renderCell: (params) => params.row.title || '-'
    },
    {
      field: 'grossSalary',
      headerName: 'Μικτός Μισθός',
      width: 130,
      renderCell: (params) => formatCurrency(params.row.grossSalary)
    },
    {
      field: 'netSalary',
      headerName: 'Καθαρός Μισθός',
      width: 130,
      renderCell: (params) => formatCurrency(params.row.netSalary)
    },
    {
      field: 'contractStatus',
      headerName: 'Κατάσταση',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={
            params.row.contractStatus === 'Active'
              ? 'Ενεργό'
              : params.row.contractStatus === 'Terminated'
                ? 'Τερματισμένο'
                : params.row.contractStatus === 'Pending'
                  ? 'Εκκρεμεί'
                  : params.row.contractStatus || 'Εκκρεμεί'
          }
          color={getStatusColor(params.row.contractStatus)}
          size="small"
        />
      )
    },
    {
      field: 'file',
      headerName: 'Αρχείο',
      width: 150,
      sortable: false,
      renderCell: (params) =>
        params.row.file ? (
          <Link
            href={getFileUrl(params.row.file)}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <FileTextOutlined style={{ fontSize: 16 }} />
            Προβολή Αρχείου
          </Link>
        ) : (
          '-'
        )
    },
    {
      field: 'actions',
      headerName: 'Ενέργειες',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title={isEmployee ? 'Προβολή' : 'Επεξεργασία'}>
            <IconButton
              size="small"
              onClick={() =>
                navigate(
                  isEmployee
                    ? `/management/contracts/${params.row.documentId}/edit?view=1`
                    : `/management/contracts/${params.row.documentId}/edit`
                )
              }
              color="primary"
            >
              {isEmployee ? <EyeOutlined /> : <EditOutlined />}
            </IconButton>
          </Tooltip>
          {!isEmployee && (
            <Tooltip title="Διαγραφή">
              <IconButton size="small" onClick={() => handleDeleteClick(params.row)} color="error">
                <DeleteOutlined />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )
    }
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {isEmployee ? 'Το Συμβόλαιό Μου' : 'Συμβόλαια'}
        </Typography>
        {!isEmployee && (
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => navigate('/management/contracts/add')}>
            Προσθήκη Νέου Συμβολαίου
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <DataGrid
            rows={contracts}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 }
              }
            }}
            pageSizeOptions={[10, 25, 50]}
            loading={loading}
            disableRowSelectionOnClick
            autoHeight
            getRowId={(row) => row.documentId || row.id}
            sx={{
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #f0f0f0'
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#fafafa',
                borderBottom: '1px solid #d9d9d9'
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Επιβεβαίωση Διαγραφής</DialogTitle>
        <DialogContent>
          <Typography>
            Είστε σίγουροι ότι θέλετε να διαγράψετε το συμβόλαιο για τον "{contractToDelete?.employee?.firstName}{' '}
            {contractToDelete?.employee?.lastName}"; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Άκυρο</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Διαγραφή
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContractList;

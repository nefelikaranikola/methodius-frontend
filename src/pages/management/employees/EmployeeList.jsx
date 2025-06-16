import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Material UI components
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

// Icons
import EditOutlined from '@ant-design/icons/EditOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';

// Project imports
import { useAuth } from 'context/AuthContext';
import { fetchEmployees, deleteEmployee } from 'api/employees';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const { token, canAccessManagement, employee } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetchEmployees(token);
      setEmployees(response.data || []);
      setError('');
    } catch (error) {
      console.error('Failed to load employees:', error);
      setError('Αποτυχία φόρτωσης υπαλλήλων. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employeeRow) => {
    navigate(`/management/employees/${employeeRow.documentId}/edit`);
  };

  const canEditEmployee = (employeeRow) => {
    // Admin can edit anyone, employee can only edit themselves
    return canAccessManagement() || (employee && employee.documentId === employeeRow.documentId);
  };

  const handleDeleteConfirm = (employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!employeeToDelete) return;

    try {
      await deleteEmployee(employeeToDelete.documentId, token);
      setEmployees(employees.filter((emp) => emp.documentId !== employeeToDelete.documentId));
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    } catch (error) {
      console.error('Failed to delete employee:', error);
      setError('Αποτυχία διαγραφής υπαλλήλου. Παρακαλώ δοκιμάστε ξανά.');
    }
  };

  const formatSalary = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'on_leave':
        return 'warning';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      field: 'avatar',
      headerName: '',
      width: 70,
      sortable: false,
      renderCell: (params) => (
        <Avatar src={params.row.picture?.url ? `http://localhost:1337${params.row.picture.url}` : null} sx={{ width: 40, height: 40 }}>
          <UserOutlined />
        </Avatar>
      )
    },
    {
      field: 'fullName',
      headerName: 'Όνομα',
      width: 200,
      renderCell: (params) => `${params.row.firstName} ${params.row.lastName}`
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      renderCell: (params) => params.row.user?.email
    },
    {
      field: 'position',
      headerName: 'Θέση',
      width: 180,
      renderCell: (params) => params.row.position || '-'
    },
    {
      field: 'department',
      headerName: 'Τμήμα',
      width: 150,
      renderCell: (params) => params.row.department || '-'
    },
    {
      field: 'phoneNumber',
      headerName: 'Τηλέφωνο',
      width: 130,
      renderCell: (params) => params.row.phoneNumber || '-'
    },
    {
      field: 'employmentStatus',
      headerName: 'Κατάσταση',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={
            params.row.employmentStatus === 'Full-Time'
              ? 'Πλήρης Απασχόληση'
              : params.row.employmentStatus === 'Part-Time'
                ? 'Μερική Απασχόληση'
                : params.row.employmentStatus === 'Intern'
                  ? 'Ασκούμενος'
                  : params.row.employmentStatus === 'Contractor'
                    ? 'Εργολάβος'
                    : params.row.employmentStatus || 'Πλήρης Απασχόληση'
          }
          color="primary"
          size="small"
        />
      )
    },
    {
      field: 'dateOfJoining',
      headerName: 'Ημερομηνία Πρόσληψης',
      width: 120,
      renderCell: (params) => {
        if (!params.row.dateOfJoining) return '-';
        return new Date(params.row.dateOfJoining).toLocaleDateString('el-GR');
      }
    },
    {
      field: 'actions',
      headerName: 'Ενέργειες',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          {canEditEmployee(params.row) && (
            <Tooltip title="Επεξεργασία">
              <IconButton size="small" onClick={() => handleEdit(params.row)} color="primary">
                <EditOutlined />
              </IconButton>
            </Tooltip>
          )}
          {canAccessManagement() && (
            <Tooltip title="Διαγραφή">
              <IconButton size="small" onClick={() => handleDeleteConfirm(params.row)} color="error">
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
          Υπάλληλοι
        </Typography>
        {canAccessManagement() && (
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => navigate('/management/employees/add')}>
            Προσθήκη Υπαλλήλου
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
            rows={employees}
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
            getRowId={(row) => row.documentId}
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
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Επιβεβαίωση Διαγραφής</DialogTitle>
        <DialogContent>
          <Typography>
            Είστε σίγουροι ότι θέλετε να διαγράψετε τον υπάλληλο "{employeeToDelete?.firstName} {employeeToDelete?.lastName}"; Αυτή η
            ενέργεια δεν μπορεί να αναιρεθεί.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Άκυρο</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Διαγραφή
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeList;

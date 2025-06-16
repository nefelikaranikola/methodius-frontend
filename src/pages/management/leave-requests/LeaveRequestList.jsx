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
  Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditOutlined from '@ant-design/icons/EditOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import { fetchLeaveRequests, deleteLeaveRequest } from 'api/leaveRequests';
import { useAuth } from 'context/AuthContext';

const LeaveRequestList = () => {
  const { token, employee } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadLeaveRequests();
  }, [employee]);

  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      const data = await fetchLeaveRequests(token);

      // Filter by employee if user is an employee (not admin)
      let filteredRequests = data.data;
      if (employee) {
        filteredRequests = data.data.filter((request) => request.employee?.documentId === employee.documentId);
      }

      setLeaveRequests(filteredRequests);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (request) => {
    setRequestToDelete(request);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!requestToDelete) return;

    try {
      await deleteLeaveRequest(token, requestToDelete.documentId);
      setLeaveRequests(leaveRequests.filter((req) => req.documentId !== requestToDelete.documentId));
      setDeleteDialogOpen(false);
      setRequestToDelete(null);
    } catch (error) {
      console.error('Error deleting leave request:', error);
      setError('Αποτυχία διαγραφής αιτήματος άδειας');
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRequestToDelete(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'declined':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const columns = [
    {
      field: 'employee',
      headerName: 'Υπάλληλος',
      width: 200,
      renderCell: (params) => (params.row.employee ? `${params.row.employee.firstName} ${params.row.employee.lastName}` : '-')
    },
    {
      field: 'leaveType',
      headerName: 'Τύπος Άδειας',
      width: 150,
      renderCell: (params) =>
        params.row.leaveType === 'Sick Leave'
          ? 'Άδεια Ασθενείας'
          : params.row.leaveType === 'Vacation'
            ? 'Διακοπές'
            : params.row.leaveType === 'Personal Leave'
              ? 'Προσωπική Άδεια'
              : params.row.leaveType || '-'
    },
    {
      field: 'startDate',
      headerName: 'Ημερομηνία Έναρξης',
      width: 130,
      renderCell: (params) => formatDate(params.row.startDate)
    },
    {
      field: 'endDate',
      headerName: 'Ημερομηνία Λήξης',
      width: 130,
      renderCell: (params) => formatDate(params.row.endDate)
    },
    {
      field: 'totalHours',
      headerName: 'Συνολικές Ώρες',
      width: 120,
      renderCell: (params) => params.row.totalHours || '-'
    },
    {
      field: 'leaveStatus',
      headerName: 'Κατάσταση',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={
            params.row.leaveStatus === 'Pending'
              ? 'Εκκρεμεί'
              : params.row.leaveStatus === 'Approved'
                ? 'Εγκρίθηκε'
                : params.row.leaveStatus === 'Declined'
                  ? 'Απορρίφθηκε'
                  : params.row.leaveStatus || 'Εκκρεμεί'
          }
          color={getStatusColor(params.row.leaveStatus)}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Ενέργειες',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title={employee && params.row.leaveStatus === 'Approved' ? 'Προβολή' : 'Επεξεργασία'}>
            <IconButton size="small" onClick={() => navigate(`/management/leave-requests/${params.row.documentId}/edit`)} color="primary">
              {employee && (params.row.leaveStatus === 'Approved' || params.row.leaveStatus === 'Declined') ? (
                <EyeOutlined />
              ) : (
                <EditOutlined />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Διαγραφή">
            <IconButton size="small" onClick={() => handleDeleteClick(params.row)} color="error">
              <DeleteOutlined />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {employee ? 'Τα Αιτήματα Άδειάς Μου' : 'Όλα τα Αιτήματα Άδειας'}
        </Typography>
        <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => navigate('/management/leave-requests/add')}>
          Προσθήκη Νέου Αιτήματος
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <DataGrid
            rows={leaveRequests}
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
            Είστε σίγουροι ότι θέλετε να διαγράψετε το αίτημα άδειας για τον "{requestToDelete?.employee?.firstName}{' '}
            {requestToDelete?.employee?.lastName}"; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.
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

export default LeaveRequestList;

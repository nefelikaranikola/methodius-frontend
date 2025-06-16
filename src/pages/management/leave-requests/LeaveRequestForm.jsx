import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// material-ui
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

// project imports
import MainCard from 'components/MainCard';
import { fetchEmployees } from 'api/employees';
import { createLeaveRequest, updateLeaveRequest, fetchLeaveRequestById } from 'api/leaveRequests';
import { useAuth } from 'context/AuthContext';

const LeaveRequestForm = () => {
  const { token, employee } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const isEmployee = Boolean(employee);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employee: employee?.id || '',
    leaveType: 'Sick Leave',
    startDate: '',
    endDate: '',
    totalHours: '',
    reason: '',
    leaveStatus: 'Pending'
  });
  const [errors, setErrors] = useState({});

  // Check if this is a read-only view for approved leave requests by employees
  const isReadOnly = isEmployee && isEdit && (formData.leaveStatus === 'Approved' || formData.leaveStatus === 'Declined');

  useEffect(() => {
    if (!isEmployee) {
      loadEmployees();
    }
    if (isEdit) {
      loadLeaveRequest();
    }
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await fetchEmployees(token);
      setEmployees(data.data || []);
    } catch (error) {
      console.error('Failed to load employees', error);
      setError('Αποτυχία φόρτωσης υπαλλήλων');
    }
  };

  const loadLeaveRequest = async () => {
    try {
      setLoading(true);
      const data = await fetchLeaveRequestById(token, id);
      setFormData({
        employee: data.employee?.id || '',
        leaveType: data.leaveType || 'Sick Leave',
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        totalHours: data.totalHours || '',
        reason: data.reason || '',
        leaveStatus: data.leaveStatus || 'Pending'
      });
    } catch (error) {
      setError('Αποτυχία φόρτωσης αιτήματος άδειας');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.employee) {
      newErrors.employee = 'Ο υπάλληλος είναι υποχρεωτικός';
    }
    if (!formData.leaveType) {
      newErrors.leaveType = 'Ο τύπος άδειας είναι υποχρεωτικός';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Η ημερομηνία έναρξης είναι υποχρεωτική';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'Η ημερομηνία λήξης είναι υποχρεωτική';
    }
    if (!formData.totalHours) {
      newErrors.totalHours = 'Οι συνολικές ώρες είναι υποχρεωτικές';
    }

    // Validate date range
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start > end) {
        newErrors.endDate = 'Η ημερομηνία λήξης πρέπει να είναι μετά την ημερομηνία έναρξης';
      }
    }

    // Validate total hours
    if (formData.totalHours && (isNaN(formData.totalHours) || parseFloat(formData.totalHours) <= 0)) {
      newErrors.totalHours = 'Οι συνολικές ώρες πρέπει να είναι θετικός αριθμός';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const submitData = {
        ...formData,
        totalHours: parseFloat(formData.totalHours)
      };

      if (isEdit) {
        await updateLeaveRequest(token, id, submitData);
      } else {
        await createLeaveRequest(token, submitData);
      }

      navigate('/management/leave-requests');
    } catch (error) {
      console.error('Failed to save leave request', error);
      setError(error.message || 'Αποτυχία αποθήκευσης αιτήματος άδειας');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/management/leave-requests');
  };

  if (loading) {
    return (
      <MainCard
        title={isEdit ? (isReadOnly ? 'Προβολή Αιτήματος Άδειας' : 'Επεξεργασία Αιτήματος Άδειας') : 'Προσθήκη Νέου Αιτήματος Άδειας'}
      >
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard
      title={isEdit ? (isReadOnly ? 'Προβολή Αιτήματος Άδειας' : 'Επεξεργασία Αιτήματος Άδειας') : 'Προσθήκη Νέου Αιτήματος Άδειας'}
      secondary={
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Επιστροφή στη Λίστα
        </Button>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Employee Selection */}
          <Grid item size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth error={!!errors.employee}>
              <InputLabel>Υπάλληλος *</InputLabel>
              <Select
                name="employee"
                value={formData.employee}
                onChange={handleChange}
                label="Υπάλληλος *"
                disabled={isEmployee || isReadOnly}
              >
                {isEmployee ? (
                  <MenuItem value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </MenuItem>
                ) : (
                  employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.employee && <FormHelperText>{errors.employee}</FormHelperText>}
            </FormControl>
          </Grid>

          {/* Leave Type */}
          <Grid item size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth error={!!errors.leaveType}>
              <InputLabel>Τύπος Άδειας *</InputLabel>
              <Select name="leaveType" value={formData.leaveType} onChange={handleChange} label="Τύπος Άδειας *" disabled={isReadOnly}>
                <MenuItem value="Sick Leave">Άδεια Ασθενείας</MenuItem>
                <MenuItem value="Vacation">Διακοπές</MenuItem>
                <MenuItem value="Personal Leave">Προσωπική Άδεια</MenuItem>
              </Select>
              {errors.leaveType && <FormHelperText>{errors.leaveType}</FormHelperText>}
            </FormControl>
          </Grid>

          {/* Start Date */}
          <Grid item size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              name="startDate"
              label="Ημερομηνία Έναρξης"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
              disabled={isReadOnly}
              error={!!errors.startDate}
              helperText={errors.startDate}
            />
          </Grid>

          {/* End Date */}
          <Grid item size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              name="endDate"
              label="Ημερομηνία Λήξης"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
              disabled={isReadOnly}
              error={!!errors.endDate}
              helperText={errors.endDate}
            />
          </Grid>

          {/* Total Hours */}
          <Grid item size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              name="totalHours"
              label="Συνολικές Ώρες"
              type="number"
              value={formData.totalHours}
              onChange={handleChange}
              inputProps={{ min: 0, step: 0.5 }}
              required
              disabled={isReadOnly}
              error={!!errors.totalHours}
              helperText={errors.totalHours}
            />
          </Grid>

          {/* Status (only for admins/HR) */}
          {!isEmployee && (
            <Grid item size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Κατάσταση</InputLabel>
                <Select name="leaveStatus" value={formData.leaveStatus} onChange={handleChange} label="Κατάσταση">
                  <MenuItem value="Pending">Εκκρεμεί</MenuItem>
                  <MenuItem value="Approved">Εγκρίθηκε</MenuItem>
                  <MenuItem value="Declined">Απορρίφθηκε</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Reason */}
          <Grid item size={12}>
            <TextField
              fullWidth
              name="reason"
              label="Αιτιολογία"
              multiline
              rows={3}
              value={formData.reason}
              onChange={handleChange}
              disabled={isReadOnly}
              placeholder="Προαιρετική αιτιολογία για το αίτημα άδειας..."
            />
          </Grid>

          {/* Form Actions */}
          <Grid item size={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={handleBack} disabled={saving}>
                Άκυρο
              </Button>
              {!isReadOnly && (
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving}>
                  {saving ? 'Αποθήκευση...' : isEdit ? 'Ενημέρωση Αιτήματος' : 'Δημιουργία Αιτήματος'}
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </MainCard>
  );
};

export default LeaveRequestForm;

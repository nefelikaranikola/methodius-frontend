import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

const EventForm = ({
  open = false,
  onClose = () => {},
  onSave = () => {},
  event = null,
  employees = [],
  loading = false,
  error = null
}) => {
  const isEdit = Boolean(event);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'Meeting',
    startDate: '',
    endDate: '',
    isAllDay: false,
    employee: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        eventType: event.eventType || 'Meeting',
        startDate: event.startDate ? event.startDate.split('T')[0] : '',
        endDate: event.endDate ? event.endDate.split('T')[0] : '',
        isAllDay: event.isAllDay || false,
        employee: event.employee?.documentId || ''
      });
    } else {
      // Reset form for new event
      setFormData({
        title: '',
        description: '',
        eventType: 'Meeting',
        startDate: '',
        endDate: '',
        isAllDay: false,
        employee: ''
      });
    }
    setErrors({});
  }, [event, open]);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Ο τίτλος είναι υποχρεωτικός';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Η ημερομηνία έναρξης είναι υποχρεωτική';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Η ημερομηνία λήξης είναι υποχρεωτική';
    }

    // Validate date range
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start > end) {
        newErrors.endDate = 'Η ημερομηνία λήξης πρέπει να είναι μετά την ημερομηνία έναρξης';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const eventData = {
      ...formData,
      employee: formData.employee || null
    };

    onSave(eventData);
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      eventType: 'Meeting',
      startDate: '',
      endDate: '',
      isAllDay: false,
      employee: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? 'Επεξεργασία Εκδήλωσης' : 'Δημιουργία Νέας Εκδήλωσης'}</DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Title */}
          <Grid size={12}>
            <TextField
              fullWidth
              label="Τίτλος Εκδήλωσης"
              value={formData.title}
              onChange={handleChange('title')}
              error={!!errors.title}
              helperText={errors.title}
              required
            />
          </Grid>

          {/* Event Type */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Τύπος Εκδήλωσης *</InputLabel>
              <Select value={formData.eventType} onChange={handleChange('eventType')} label="Τύπος Εκδήλωσης *">
                <MenuItem value="Meeting">Συνάντηση</MenuItem>
                <MenuItem value="Deadline">Προθεσμία</MenuItem>
                <MenuItem value="Holiday">Αργία</MenuItem>
                <MenuItem value="Other">Άλλο</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Employee (optional) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Υπάλληλος (Προαιρετικό)</InputLabel>
              <Select value={formData.employee} onChange={handleChange('employee')} label="Υπάλληλος (Προαιρετικό)">
                <MenuItem value="">
                  <em>Εκδήλωση όλης της εταιρείας</em>
                </MenuItem>
                {employees.map((emp) => (
                  <MenuItem key={emp.documentId} value={emp.documentId}>
                    {emp.firstName} {emp.lastName} - {emp.position}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Start Date */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Ημερομηνία Έναρξης"
              type="date"
              value={formData.startDate}
              onChange={handleChange('startDate')}
              InputLabelProps={{ shrink: true }}
              error={!!errors.startDate}
              helperText={errors.startDate}
              required
            />
          </Grid>

          {/* End Date */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Ημερομηνία Λήξης"
              type="date"
              value={formData.endDate}
              onChange={handleChange('endDate')}
              InputLabelProps={{ shrink: true }}
              error={!!errors.endDate}
              helperText={errors.endDate}
              required
            />
          </Grid>

          {/* All Day */}
          <Grid size={12}>
            <FormControlLabel
              control={<Checkbox checked={formData.isAllDay} onChange={handleChange('isAllDay')} />}
              label="Εκδήλωση όλης της ημέρας"
            />
          </Grid>

          {/* Description */}
          <Grid size={12}>
            <TextField
              fullWidth
              label="Περιγραφή"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange('description')}
              placeholder="Προαιρετική περιγραφή..."
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Άκυρο
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
          disabled={loading}
        >
          {loading ? 'Αποθήκευση...' : isEdit ? 'Ενημέρωση Εκδήλωσης' : 'Δημιουργία Εκδήλωσης'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

EventForm.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  event: PropTypes.object,
  employees: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.string
};

export default EventForm;

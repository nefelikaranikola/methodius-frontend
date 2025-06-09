import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

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
  CircularProgress,
  Paper,
  Link
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon, Upload as UploadIcon, Description as FileIcon } from '@mui/icons-material';

// project imports
import MainCard from 'components/MainCard';
import { fetchEmployees, uploadMedia } from 'api/employees';
import { createContract, updateContract, fetchContractById } from 'api/contracts';
import { useAuth } from 'context/AuthContext';
import { config } from 'utils/config';

const CONTRACT_STATUSES = ['Active', 'Terminated', 'Pending'];

const ContractForm = () => {
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);
  const isReadOnly = new URLSearchParams(location.search).get('view') === '1';

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employee: '',
    title: 'Employment Contract',
    grossSalary: '',
    netSalary: '',
    contractStatus: 'Pending',
    notes: '',
    file: null
  });
  const [errors, setErrors] = useState({});
  const [currentFileUrl, setCurrentFileUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadEmployees();
    if (isEdit) {
      loadContract();
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

  const loadContract = async () => {
    try {
      setLoading(true);
      const data = await fetchContractById(token, id);
      setFormData({
        employee: data.employee?.documentId || '',
        title: data.title || 'Employment Contract',
        grossSalary: data.grossSalary || '',
        netSalary: data.netSalary || '',
        contractStatus: data.contractStatus || 'Pending',
        notes: data.notes || '',
        file: null
      });

      if (data.file) {
        setCurrentFileUrl(config.API_URL.replace(/\/api\/?$/, '') + (data.file.url.startsWith('/') ? data.file.url : '/' + data.file.url));
      }
    } catch (error) {
      setError('Αποτυχία φόρτωσης συμβολαίου');
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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFormData((prev) => ({
        ...prev,
        file: file
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.employee) {
      newErrors.employee = 'Ο υπάλληλος είναι υποχρεωτικός';
    }
    if (!formData.title) {
      newErrors.title = 'Ο τίτλος είναι υποχρεωτικός';
    }
    if (!formData.grossSalary) {
      newErrors.grossSalary = 'Ο μικτός μισθός είναι υποχρεωτικός';
    }
    if (!formData.netSalary) {
      newErrors.netSalary = 'Ο καθαρός μισθός είναι υποχρεωτικός';
    }

    // Validate salary amounts
    if (formData.grossSalary && (isNaN(formData.grossSalary) || parseFloat(formData.grossSalary) <= 0)) {
      newErrors.grossSalary = 'Ο μικτός μισθός πρέπει να είναι θετικός αριθμός';
    }
    if (formData.netSalary && (isNaN(formData.netSalary) || parseFloat(formData.netSalary) <= 0)) {
      newErrors.netSalary = 'Ο καθαρός μισθός πρέπει να είναι θετικός αριθμός';
    }

    // Validate that net salary is not greater than gross salary
    if (formData.grossSalary && formData.netSalary) {
      const gross = parseFloat(formData.grossSalary);
      const net = parseFloat(formData.netSalary);
      if (net > gross) {
        newErrors.netSalary = 'Ο καθαρός μισθός δεν μπορεί να είναι μεγαλύτερος από τον μικτό μισθό';
      }
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

      let fileId = null;

      // Upload file if selected
      if (formData.file) {
        const uploadForm = new FormData();
        uploadForm.append('files', formData.file, formData.file.name);
        const uploaded = await uploadMedia(uploadForm);
        fileId = uploaded[0]?.id;
      }

      const submitData = {
        employee: formData.employee,
        title: formData.title,
        grossSalary: parseFloat(formData.grossSalary),
        netSalary: parseFloat(formData.netSalary),
        contractStatus: formData.contractStatus,
        notes: formData.notes,
        ...(fileId && { file: fileId })
      };

      if (isEdit) {
        await updateContract(token, id, submitData);
      } else {
        await createContract(token, submitData);
      }

      navigate('/management/contracts');
    } catch (error) {
      console.error('Failed to save contract', error);
      setError(error.message || 'Αποτυχία αποθήκευσης συμβολαίου');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/management/contracts');
  };

  if (loading) {
    return (
      <MainCard title={isEdit ? (isReadOnly ? 'Προβολή Συμβολαίου' : 'Επεξεργασία Συμβολαίου') : 'Προσθήκη Νέου Συμβολαίου'}>
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard
      title={isEdit ? (isReadOnly ? 'Προβολή Συμβολαίου' : 'Επεξεργασία Συμβολαίου') : 'Προσθήκη Νέου Συμβολαίου'}
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
              <Select name="employee" value={formData.employee} onChange={handleChange} label="Υπάλληλος *" disabled={isReadOnly}>
                {employees.map((emp) => (
                  <MenuItem key={emp.documentId || emp.id} value={emp.documentId || emp.id}>
                    {emp.firstName} {emp.lastName}
                  </MenuItem>
                ))}
              </Select>
              {errors.employee && <FormHelperText>{errors.employee}</FormHelperText>}
            </FormControl>
          </Grid>

          {/* Contract Title */}
          <Grid item size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              name="title"
              label="Τίτλος Συμβολαίου"
              value={formData.title}
              onChange={handleChange}
              required
              error={!!errors.title}
              helperText={errors.title}
              disabled={isReadOnly}
            />
          </Grid>

          {/* Gross Salary */}
          <Grid item size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              name="grossSalary"
              label="Μικτός Μισθός (€)"
              type="number"
              value={formData.grossSalary}
              onChange={handleChange}
              inputProps={{ min: 0, step: 0.01 }}
              required
              error={!!errors.grossSalary}
              helperText={errors.grossSalary}
              disabled={isReadOnly}
            />
          </Grid>

          {/* Net Salary */}
          <Grid item size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              name="netSalary"
              label="Καθαρός Μισθός (€)"
              type="number"
              value={formData.netSalary}
              onChange={handleChange}
              inputProps={{ min: 0, step: 0.01 }}
              required
              error={!!errors.netSalary}
              helperText={errors.netSalary}
              disabled={isReadOnly}
            />
          </Grid>

          {/* Contract Status */}
          <Grid item size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Κατάσταση</InputLabel>
              <Select name="contractStatus" value={formData.contractStatus} onChange={handleChange} label="Κατάσταση" disabled={isReadOnly}>
                {CONTRACT_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status === 'Active' ? 'Ενεργό' : status === 'Terminated' ? 'Τερματισμένο' : status === 'Pending' ? 'Εκκρεμεί' : status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* File Upload */}
          <Grid item size={{ xs: 12, md: 6 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Αρχείο Συμβολαίου (PDF)
              </Typography>
              {!isReadOnly && (
                <Button variant="outlined" component="label" startIcon={<UploadIcon />} sx={{ mb: 1 }}>
                  {selectedFile ? selectedFile.name : 'Επιλογή Αρχείου'}
                  <input type="file" accept="application/pdf" onChange={handleFileChange} hidden />
                </Button>
              )}
              {currentFileUrl && (
                <Box mt={1}>
                  <Link
                    href={currentFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    <FileIcon fontSize="small" />
                    Προβολή Τρέχοντος Αρχείου
                  </Link>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Notes */}
          <Grid item size={12}>
            <TextField
              fullWidth
              name="notes"
              label="Σημειώσεις"
              multiline
              rows={4}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Επιπλέον σημειώσεις για το συμβόλαιο..."
              disabled={isReadOnly}
            />
          </Grid>

          {/* Form Actions */}
          {!isReadOnly && (
            <Grid item size={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={handleBack} disabled={saving}>
                  Άκυρο
                </Button>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving}>
                  {saving ? 'Αποθήκευση...' : isEdit ? 'Ενημέρωση Συμβολαίου' : 'Δημιουργία Συμβολαίου'}
                </Button>
              </Stack>
            </Grid>
          )}
        </Grid>
      </Box>
    </MainCard>
  );
};

export default ContractForm;

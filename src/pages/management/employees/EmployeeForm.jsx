import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

// Material UI components
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  Avatar,
  IconButton,
  InputLabel,
  FormControl,
  Select,
  FormHelperText,
  Checkbox,
  FormControlLabel
} from '@mui/material';

// Material UI Icons
import { ArrowBack, Save, PhotoCamera, Person } from '@mui/icons-material';

// Project imports
import { useAuth } from 'context/AuthContext';
import { fetchEmployee, createEmployee, updateEmployee, uploadMedia, createEmployeeAccount, updateEmployeeAccount } from 'api/employees';

const EMPLOYMENT_STATUSES = ['Full-Time', 'Part-Time', 'Intern', 'Contractor'];

// Validation Schema matching the original structure
const employeeSchema = Yup.object().shape({
  firstName: Yup.string().required('Το όνομα είναι υποχρεωτικό').min(2, 'Πολύ σύντομο'),
  lastName: Yup.string().required('Το επώνυμο είναι υποχρεωτικό').min(2, 'Πολύ σύντομο'),
  email: Yup.string().email('Μη έγκυρο email'), // Email is optional
  password: Yup.string().min(6, 'Ο κωδικός είναι πολύ σύντομος'), // Password is optional
  phoneNumber: Yup.string(),
  position: Yup.string(),
  department: Yup.string(),
  dateOfJoining: Yup.date().required('Η ημερομηνία πρόσληψης είναι υποχρεωτική'),
  dateOfBirth: Yup.date().required('Η ημερομηνία γέννησης είναι υποχρεωτική'), // dateOfBirth is required in Strapi
  address: Yup.string(),
  employmentStatus: Yup.string().oneOf(EMPLOYMENT_STATUSES, 'Μη έγκυρη κατάσταση απασχόλησης'),
  bio: Yup.string()
});

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [initialValues, setInitialValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    position: '',
    department: '',
    dateOfJoining: '',
    dateOfBirth: '',
    address: '',
    employmentStatus: 'Full-Time',
    bio: '',
    picture: null
  });
  const [pictureFile, setPictureFile] = useState(null);
  const [picturePreview, setPicturePreview] = useState(null);
  const [currentEmployeeAccount, setCurrentEmployeeAccount] = useState(false);

  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing) {
      loadEmployee();
    }
  }, [id]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const employee = await fetchEmployee(id, token);

      setInitialValues({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.user?.email || '',
        password: '', // Don't populate password for security
        phoneNumber: employee.phoneNumber || '',
        position: employee.position || '',
        department: employee.department || '',
        dateOfJoining: employee.dateOfJoining ? employee.dateOfJoining.split('T')[0] : '',
        dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : '',
        address: employee.address || '',
        employmentStatus: employee.employmentStatus || 'Full-Time',
        bio: employee.bio || '',
        picture: employee.picture?.id || null
      });

      if (employee.picture?.url) {
        setPicturePreview(`http://localhost:1337${employee.picture.url}`);
      }

      if (employee.user?.id) {
        setCurrentEmployeeAccount(employee.user?.id);
      }

      setError('');
    } catch (error) {
      console.error('Failed to load employee:', error);
      setError('Αποτυχία φόρτωσης δεδομένων υπαλλήλου. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setLoading(false);
    }
  };

  const handlePictureChange = (event) => {
    const file = event.target.files[0];
    console.log('File selected:', file);
    if (file) {
      setPictureFile(file);
      console.log('Picture file set:', file.name, 'Size:', file.size);
      const reader = new FileReader();
      reader.onload = (e) => setPicturePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      let pictureId = values.picture;

      // Upload picture if changed - using the original CoreUI approach
      console.log('Checking for picture file:', pictureFile);
      if (pictureFile) {
        try {
          console.log('Uploading picture...', pictureFile.name, pictureFile.size);
          const uploadFormMedia = new FormData();
          uploadFormMedia.append('files', pictureFile, pictureFile.name);

          console.log('FormData created, calling uploadMedia...');
          const uploadedData = await uploadMedia(uploadFormMedia);
          console.log('Picture uploaded successfully:', uploadedData);

          pictureId = uploadedData[0]?.id;
          console.log('Picture ID set to:', pictureId);
        } catch (uploadError) {
          console.error('Picture upload failed:', uploadError);
          // Continue without picture if upload fails
        }
      } else {
        console.log('No picture file to upload');
      }

      // Prepare employee data exactly matching the original implementation
      const employeeData = {
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        position: values.position,
        department: values.department,
        dateOfJoining: values.dateOfJoining,
        dateOfBirth: values.dateOfBirth,
        address: values.address,
        employmentStatus: values.employmentStatus,
        bio: values.bio,
        picture: pictureId || undefined
      };

      if (isEditing) {
        // Update existing employee
        await updateEmployee(id, employeeData, token);

        // Handle user account creation/update for existing employee
        if (!currentEmployeeAccount && values.email && values.password) {
          console.log('Creating employee account...');
          const { user: createdEmployeeAccount } = await createEmployeeAccount(token, {
            username: values.email,
            email: values.email,
            password: values.password
          });
          console.log('Employee account created', createdEmployeeAccount);

          if (createdEmployeeAccount) {
            console.log('Updating employee with user connection...');
            await updateEmployee(
              id,
              {
                user: {
                  connect: [createdEmployeeAccount.documentId]
                }
              },
              token
            );
            console.log('Employee updated with user connection');
          }
        } else if (currentEmployeeAccount && values.password) {
          console.log('Updating employee account...');
          await updateEmployeeAccount(token, currentEmployeeAccount, {
            password: values.password
          });
          console.log('Employee account updated');
        }

        setSuccess('Employee updated successfully!');
      } else {
        // Create new employee
        console.log('Creating employee...');
        const createdEmployee = await createEmployee(employeeData, token);
        console.log('Employee created with documentId', createdEmployee.documentId);

        // Create user account if email and password provided
        if (values.email && values.password) {
          console.log('Creating employee account...');
          const { user: createdEmployeeAccount } = await createEmployeeAccount(token, {
            username: values.email,
            email: values.email,
            password: values.password
          });
          console.log('Employee account created', createdEmployeeAccount);

          if (createdEmployeeAccount) {
            console.log('Updating employee with user connection...');
            await updateEmployee(
              createdEmployee.documentId,
              {
                user: {
                  connect: [createdEmployeeAccount.documentId]
                }
              },
              token
            );
            console.log('Employee updated with user connection');
          }
        }

        setSuccess('Employee created successfully!');
        setTimeout(() => navigate('/management/employees'), 2000);
      }
    } catch (error) {
      console.error('Failed to save employee:', error);
      if (error.message.includes('email')) {
        setFieldError('email', 'Αυτό το email χρησιμοποιείται ήδη');
      } else {
        setError(error.message || 'Αποτυχία αποθήκευσης υπαλλήλου. Παρακαλώ δοκιμάστε ξανά.');
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  if (loading && isEditing && !initialValues.firstName) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/management/employees')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          {isEditing ? 'Επεξεργασία Υπαλλήλου' : 'Προσθήκη Νέου Υπαλλήλου'}
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Form */}
      <Card>
        <CardContent>
          <Formik initialValues={initialValues} validationSchema={employeeSchema} enableReinitialize onSubmit={handleSubmit}>
            {({ errors, touched, isSubmitting, values, setFieldValue }) => (
              <Form>
                <Grid container spacing={3}>
                  {/* Picture Upload Section */}
                  <Grid item size={12}>
                    <Box display="flex" justifyContent="center" mb={3}>
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <Avatar src={picturePreview} sx={{ width: 120, height: 120, mb: 2 }}>
                          <Person style={{ fontSize: '48px' }} />
                        </Avatar>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePictureChange}
                          style={{ display: 'none' }}
                          id="picture-upload"
                        />
                        <label htmlFor="picture-upload">
                          <Button variant="outlined" component="span" startIcon={<PhotoCamera />} size="small">
                            {picturePreview ? 'Change Picture' : 'Upload Picture'}
                          </Button>
                        </label>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Personal Information Section */}
                  <Grid item size={12}>
                    <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #e0e0e0', pb: 1, mb: 2 }}>
                      Προσωπικές Πληροφορίες
                    </Typography>
                  </Grid>

                  <Grid item size={{ xs: 12, sm: 6 }}>
                    <Field name="firstName">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Όνομα *"
                          fullWidth
                          error={touched.firstName && !!errors.firstName}
                          helperText={touched.firstName && errors.firstName}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item size={{ xs: 12, sm: 6 }}>
                    <Field name="lastName">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Επώνυμο *"
                          fullWidth
                          error={touched.lastName && !!errors.lastName}
                          helperText={touched.lastName && errors.lastName}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item size={{ xs: 12, sm: 6 }}>
                    <Field name="phoneNumber">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Τηλέφωνο"
                          fullWidth
                          error={touched.phoneNumber && !!errors.phoneNumber}
                          helperText={touched.phoneNumber && errors.phoneNumber}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item size={{ xs: 12, sm: 6 }}>
                    <Field name="dateOfBirth">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Ημερομηνία Γέννησης *"
                          type="date"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          error={touched.dateOfBirth && !!errors.dateOfBirth}
                          helperText={touched.dateOfBirth && errors.dateOfBirth}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item size={12}>
                    <Field name="address">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Διεύθυνση"
                          fullWidth
                          multiline
                          rows={2}
                          error={touched.address && !!errors.address}
                          helperText={touched.address && errors.address}
                        />
                      )}
                    </Field>
                  </Grid>

                  {/* Employment Information Section */}
                  <Grid item size={12}>
                    <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #e0e0e0', pb: 1, mb: 2, mt: 3 }}>
                      Πληροφορίες Εργασίας
                    </Typography>
                  </Grid>

                  <Grid item size={{ xs: 12, sm: 6 }}>
                    <Field name="position">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Θέση"
                          fullWidth
                          error={touched.position && !!errors.position}
                          helperText={touched.position && errors.position}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item size={{ xs: 12, sm: 6 }}>
                    <Field name="department">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Τμήμα"
                          fullWidth
                          error={touched.department && !!errors.department}
                          helperText={touched.department && errors.department}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item size={{ xs: 12, sm: 6 }}>
                    <Field name="dateOfJoining">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Ημερομηνία Πρόσληψης *"
                          type="date"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          error={touched.dateOfJoining && !!errors.dateOfJoining}
                          helperText={touched.dateOfJoining && errors.dateOfJoining}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth error={touched.employmentStatus && !!errors.employmentStatus}>
                      <InputLabel>Κατάσταση Απασχόλησης *</InputLabel>
                      <Field name="employmentStatus">
                        {({ field }) => (
                          <Select {...field} label="Κατάσταση Απασχόλησης *">
                            {EMPLOYMENT_STATUSES.map((status) => (
                              <MenuItem key={status} value={status}>
                                {status === 'Full-Time'
                                  ? 'Πλήρης Απασχόληση'
                                  : status === 'Part-Time'
                                    ? 'Μερική Απασχόληση'
                                    : status === 'Intern'
                                      ? 'Ασκούμενος'
                                      : status === 'Contractor'
                                        ? 'Εργολάβος'
                                        : status}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      </Field>
                      {touched.employmentStatus && errors.employmentStatus && <FormHelperText>{errors.employmentStatus}</FormHelperText>}
                    </FormControl>
                  </Grid>

                  <Grid item size={12}>
                    <Field name="bio">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Βιογραφικό"
                          fullWidth
                          multiline
                          rows={3}
                          error={touched.bio && !!errors.bio}
                          helperText={touched.bio && errors.bio}
                        />
                      )}
                    </Field>
                  </Grid>

                  {/* Employee Credentials Section */}
                  <Grid item size={12}>
                    <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #e0e0e0', pb: 1, mb: 2, mt: 3 }}>
                      Διαπιστευτήρια Υπαλλήλου (Προαιρετικό)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Συμπληρώστε email και κωδικό μόνο αν θέλετε να δημιουργήσετε λογαριασμό σύνδεσης για αυτόν τον υπάλληλο.
                    </Typography>
                  </Grid>

                  <Grid item size={{ xs: 12, sm: 6 }}>
                    <Field name="email">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Email (Προαιρετικό)"
                          type="email"
                          fullWidth
                          disabled={isEditing && currentEmployeeAccount}
                          error={touched.email && !!errors.email}
                          helperText={(touched.email && errors.email) || 'Χρειάζεται μόνο αν θέλετε να δημιουργήσετε λογαριασμό σύνδεσης'}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item size={{ xs: 12, sm: 6 }}>
                    <Field name="password">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label={isEditing && currentEmployeeAccount ? 'Αλλαγή Κωδικού (Προαιρετικό)' : 'Κωδικός (Προαιρετικό)'}
                          type="password"
                          fullWidth
                          placeholder={isEditing && currentEmployeeAccount ? '******' : ''}
                          error={touched.password && !!errors.password}
                          helperText={
                            (touched.password && errors.password) || 'Χρειάζεται μόνο αν θέλετε να δημιουργήσετε λογαριασμό σύνδεσης'
                          }
                        />
                      )}
                    </Field>
                  </Grid>

                  {/* Action Buttons */}
                  <Grid item size={12}>
                    <Box display="flex" justifyContent="flex-end" gap={2} mt={4} pt={3} borderTop="1px solid #e0e0e0">
                      <Button
                        variant="outlined"
                        onClick={() => navigate('/management/employees')}
                        disabled={isSubmitting || loading}
                        size="large"
                      >
                        Άκυρο
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                        disabled={isSubmitting || loading}
                        size="large"
                      >
                        {isEditing ? 'Ενημέρωση' : 'Δημιουργία'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployeeForm;

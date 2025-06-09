import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// material-ui
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';
import AnimateButton from 'components/@extended/AnimateButton';
import { useAuth } from 'context/AuthContext';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';

export default function AuthLogin({ isDemo = false }) {
  const [checked, setChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (values, { setErrors, setStatus, setSubmitting }) => {
    try {
      setLoading(true);
      setError('');
      setStatus();
      setErrors({});

      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:1337'}/api/auth/local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: values.email,
          password: values.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        login(data.jwt, data.user);
        navigate('/dashboard');
      } else {
        setError(data.error?.message || 'Η σύνδεση απέτυχε. Παρακαλώ ελέγξτε τα διαπιστευτήριά σας.');
        setStatus({ success: false });
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Προέκυψε σφάλμα. Παρακαλώ δοκιμάστε ξανά.');
      setStatus({ success: false });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Πρέπει να είναι έγκυρο email').max(255).required('Το email είναι υποχρεωτικό'),
    password: Yup.string().required('Ο κωδικός είναι υποχρεωτικός')
  });

  return (
    <Formik
      initialValues={{
        email: '',
        password: ''
      }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form noValidate>
          {error && (
            <Grid size={12} sx={{ mb: 2 }}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          <Grid container spacing={3}>
            <Grid size={12}>
              <Stack sx={{ gap: 1 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Διεύθυνση Email
                </Typography>
                <Field name="email">
                  {({ field, meta }) => (
                    <TextField
                      {...field}
                      fullWidth
                      placeholder="Εισάγετε διεύθυνση email"
                      error={meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      disabled={isSubmitting || loading}
                      type="email"
                    />
                  )}
                </Field>
              </Stack>
            </Grid>

            <Grid size={12}>
              <Stack sx={{ gap: 1 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Κωδικός
                </Typography>
                <Field name="password">
                  {({ field, meta }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Εισάγετε κωδικό"
                      error={meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      disabled={isSubmitting || loading}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="εναλλαγή ορατότητας κωδικού"
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                              disabled={isSubmitting || loading}
                            >
                              {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                </Field>
              </Stack>
            </Grid>

            <Grid sx={{ mt: -1 }} size={12}>
              <Stack direction="row" sx={{ gap: 2, alignItems: 'baseline', justifyContent: 'space-between' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={checked}
                      onChange={(event) => setChecked(event.target.checked)}
                      name="checked"
                      color="primary"
                      size="small"
                      disabled={isSubmitting || loading}
                    />
                  }
                  label={<Typography variant="h6">Διατήρηση σύνδεσης</Typography>}
                />
                <Link variant="h6" component={RouterLink} to="#" color="text.primary">
                  Ξεχάσατε τον κωδικό;
                </Link>
              </Stack>
            </Grid>

            <Grid size={12}>
              <AnimateButton>
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isSubmitting || loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Σύνδεση...' : 'Σύνδεση'}
                </Button>
              </AnimateButton>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
}

AuthLogin.propTypes = { isDemo: PropTypes.bool };

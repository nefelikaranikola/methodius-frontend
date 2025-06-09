import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { fetchContracts } from 'api/contracts';
import { useAuth } from 'context/AuthContext';

const Payroll = () => {
  const { token, employee } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!employee) {
      loadContracts();
    }
  }, [employee]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const data = await fetchContracts(token);
      setContracts(data.data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate payroll date (25th of month, adjusted for weekends)
  const getPayrollDate = (year, month) => {
    let date = new Date(year, month, 25);
    let day = date.getDay();
    if (day === 6) {
      // Saturday
      date.setDate(24);
    } else if (day === 0) {
      // Sunday
      date.setDate(26);
      if (date.getDay() === 0) date.setDate(27); // If still Sunday, set to 27
    }
    return date.toLocaleDateString('en-GB');
  };

  // If user is an employee, show access denied
  if (employee) {
    return (
      <MainCard title="Μισθοδοσία">
        <Alert severity="warning">Δεν έχετε πρόσβαση σε αυτήν τη σελίδα.</Alert>
      </MainCard>
    );
  }

  if (loading) {
    return (
      <MainCard title="Στατιστικά Μισθοδοσίας">
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  if (error) {
    return (
      <MainCard title="Στατιστικά Μισθοδοσίας">
        <Alert severity="error">{error}</Alert>
      </MainCard>
    );
  }

  // Calculate payroll statistics
  const now = new Date();
  const year = 2025;
  const month = 4; // May (0-based)
  const contractsForMonth = contracts.filter(() => true); // All contracts for demo

  const totalGross = contractsForMonth.reduce((sum, c) => sum + (parseFloat(c.grossSalary) || 0), 0);
  const totalNet = contractsForMonth.reduce((sum, c) => sum + (parseFloat(c.netSalary) || 0), 0);
  const totalTaxes = totalGross - totalNet;
  const payrollDate = getPayrollDate(year, month);

  const formatCurrency = (amount) => {
    return `€${amount.toLocaleString()}`;
  };

  return (
    <MainCard title="Στατιστικά Μισθοδοσίας — Μάιος 2025">
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ height: '100%', bgcolor: 'success.lighter' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Καθαρός Μισθός Υπαλλήλων
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {formatCurrency(totalNet)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ height: '100%', bgcolor: 'primary.lighter' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Μικτός Μισθός
                </Typography>
              </Box>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {formatCurrency(totalGross)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ height: '100%', bgcolor: 'error.lighter' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <ReceiptIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Φόροι προς Πληρωμή
                </Typography>
              </Box>
              <Typography variant="h4" color="error.main" fontWeight="bold">
                {formatCurrency(totalTaxes)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ height: '100%', bgcolor: 'grey.100' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <CalendarIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Ημερομηνία Πληρωμής
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {payrollDate}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Employee Breakdown */}
        <Grid size={12}>
          <Box mt={2}>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Ανάλυση Μισθοδοσίας Υπαλλήλων
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Υπάλληλος</TableCell>
                    <TableCell align="right">Μικτός Μισθός</TableCell>
                    <TableCell align="right">Καθαρός Μισθός</TableCell>
                    <TableCell align="right">Φόροι</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contractsForMonth.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body1" color="text.secondary" py={3}>
                          Δεν βρέθηκαν συμβόλαια για αυτήν την περίοδο
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    contractsForMonth.map((contract) => {
                      const gross = parseFloat(contract.grossSalary || 0);
                      const net = parseFloat(contract.netSalary || 0);
                      const taxes = gross - net;

                      return (
                        <TableRow key={contract.documentId || contract.id} hover>
                          <TableCell>{contract.employee ? `${contract.employee.firstName} ${contract.employee.lastName}` : '-'}</TableCell>
                          <TableCell align="right">{formatCurrency(gross)}</TableCell>
                          <TableCell align="right">{formatCurrency(net)}</TableCell>
                          <TableCell align="right">
                            <Typography color="error.main">{formatCurrency(taxes)}</Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default Payroll;

import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Grid, Typography, Alert, CircularProgress } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import MainCard from 'components/MainCard';
import DashboardCard from 'components/cards/statistics/DashboardCard';
import EmployeeStatsChart from 'sections/analytics/EmployeeStatsChart';
import LeaveRequestsChart from 'sections/analytics/LeaveRequestsChart';
import PayrollTimelineChart from 'sections/analytics/PayrollTimelineChart';
import { fetchEmployees } from 'api/employees';
import { fetchLeaveRequests } from 'api/leaveRequests';
import { fetchContracts } from 'api/contracts';
import { useAuth } from 'context/AuthContext';

const Analytics = () => {
  const { token, employee } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!employee) {
      loadAllData();
    }
  }, [employee]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [employeesData, leaveRequestsData, contractsData] = await Promise.all([
        fetchEmployees(token),
        fetchLeaveRequests(token),
        fetchContracts(token)
      ]);

      setEmployees(employeesData.data || []);
      setLeaveRequests(leaveRequestsData.data || []);
      setContracts(contractsData.data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // If user is an employee, show access denied
  if (employee) {
    return (
      <MainCard title="Αναλυτικά">
        <Alert severity="warning">Δεν έχετε πρόσβαση σε αυτήν τη σελίδα.</Alert>
      </MainCard>
    );
  }

  if (loading) {
    return (
      <MainCard title="Σύστημα Αναλυτικών">
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  if (error) {
    return (
      <MainCard title="Σύστημα Αναλυτικών">
        <Alert severity="error">{error}</Alert>
      </MainCard>
    );
  }

  // Calculate statistics
  const totalEmployees = employees.length;
  const totalLeaveRequests = leaveRequests.length;
  const pendingRequests = leaveRequests.filter((req) => req.leaveStatus?.toLowerCase() === 'pending').length;
  const totalContracts = contracts.length;

  return (
    <MainCard title="Σύστημα Αναλυτικών">
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <DashboardCard title="Σύνολο Υπαλλήλων" count={totalEmployees.toString()} color="primary" extra="Ενεργό Προσωπικό" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <DashboardCard title="Αιτήματα Άδειας" count={totalLeaveRequests.toString()} color="info" extra="Συνολικά" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <DashboardCard title="Εκκρεμή Αιτήματα" count={pendingRequests.toString()} color="warning" extra="Αναμένουν Έγκριση" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <DashboardCard title="Ενεργά Συμβόλαια" count={totalContracts.toString()} color="success" extra="Τρέχοντα" />
        </Grid>

        {/* Charts */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Υπάλληλοι ανά Θέση</Typography>
              </Box>
              <EmployeeStatsChart employees={employees} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AssignmentIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Κατάσταση Αιτημάτων Άδειας</Typography>
              </Box>
              <LeaveRequestsChart leaveRequests={leaveRequests} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TimelineIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Τάσεις Μισθοδοσίας (Τελευταίοι 6 Μήνες)</Typography>
              </Box>
              <PayrollTimelineChart contracts={contracts} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default Analytics;

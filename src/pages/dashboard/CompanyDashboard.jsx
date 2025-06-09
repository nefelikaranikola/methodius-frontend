import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  Alert,
  Stack
} from '@mui/material';
import MainCard from 'components/MainCard';
import DashboardCard from 'components/cards/statistics/DashboardCard';
import { useAuth } from 'context/AuthContext';
import { fetchEmployees } from 'api/employees';
import TeamOutlined from '@ant-design/icons/TeamOutlined';
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const { token, user, employee } = useAuth();

  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    newEmployeesThisMonth: 0
  });

  const [recentEmployees, setRecentEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load employees
      const employeesResponse = await fetchEmployees(token);
      const employees = employeesResponse.data || [];

      // Calculate stats
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      const newEmployeesThisMonth = employees.filter((emp) => {
        if (!emp.dateOfJoining) return false;
        const joinDate = new Date(emp.dateOfJoining);
        return joinDate.getMonth() === thisMonth && joinDate.getFullYear() === thisYear;
      }).length;

      const activeEmployees = employees.filter((emp) => emp.employmentStatus && emp.employmentStatus !== 'Terminated').length;

      setStats({
        totalEmployees: employees.length,
        activeEmployees,
        newEmployeesThisMonth
      });

      // Set recent employees (last 5)
      const sortedEmployees = employees
        .filter((emp) => emp.dateOfJoining)
        .sort((a, b) => new Date(b.dateOfJoining) - new Date(a.dateOfJoining))
        .slice(0, 5);
      setRecentEmployees(sortedEmployees);

      setError('');
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Αποτυχία φόρτωσης δεδομένων. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Δ/Υ';
    return new Date(dateString).toLocaleDateString('el-GR');
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Δ/Υ';
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* Header */}
      <Grid size={12}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Καλώς ήρθατε, {employee ? `${employee.firstName} ${employee.lastName}` : user?.username}!</Typography>
          <Typography variant="body2" color="text.secondary">
            Σύστημα Διαχείρισης Εταιρείας
          </Typography>
        </Box>
      </Grid>

      {error && (
        <Grid size={12}>
          <Alert severity="error">{error}</Alert>
        </Grid>
      )}

      {/* Statistics Row */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <DashboardCard
          title="Σύνολο Υπαλλήλων"
          count={stats.totalEmployees.toString()}
          percentage={stats.newEmployeesThisMonth > 0 ? 15.3 : null}
          extra={`${stats.newEmployeesThisMonth} νέοι αυτόν τον μήνα`}
          color="primary"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <DashboardCard
          title="Ενεργοί Υπάλληλοι"
          count={stats.activeEmployees.toString()}
          percentage={null}
          extra="Αυτή τη στιγμή εργάζονται"
          color="success"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <DashboardCard title="Κατάσταση Συστήματος" count="100%" percentage={null} extra="Όλα τα συστήματα λειτουργούν" color="success" />
      </Grid>

      {/* Quick Actions */}
      <Grid size={12}>
        <MainCard title="Γρήγορες Ενέργειες">
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button variant="contained" startIcon={<TeamOutlined />} onClick={() => navigate('/management/employees')}>
              Διαχείριση Υπαλλήλων
            </Button>
            <Button variant="outlined" startIcon={<CalendarOutlined />} onClick={() => navigate('/management/leave-requests')}>
              Αιτήματα Άδειας
            </Button>
            <Button variant="outlined" startIcon={<FileTextOutlined />} onClick={() => navigate('/management/contracts')}>
              Συμβόλαια
            </Button>
          </Stack>
        </MainCard>
      </Grid>

      {/* Recent Employees */}
      <Grid size={{ xs: 12, md: 6 }}>
        <MainCard title="Πρόσφατα Προσληφθέντες Υπάλληλοι">
          <List>
            {recentEmployees.length > 0 ? (
              recentEmployees.map((employee, index) => (
                <ListItem key={employee.documentId || index} divider={index < recentEmployees.length - 1}>
                  <ListItemAvatar>
                    <Avatar
                      src={employee.picture?.url ? `http://localhost:1337${employee.picture.url}` : null}
                      sx={{ bgcolor: 'primary.lighter', color: 'primary.main' }}
                    >
                      <UserOutlined />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${employee.firstName} ${employee.lastName}`}
                    secondary={`${employee.position || 'Υπάλληλος'} • Προσλήφθηκε: ${formatDate(employee.dateOfJoining)}`}
                  />
                  <Chip label={employee.employmentStatus || 'Πλήρης Απασχόληση'} size="small" variant="outlined" color="primary" />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="Δεν υπάρχουν πρόσφατοι υπάλληλοι" secondary="Δεν προσλήφθηκαν υπάλληλοι πρόσφατα" />
              </ListItem>
            )}
          </List>
        </MainCard>
      </Grid>

      {/* System Information */}
      <Grid size={{ xs: 12, md: 6 }}>
        <MainCard title="Πληροφορίες Συστήματος">
          <List>
            <ListItem divider>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'success.lighter', color: 'success.main' }}>
                  <TeamOutlined />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Διαχείριση Υπαλλήλων" secondary="Πλήρεις λειτουργίες διαθέσιμες" />
              <Chip label="Ενεργό" size="small" color="success" />
            </ListItem>
            <ListItem divider>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'info.lighter', color: 'info.main' }}>
                  <CalendarOutlined />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Διαχείριση Αδειών" secondary="Πλήρεις λειτουργίες διαθέσιμες" />
              <Chip label="Ενεργό" size="small" color="success" />
            </ListItem>
            <ListItem divider>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'warning.lighter', color: 'warning.main' }}>
                  <FileTextOutlined />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Διαχείριση Συμβολαίων" secondary="Πλήρεις λειτουργίες διαθέσιμες" />
              <Chip label="Ενεργό" size="small" color="success" />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'warning.lighter', color: 'warning.main' }}>
                  <FileTextOutlined />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Διαχείριση Μισθοδοσίας" secondary="Μόνο προβολή διαθέσιμη" />
              <Chip label="Ενεργό" size="small" color="warning" />
            </ListItem>
          </List>
        </MainCard>
      </Grid>
    </Grid>
  );
}

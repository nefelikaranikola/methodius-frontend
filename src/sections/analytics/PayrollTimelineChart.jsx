import { useTheme } from '@mui/material/styles';
import { BarChart } from '@mui/x-charts/BarChart';
import { Typography, Box } from '@mui/material';
import PropTypes from 'prop-types';

export default function PayrollTimelineChart({ contracts = [] }) {
  const theme = useTheme();

  // Calculate current total salaries from contracts
  const totalGross = contracts.reduce((sum, c) => sum + (parseFloat(c.grossSalary) || 0), 0);
  const totalNet = contracts.reduce((sum, c) => sum + (parseFloat(c.netSalary) || 0), 0);
  const totalTaxes = totalGross - totalNet;

  // Since we don't have historical payroll data, we'll show current data breakdown
  if (contracts.length === 0 || totalGross === 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={300}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Δεν υπάρχουν δεδομένα μισθοδοσίας
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Προσθέστε συμβόλαια υπαλλήλων για να δείτε στατιστικά μισθοδοσίας
        </Typography>
      </Box>
    );
  }

  // Create chart data for current payroll breakdown
  const chartData = [
    { category: 'Καθαρός Μισθός', amount: totalNet },
    { category: 'Φόροι', amount: totalTaxes }
  ];

  return (
    <Box>
      <Box mb={2} p={2} bgcolor="info.lighter" borderRadius={1}>
        <Typography variant="body2" color="info.main">
          <strong>Σημείωση:</strong> Αυτό το γράφημα δείχνει την ανάλυση τρέχουσας μισθοδοσίας. Για ιστορικές τάσεις, απαιτείται ενσωμάτωση
          με σύστημα αποθήκευσης ιστορικών δεδομένων μισθοδοσίας.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom textAlign="center">
          Ανάλυση Τρέχουσας Μηνιαίας Μισθοδοσίας
        </Typography>

        <BarChart
          dataset={chartData}
          xAxis={[
            {
              scaleType: 'band',
              dataKey: 'category',
              tickLabelStyle: { fontSize: 12, fill: theme.palette.text.secondary }
            }
          ]}
          yAxis={[
            {
              tickLabelStyle: { fontSize: 10, fill: theme.palette.text.secondary }
            }
          ]}
          series={[
            {
              dataKey: 'amount',
              label: 'Ποσό (€)'
            }
          ]}
          colors={[theme.palette.success.main, theme.palette.error.main]}
          height={250}
          margin={{ left: 80, right: 40, top: 40, bottom: 80 }}
          slotProps={{
            legend: { hidden: true }
          }}
        />

        <Box display="flex" justifyContent="center" gap={4} mt={2}>
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Σύνολο Μικτού Μισθού
            </Typography>
            <Typography variant="h6" color="primary.main" fontWeight="bold">
              €{totalGross.toLocaleString()}
            </Typography>
          </Box>

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Υπάλληλοι
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {contracts.length}
            </Typography>
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
          Βασισμένο σε {contracts.length} ενεργ{contracts.length === 1 ? 'ό' : 'ά'} συμβόλαι{contracts.length === 1 ? 'ο' : 'α'}
        </Typography>
      </Box>
    </Box>
  );
}

PayrollTimelineChart.propTypes = {
  contracts: PropTypes.array
};

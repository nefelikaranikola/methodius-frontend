import { useTheme } from '@mui/material/styles';
import { BarChart } from '@mui/x-charts/BarChart';
import PropTypes from 'prop-types';

export default function EmployeeStatsChart({ employees = [] }) {
  const theme = useTheme();
  const axisFonstyle = { fontSize: 10, fill: theme.palette.text.secondary };

  // Count employees by position
  const positionCounts = employees.reduce((acc, employee) => {
    const position = employee.position || 'Unspecified';
    acc[position] = (acc[position] || 0) + 1;
    return acc;
  }, {});

  const positions = Object.keys(positionCounts);
  const counts = Object.values(positionCounts);

  if (positions.length === 0) {
    return (
      <BarChart
        hideLegend
        height={300}
        series={[{ data: [0], label: 'Χωρίς Δεδομένα' }]}
        xAxis={[{ data: ['Χωρίς Δεδομένα'], scaleType: 'band', disableLine: true, disableTicks: true, tickLabelStyle: axisFonstyle }]}
        yAxis={[{ disableLine: true, disableTicks: true, tickLabelStyle: axisFonstyle }]}
        margin={{ left: 40, right: 20, top: 20, bottom: 40 }}
        colors={[theme.palette.grey[400]]}
      />
    );
  }

  return (
    <BarChart
      hideLegend
      height={300}
      series={[{ data: counts, label: 'Υπάλληλοι ανά Θέση' }]}
      xAxis={[
        {
          data: positions,
          scaleType: 'band',
          disableLine: true,
          disableTicks: true,
          tickLabelStyle: axisFonstyle
        }
      ]}
      yAxis={[
        {
          disableLine: true,
          disableTicks: true,
          tickLabelStyle: axisFonstyle
        }
      ]}
      slotProps={{ bar: { rx: 5, ry: 5 } }}
      axisHighlight={{ x: 'none' }}
      margin={{ left: 40, right: 20, top: 20, bottom: 40 }}
      colors={[theme.palette.primary.main]}
      sx={{ '& .MuiBarElement-root:hover': { opacity: 0.6 } }}
    />
  );
}

EmployeeStatsChart.propTypes = {
  employees: PropTypes.array
};

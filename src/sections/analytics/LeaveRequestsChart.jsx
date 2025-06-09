import { useTheme } from '@mui/material/styles';
import { PieChart } from '@mui/x-charts/PieChart';
import PropTypes from 'prop-types';

export default function LeaveRequestsChart({ leaveRequests = [] }) {
  const theme = useTheme();

  // Count leave requests by status
  const statusCounts = leaveRequests.reduce((acc, request) => {
    const status = request.leaveStatus || 'Pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(statusCounts).map(([status, count], index) => {
    const colors = {
      approved: theme.palette.success.main,
      Approved: theme.palette.success.main,
      pending: theme.palette.warning.main,
      Pending: theme.palette.warning.main,
      declined: theme.palette.error.main,
      Declined: theme.palette.error.main,
      rejected: theme.palette.error.main,
      Rejected: theme.palette.error.main
    };

    return {
      id: index,
      value: count,
      label: `${status} (${count})`,
      color: colors[status] || theme.palette.info.main
    };
  });

  if (data.length === 0) {
    return (
      <PieChart
        series={[
          {
            data: [{ id: 0, value: 1, label: 'Χωρίς Δεδομένα', color: theme.palette.grey[400] }],
            highlightScope: { faded: 'global', highlighted: 'item' }
          }
        ]}
        height={300}
        margin={{ top: 40, bottom: 40, left: 40, right: 40 }}
      />
    );
  }

  return (
    <PieChart
      series={[
        {
          data,
          highlightScope: { faded: 'global', highlighted: 'item' },
          faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' }
        }
      ]}
      height={300}
      margin={{ top: 40, bottom: 40, left: 40, right: 40 }}
    />
  );
}

LeaveRequestsChart.propTypes = {
  leaveRequests: PropTypes.array
};

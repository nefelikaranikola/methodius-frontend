import { Box } from '@mui/material';
import Profile from './Profile';

export default function HeaderContent() {
  return (
    <Box sx={{ width: '100%', ml: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Profile />
      </Box>
    </Box>
  );
}

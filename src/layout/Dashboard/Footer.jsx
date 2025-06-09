// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Footer() {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', p: '24px 16px 0px', mt: 'auto' }}>
      <Typography variant="caption">&copy; Nefeli Karanikola</Typography>
    </Stack>
  );
}

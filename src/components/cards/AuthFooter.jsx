import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

export default function AuthFooter() {
  return (
    <Container maxWidth="xl">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ gap: 2, justifyContent: { xs: 'center', sm: 'space-between', textAlign: { xs: 'center', sm: 'inherit' } } }}
      >
        <Typography variant="subtitle2" color="secondary">
          © Nefeli Karanikola
        </Typography>
      </Stack>
    </Container>
  );
}

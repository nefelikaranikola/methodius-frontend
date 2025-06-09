import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from 'assets/images/logo-dark.svg';
 * import logo from 'assets/images/logo.svg';
 *
 */

export default function LogoMain() {
  const theme = useTheme();
  return (
    <Typography
      variant="h4"
      component="div"
      sx={{
        fontWeight: 'bold',
        color: theme.palette.primary.main,
        fontSize: { xs: '1.5rem', sm: '2rem' },
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
      }}
    >
      Methodius
    </Typography>
  );
}

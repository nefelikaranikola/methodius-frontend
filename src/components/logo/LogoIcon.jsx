import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoIconDark from 'assets/images/logo-icon-dark.svg';
 * import logoIcon from 'assets/images/logo-icon.svg';
 * import { ThemeMode } from 'config';
 *
 */

export default function LogoIcon() {
  const theme = useTheme();

  return (
    <Typography
      variant="h3"
      component="div"
      sx={{
        fontWeight: 'bold',
        color: theme.palette.primary.main,
        fontSize: '2rem',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        textAlign: 'center',
        lineHeight: 1
      }}
    >
      M
    </Typography>
  );
}

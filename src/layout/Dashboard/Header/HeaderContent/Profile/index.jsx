import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ButtonBase from '@mui/material/ButtonBase';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';
import { useAuth } from 'context/AuthContext';
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import avatar1 from 'assets/images/users/avatar-1.png';

export default function Profile() {
  const navigate = useNavigate();
  const { user, employee, logout, isAdmin } = useAuth();

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setOpen(false);
  };

  // Get user display information based on admin vs employee
  const adminUser = isAdmin();
  const displayName = adminUser ? user?.username || 'Διαχειριστής' : employee ? `${employee.firstName} ${employee.lastName}` : 'Χρήστης';
  const displayEmail = user?.email || '';
  const displayRole = adminUser ? 'Διαχειριστής' : employee?.position || 'Υπάλληλος';
  const avatarUrl = employee?.picture?.url ? `http://localhost:1337${employee.picture.url}` : null;

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <ButtonBase
        sx={(theme) => ({
          p: 0.25,
          bgcolor: open ? 'grey.100' : 'transparent',
          borderRadius: 1,
          '&:hover': { bgcolor: 'secondary.lighter' },
          '&:focus-visible': { outline: `2px solid ${theme.palette.secondary.dark}`, outlineOffset: 2 },
          ...theme.applyStyles('dark', { bgcolor: open ? 'background.default' : 'transparent', '&:hover': { bgcolor: 'secondary.light' } })
        })}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Stack direction="row" sx={{ gap: 1.25, alignItems: 'center', p: 0.5 }}>
          <Avatar alt="profile user" src={avatarUrl || avatar1} size="sm" />
          <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
            {displayName}
          </Typography>
        </Stack>
      </ButtonBase>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 9]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position="top-right" in={open} {...TransitionProps}>
            <Paper sx={(theme) => ({ boxShadow: theme.customShadows.z1, width: 280, minWidth: 240 })}>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard elevation={0} border={false} content={false}>
                  <Box sx={{ p: 2.5 }}>
                    <Stack direction="row" sx={{ gap: 1.25, alignItems: 'center', mb: 2 }}>
                      <Avatar alt="profile user" src={avatarUrl || avatar1} sx={{ width: 32, height: 32 }} />
                      <Stack>
                        <Typography variant="h6">{displayName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {displayRole}
                        </Typography>
                        {displayEmail && (
                          <Typography variant="caption" color="text.secondary">
                            {displayEmail}
                          </Typography>
                        )}
                      </Stack>
                    </Stack>

                    <Button fullWidth variant="outlined" color="error" startIcon={<LogoutOutlined />} onClick={handleLogout} sx={{ mt: 1 }}>
                      Αποσύνδεση
                    </Button>
                  </Box>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}

import useAuth from '../../hooks/useAuth';

import { Box } from '@mui/system';
import LoggedIn from './LoggedIn';
import Login from './Login/Login';

const Main = () => {
  const { isLoggedIn } = useAuth();

  return (
    <Box
      component='main'
      sx={{
        minHeight: 0,
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      {/* Not Logged In vs. Logged In */}
      {isLoggedIn ? <LoggedIn /> : <Login />}
    </Box>
  );
};

export default Main;

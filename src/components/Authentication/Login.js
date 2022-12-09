import { useState } from 'react';

import useAxiosSend from '../../hooks/useAxiosSend';
import useAuth from '../../hooks/useAuth';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const LOGIN_URL = '/v1/auth/login';

const Login = () => {
  const [sendState, sendData] = useAxiosSend();
  const { setAuth } = useAuth();

  const [formState, setFormState] = useState({
    login: {
      username: '',
      password: '',
    },
    validationErrors: {},
  });

  // form data change handler
  const inputChangeHandler = (event) => {
    setFormState((prevState) => ({
      ...prevState,
      login: {
        ...prevState.login,
        [event.target.id]: event.target.value,
      },
    }));
  };

  // submit login form
  const submitLogin = (event) => {
    event.preventDefault();

    // form validation
    let validationErrors = [];

    // username (not blank)
    if (formState.login.username.length <= 0) {
      validationErrors.username = true;
    }

    // password (not blank)
    if (formState.login.password.length <= 0) {
      validationErrors.password = true;
    }

    setFormState((prevState) => ({
      ...prevState,
      validationErrors: validationErrors,
    }));
    if (Object.keys(validationErrors).length > 0) {
      return false;
    }
    // form validation - end

    sendData(LOGIN_URL, 'POST', formState.login, true).then((success) => {
      if (success) {
        setAuth({
          loggedInExpiration: success.session.exp,
          accessToken: success.access_token,
        });
      }
    });
  };

  return (
    <Container maxWidth='xs'>
      <Box
        sx={{
          marginTop: 4,
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'error.main' }}>
          <LockOutlinedIcon />
        </Avatar>

        <Typography component='h1' variant='h5'>
          LeGo CertHub
        </Typography>

        {sendState.errorMessage && (
          <Alert severity='error'>{sendState.errorMessage}</Alert>
        )}

        <Box component='form' onSubmit={submitLogin}>
          <TextField
            margin='normal'
            required
            fullWidth
            id='username'
            name='Username'
            label='Username'
            autoFocus
            value={formState.login.username}
            onChange={inputChangeHandler}
            error={formState.validationErrors.username}
            helperText={
              formState.validationErrors.username && 'Username cannot be blank.'
            }
          />

          <TextField
            margin='normal'
            required
            fullWidth
            id='password'
            label='Password'
            name='password'
            type='password'
            value={formState.login.password}
            onChange={inputChangeHandler}
            error={formState.validationErrors.password}
            helperText={
              formState.validationErrors.password && 'Password cannot be blank.'
            }
          />

          <Stack direction='row' justifyContent='end' sx={{ marginTop: 1 }}>
            <Button
              type='submit'
              color='primary'
              variant='contained'
              onClick={submitLogin}
              disabled={sendState.isSending}
            >
              Login
            </Button>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;

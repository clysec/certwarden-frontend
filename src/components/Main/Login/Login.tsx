import { MouseEventHandler, useEffect, type FC, type FormEventHandler } from 'react';
import {
  type authorizationResponseType,
  oidcAuthorizationResponseType,
  parseAuthorizationResponseType,
  parseOidcAuthorizationResponseType,
} from '../../../types/api';
import {
  type frontendErrorType,
  type validationErrorsType,
} from '../../../types/frontend';

import { useState } from 'react';

import useAuth from '../../../hooks/useAuth';
import useAxiosSend from '../../../hooks/useAxiosSend';
import { inputHandlerFuncMaker } from '../../../helpers/input-handler';

import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Paper } from '@mui/material';

import ApiError from '../../UI/Api/ApiError';
import InputTextField from '../../UI/FormMui/InputTextField';
import FormFooter from '../../UI/FormMui/FormFooter';
import Form from '../../UI/FormMui/Form';
import Button from '../../UI/Button/Button';
import { useSearchParams } from 'react-router-dom';

// backend API path
const LOGIN_URL = '/v1/app/auth/login';
const OIDC_URL = '/v1/app/auth/oidc';
const OIDC_LOGIN_URL = '/v1/app/auth/oidclogin';

// form shape
type formObj = {
  dataToSubmit: {
    username: string;
    password: string;
  };
  sendError: frontendErrorType | undefined;
  validationErrors: validationErrorsType;
};

// component
const Login: FC = () => {
  const { axiosSendState, apiCall } = useAxiosSend();
  const { setAuth } = useAuth();

  // set blank form state
  const blankForm: formObj = {
    dataToSubmit: {
      username: '',
      password: '',
    },
    sendError: undefined,
    validationErrors: {},
  };
  const [formState, setFormState] = useState(blankForm);

  // form data change handler
  const inputChangeHandler = inputHandlerFuncMaker(setFormState);

  const [ searchParams ] = useSearchParams();
  if (searchParams.get('state') != null && searchParams.get('code') != null) {
    useEffect(() => {
      const authData = localStorage.getItem('oidcAuthData');
      console.log(authData);

      if (authData == null) {
        window.location.href = `${window.location.origin}/${window.location.pathname}`;
        return;
      }

      apiCall<authorizationResponseType>(
        'POST',
          OIDC_LOGIN_URL,
          { 
            code: searchParams.get('code'),
            state: searchParams.get('state'),
            "session_state": searchParams.get('session_state'),
            "iss": searchParams.get('iss'),
            "sid": searchParams.get('sid'),
            "original_request": JSON.parse(authData || '{}') 
          },
          parseAuthorizationResponseType
        ).then(({ responseData, error }) => {
          localStorage.removeItem('oidcAuthData');
          // set auth if success
          if (responseData) {
            setAuth(responseData.authorization);
          } else {
            // failed, clear form and set error
            setFormState({
              ...blankForm,
              sendError: error,
            });
          }
        });
      }, [ searchParams ]);
  }
  

  const oidcClickHandler: MouseEventHandler = (event) => {
    event.preventDefault();
    
    apiCall<oidcAuthorizationResponseType>(
      'POST',
      OIDC_URL,
      {},
      parseOidcAuthorizationResponseType
    ).then(({ responseData, error }) => {
      // set auth if success
      if (responseData) {
        responseData.authorization.callback_url = window.location.href;
        localStorage.setItem('oidcAuthData', JSON.stringify(responseData.authorization));

        window.location.href = responseData.authorization.redirect_url + "&redirect_uri=" + window.location.href;
      } else {
        // failed, clear form and set error
        setFormState({
          ...blankForm,
          sendError: error,
        });
      }
    });
  };

  // submit login form
  const submitFormHandler: FormEventHandler = (event) => {
    event.preventDefault();

    // form validation
    const validationErrors: validationErrorsType = {};

    // username (not blank)
    if (formState.dataToSubmit.username.length <= 0) {
      validationErrors['dataToSubmit.username'] = true;
    }

    // password (not blank)
    if (formState.dataToSubmit.password.length <= 0) {
      validationErrors['dataToSubmit.password'] = true;
    }

    setFormState((prevState) => ({
      ...prevState,
      validationErrors: validationErrors,
    }));
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    // form validation - end

    apiCall<authorizationResponseType>(
      'POST',
      LOGIN_URL,
      formState.dataToSubmit,
      parseAuthorizationResponseType
    ).then(({ responseData, error }) => {
      // set auth if success
      if (responseData) {
        setAuth(responseData.authorization);
      } else {
        // failed, clear form and set error
        setFormState({
          ...blankForm,
          sendError: error,
        });
      }
    });
  };

  return (
    /* do not use standard form container since this form is special size*/
    <Container maxWidth='xs'>
      <Paper
        sx={{
          my: 6,
          px: 6,
          pt: 2,
          pb: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'error.main' }}>
          <LockOutlinedIcon />
        </Avatar>

        <Form onSubmit={submitFormHandler}>
          <InputTextField
            id='dataToSubmit.username'
            label='Username'
            value={formState.dataToSubmit.username}
            onChange={inputChangeHandler}
            error={formState.validationErrors['dataToSubmit.username']}
          />

          <InputTextField
            id='dataToSubmit.password'
            label='Password'
            value={formState.dataToSubmit.password}
            onChange={inputChangeHandler}
            error={formState.validationErrors['dataToSubmit.password']}
          />

          {formState.sendError &&
            Object.keys(formState.validationErrors).length <= 0 && (
              <ApiError
                statusCode={formState.sendError.statusCode}
                message={formState.sendError.message}
              />
            )}
        
          <FormFooter
            resetOnClick={() => setFormState(blankForm)}
            disabledAllButtons={axiosSendState.isSending}
            disabledResetButton={
              JSON.stringify(formState.dataToSubmit) ===
              JSON.stringify(blankForm.dataToSubmit)
            }
          />
        </Form>
        <Button color='primary' type='submit' onClick={oidcClickHandler} sx={{ width: '100%', mr: 2, mt: 2 }}>
            Single Sign-On
        </Button>
      </Paper>
    </Container>
  );
};

export default Login;

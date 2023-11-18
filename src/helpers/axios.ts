import { type AxiosRequestConfig, isAxiosError } from 'axios';
import { z } from 'zod';

import { isErrorResponseType } from '../types/api';
import { type frontendErrorType } from '../types/frontend';

import axios from 'axios';
import { apiUrl } from './environment';

// base config (always allow cookies)
export const axiosConfig: AxiosRequestConfig = {
  baseURL: apiUrl,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
};

// common axios instance
export const axiosInstance = axios.create(axiosConfig);

// error parser
export const parseAxiosError = (err: unknown): frontendErrorType => {
  // if err is an error response from backend api, use its code and message
  // first possible spot for backend response
  if (
    err &&
    typeof err === 'object' &&
    'data' in err &&
    isErrorResponseType(err.data)
  ) {
    const retErr = {
      statusCode: err.data.status_code,
      message: err.data.message,
    };

    return retErr;
  }

  // second possible spot for backend response
  if (
    err &&
    typeof err === 'object' &&
    'response' in err &&
    err.response &&
    typeof err.response === 'object' &&
    'data' in err.response &&
    isErrorResponseType(err.response.data)
  ) {
    const retErr = {
      statusCode: err.response.data.status_code,
      message: err.response.data.message,
    };

    return retErr;
  }

  // if zod error
  if (err instanceof z.ZodError) {
    // log all of the zod issues, only 1 can be returned nicely in GUI
    console.error(err.issues);

    if (err.issues[0]) {
      return {
        statusCode: 'first zod err: ' + err.issues[0].code,
        message: '[' + err.issues[0].path + ']: ' + err.issues[0].message,
      };
    } else {
      // should never happen
      return {
        statusCode: 'zod err: unknown',
        message: 'unknown (zod issue 0 missing)',
      };
    }
  }

  // if axios error, return axios code and message
  if (isAxiosError(err)) {
    const retErr = {
      statusCode: err.code || 'unknown',
      message: err.message,
    };

    return retErr;
  }

  console.error('unknown error');
  return { statusCode: 'unknown', message: 'unknown' };
};

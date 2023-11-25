import { type FC, type FormEventHandler } from 'react';
import {
  type certificateOptionsResponseType,
  parseCertificateOptionsResponse,
  type oneCertificateResponseType,
  parseOneCertificateResponseType,
} from '../../../../types/api';
import {
  type frontendErrorType,
  type validationErrorsType,
} from '../../../../types/frontend';
import { type selectInputOption } from '../../../../helpers/input-handler';

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useAxiosGet from '../../../../hooks/useAxiosGet';
import useAxiosSend from '../../../../hooks/useAxiosSend';
import { inputHandlerFuncMaker } from '../../../../helpers/input-handler';
import {
  isDomainValid,
  isNameValid,
} from '../../../../helpers/form-validation';
import {
  newId,
  defaultKeyGenAlgorithmValue,
} from '../../../../helpers/constants';
import {
  buildAcmeAccountOptions,
  buildPrivateKeyOptions,
} from '../../../../helpers/options_builders';

import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import ApiError from '../../../UI/Api/ApiError';
import ApiLoading from '../../../UI/Api/ApiLoading';
import InputSelect from '../../../UI/FormMui/InputSelect';
import Form from '../../../UI/FormMui/Form';
import FormContainer from '../../../UI/FormMui/FormContainer';
import FormFooter from '../../../UI/FormMui/FormFooter';
import FormInfo from '../../../UI/FormMui/FormInfo';
import InputArrayText from '../../../UI/FormMui/InputArrayText';
import InputTextField from '../../../UI/FormMui/InputTextField';
import TitleBar from '../../../UI/TitleBar/TitleBar';

const NEW_CERTIFICATE_URL = '/v1/certificates';
const CERTIFICATE_OPTIONS_URL = `/v1/certificates/${newId}`;

// customize key builder to deal with option to generate new key
type privateKeyType = {
  id: number;
  name: string;
  algorithm: {
    name: string;
  };
};

const buildCustomPrivateKeyOptions = (
  availableKeys: privateKeyType[]
): selectInputOption<number>[] => {
  // make generate option
  const keyOptions: selectInputOption<number>[] = [
    {
      value: newId,
      name: 'Generate New Key',
      alsoSet: [
        {
          name: 'dataToSubmit.algorithm_value',
          value: defaultKeyGenAlgorithmValue,
        },
      ],
    },
  ];

  // concat base key list, modifying each option to include undefining algorithm
  return keyOptions.concat(
    buildPrivateKeyOptions(availableKeys).map((key) => ({
      ...key,
      alsoSet: [
        {
          name: 'dataToSubmit.algorithm_value',
          value: undefined,
        },
      ],
    }))
  );
};

// form shape
type formObj = {
  getResponseData: certificateOptionsResponseType | undefined;
  getError: frontendErrorType | undefined;
  dataToSubmit: {
    name: string;
    description: string;
    private_key_id: number | '';
    algorithm_value: string;
    acme_account_id: number | '';
    subject: string;
    subject_alts: string[];
    organization: string;
    organizational_unit: string;
    country: string;
    state: string;
    city: string;
  };
  sendError: frontendErrorType | undefined;
  validationErrors: validationErrorsType;
};

const AddOneCert: FC = () => {
  // fetch new cert options
  const { getState } = useAxiosGet<certificateOptionsResponseType>(
    CERTIFICATE_OPTIONS_URL,
    parseCertificateOptionsResponse
  );

  const { axiosSendState, apiCall } = useAxiosSend();
  const navigate = useNavigate();

  const makeBlankForm: () => formObj = useCallback(
    () => ({
      getResponseData: getState.responseData,
      getError: getState.error,
      dataToSubmit: {
        name: '',
        description: '',
        private_key_id: newId,
        algorithm_value: defaultKeyGenAlgorithmValue,
        acme_account_id: '',
        subject: '',
        subject_alts: [],
        organization: '',
        organizational_unit: '',
        country: '',
        state: '',
        city: '',
      },
      sendError: undefined,
      validationErrors: {},
    }),
    [getState]
  );
  const [formState, setFormState] = useState(makeBlankForm());

  // update state when GET loads
  useEffect(() => {
    setFormState(makeBlankForm());
  }, [makeBlankForm, setFormState]);

  // data change handler
  const inputChangeHandler = inputHandlerFuncMaker(setFormState);

  // form submission handler
  const submitFormHandler: FormEventHandler = (event) => {
    event.preventDefault();

    // form validation
    const validationErrors: validationErrorsType = {};

    // name
    if (!isNameValid(formState.dataToSubmit.name)) {
      validationErrors['dataToSubmit.name'] = true;
    }

    // check account is selected
    if (formState.dataToSubmit.acme_account_id === '') {
      validationErrors['dataToSubmit.acme_account_id'] = true;
    }

    // check private key is selected
    if (formState.dataToSubmit.private_key_id === '') {
      validationErrors['dataToSubmit.private_key_id'] = true;
    }

    // if generate new key is selected, confirm alg is selected
    if (
      formState.dataToSubmit.private_key_id === newId &&
      formState.dataToSubmit.algorithm_value === ''
    ) {
      validationErrors['dataToSubmit.algorithm_value'] = true;
    }

    // subject
    if (!isDomainValid(formState.dataToSubmit.subject)) {
      validationErrors['dataToSubmit.subject'] = true;
    }
    // subject alts
    formState.dataToSubmit.subject_alts.forEach((alt, index) => {
      if (!isDomainValid(alt)) {
        validationErrors[`dataToSubmit.subject_alts.${index}`] = true;
      }
    });
    //TODO: CSR validation?
    // form validation -- end

    setFormState((prevState) => ({
      ...prevState,
      validationErrors: validationErrors,
    }));
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    //

    apiCall<oneCertificateResponseType>(
      'POST',
      NEW_CERTIFICATE_URL,
      formState.dataToSubmit,
      parseOneCertificateResponseType
    ).then(({ responseData, error }) => {
      if (responseData) {
        navigate(`/certificates/${responseData.certificate.id}`);
      } else {
        // failed, set error
        setFormState((prevState) => ({
          ...prevState,
          sendError: error,
        }));
      }
    });
  };

  return (
    <FormContainer>
      <TitleBar title='New Certificate' />

      {!formState.getResponseData && !formState.getError && <ApiLoading />}

      {formState.getError && (
        <ApiError
          statusCode={formState.getError.statusCode}
          message={formState.getError.message}
        />
      )}

      {formState.getResponseData && (
        <Form onSubmit={submitFormHandler}>
          <InputTextField
            id='dataToSubmit.name'
            label='Name'
            value={formState.dataToSubmit.name}
            onChange={inputChangeHandler}
            error={formState.validationErrors['dataToSubmit.name']}
          />

          <InputTextField
            id='dataToSubmit.description'
            label='Description'
            value={formState.dataToSubmit.description}
            onChange={inputChangeHandler}
          />

          <InputSelect
            id='dataToSubmit.acme_account_id'
            label='ACME Account'
            value={formState.dataToSubmit.acme_account_id}
            onChange={inputChangeHandler}
            options={buildAcmeAccountOptions(
              formState.getResponseData.certificate_options.acme_accounts
            )}
            error={formState.validationErrors['dataToSubmit.acme_account_id']}
          />

          <InputSelect
            id='dataToSubmit.private_key_id'
            label='Private Key'
            value={formState.dataToSubmit.private_key_id}
            onChange={inputChangeHandler}
            options={buildCustomPrivateKeyOptions(
              formState.getResponseData.certificate_options.private_keys
            )}
            error={formState.validationErrors['dataToSubmit.private_key_id']}
          />

          {formState.dataToSubmit.private_key_id === newId && (
            <InputSelect
              id='dataToSubmit.algorithm_value'
              label='Key Generation Algorithm'
              value={formState.dataToSubmit.algorithm_value}
              onChange={inputChangeHandler}
              options={
                formState.getResponseData.certificate_options.key_algorithms
              }
              error={formState.validationErrors['dataToSubmit.algorithm_value']}
            />
          )}

          <InputTextField
            id='dataToSubmit.subject'
            label='Subject (and Common Name)'
            value={formState.dataToSubmit.subject}
            onChange={inputChangeHandler}
            error={formState.validationErrors['dataToSubmit.subject']}
          />

          <InputArrayText
            id='dataToSubmit.subject_alts'
            label='Subject Alternate Names'
            subLabel='Alternate Name'
            value={formState.dataToSubmit.subject_alts}
            onChange={inputChangeHandler}
            validationErrors={formState.validationErrors}
          />

          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls='csr-fields-content'
              id='csr-fields-header'
            >
              <FormInfo sx={{ p: 1 }}>CSR Fields</FormInfo>
            </AccordionSummary>
            <AccordionDetails>
              <FormInfo sx={{ mx: 2, mb: 1 }}>
                These fields are optional and appear to be ignored by some CAs.
              </FormInfo>

              <InputTextField
                id='dataToSubmit.country'
                label='Country (2 Letter Code)'
                value={formState.dataToSubmit.country}
                onChange={inputChangeHandler}
              />

              <InputTextField
                id='dataToSubmit.state'
                label='State (2 Letter Code)'
                value={formState.dataToSubmit.state}
                onChange={inputChangeHandler}
              />

              <InputTextField
                id='dataToSubmit.city'
                label='City'
                value={formState.dataToSubmit.city}
                onChange={inputChangeHandler}
              />

              <InputTextField
                id='dataToSubmit.organization'
                label='Organization'
                value={formState.dataToSubmit.organization}
                onChange={inputChangeHandler}
              />

              <InputTextField
                id='dataToSubmit.organizational_unit'
                label='Organizational Unit'
                value={formState.dataToSubmit.organizational_unit}
                onChange={inputChangeHandler}
              />
            </AccordionDetails>
          </Accordion>

          {formState.sendError &&
            Object.keys(formState.validationErrors).length <= 0 && (
              <ApiError
                statusCode={formState.sendError.statusCode}
                message={formState.sendError.message}
              />
            )}

          <FormFooter
            cancelHref='/certificates'
            resetOnClick={() => setFormState(makeBlankForm())}
            disabledAllButtons={axiosSendState.isSending}
            disabledResetButton={
              JSON.stringify(formState.dataToSubmit) ===
              JSON.stringify(makeBlankForm().dataToSubmit)
            }
          />
        </Form>
      )}
    </FormContainer>
  );
};

export default AddOneCert;

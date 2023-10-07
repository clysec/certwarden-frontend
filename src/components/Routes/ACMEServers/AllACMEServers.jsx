import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { Link } from '@mui/material';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import { TableCell } from '@mui/material';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import useAxiosGet from '../../../hooks/useAxiosGet';
import { getRowsPerPage, getPage, getSort } from '../../UI/TableMui/query';
import { newId } from '../../../helpers/constants';

import ApiLoading from '../../UI/Api/ApiLoading';
import ApiError from '../../UI/Api/ApiError';
import Button from '../../UI/Button/Button';
import TableContainer from '../../UI/TableMui/TableContainer';
import TableHeaderRow from '../../UI/TableMui/TableHeaderRow';
import TitleBar from '../../UI/TitleBar/TitleBar';
import TablePagination from '../../UI/TableMui/TablePagination';

// table headers and sortable param
const tableHeaders = [
  {
    id: 'name',
    label: 'Name',
    sortable: true,
  },
  {
    id: 'description',
    label: 'Description',
    sortable: true,
  },
  {
    id: 'is_staging',
    label: 'Staging',
    sortable: true,
  },
  {
    id: 'external_account_required',
    label: 'Requires EAB',
    sortable: true,
  },
];

const AllACMEServers = () => {
  const [searchParams] = useSearchParams();

  // get calculated query params
  const rowsPerPage = getRowsPerPage(searchParams);
  const page = getPage(searchParams);
  const sort = getSort(searchParams, 'name', 'asc');

  // calculate offset from current page and rows per page
  const offset = page * rowsPerPage;

  const [apiGetState] = useAxiosGet(
    `/v1/acmeservers?limit=${rowsPerPage}&offset=${offset}&sort=${sort}`,
    'all_acme_servers',
    true
  );

  return (
    <TableContainer>
      <TitleBar title='ACME Servers'>
        <Button
          variant='contained'
          type='submit'
          href={`/acmeservers/${newId}`}
        >
          New Server
        </Button>
      </TitleBar>

      <Typography variant='p' sx={{ m: 3 }} display='block'>
        Support is primarily provided for Let&apos;s Encrypt compatibility, but
        if you have issues with other ACME Servers feel free to open an issue.
      </Typography>

      {!apiGetState.isLoaded && <ApiLoading />}
      {apiGetState.errorMessage && (
        <ApiError
          code={apiGetState.errorCode}
          message={apiGetState.errorMessage}
        />
      )}
      {apiGetState.isLoaded && !apiGetState.errorMessage && (
        <>
          <Table size='small'>
            <TableHead>
              <TableHeaderRow headers={tableHeaders} />
            </TableHead>
            <TableBody>
              {apiGetState?.all_acme_servers.acme_servers.length > 0 &&
                apiGetState.all_acme_servers.acme_servers.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Link component={RouterLink} to={'/acmeservers/' + s.id}>
                        {s.name}
                      </Link>
                    </TableCell>
                    <TableCell>{s.description}</TableCell>
                    <TableCell>{s.is_staging ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      {s.external_account_required ? 'Yes' : 'No'}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            page={page}
            rowsPerPage={rowsPerPage}
            count={apiGetState?.all_acme_servers.total_records}
          />
        </>
      )}
    </TableContainer>
  );
};

export default AllACMEServers;

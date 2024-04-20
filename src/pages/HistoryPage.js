import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers';

// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  Button,
  Popover,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  TextField,
} from '@mui/material';
// components
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { titres } from '../utils/titres';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
// mock
import USERLIST from '../_mock/user';
import { ProductSort, ProductFilterSidebar } from '../sections/@dashboard/products';
import { db } from '../config/firebase-config';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'date', label: 'Date', alignRight: false },
  { id: 'type', label: 'Type', alignRight: false },
  { id: 'societe', label: 'Societé', alignRight: false },
  { id: 'cours', label: 'Cours', alignRight: false },
  { id: 'qte', label: 'Quantité', alignRight: false },
  { id: 'brut', label: 'Brut', alignRight: false },
  { id: 'commision', label: 'Commission', alignRight: false },
  { id: 'net', label: 'Net', alignRight: false },
  { id: 'bank', label: 'Banque', alignRight: false },
  { id: 'bankDiff', label: 'Banque Diff', alignRight: false },
  { id: '' },
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function HistoryPage() {
  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [transactions, setTransactions] = useState([]);

  const [filteredTransactions, setFilteredTransactions] = useState([]);

  const [beginFilterDate, setBeginFilterDate] = useState(null);

  const [finishFilterDate, setFinishFilterDate] = useState(null);

  const [selectedSocieteFiltre, setSelectedSocieteFiltre] = useState('Titre');

  const [selectedService, setSelectedService] = useState('');

  const [selectedAv, setSelectedAv] = useState('Achat');

  const listTransactionRef = collection(db, 'Transactions');
  const [bankValues, setBankValues] = useState({});

  const handleBankChange = (event, id) => {
    const { value } = event.target;
    setBankValues((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const getTransactionsList = async () => {
    const transactionSnapshot = await getDocs(listTransactionRef);

    const transactionListData = transactionSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setFilteredTransactions(transactionListData);
    setTransactions(transactionListData);
  };
  useEffect(() => {
    getTransactionsList();
  }, []);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = USERLIST.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };
  const filteredData = useMemo(() => {
    const beginTimestamp = new Date(beginFilterDate).getTime();
    const finishTimestamp = new Date(finishFilterDate).getTime();
    // Filtering logic based on all filter parameters
    return transactions.filter((item) => {
      // Example: Filter based on begin date
      if (beginFilterDate && item.date.seconds * 1000 < beginTimestamp) {
        return false;
      }
      // Example: Filter based on finish date
      if (finishFilterDate && item.date.seconds * 1000 > finishTimestamp) {
        return false;
      }
      // Example: Filter based on selected titre
      if (selectedSocieteFiltre !== 'Titre' && item.titre !== selectedSocieteFiltre) {
        return false;
      }
      // Example: Filter based on selected type
      if (selectedService && item.type !== selectedService.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [transactions, beginFilterDate, finishFilterDate, selectedSocieteFiltre, selectedAv, selectedService]);

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - USERLIST.length) : 0;

  const filteredUsers = applySortFilter(USERLIST, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  return (
    <>
      <Helmet>
        <title> User | Minimal UI </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Historique transactions
          </Typography>
        </Stack>

        <Card>
          <Stack direction={'row'} spacing={3} margin={3}>
            {selected.length > 0 ? (
              <IconButton
                onClick={() => {
                  selected.map(async (id) => {
                    await deleteDoc(doc(db, 'bank_transactions', id));
                  });
                  getTransactionsList();
                }}
              >
                <Iconify icon="eva:trash-2-fill" />
              </IconButton>
            ) : (
              <IconButton
                onClick={() => {
                  setFilteredTransactions(transactions);
                  setBeginFilterDate(null);
                  setFinishFilterDate(null);
                  setSelectedSocieteFiltre('Titre');
                  setSelectedService('');
                }}
              >
                <Iconify icon="ic:round-clear" />
              </IconButton>
            )}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date de debut"
                disableFuture
                className="bg-white"
                format="DD-MM-YYYY"
                maxDate={finishFilterDate}
                onChange={(newValue) => {
                  setBeginFilterDate(newValue);
                }}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date de fin"
                disableFuture
                className="bg-white"
                format="DD-MM-YYYY"
                defaultValue={dayjs(new Date())}
                minDate={beginFilterDate}
                onChange={(newValue) => {
                  setFinishFilterDate(newValue);
                }}
              />
            </LocalizationProvider>

            <FormControl fullWidth>
              <InputLabel id="select-titre-label">Titre</InputLabel>

              <Select
                labelId="select-titre-label"
                label="Titre"
                variant="outlined"
                size="medium"
                value={selectedSocieteFiltre}
                onChange={(event) => setSelectedSocieteFiltre(event.target.value)}
              >
                {titres.map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row-reverse" alignItems="center" justifyContent="flex-end" sx={{ mb: 5 }} marginX={5}>
            <Stack direction="row" spacing={1}>
              <Button
                variant={selectedService === 'Achat' ? 'contained' : 'outlined'}
                onClick={() => {
                  if (selectedService !== 'Achat') setSelectedService('Achat');
                }}
              >
                Achat
              </Button>
              <Button
                variant={selectedService === 'Vente' ? 'contained' : 'outlined'}
                onClick={() => {
                  if (selectedService !== 'Vente') setSelectedService('Vente');
                }}
              >
                Vente
              </Button>

              <Button
                variant={selectedService === 'Dividende' ? 'contained' : 'outlined'}
                onClick={() => {
                  if (selectedService !== 'Dividende') setSelectedService('Dividende');
                }}
              >
                Dividende
              </Button>
              <Button
                variant={selectedService === 'Introduction' ? 'contained' : 'outlined'}
                onClick={() => {
                  if (selectedService !== 'Introduction') setSelectedService('Introduction');
                }}
              >
                Introduction
              </Button>
              <Button variant={selectedService === 'tax' ? 'contained' : 'outlined'}>Tax Immobiliere</Button>
            </Stack>
          </Stack>

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={filteredData.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredData.map((row) => {
                    const { id, date, titre, prix, quantite, type } = row;
                    const selectedUser = selected.indexOf(id) !== -1;
                    const milliseconds = date.seconds * 1000;

                    // Create a new Date object
                    const dateMili = new Date(milliseconds);

                    // Extract date components
                    const day = dateMili.getDate();
                    const month = dateMili.getMonth() + 1; // Months are zero-based, so January is 0
                    const year = dateMili.getFullYear();

                    // Format the date as a French date string
                    const frenchDate = `${day}/${month}/${year}`;

                    const diffBank = (
                      bankValues[id] -
                      (type === 'achat'
                        ? prix * quantite + quantite * prix * 0.0044
                        : prix * quantite - quantite * prix * 0.0044)
                    ).toFixed(2);
                    return (
                      <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, id)} />
                        </TableCell>

                        <TableCell align="left">{frenchDate}</TableCell>
                        <TableCell
                          align="left"
                          style={type === 'achat' ? { backgroundColor: '#b6ff8f' } : { backgroundColor: '#ff9b9b' }}
                        >
                          {type.toUpperCase()}
                        </TableCell>
                        <TableCell align="left">{titre}</TableCell>

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {prix}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell align="left">{quantite}</TableCell>
                        <TableCell align="left">{quantite * prix}</TableCell>
                        <TableCell align="left">{(prix * quantite * 0.0044).toFixed(2)}</TableCell>

                        <TableCell align="left">
                          {type === 'achat'
                            ? (prix * quantite + quantite * prix * 0.0044).toFixed(2)
                            : (prix * quantite - quantite * prix * 0.0044).toFixed(2)}
                        </TableCell>
                        <TableCell align="left">
                          <TextField type={'number'} onChange={(event) => handleBankChange(event, id)} />
                        </TableCell>
                        <TableCell align="left">{diffBank}</TableCell>
                        {/* <TableCell align="left">{isVerified ? 'Yes' : 'No'}</TableCell>

                        <TableCell align="left">
                          <Label color={(status === 'banned' && 'error') || 'success'}>{sentenceCase(status)}</Label>
                        </TableCell> */}

                        <TableCell align="right">
                          <IconButton size="large" color="inherit" onClick={handleOpenMenu}>
                            <Iconify icon={'eva:more-vertical-fill'} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            Not found
                          </Typography>

                          <Typography variant="body2">
                            No results found for &nbsp;
                            <strong>&quot;{filterName}&quot;</strong>.
                            <br /> Try checking for typos or using complete words.
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
            <Stack direction={'row'} spacing={3} marginTop={3}>
              <Stack direction={'column'}>
                <TextField
                  label="Total"
                  value={filteredData
                    .map((row) =>
                      row.type === 'achat'
                        ? row.prix * row.quantite + row.quantite * row.prix * 0.0044
                        : row.prix * row.quantite - row.quantite * row.prix * 0.0044
                    )
                    .reduce((a, b) => a + b, 0)
                    .toFixed(2)}
                />
              </Stack>
              <Stack direction={'column'}>
                <TextField
                  label="Total commision"
                  value={filteredData
                    .map((row) => row.quantite * row.prix * 0.0044)
                    .reduce((a, b) => a + b, 0)
                    .toFixed(2)}
                />
              </Stack>
              <Stack direction={'column'}>
                <TextField
                  label="Total Diff. Sys/Banque"
                  value={filteredData
                    .map((row) => {
                      const bankValue = Number.isNaN(bankValues[row.id]) ? 0 : bankValues[row.id];
                      const transactionValue =
                        row.type === 'achat'
                          ? row.prix * row.quantite + row.quantite * row.prix * 0.0044
                          : row.prix * row.quantite - row.quantite * row.prix * 0.0044;
                      return bankValue - transactionValue;
                    })
                    .reduce((a, b) => a + b, 0)
                    .toFixed(2)}
                />
              </Stack>
            </Stack>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={USERLIST.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 140,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <MenuItem>
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
          Modifier
        </MenuItem>

        <MenuItem
          sx={{ color: 'error.main' }}
          onClick={() => {
            console.log('selected', selected);
          }}
        >
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          Suprimer
        </MenuItem>
      </Popover>
    </>
  );
}

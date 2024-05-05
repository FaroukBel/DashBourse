import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useEffect, useMemo, useState } from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Swal from 'sweetalert2';

// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Button,
  Popover,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  FormControl,
  Select,
  InputLabel,
  Tooltip,
  IconButton,
  TableContainer,
  TablePagination,
  TextField,
} from '@mui/material';

import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// components
import { collection, addDoc, getDocs, Timestamp, deleteDoc, doc, setDoc } from 'firebase/firestore';
import dayjs from 'dayjs';
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
// mock
import USERLIST from '../_mock/user';
import { ProductSort, ProductFilterSidebar } from '../sections/@dashboard/products';
import { db } from '../config/firebase-config';
import { titres } from '../utils/titres';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'date', label: 'Date', alignRight: false },
  { id: 'acaht/vente', label: 'Achat/Vente', alignRight: false },
  { id: 'type', label: 'Type', alignRight: false },
  { id: 'societe', label: 'Societé', alignRight: false },
  { id: 'prix', label: 'Prix', alignRight: false },
  { id: 'quantite', label: 'Quantité', alignRight: false },
  { id: 'cours', label: 'Montant', alignRight: false },
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

export default function BankPage() {
  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);
  const [rowToEdit, setRowToEdit] = useState([]);
  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');
  const [selectedAv, setSelectedAv] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [beginFilterDate, setBeginFilterDate] = useState(null);
  const [finishFilterDate, setFinishFilterDate] = useState(dayjs(new Date()));
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [bankValues, setBankValues] = useState({});
  const [prixValues, setPrixValues] = useState({});
  const [quantiteValues, setQuantiteValues] = useState({});
  const [selectedService, setSelectedService] = useState('');

  const [selectedSocieteFiltre, setSelectedSocieteFiltre] = useState('Titre');

  const listTransactionRef = collection(db, 'bank_transactions');
  const handleBankChange = (event, id) => {
    const { value } = event.target;
    setBankValues((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handlePrixChange = (event, id) => {
    const { value } = event.target;
    setPrixValues((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleQuantiteChange = (event, id) => {
    const { value } = event.target;
    setQuantiteValues((prevState) => ({
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
    setTransactions(transactionListData);
    setFilteredTransactions(transactionListData);
    setPrixValues(
      transactionListData.reduce((acc, row) => {
        acc[row.id] = row.prix;
        return acc;
      }, {})
    );
    setQuantiteValues(
      transactionListData.reduce((acc, row) => {
        acc[row.id] = row.quantite;
        return acc;
      }, {})
    );

    setBankValues(
      transactionListData.reduce((acc, row) => {
        acc[row.id] = row.montant || 0;
        return acc;
      }, {})
    );
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
      const newSelecteds = transactions.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
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

  const filteredData = useMemo(() => {
    const beginTimestamp = new Date(beginFilterDate).getTime();
    const finishTimestamp = new Date(finishFilterDate).getTime();
    // Filtering logic based on all filter parameters
    return transactions.filter((item) => {
      // Example: Filter based on begin date
      if (beginFilterDate && item.selectedDate.seconds * 1000 < beginTimestamp) {
        return false;
      }
      // Example: Filter based on finish date
      if (finishFilterDate && item.selectedDate.seconds * 1000 > finishTimestamp) {
        return false;
      }
      // Example: Filter based on selected titre
      if (selectedSocieteFiltre !== 'Titre' && item.titre !== selectedSocieteFiltre) {
        return false;
      }
      // Example: Filter based on selected type
      if (selectedService !== '' && item.type.toLowerCase() !== selectedService.toLowerCase()) {
        return false;
      }
      // Example: Filter based on selected av
      if (selectedAv !== '' && item.av.toLowerCase() !== selectedAv.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [transactions, beginFilterDate, finishFilterDate, selectedSocieteFiltre, selectedAv, selectedService]);

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - transactions.length) : 0;

  const filteredUsers = applySortFilter(transactions, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;
  const [openFilter, setOpenFilter] = useState(false);

  const handleOpenFilter = () => {
    setOpenFilter(true);
  };

  const handleCloseFilter = () => {
    setOpenFilter(false);
  };

  const total = filteredData
    .map((row) => (row.av === 'vente' ? Number(row.montant) : Number(row.montant) * -1))
    .reduce((a, b) => a + b, 0)
    .toFixed(2);

  const totalAchat = filteredData
    .map((row) => (row.av === 'achat' ? Number(row.montant) : 0))
    .reduce((a, b) => a + b, 0)
    .toFixed(2);
  const totalVente = filteredData
    .map((row) => (row.av === 'vente' ? Number(row.montant) : 0))
    .reduce((a, b) => a + b, 0)
    .toFixed(2);

  const quantiteTotal = filteredData
    .map((row) => (row.av === 'achat' ? Number(row.quantite) : 0))
    .reduce((a, b) => a + b, 0)
    .toFixed(0);

  let totalMontant;

  if (selected.length === 0) {
    totalMontant = total;
  } else {
    totalMontant = selected
      .reduce((acc, value) => {
        const transaction = transactions.find((transaction) => transaction.id === value);
        const transactionValue =
          transaction.av === 'vente' ? Number(transaction.montant) : Number(transaction.montant) * -1;
        return acc + transactionValue;
      }, 0)
      .toFixed(2);
  }
  return (
    <>
      <Helmet>
        <title>Historique Banque </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="center" mb={5} fullWidth>
          <Typography fontSize={39} gutterBottom>
            Historique Banque
          </Typography>
        </Stack>

        <Card>
          <Stack direction={'row'} spacing={3} margin={3}>
            {selected.length > 0 ? (
              <Tooltip title="Delete">
                <IconButton
                  onClick={() => {
                    Swal.fire({
                      title: 'Êtes-vous sûr(e) ?',
                      text: 'Vous êtes sur le point de supprimer les transactions sélectionnées.',
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: '#3085d6',
                      cancelButtonColor: '#d33',
                      confirmButtonText: 'Oui, supprimer !',
                      cancelButtonText: 'Annuler',
                    }).then(async (result) => {
                      if (result.isConfirmed) {
                        selected.map(async (id) => {
                          await deleteDoc(doc(db, 'bank_transactions', id));
                        });
                        getTransactionsList();
                        Swal.fire('Supprimé !', 'Les transactions sélectionnées ont été supprimées.', 'success');
                      }
                    });
                  }}
                >
                  <Iconify icon="eva:trash-2-fill" />
                </IconButton>
              </Tooltip>
            ) : (
              <IconButton
                onClick={() => {
                  setFilteredTransactions(transactions);
                  setBeginFilterDate(null);
                  setFinishFilterDate(null);
                  setSelectedSocieteFiltre('Titre');
                  setSelectedService('');
                  setSelectedAv('');
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
                onChange={(event) => {
                  setSelectedSocieteFiltre(event.target.value);
                }}
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
              {/* <ProductFilterSidebar
              openFilter={openFilter}
              onOpenFilter={handleOpenFilter}
              onCloseFilter={handleCloseFilter}
            />
            <ProductSort /> */}

              <Button
                variant={selectedAv === 'Achat' ? 'contained' : 'outlined'}
                onClick={() => {
                  if (selectedAv !== 'Achat') setSelectedAv('Achat');
                }}
              >
                Achat
              </Button>
              <Button
                variant={selectedAv === 'Vente' ? 'contained' : 'outlined'}
                onClick={() => {
                  if (selectedAv !== 'Vente') setSelectedAv('Vente');
                }}
              >
                Vente
              </Button>
              <Button
                variant={selectedService === 'Action' ? 'contained' : 'outlined'}
                onClick={() => {
                  if (selectedService !== 'Action') setSelectedService('Action');
                }}
              >
                Action
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
              <Button
                variant={selectedService === 'Tax Immobilier' ? 'contained' : 'outlined'}
                onClick={() => {
                  if (selectedService !== 'Tax Immobilier') setSelectedService('Tax Immobilier');
                }}
              >
                Tax Immobiliere
              </Button>
            </Stack>
          </Stack>

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800, maxHeight: 740 }}>
              <Table stickyHeader>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={transactions.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredData.length > 0 &&
                    filteredData.map((row) => {
                      const { id, selectedDate, titre, montant, type, av, prix, quantite } = row;
                      const selectedUser = selected.indexOf(id) !== -1;
                      let frenchDate = '';
                      if (selectedDate) {
                        const milliseconds = selectedDate.seconds * 1000;

                        // Create a new Date object
                        const dateMili = new Date(milliseconds);

                        // Extract date components
                        const day = dateMili.getDate();
                        const month = dateMili.getMonth() + 1; // Months are zero-based, so January is 0
                        const year = dateMili.getFullYear();

                        // Format the date as a French date string
                        frenchDate = `${day}/${month}/${year}`;
                      }

                      return (
                        <TableRow
                          hover
                          key={id}
                          tabIndex={-1}
                          role="checkbox"
                          selected={selectedUser}
                          style={{
                            backgroundColor: selectedUser
                              ? av === 'vente'
                                ? 'rgb(241 255 244)'
                                : 'rgb(255 247 247)'
                              : 'transparent',
                          }}
                        >
                          <TableCell
                            padding="checkbox"
                            style={{
                              borderRight: selectedUser
                                ? '1px solid rgb(105 105 105 / 40%)'
                                : '1px solid rgb(165 165 165)',
                              borderBottom: selectedUser
                                ? '1px solid rgb(105 105 105 / 40%)'
                                : '1px solid rgb(165 165 165)',
                            }}
                          >
                            <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, id)} />
                          </TableCell>

                          <TableCell
                            align="left"
                            style={{
                              borderRight: selectedUser
                                ? '1px solid rgb(105 105 105 / 40%)'
                                : '1px solid rgb(165 165 165)',
                              borderBottom: selectedUser
                                ? '1px solid rgb(105 105 105 / 40%)'
                                : '1px solid rgb(165 165 165)',
                            }}
                          >
                            {frenchDate}
                          </TableCell>
                          <TableCell
                            align="left"
                            style={
                              av === 'vente'
                                ? {
                                    backgroundColor: 'rgb(241 255 244)',
                                    borderRight: selectedUser
                                      ? '1px solid rgb(105 105 105 / 40%)'
                                      : '1px solid rgb(165 165 165)',
                                    borderBottom: selectedUser
                                      ? '1px solid rgb(105 105 105 / 40%)'
                                      : '1px solid rgb(165 165 165)',
                                  }
                                : {
                                    backgroundColor: 'rgb(255 247 247)',
                                    borderRight: selectedUser
                                      ? '1px solid rgb(105 105 105 / 40%)'
                                      : '1px solid rgb(165 165 165)',
                                    borderBottom: selectedUser
                                      ? '1px solid rgb(105 105 105 / 40%)'
                                      : '1px solid rgb(165 165 165)',
                                  }
                            }
                          >
                            {av && av.toUpperCase()}
                          </TableCell>
                          <TableCell
                            align="left"
                            style={{
                              borderRight: selectedUser
                                ? '1px solid rgb(105 105 105 / 40%)'
                                : '1px solid rgb(165 165 165)',
                              borderBottom: selectedUser
                                ? '1px solid rgb(105 105 105 / 40%)'
                                : '1px solid rgb(165 165 165)',
                            }}
                          >
                            {type}
                          </TableCell>
                          <TableCell
                            align="left"
                            style={{
                              borderRight: selectedUser
                                ? '1px solid rgb(105 105 105 / 40%)'
                                : '1px solid rgb(165 165 165)',
                              borderBottom: selectedUser
                                ? '1px solid rgb(105 105 105 / 40%)'
                                : '1px solid rgb(165 165 165)',
                            }}
                          >
                            {titre}
                          </TableCell>
                          {rowToEdit.includes(id) ? (
                            <TableCell
                              align="left"
                              style={{
                                borderRight: selectedUser
                                  ? '1px solid rgb(105 105 105 / 40%)'
                                  : '1px solid rgb(165 165 165)',
                                borderBottom: selectedUser
                                  ? '1px solid rgb(105 105 105 / 40%)'
                                  : '1px solid rgb(165 165 165)',
                              }}
                            >
                              <TextField
                                type={'number'}
                                value={prixValues[id]}
                                onChange={(event) => {
                                  handlePrixChange(event, id);
                                }}
                              />
                            </TableCell>
                          ) : (
                            <TableCell
                              align="left"
                              style={{
                                borderRight: selectedUser
                                  ? '1px solid rgb(105 105 105 / 40%)'
                                  : '1px solid rgb(165 165 165)',
                                borderBottom: selectedUser
                                  ? '1px solid rgb(105 105 105 / 40%)'
                                  : '1px solid rgb(165 165 165)',
                              }}
                            >
                              {prix}
                            </TableCell>
                          )}

                          {rowToEdit.includes(id) ? (
                            <TableCell
                              align="left"
                              style={{
                                borderRight: selectedUser
                                  ? '1px solid rgb(105 105 105 / 40%)'
                                  : '1px solid rgb(165 165 165)',
                                borderBottom: selectedUser
                                  ? '1px solid rgb(105 105 105 / 40%)'
                                  : '1px solid rgb(165 165 165)',
                              }}
                            >
                              <TextField
                                type={'number'}
                                value={quantiteValues[id]}
                                onChange={(event) => {
                                  handleQuantiteChange(event, id);
                                }}
                              />
                            </TableCell>
                          ) : (
                            <TableCell
                              align="left"
                              style={{
                                borderRight: selectedUser
                                  ? '1px solid rgb(105 105 105 / 40%)'
                                  : '1px solid rgb(165 165 165)',
                                borderBottom: selectedUser
                                  ? '1px solid rgb(105 105 105 / 40%)'
                                  : '1px solid rgb(165 165 165)',
                              }}
                            >
                              {quantite}
                            </TableCell>
                          )}

                          {rowToEdit.includes(id) ? (
                            <TableCell
                              align="left"
                              style={{
                                borderRight: selectedUser
                                  ? '1px solid rgb(105 105 105 / 40%)'
                                  : '1px solid rgb(165 165 165)',
                                borderBottom: selectedUser
                                  ? '1px solid rgb(105 105 105 / 40%)'
                                  : '1px solid rgb(165 165 165)',
                              }}
                            >
                              <TextField
                                type={'number'}
                                value={bankValues[id]}
                                onChange={(event) => {
                                  handleBankChange(event, id);
                                }}
                              />
                            </TableCell>
                          ) : (
                            <TableCell
                              align="left"
                              style={{
                                borderRight: selectedUser
                                  ? '1px solid rgb(105 105 105 / 40%)'
                                  : '1px solid rgb(165 165 165)',
                                borderBottom: selectedUser
                                  ? '1px solid rgb(105 105 105 / 40%)'
                                  : '1px solid rgb(165 165 165)',
                              }}
                            >
                              {av === 'achat' ? '-' : ''} {montant} DH
                            </TableCell>
                          )}

                          <TableCell
                            align="right"
                            style={{
                              borderRight: selectedUser
                                ? '1px solid rgb(105 105 105 / 40%)'
                                : '1px solid rgb(165 165 165)',
                              borderBottom: selectedUser
                                ? '1px solid rgb(105 105 105 / 40%)'
                                : '1px solid rgb(165 165 165)',
                            }}
                          >
                            {rowToEdit.includes(id) ? (
                              <>
                                <IconButton
                                  onClick={async () => {
                                    const transactionRef = doc(db, 'bank_transactions', id);
                                    await setDoc(transactionRef, {
                                      ...row,
                                      prix: prixValues[id],
                                      quantite: quantiteValues[id],
                                      montant: bankValues[id],
                                    });
                                    setRowToEdit(rowToEdit.filter((rowId) => rowId !== id));
                                    getTransactionsList();
                                  }}
                                >
                                  <Iconify icon={'eva:save-fill'} />
                                </IconButton>
                                <IconButton
                                  onClick={() => {
                                    setRowToEdit(rowToEdit.filter((rowId) => rowId !== id));
                                  }}
                                >
                                  <Iconify icon={'eva:close-outline'} />
                                </IconButton>
                              </>
                            ) : (
                              <IconButton
                                onClick={() => {
                                  setRowToEdit([...rowToEdit, id]);
                                }}
                              >
                                <Iconify icon={'eva:edit-fill'} />
                              </IconButton>
                            )}

                            <IconButton
                              color="error"
                              onClick={() => {
                                Swal.fire({
                                  title: 'Êtes-vous sûr(e) ?',
                                  text: 'Vous êtes sur le point de supprimer cette transaction.',
                                  icon: 'warning',
                                  showCancelButton: true,
                                  confirmButtonColor: '#3085d6',
                                  cancelButtonColor: '#d33',
                                  confirmButtonText: 'Oui, supprimer !',
                                  cancelButtonText: 'Annuler',
                                }).then(async (result) => {
                                  if (result.isConfirmed) {
                                    await deleteDoc(doc(db, 'bank_transactions', id));
                                    getTransactionsList();
                                    Swal.fire('Supprimé !', 'La transaction a été supprimée.', 'success');
                                  }
                                });
                              }}
                            >
                              <Iconify icon={'eva:trash-2-outline'} />
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
            <Stack direction={'row-reverse'} spacing={3} marginTop={3} marginX={3}>
              <Stack direction={'column'}>
                <InputLabel>
                  <Typography variant="h6">Total Achat</Typography>
                </InputLabel>
                <TextField variant="outlined" value={totalAchat} />
              </Stack>
              <Stack direction={'column'}>
                <InputLabel>
                  <Typography variant="h6">Total Vente</Typography>
                </InputLabel>
                <TextField variant="outlined" value={totalVente} />
              </Stack>
              <Stack direction={'column'}>
                <InputLabel>
                  <Typography variant="h6">Total Quantité</Typography>
                </InputLabel>
                <TextField variant="outlined" value={quantiteTotal} />
              </Stack>
            </Stack>
            <Stack direction={'row-reverse'} spacing={3} marginTop={3} marginX={3}>
              <Stack direction={'column'}>
                <InputLabel>
                  <Typography variant="h6">Total</Typography>
                </InputLabel>
                <TextField
                  variant="outlined"
                  style={
                    totalMontant > 0
                      ? { backgroundColor: 'rgb(241 255 244)' }
                      : totalMontant < 0
                      ? { backgroundColor: 'rgb(255 247 247)' }
                      : { backgroundColor: 'white' }
                  }
                  value={totalMontant}
                />
              </Stack>
            </Stack>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[10, 50, { value: -1, label: 'Tout' }]}
            component="div"
            count={filteredTransactions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </>
  );
}

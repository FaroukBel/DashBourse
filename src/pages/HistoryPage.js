import { Helmet } from 'react-helmet-async';
import { filter, set } from 'lodash';
import { sentenceCase } from 'change-case';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers';
import Swal from 'sweetalert2';
// @mui
import {
  Card,
  Table,
  Stack,
  Alert,
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
  Divider,
} from '@mui/material';
// components
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { titres } from '../utils/titres';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
// mock

import { ProductSort, ProductFilterSidebar } from '../sections/@dashboard/products';
import { db } from '../config/firebase-config';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'date', label: 'Date', alignRight: false },
  { id: 'societe', label: 'Societé', alignRight: false },
  { id: 'cours', label: 'Achat', alignRight: false },
  { id: 'qte', label: 'Vente', alignRight: false },
  { id: 'brut', label: 'Quantite', alignRight: false },
  { id: 'commAchat', label: 'Comm/Achat', alignRight: false },
  { id: 'commVente', label: 'Comm/Vente', alignRight: false },

  { id: 'pnl', label: '+/- Value', alignRight: false },
  { id: '' },
];

const TABLE_HEAD_DIVIDENDE = [
  { id: 'date', label: 'Date', alignRight: false },
  { id: 'datePaiement', label: 'Date Paiement', alignRight: false },
  { id: 'societe', label: 'Societé', alignRight: false },
  { id: 'cours', label: 'Cours', alignRight: false },
  { id: 'brut', label: 'Quantite', alignRight: false },
  { id: 'commAchat', label: 'IGR', alignRight: false },

  { id: 'pnl', label: '+/- Value', alignRight: false },
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
  const [total, setTotal] = useState(0);

  const [finishFilterDate, setFinishFilterDate] = useState(null);

  const [selectedSocieteFiltre, setSelectedSocieteFiltre] = useState('Titre');

  const [selectedService, setSelectedService] = useState('');
  const [rowToEdit, setRowToEdit] = useState([]);
  const [selectedAv, setSelectedAv] = useState('Achat');
  const [isDifferentSociete, setIsDifferentSociete] = useState(false);
  const listTransactionRef = collection(db, 'Transactions');
  const [bankValues, setBankValues] = useState({});
  const [prixValues, setPrixValues] = useState({});
  const [prixValuesVente, setPrixValuesVente] = useState({});
  const [quantiteValues, setQuantiteValues] = useState({});

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

  const handlePrixVente = (event, id) => {
    const { value } = event.target;
    setPrixValuesVente((prevState) => ({
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
    setFilteredTransactions(transactionListData);
    setTransactions(transactionListData);

    setPrixValues(
      transactionListData.reduce((acc, row) => {
        acc[row.id] = row.prixAchat;
        return acc;
      }, {})
    );

    setPrixValuesVente(
      transactionListData.reduce((acc, row) => {
        acc[row.id] = row.prixVente;
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
        acc[row.id] = row.bank || 0;
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
  const filteredData = useMemo(() => {
    const beginTimestamp = new Date(beginFilterDate).getTime();
    const finishTimestamp = new Date(finishFilterDate).getTime();
    // Filtering logic based on all filter parameters
    return transactions.filter((item) => {
      // Example: Filter based on begin date
      // Example: Filter based on begin date
      if (
        beginFilterDate &&
        (item.date?.seconds * 1000 < beginTimestamp || item.dateEngagement?.seconds * 1000 < beginTimestamp)
      ) {
        return false;
      }
      // Example: Filter based on finish date
      if (
        finishFilterDate &&
        (item.date?.seconds * 1000 > finishTimestamp || item.dateEngagement?.seconds * 1000 > finishTimestamp)
      ) {
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - transactions.length) : 0;

  const filteredUsers = applySortFilter(transactions, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  const calculateTransactionValue = (row) => {
    if (row.type === 'achat') {
      return row.prix * row.quantite + row.quantite * row.prix * row.taxValue;
    }
    if (row.type === 'vente') {
      return row.prix * row.quantite - row.quantite * row.prix * row.taxValue;
    }
    return 0;
  };

  const { totalAchat, totalVente, totalQuantite, totalDiv, totalDivQte } = filteredData.reduce(
    (acc, value) => {
      acc.totalAchat += value.prixAchat * value.quantite + value.quantite * value.prixAchat * value.taxValue;
      acc.totalDiv += value.prix * value.quantite;
      acc.totalDivQte += Number(value.quantite);
      acc.totalVente += value.prixVente * value.quantite - value.quantite * value.prixVente * value.taxValue;
      acc.totalQuantite += Number(value.quantite);
      return acc;
    },
    { totalAchat: 0, totalVente: 0, totalQuantite: 0, totalDiv: 0, totalDivQte: 0 }
  );

  const totalTVA = ((totalVente - totalAchat) * 0.15).toFixed(2);
  const totalPL = (totalVente - totalAchat - (totalVente - totalAchat) * 0.15).toFixed(2);
  const igrDividende = (totalDiv * 0.15).toFixed(2);
  const totalDividende = totalDiv.toFixed(2);

  const totalBrutFilteredData = filteredData
    .reduce((acc, row) => {
      const transactionValue = calculateTransactionValue(row);
      return acc + transactionValue;
    }, 0)
    .toFixed(2);

  let totalBrut;

  if (selected.length === 0) {
    totalBrut = totalBrutFilteredData;
  } else {
    totalBrut = selected
      .reduce((acc, value) => {
        const transaction = transactions.find((transaction) => transaction.id === value);
        const transactionValue = calculateTransactionValue(transaction);
        return acc + transactionValue;
      }, 0)
      .toFixed(2);
  }

  const dateFrench = (date) => {
    const milliseconds = date ? date.seconds * 1000 : null;

    // Create a new Date object
    const dateMili = new Date(milliseconds);

    // Extract date components
    const day = dateMili.getDate();
    const month = dateMili.getMonth() + 1; // Months are zero-based, so January is 0
    const year = dateMili.getFullYear();

    // Format the date as a French date string
    const frenchDate = `${day}/${month}/${year}`;

    return frenchDate;
  };
  return (
    <>
      <Helmet>
        <title> Historique </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="center" mb={5} fullWidth>
          <Typography fontSize={39} gutterBottom>
            Historique transactions
          </Typography>
        </Stack>

        <Card>
          <Stack direction={'row'} spacing={3} margin={3}>
            {selected.length > 0 ? (
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
                        await deleteDoc(doc(db, 'Transactions', id));
                      });
                      getTransactionsList();
                      Swal.fire('Supprimé !', 'Les transactions sélectionnées ont été supprimées.', 'success');
                    }
                  });
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
                variant={selectedService === 'tax immobiliere' ? 'contained' : 'outlined'}
                onClick={() => {
                  if (selectedService !== 'tax immobiliere') setSelectedService('tax immobiliere');
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
                  headLabel={selectedService ? TABLE_HEAD_DIVIDENDE : TABLE_HEAD}
                  rowCount={transactions.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredData.map((row) => {
                    const { id, date, dateEngagement, datePaiement, titre, prixAchat, prixVente, quantite, type , taxValue} = row;
                    const selectedUser = selected.indexOf(id) !== -1;
                    const milliseconds = date
                      ? date.seconds * 1000
                      : dateEngagement
                      ? dateEngagement.seconds * 1000
                      : null;

                    // Create a new Date object
                    const dateMili = new Date(milliseconds);

                    // Extract date components
                    const day = dateMili.getDate();
                    const month = dateMili.getMonth() + 1; // Months are zero-based, so January is 0
                    const year = dateMili.getFullYear();

                    // Format the date as a French date string
                    const frenchDate = `${day}/${month}/${year}`;
                    const totalCommissionAchatVar = (quantite * prixAchat * taxValue + quantite * prixAchat).toFixed(2);
                    const totalCommissionVenteVar = (quantite * prixVente - quantite * prixVente * taxValue).toFixed(2);
                    const commissionAchat = (quantite * prixAchat * taxValue).toFixed(2);
                    const commissionVente = (quantite * prixVente * taxValue).toFixed(2);
                    let pnl;
                    if (totalCommissionVenteVar - totalCommissionAchatVar < 0) {
                      pnl = (totalCommissionVenteVar - totalCommissionAchatVar).toFixed(2);
                    } else {
                      const pnlCommission = (totalCommissionVenteVar - totalCommissionAchatVar) * 0.15;

                      pnl = ((totalCommissionVenteVar - totalCommissionAchatVar).toFixed(2) - pnlCommission).toFixed(2);
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
                            ? pnl > 0
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
                        {type === 'dividende' && (
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
                            {dateFrench(datePaiement)}
                          </TableCell>
                        )}
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
                            {selectedService === 'Dividende' ? row.prix : prixAchat}
                          </TableCell>
                        )}
                        {selectedService !== 'Dividende' && (
                          <>
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
                                  value={prixValuesVente[id]}
                                  onChange={(event) => {
                                    handlePrixVente(event, id);
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
                                {prixVente}
                              </TableCell>
                            )}
                          </>
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
                            {' '}
                            {quantite}
                          </TableCell>
                        )}

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
                          {selectedService !== 'Dividende' ? commissionAchat : row.prix * quantite * 0.15}
                        </TableCell>
                        {selectedService !== 'Dividende' && (
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
                            {commissionVente}
                          </TableCell>
                        )}

                        <TableCell
                          align="left"
                          style={{
                            backgroundColor:
                              selectedService !== 'Dividende'
                                ? pnl
                                : row.prix * quantite - row.prix * quantite * 0.15 < 0
                                ? 'rgb(255 247 247)'
                                : 'rgb(241 255 244)',
                            borderRight: selectedUser
                              ? '1px solid rgb(105 105 105 / 40%)'
                              : '1px solid rgb(165 165 165)',
                            borderBottom: selectedUser
                              ? '1px solid rgb(105 105 105 / 40%)'
                              : '1px solid rgb(165 165 165)',
                          }}
                        >
                          {selectedService !== 'Dividende' ? pnl : row.prix * quantite - row.prix * quantite * 0.15}
                        </TableCell>

                        <TableCell align="right">
                          {rowToEdit.includes(id) ? (
                            <>
                              <IconButton
                                onClick={async () => {
                                  const transactionRef = doc(db, 'Transactions', id);
                                  await setDoc(transactionRef, {
                                    ...row,
                                    prixAchat: prixValues[id],
                                    prixVente: prixValuesVente[id],
                                    quantite: quantiteValues[id],
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
                                  await deleteDoc(doc(db, 'Transactions', id));
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

            <Divider />
            <Stack direction={'row-reverse'} spacing={3} marginTop={3} marginX={3}>
              {selectedService !== 'Dividende' && (
                <Stack direction={'column'}>
                  <InputLabel>
                    <Typography variant="h6">Total Vente</Typography>
                  </InputLabel>
                  <TextField variant="outlined" value={totalVente} />
                </Stack>
              )}
              <Stack direction={'column'}>
                <InputLabel>
                  <Typography variant="h6">{selectedService !== 'Dividende' ? 'Total Achat' : 'Total Qte'}</Typography>
                </InputLabel>
                <TextField variant="outlined" value={selectedService !== 'Dividende' ? totalAchat : totalDivQte} />
              </Stack>
              <Stack direction={'column'}>
                <InputLabel>
                  <Typography variant="h6">IGR</Typography>
                </InputLabel>
                <TextField variant="outlined" value={selectedService !== 'Dividende' ? totalTVA : igrDividende} />
              </Stack>
              {selectedService !== 'Dividende' && (
                <Stack direction={'column'}>
                  <InputLabel>
                    <Typography variant="h6">Commission</Typography>
                  </InputLabel>
                  <TextField
                    variant="outlined"
                    value={filteredData
                      .map((row) => row.quantite * row.prixVente * row.taxValue + row.quantite * row.prixAchat * row.taxValue)
                      .reduce((a, b) => a + b, 0)
                      .toFixed(2)}
                  />
                </Stack>
              )}

              <Stack direction={'column'}>
                <InputLabel>
                  <Typography variant="h6">Total Quantité</Typography>
                </InputLabel>
                <TextField variant="outlined" value={totalQuantite} />
              </Stack>
            </Stack>

            <Stack direction={'row-reverse'} spacing={3} marginTop={3} marginX={3}>
              <Stack direction={'column'}>
                <InputLabel>
                  <Typography variant="h6">+/- Value</Typography>
                </InputLabel>
                {selectedService === 'Dividende' && (
                  <TextField
                    variant="outlined"
                    style={
                      totalDividende > 0
                        ? { backgroundColor: 'rgb(241, 255, 244)' }
                        : totalDividende < 0
                        ? { backgroundColor: 'rgb(255, 247, 247)' }
                        : { backgroundColor: 'white' }
                    }
                    value={totalDividende}
                  />
                )}
                {selectedService === 'Action' && (
                  <TextField
                    variant="outlined"
                    style={
                      !Number.isNaN(parseFloat(totalPL))
                        ? parseFloat(totalPL) > 0
                          ? { backgroundColor: 'rgb(241, 255, 244)' }
                          : parseFloat(totalPL) < 0
                          ? { backgroundColor: 'rgb(255, 247, 247)' }
                          : { backgroundColor: 'white' }
                        : { backgroundColor: 'white' }
                    }
                    value={!Number.isNaN(parseFloat(totalPL)) ? parseFloat(totalPL) : 0}
                  />
                )}
              </Stack>
            </Stack>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={transactions.length}
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

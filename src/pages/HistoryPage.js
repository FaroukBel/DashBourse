import { Helmet } from 'react-helmet-async';
import { filter, orderBy, set } from 'lodash';
import { sentenceCase } from 'change-case';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import { Save, Cancel } from '@mui/icons-material';

// @mui
import {
  Card,
  Table,
  Stack,
  FormControl,
  InputLabel,
  Select,
  Button,
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
import { DataGrid } from '@mui/x-data-grid';

import { frFR } from '@mui/x-date-pickers/locales';
// components
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';

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
  { id: 'titre', label: 'Societé', alignRight: false },
  { id: 'prixAchat', label: 'Achat', alignRight: false },
  { id: 'prixVente', label: 'Vente', alignRight: false },
  { id: 'quantite', label: 'Quantite', alignRight: false },
  { id: 'taxValue', label: '% Comm', alignRight: false },
  { id: 'commAchat', label: 'Comm/Achat', alignRight: false },
  { id: 'commVente', label: 'Comm/Vente', alignRight: false },
  { id: 'pnl', label: '+/- Value', alignRight: false },
];

const TABLE_HEAD_IMMO = [
  { id: 'date', label: 'Date', alignRight: false },

  { id: 'societe', label: 'Societé', alignRight: false },
  { id: 'cours', label: 'Motant', alignRight: false },
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

function formatNumber(number) {
  // Convert number to string
  const numberString = number.toString();

  // Split the number into integer and decimal parts
  const [integerPart, decimalPart] = numberString.split('.');

  // Format the integer part with periods as thousand separators
  const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Format the decimal part, if it exists
  const formattedDecimalPart = decimalPart ? `,${decimalPart}` : '';

  // Combine the formatted integer part and the decimal part
  return `${formattedIntegerPart}${formattedDecimalPart}`;
}

export default function HistoryPage() {
  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('cours');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [transactions, setTransactions] = useState([]);

  const [filteredTransactions, setFilteredTransactions] = useState([]);

  const [beginFilterDate, setBeginFilterDate] = useState(null);
  const [total, setTotal] = useState(0);

  const [finishFilterDate, setFinishFilterDate] = useState(null);

  const [selectedSocieteFiltre, setSelectedSocieteFiltre] = useState('Titre');

  const [selectedService, setSelectedService] = useState('Tout');
  const [rowToEdit, setRowToEdit] = useState([]);
  const [isDifferentSociete, setIsDifferentSociete] = useState(false);
  const listTransactionRef = collection(db, 'Transactions');
  const [bankValues, setBankValues] = useState({});
  const [prixValues, setPrixValues] = useState({});
  const [prixValuesVente, setPrixValuesVente] = useState({});
  const [quantiteValues, setQuantiteValues] = useState({});
  const [taxValues, setTaxValues] = useState({});
  const [pnlGlobal, setPnlGlobal] = useState(0);
  const [titres, setTitres] = useState([]);

  const handleTaxChange = (event, id) => {
    const { value } = event.target;
    setTaxValues((prevState) => ({
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
    const titresData = await getDoc(doc(db, 'utils', 'titresDoc'));

    const titresList = titresData.data().titres;
    setTitres(titresList);
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
    console.log(filteredData);
  }, []);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleRequestSort = (event, property) => {
    console.log(property);
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

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);

      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return format(new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000), 'yyyy-MM-dd HH:mm:ss');
  };
  const filteredData = useMemo(() => {
    const beginTimestamp = new Date(beginFilterDate).getTime();
    const finishTimestamp = new Date(finishFilterDate).getTime();
    return transactions.filter((item) => {
      if (
        beginFilterDate &&
        (item.date?.seconds * 1000 < beginTimestamp || item.dateEngagement?.seconds * 1000 < beginTimestamp)
      ) {
        return false;
      }
      if (
        finishFilterDate &&
        (item.date?.seconds * 1000 > finishTimestamp || item.dateEngagement?.seconds * 1000 > finishTimestamp)
      ) {
        return false;
      }
      if (selectedSocieteFiltre !== 'Titre' && item.titre !== selectedSocieteFiltre) {
        return false;
      }
      if (selectedService && item.type !== selectedService.toLowerCase() && selectedService !== 'Tout') {
        return false;
      }
      return true;
    });
  }, [transactions, beginFilterDate, finishFilterDate, selectedSocieteFiltre, selectedService]);

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

  const sortedData = stableSort(filteredData, getComparator(order, orderBy));

  const isNotFound = !sortedData.length && !!filterName;

  const calculateTransactionValue = (row) => {
    if (row.type === 'achat') {
      return row.prix * row.quantite + row.quantite * row.prix * row.taxValue;
    }
    if (row.type === 'vente') {
      return row.prix * row.quantite - row.quantite * row.prix * row.taxValue;
    }
    return 0;
  };

  const mapHeadersToColumns = (headers) => {
    return headers.map((header) => ({
      field: header.id,
      headerName: header.label,
      align: header.alignRight ? 'right' : 'left',
      width: 150,
      editable: true,
    }));
  };
  const calculateValues = (item) => {
    const commAchat = item.prixAchat * item.taxValue * item.quantite;
    const commVente = item.prixVente * item.taxValue * item.quantite;
    const pnl = (item.prixVente - item.prixAchat) * item.quantite - (commAchat + commVente);
    return { commAchat, commVente, pnl };
  };
  const DataGridComponent = ({ headers }) => {
    const filteredDataAction = filteredData.filter((item) => item.type === 'action');

    const [rows, setRows] = useState(
      filteredDataAction.map((item) => {
        const { commAchat, commVente, pnl } = calculateValues(item);

        return {
          id: item.id,
          date: formatDate(item.date),
          prixAchat: Number(item.prixAchat).toFixed(2),
          prixVente: Number(item.prixVente).toFixed(2),
          quantite: Number(item.quantite).toFixed(2),
          commAchat: commAchat.toFixed(2),
          commVente: commVente.toFixed(2),
          pnl: pnl.toFixed(2),
        };
      })
    );
    const [editRowsModel, setEditRowsModel] = useState({});
    const [editingRowId, setEditingRowId] = useState(null);

    const handleEditClick = (id) => {
      setEditingRowId(id);
      setEditRowsModel({
        [id]: { ...rows.find((row) => row.id === id) },
      });
    };

    const handleSaveClick = () => {
      const updatedRows = rows.map((row) => {
        if (row.id === editingRowId) {
          return { ...row, ...editRowsModel[editingRowId] };
        }
        return row;
      });
      setRows(updatedRows);
      setEditingRowId(null);
      setEditRowsModel({});
    };

    const handleCancelClick = () => {
      setEditingRowId(null);
      setEditRowsModel({});
    };

    const handleEditRowsModelChange = (model) => {
      setEditRowsModel(model);
    };

    const columns = [
      ...mapHeadersToColumns(headers),
      {
        field: 'actions',
        headerName: 'Actions',
        width: 150,
        renderCell: (params) => {
          const isEditing = params.row.id === editingRowId;
          return isEditing ? (
            <>
              <IconButton color="primary" onClick={handleSaveClick} style={{ marginRight: 10 }}>
                <Save />
              </IconButton>
              <IconButton color="secondary" onClick={handleCancelClick}>
                <Cancel />
              </IconButton>
            </>
          ) : (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handleEditClick(params.row.id)}
              style={{ marginRight: 10 }}
            >
              Edit
            </Button>
          );
        },
      },
    ];
    const localeText = {
      // Define locale text properties here, or use the provided locale object
      // For example:

      noRowsLabel: 'Pas de lignes',
      noResultsOverlayLabel: 'Pas de résultats',
      errorOverlayDefaultLabel: "Une erreur s'est produite.",
      filterPanelPlaceholder: 'Filtrer...',
      filterPanelTitle: 'Filtre',
      filterOperatorContains: 'contient',
      filterOperatorEquals: 'égal',
      filterOperatorNotEquals: 'différent',
      filterOperatorStartsWith: 'commence par',
      filterOperatorEndsWith: 'finit par',
      filterOperatorIs: 'est',
      filterOperatorNot: "n'est pas",
      filterOperatorAfter: 'après',
      filterOperatorOnOrAfter: 'le ou après',
      filterOperatorBefore: 'avant',
      filterOperatorOnOrBefore: 'le ou avant',
      filterOperatorIsEmpty: 'est vide',
      filterOperatorIsNotEmpty: "n'est pas vide",
      filterValueAny: "n'importe quel",
      filterValueTrue: 'vrai',
      filterValueFalse: 'faux',
      filterValueEmpty: 'vide',
      filterValueNotEmpty: 'non vide',
      filterValueBlanks: 'vides',
      filterValueLoading: 'chargement...',
      filterValueOperator: 'Opérateur',
      filterValueColumns: 'Colonnes',
      filterValueColumn: 'Colonne',
      filterValueAnd: 'et',
      filterValueOr: 'ou',
      filterValueMultipleValues: '(valeurs multiples)',
      filterValueMultipleValuesDelimiter: ',',
      filterValueMultipleValuesStart: '(',
      filterValueMultipleValuesEnd: ')',
      filterValueMultipleValuesSelected: 'sélectionné',
      filterValueMultipleValuesSelectAll: 'Tout sélectionner',
      filterValueMultipleValuesSelectNone: 'Aucun',
      filterValueMultipleValuesShowAll: 'Afficher tout',
      filterValueMultipleValuesOrder: 'Ordre',
      filterValueMultipleValuesOrderAsc: 'Ascendant',
      filterValueMultipleValuesOrderDesc: 'Descendant',
      filterValueMultipleValuesCase: 'Cas',
      filterValueMultipleValuesCaseSensitive: 'Sensible à la casse',
      filterValueMultipleValuesCaseInsensitive: 'Insensible à la casse',
      filterValueMultipleValuesSearch: 'Rechercher',
      filterValueMultipleValuesSelectedAll: 'Tout sélectionné',
      filterValueMultipleValuesSelectedNone: 'Aucun sélectionné',
      filterValueMultipleValuesSelectedSome: 'Sélectionné',
      filterValueMultipleValuesSelectedMany: 'Beaucoup sélectionné',
      filterValueMultipleValuesSelectedAllVisible: 'Tout sélectionné',
      filterValueMultipleValuesSelectedNoneVisible: 'Aucun sélectionné',
      filterValueMultipleValuesSelectedSomeVisible: 'Sélectionné',
      filterValueMultipleValuesSelectedManyVisible: 'Beaucoup sélectionné',
      filterValueMultipleValuesInvalidList: 'Liste invalide',
      filterValueMultipleValuesLoadMore: 'Charger plus',
      filterValueMultipleValuesSearchCount: '{count} trouvé',
      filterValueMultipleValuesSearchCountAll: 'Tout trouvé ({count})',
      filterValueMultipleValuesSearchPlaceholder: 'Rechercher...',
      filterValueMultipleValuesSearchEmpty: 'Aucun résultat',
      filterValueSortAscending: 'Tri croissant',
      filterValueSortDescending: 'Tri décroissant',

      // Add other localization properties as needed
    };
    return (
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
          rows={rows}
          columns={columns}
          editRowsModel={editRowsModel}
          onEditRowsModelChange={handleEditRowsModelChange}
          initialState={{
            sorting: {
              sortModel: [{ field: 'date', sort: 'desc' }],
            },
          }}
        />
      </div>
    );
  };

  const { totalAchat, totalVente, totalQuantite, totalDiv, totalDivQte, pnlAction, totalTVA, globalPnl, taxImmoTotal } =
    filteredData.reduce(
      (acc, value) => {
        // Parse fields as numbers and handle missing fields
        const prixAchat = parseFloat(value.prixAchat) || 0;
        const prixVente = parseFloat(value.prixVente) || 0;
        const quantite = parseFloat(value.quantite) || 0;
        const taxValue = parseFloat(value.taxValue) || 0;
        const prix = parseFloat(value.prix) || 0;

        // Calculate total purchase and sale amounts with tax
        acc.totalAchat += prixAchat * quantite + quantite * prixAchat * taxValue;
        acc.totalVente += prixVente * quantite - quantite * prixVente * taxValue;

        // Calculate profit and loss
        const vente = prixVente * quantite - quantite * prixVente * taxValue;
        const achat = prixAchat * quantite + quantite * prixAchat * taxValue;

        if (vente - achat < 0) {
          acc.pnlAction += vente - achat;
        } else {
          acc.totalTVA += (vente - achat) * 0.15;
          acc.pnlAction += vente - achat - (vente - achat) * 0.15;
        }

        // Calculate total dividends
        if (value.type === 'dividende') {
          acc.totalDiv += prix * quantite;
          acc.totalDivQte += quantite;
        }
        if (value.type === 'tax immobiliere') {
          acc.taxImmoTotal += prix;
        }
        // Calculate total quantity
        acc.totalQuantite += quantite;
        const igrDividende = (acc.totalDiv * 0.15).toFixed(2);
        // Calculate global pnl
        acc.globalPnl =
          parseFloat(acc.pnlAction) + parseFloat(acc.totalDiv - igrDividende) + parseFloat(acc.taxImmoTotal);
        return acc;
      },
      {
        totalAchat: 0,
        totalVente: 0,
        totalQuantite: 0,
        totalDiv: 0,
        totalDivQte: 0,
        pnlAction: 0,
        totalTVA: 0,
        globalPnl: 0,
        taxImmoTotal: 0,
      }
    );

  const igrDividende = (totalDiv * 0.15).toFixed(2);
  const totalDividende = totalDiv.toFixed(2) - igrDividende;

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

  let totalTaxValues;

  if (selected.length === 0) {
    totalTaxValues = filteredData.reduce((acc, row) => {
      return acc + Number(row.prix);
    }, 0);
  } else {
    totalTaxValues = selected.reduce((acc, value) => {
      const transaction = transactions.find((transaction) => transaction.id === value);
      return acc + Number(transaction.prix);
    }, 0);
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

  const ActionContainerTable = ({ height }) => {
    let pnlActionVar = 0;
    return (
      <TableContainer sx={{ minWidth: 800, maxHeight: height }}>
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
            {sortedData.map((row) => {
              const { id, date, dateEngagement, datePaiement, titre, prixAchat, prixVente, quantite, type, taxValue } =
                row;
              const selectedUser = selected.indexOf(id) !== -1;
              const milliseconds = date ? date.seconds * 1000 : dateEngagement ? dateEngagement.seconds * 1000 : null;

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

              pnlActionVar += parseFloat(pnl);

              return (
                <>
                  {type === 'action' && (
                    <TableRow>
                      <TableCell
                        padding="checkbox"
                        style={{
                          borderRight: selectedUser ? '1px solid rgb(105 105 105 / 40%)' : '1px solid rgb(165 165 165)',
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
                          borderRight: selectedUser ? '1px solid rgb(105 105 105 / 40%)' : '1px solid rgb(165 165 165)',
                          borderBottom: selectedUser
                            ? '1px solid rgb(105 105 105 / 40%)'
                            : '1px solid rgb(165 165 165)',
                        }}
                      >
                        {frenchDate}
                      </TableCell>

                      <TableCell
                        align="left"
                        style={{
                          borderRight: selectedUser ? '1px solid rgb(105 105 105 / 40%)' : '1px solid rgb(165 165 165)',
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
                          {prixAchat}
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
                            <Select
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              value={taxValues[id]}
                              defaultValue={taxValue}
                              onChange={(event) => {
                                handleTaxChange(event, id);
                              }}
                            >
                              <MenuItem value={0.0044}>0.44%</MenuItem>
                              <MenuItem value={0.0077}>0.77%</MenuItem>
                            </Select>
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
                            {taxValue * 100} {' %'}
                          </TableCell>
                        )}
                      </>

                      <TableCell
                        align="left"
                        style={{
                          borderRight: selectedUser ? '1px solid rgb(105 105 105 / 40%)' : '1px solid rgb(165 165 165)',
                          borderBottom: selectedUser
                            ? '1px solid rgb(105 105 105 / 40%)'
                            : '1px solid rgb(165 165 165)',
                        }}
                      >
                        {commissionAchat}
                      </TableCell>

                      <TableCell
                        align="left"
                        style={{
                          borderRight: selectedUser ? '1px solid rgb(105 105 105 / 40%)' : '1px solid rgb(165 165 165)',
                          borderBottom: selectedUser
                            ? '1px solid rgb(105 105 105 / 40%)'
                            : '1px solid rgb(165 165 165)',
                        }}
                      >
                        {commissionVente}
                      </TableCell>

                      <TableCell
                        align="left"
                        style={{
                          color:
                            selectedService === 'Dividende'
                              ? pnl
                              : selectedService === 'Tout'
                              ? pnl > 0
                                ? '#019875'
                                : '#e8305f'
                              : '#019875',

                          borderRight: selectedUser ? '1px solid rgb(105 105 105 / 40%)' : '1px solid rgb(165 165 165)',
                          borderBottom: selectedUser
                            ? '1px solid rgb(105 105 105 / 40%)'
                            : '1px solid rgb(165 165 165)',
                        }}
                      >
                        {formatNumber(pnl)} DH
                      </TableCell>
                      <TableCell
                        align="right"
                        style={{
                          direction: 'ltr',
                          width: '120px',
                          borderRight: selectedUser ? '1px solid rgb(105 105 105 / 40%)' : '1px solid rgb(165 165 165)',
                          borderBottom: selectedUser
                            ? '1px solid rgb(105 105 105 / 40%)'
                            : '1px solid rgb(165 165 165)',
                        }}
                      >
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
                                  taxValue: taxValues[id],
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
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const DividendeContainerTable = ({ height }) => {
    return (
      <TableContainer sx={{ minWidth: 800, maxHeight: height }}>
        <Table stickyHeader>
          <UserListHead
            order={order}
            orderBy={orderBy}
            headLabel={TABLE_HEAD_DIVIDENDE}
            rowCount={transactions.length}
            numSelected={selected.length}
            onRequestSort={handleRequestSort}
            onSelectAllClick={handleSelectAllClick}
          />
          <TableBody>
            {filteredData.map((row) => {
              const { id, date, dateEngagement, datePaiement, titre, prixAchat, prixVente, quantite, type, taxValue } =
                row;
              const selectedUser = selected.indexOf(id) !== -1;
              const milliseconds = date ? date.seconds * 1000 : dateEngagement ? dateEngagement.seconds * 1000 : null;

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
                <>
                  {type === 'dividende' && (
                    <TableRow
                      hover
                      key={id}
                      tabIndex={-1}
                      role="checkbox"
                      selected={selectedUser}
                      style={{
                        backgroundColor: selectedUser ? (pnl > 0 ? '#019875' : '#e8305f') : 'transparent',
                      }}
                    >
                      <TableCell
                        padding="checkbox"
                        style={{
                          borderRight: selectedUser ? '1px solid rgb(105 105 105 / 40%)' : '1px solid rgb(165 165 165)',
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
                          borderRight: selectedUser ? '1px solid rgb(105 105 105 / 40%)' : '1px solid rgb(165 165 165)',
                          borderBottom: selectedUser
                            ? '1px solid rgb(105 105 105 / 40%)'
                            : '1px solid rgb(165 165 165)',
                        }}
                      >
                        {frenchDate}
                      </TableCell>

                      <TableCell
                        align="left"
                        style={{
                          borderRight: selectedUser ? '1px solid rgb(105 105 105 / 40%)' : '1px solid rgb(165 165 165)',
                          borderBottom: selectedUser
                            ? '1px solid rgb(105 105 105 / 40%)'
                            : '1px solid rgb(165 165 165)',
                        }}
                      >
                        {dateFrench(datePaiement)}
                      </TableCell>

                      <TableCell
                        align="left"
                        style={{
                          borderRight: selectedUser ? '1px solid rgb(105 105 105 / 40%)' : '1px solid rgb(165 165 165)',
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
                          {row.prix}
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
                          {' '}
                          {quantite}
                        </TableCell>
                      )}

                      <TableCell
                        align="left"
                        style={{
                          borderRight: selectedUser ? '1px solid rgb(105 105 105 / 40%)' : '1px solid rgb(165 165 165)',
                          borderBottom: selectedUser
                            ? '1px solid rgb(105 105 105 / 40%)'
                            : '1px solid rgb(165 165 165)',
                        }}
                      >
                        {row.prix * quantite * 0.15}
                      </TableCell>
                      <TableCell
                        align="left"
                        style={{
                          color: row.prix * quantite - row.prix * quantite * 0.15 < 0 ? '#e8305f' : '#019875',
                          borderRight: selectedUser ? '1px solid rgb(105 105 105 / 40%)' : '1px solid rgb(165 165 165)',
                          borderBottom: selectedUser
                            ? '1px solid rgb(105 105 105 / 40%)'
                            : '1px solid rgb(165 165 165)',
                        }}
                      >
                        {formatNumber(row.prix * quantite - row.prix * quantite * 0.15)} DH
                      </TableCell>
                      <TableCell
                        align="right"
                        style={{
                          direction: 'ltr',
                          borderRight: selectedUser ? '1px solid rgb(105 105 105 / 40%)' : '1px solid rgb(165 165 165)',
                          borderBottom: selectedUser
                            ? '1px solid rgb(105 105 105 / 40%)'
                            : '1px solid rgb(165 165 165)',
                        }}
                      >
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
                                  taxValue: taxValues[id],
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
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const TaxContainerTable = ({ height }) => {
    return (
      <TableContainer sx={{ minWidth: 800, maxHeight: height }}>
        <Table stickyHeader>
          <UserListHead
            order={order}
            orderBy={orderBy}
            headLabel={TABLE_HEAD_IMMO}
            rowCount={transactions.length}
            numSelected={selected.length}
            onRequestSort={handleRequestSort}
            onSelectAllClick={handleSelectAllClick}
          />

          <TableBody>
            {filteredData.map((row) => {
              const { id, date, dateEngagement, datePaiement, titre, prixAchat, prixVente, quantite, type, taxValue } =
                row;
              const selectedUser = selected.indexOf(id) !== -1;
              const milliseconds = date ? date.seconds * 1000 : dateEngagement ? dateEngagement.seconds * 1000 : null;

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
                <>
                  {type === 'tax immobiliere' && (
                    <TableRow>
                      <TableCell
                        padding="checkbox"
                        style={{
                          borderRight: selectedUser ? '1px solid rgb(105 105 105 / 40%)' : '1px solid rgb(165 165 165)',
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
                          borderRight: selectedUser ? '1px solid rgb(105 105 105 / 40%)' : '1px solid rgb(165 165 165)',
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
                          borderRight: selectedUser ? '1px solid rgb(105 105 105 / 40%)' : '1px solid rgb(165 165 165)',
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
                          {formatNumber(row.prix)} DH
                        </TableCell>
                      )}
                      <TableCell
                        align="right"
                        style={{
                          direction: 'ltr',
                          borderRight: selectedUser ? '1px solid rgb(105 105 105 / 40%)' : '1px solid rgb(165 165 165)',
                          borderBottom: selectedUser
                            ? '1px solid rgb(105 105 105 / 40%)'
                            : '1px solid rgb(165 165 165)',
                        }}
                      >
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
                                  taxValue: taxValues[id],
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
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  return (
    <>
      <Helmet>
        <title> Historique </title>
      </Helmet>

      <Container
        maxWidth="xxl"
        sx={{
          mt: 3,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
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
                variant={selectedService === 'Tout' ? 'contained' : 'outlined'}
                onClick={() => {
                  if (selectedService !== 'Tout') setSelectedService('Tout');
                }}
              >
                Tout
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
            {selectedService === 'Tout' && (
              <>
                <Stack direction={'row-reverse'} spacing={3} marginTop={3} marginX={3}>
                  <Stack direction={'column'}>
                    <Typography variant="h4">Total global</Typography>
                    <TextField
                      variant="outlined"
                      inputProps={{ style: { color: globalPnl < 0 ? '#e8305f' : '#019875' } }}
                      value={formatNumber(globalPnl.toFixed(2))}
                    />
                  </Stack>
                </Stack>
                <Stack direction={'row'} justifyContent={'center'} alignItems={'center'}>
                  <Typography
                    variant="h4"
                    sx={{
                      mt: 3,
                      ml: 3,
                    }}
                  >
                    Actions
                  </Typography>
                </Stack>
                <DataGridComponent headers={TABLE_HEAD} />
                <ActionContainerTable height={400} />
                <Stack direction={'row-reverse'} spacing={3} marginTop={3} marginX={3} marginBottom={2}>
                  <Stack direction={'column'}>
                    <Typography variant="h4">Total action</Typography>
                    <TextField
                      variant="outlined"
                      inputProps={{ style: { color: pnlAction < 0 ? '#e8305f' : '#019875' } }}
                      value={formatNumber(pnlAction.toFixed(2))}
                    />
                  </Stack>
                </Stack>
                <Divider />

                <Stack direction={'row'} justifyContent={'center'} alignItems={'center'}>
                  <Typography
                    variant="h4"
                    sx={{
                      mt: 3,
                      ml: 3,
                    }}
                  >
                    Dividendes
                  </Typography>
                </Stack>

                <DividendeContainerTable height={400} />
                <Stack direction={'row-reverse'} spacing={3} marginTop={3} marginX={3} marginBottom={2}>
                  <Stack direction={'column'}>
                    <Typography variant="h4">Total dividende</Typography>
                    <TextField
                      variant="outlined"
                      inputProps={{ style: { color: '#019875' } }}
                      value={formatNumber(totalDividende.toFixed(2))}
                    />
                  </Stack>
                </Stack>
                <Divider />

                <Stack direction={'row'} justifyContent={'center'} alignItems={'center'}>
                  <Typography
                    variant="h4"
                    sx={{
                      mt: 3,
                      ml: 3,
                    }}
                  >
                    Tax Immobiliere
                  </Typography>
                </Stack>
                <TaxContainerTable height={400} />
                <Stack direction={'row-reverse'} spacing={3} marginTop={3} marginX={3} marginBottom={3}>
                  <Stack direction={'column'}>
                    <Typography variant="h4">Total tax immobiliere</Typography>
                    <TextField
                      variant="outlined"
                      inputProps={{ style: { color: '#019875' } }}
                      value={formatNumber(taxImmoTotal.toFixed(2))}
                    />
                  </Stack>
                </Stack>
              </>
            )}

            {selectedService === 'Action' && <ActionContainerTable height={800} />}

            {selectedService === 'Dividende' && <DividendeContainerTable height={800} />}

            {selectedService === 'tax immobiliere' && <TaxContainerTable height={800} />}

            <Divider />

            <Stack direction={'row-reverse'} spacing={3} marginTop={3} marginX={3}>
              {selectedService !== 'tax immobiliere' && selectedService !== 'Tout' && (
                <>
                  {selectedService !== 'Dividende' && (
                    <Stack direction={'column'}>
                      <InputLabel>
                        <Typography variant="h6">Total Vente</Typography>
                      </InputLabel>
                      <TextField variant="outlined" value={formatNumber(totalVente.toFixed(2))} />
                    </Stack>
                  )}
                  <Stack direction={'column'}>
                    <InputLabel>
                      <Typography variant="h6">
                        {selectedService !== 'Dividende' ? 'Total Achat' : 'Total Qte'}
                      </Typography>
                    </InputLabel>
                    <TextField
                      variant="outlined"
                      value={
                        selectedService !== 'Dividende'
                          ? formatNumber(totalAchat.toFixed(2))
                          : formatNumber(totalDivQte.toFixed(2))
                      }
                    />
                  </Stack>
                  <Stack direction={'column'}>
                    <InputLabel>
                      <Typography variant="h6">IGR</Typography>
                    </InputLabel>
                    <TextField
                      variant="outlined"
                      value={
                        selectedService !== 'Dividende'
                          ? formatNumber(totalTVA.toFixed(2))
                          : formatNumber(Number(igrDividende).toFixed(2))
                      }
                    />
                  </Stack>
                </>
              )}
              {selectedService === 'Action' && selectedService !== 'Tout' && (
                <Stack direction={'column'}>
                  <InputLabel>
                    <Typography variant="h6">Commission</Typography>
                  </InputLabel>
                  <TextField
                    variant="outlined"
                    value={filteredData
                      .map(
                        (row) =>
                          row.quantite * row.prixVente * row.taxValue + row.quantite * row.prixAchat * row.taxValue
                      )
                      .reduce((a, b) => a + b, 0)
                      .toFixed(2)}
                  />
                </Stack>
              )}
              {selectedService !== 'tax immobiliere' && selectedService !== 'Tout' && (
                <Stack direction={'column'}>
                  <InputLabel>
                    <Typography variant="h6">Total Quantité</Typography>
                  </InputLabel>
                  <TextField variant="outlined" value={formatNumber(totalQuantite.toFixed(2))} />
                </Stack>
              )}
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
                        ? { color: 'rgb(241, 255, 244)' }
                        : totalDividende < 0
                        ? { color: 'rgb(255, 247, 247)' }
                        : { backgroundColor: 'white' }
                    }
                    value={totalDividende}
                  />
                )}
                {selectedService === 'Action' && (
                  <TextField
                    variant="outlined"
                    style={
                      pnlAction > 0
                        ? { color: 'rgb(241, 255, 244)' }
                        : pnlAction < 0
                        ? { color: 'rgb(255, 247, 247)' }
                        : { backgroundColor: 'white' }
                    }
                    value={formatNumber(pnlAction.toFixed(2))}
                  />
                )}

                {selectedService === 'tax immobiliere' && (
                  <TextField
                    variant="outlined"
                    style={
                      totalTaxValues > 0
                        ? { color: 'rgb(241, 255, 244)' }
                        : totalTaxValues < 0
                        ? { color: 'rgb(255, 247, 247)' }
                        : { backgroundColor: 'white' }
                    }
                    value={totalTaxValues}
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

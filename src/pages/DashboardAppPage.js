import { Helmet } from 'react-helmet-async';
import { faker } from '@faker-js/faker';
// @mui
import { useTheme } from '@mui/material/styles';
import { Card, Grid, Button, Container, Typography, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useMemo, useState } from 'react';
// components
import { LineChart } from '@mui/x-charts';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';

// Register the required components
import zoomPlugin from 'chartjs-plugin-zoom';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { format, isValid } from 'date-fns';

// sections
import {
  AppTasks,
  AppNewsUpdate,
  AppOrderTimeline,
  AppCurrentVisits,
  AppWebsiteVisits,
  AppTrafficBySite,
  AppCurrentSubject,
  AppConversionRates,
} from '../sections/@dashboard/app';
import Iconify from '../components/iconify';
import { db } from '../config/firebase-config';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  BarElement,

  Legend,
  zoomPlugin
);

export default function DashboardAppPage() {
  const theme = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [sysTransactions, setSysTransactions] = useState([]);
  const [titleTotalsAchat, setTitleTotalsAchat] = useState([]);
  const [titleTotalsPNL, setTitleTotalsPNL] = useState([]);
  const [statsData, setStatsData] = useState([]);
  const listTransactionRef = collection(db, 'bank_transactions');
  const listTransactionRefSys = collection(db, 'Transactions');
  const [chartType, setChartType] = useState("line")
  const [groupByTitre, setGroupByTitre] = useState([]);

  const getTransactionsList = async () => {
    const transactionSnapshot = await getDocs(listTransactionRef);


    const transactionListData = transactionSnapshot.docs.map((doc) => {
      const transactionData = doc.data();

      // Assuming your date field in Firebase is called 'date'
      const transactionDate = new Date(transactionData.selectedDate.toDate()); // Convert Firestore Timestamp to JavaScript Date object

      const transactionDay = transactionDate.getDate();
      const transactionMonth = transactionDate.getMonth() + 1;
      const transactionYear = transactionDate.getFullYear();
      const formattedDate = `${transactionDay.toString().padStart(2, '0')}/${transactionMonth
        .toString()
        .padStart(2, '0')}/${transactionYear}`;

      return {
        ...transactionData,
        id: doc.id,
        formattedDate, // Add formatted date to the object
      };
    });
    setTransactions(transactionListData);
    const titleTotalsPNL = transactionListData.reduce((acc, row) => {
      if (!acc[row.titre]) {
        acc[row.titre] = 0;
      }

      if (row.av === 'vente') {
        acc[row.titre] += Number(row.montant);
      } else if (row.av === 'achat') {
        acc[row.titre] -= Number(row.montant);
      }

      return acc;
    }, {});
    const formattedTitleTotalsPNL = Object.keys(titleTotalsPNL).map((title) => ({
      label: title,
      value: titleTotalsPNL[title],
    }));
    setTitleTotalsPNL(formattedTitleTotalsPNL);

    const titleTotalsAchat = transactionListData.reduce((acc, row) => {
      if (!acc[row.titre]) {
        acc[row.titre] = 0;
      }
      if (row.av === 'achat') {
        acc[row.titre] += Number(row.montant);
      }

      return acc;
    }, {});

    const formattedTitleTotalsAchat = Object.keys(titleTotalsAchat).map((title) => ({
      label: title,
      value: titleTotalsAchat[title],
    }));
    setTitleTotalsAchat(formattedTitleTotalsAchat);
    setGroupByTitre(formattedTitleTotalsAchat);
  };



  const getSysTransactionsList = async () => {
    try {
      const listTransactionSys = await getDocs(listTransactionRefSys);

      const transactionListDataSys = listTransactionSys.docs.map((doc) => {
        const transactionDataSys = doc.data();

        // Check if the 'date' field exists and is in the Firestore timestamp format
        let transactionDateSys;
        if (transactionDataSys.date && transactionDataSys.date.seconds) {
          // Convert Firestore timestamp object (seconds + nanoseconds) to JavaScript Date
          transactionDateSys = new Date(transactionDataSys.date.seconds * 1000 + transactionDataSys.date.nanoseconds / 1000000);
        } else {
          transactionDateSys = new Date(); // Fallback to current date if the date is missing or in an unexpected format
        }

        const transactionDaySys = transactionDateSys.getDate();
        const transactionMonthSys = transactionDateSys.getMonth() + 1;
        const transactionYearSys = transactionDateSys.getFullYear();
        const formattedDateSys = `${transactionDaySys.toString().padStart(2, '0')}/${transactionMonthSys
          .toString()
          .padStart(2, '0')}/${transactionYearSys}`;

        return {
          ...transactionDataSys,
          id: doc.id,
          formattedDateSys, // Add formatted date to the object
        };
      });
      setSysTransactions(transactionListDataSys);
    } catch (error) {
      console.error('Error fetching system transactions:', error);
    }
  };


  useEffect(() => {
    getSysTransactionsList();
    getTransactionsList();
  }, []);

  useEffect(() => {
    if (sysTransactions.length > 0) {
      handleQuantiteDifference();
    }
  }, [transactions, sysTransactions]);

  const handleCompChange = (type) => {
    if (type === 'Nbr. Action') {
      setGroupByTitre(titleTotalsAchat);
    } else if (type === '+Value') {
      setGroupByTitre(titleTotalsPNL);
    }
  };
  const handleValuesChange = (type) => {
    if (type === 'Nbr. Action') {
      setGroupByTitre(titleTotalsAchat);
    } else if (type === '+Value') {
      setGroupByTitre(titleTotalsPNL);
    }
  };
  function formatNumber(number) {
    // Convert number to string
    const dotNumber = number.toFixed(2);
    const numberString = dotNumber.toString();

    // Split the number into integer and decimal parts
    const [integerPart, decimalPart] = numberString.split('.');

    // Format the integer part with periods as thousand separators
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Format the decimal part, if it exists
    const formattedDecimalPart = decimalPart ? `,${decimalPart}` : '';

    // Combine the formatted integer part and the decimal part
    return `${formattedIntegerPart}${formattedDecimalPart} DH`;
  }
  const handleQuantiteDifference = () => {
    // Group transactions by 'Titre'
    const groupedTransactions = transactions.reduce((acc, row) => {
      if (row.titre === 'Titre') return acc;
      if (!acc[row.titre]) {
        acc[row.titre] = { achat: 0, vente: 0, montantAchat: 0, montantVente: 0 };
      }
      if (row.av === 'achat') {
        acc[row.titre].achat += Number(row.quantite);
        acc[row.titre].montantAchat += Number(row.montant);
      } else if (row.av === 'vente') {
        acc[row.titre].vente += Number(row.quantite);
        acc[row.titre].montantVente += Number(row.montant);
      }
      return acc;
    }, {});

    // Calculate the difference for both Quantite and Montant, then format the result
    const result = Object.keys(groupedTransactions).map((titre) => ({
      id: titre,
      quantiteDifference: groupedTransactions[titre].vente - groupedTransactions[titre].achat,
      montantDifference: groupedTransactions[titre].montantVente - groupedTransactions[titre].montantAchat,
    }));

    // Sort the result: prioritize non-zero quantite differences and then by descending order
    result.sort((a, b) => {
      if (a.quantiteDifference === 0) return 1; // Push zero quantite values to the end
      if (b.quantiteDifference === 0) return -1; // Push zero quantite values to the end
      return b.quantiteDifference - a.quantiteDifference; // Descending order for non-zero quantite
    });


    setStatsData(result);
    return result;
  };
  const calculatePnLByTitre = (sysTransactions) => {
    return sysTransactions.reduce(
      (acc, value) => {
        const { titre, quantite, prixAchat, prixVente, taxValue = 0 } = value;

        // Parse fields as numbers and handle missing fields
        const parsedPrixAchat = parseFloat(prixAchat) || 0;
        const parsedPrixVente = parseFloat(prixVente) || 0;
        const parsedQuantite = parseFloat(quantite) || 0;
        const parsedTaxValue = parseFloat(taxValue) || 0;

        // Calculate the total purchase and sale amounts with tax for this transaction
        const achat = parsedPrixAchat * parsedQuantite + parsedQuantite * parsedPrixAchat * parsedTaxValue;
        const vente = parsedPrixVente * parsedQuantite - parsedQuantite * parsedPrixVente * parsedTaxValue;

        // Calculate PnL for this transaction
        let pnl = vente - achat;
        let taxAmount = 0;

        // If the PnL is positive, apply a 15% tax
        if (pnl > 0) {
          taxAmount = pnl * 0.15; // Store the tax amount (15% of pnl)
          pnl *= 0.85; // Deduct 15% tax
        }

        // Initialize the PnL, totalTax, and totalTaxValue for this titre if they don't exist yet
        if (!acc.pnl[titre]) {
          acc.pnl[titre] = 0;
        }
        if (!acc.totalTax[titre]) {
          acc.totalTax[titre] = 0;
        }
        if (!acc.totalTaxValue[titre]) {
          acc.totalTaxValue[titre] = 0;
        }

        // Add the PnL for this transaction to the total PnL for the specific titre
        acc.pnl[titre] += pnl;
        acc.totalTax[titre] += taxAmount; // Add the tax amount to the total tax for the specific titre
        acc.totalTaxValue[titre] += parsedTaxValue * parsedQuantite; // Add the parsedTaxValue to the total tax value for the titre

        return acc;
      },
      { pnl: {}, totalTax: {}, totalTaxValue: {} } // Initialize accumulator with both PnL, total tax, and tax value objects
    );
  };

  // Calculate PnL, total tax, and total tax value by titre
  const { pnl: pnlByTitre, totalTax: totalTaxByTitre, totalTaxValue: totalTaxValueByTitre } = calculatePnLByTitre(sysTransactions);

  // Update your statsData with PnL, difference, tax, and total tax value
  const updatedStatsData = statsData.map(row => {
    const pnl = pnlByTitre[row.id] || 0; // Fetch PnL from sysTransactions, default to 0 if not found
    const totalTax = totalTaxByTitre[row.id] || 0; // Fetch total tax from sysTransactions, default to 0 if not found
    const totalTaxValue = totalTaxValueByTitre[row.id] || 0; // Fetch total tax value from sysTransactions, default to 0 if not found
    const pnlDifference = pnl - row.montantDifference; // Calculate the difference

    return {
      ...row,
      totalPnl: pnl, // Add totalPnl column
      pnlDifference, // Add the difference column
      totalTax, // Add the total tax column
      totalTaxValue, // Add the total tax value column
    };
  });




  const formatDateWithoutLeadingZeros = (date) => {
    const day = date.getDate(); // No leading zero
    const month = date.getMonth() + 1; // Months are zero-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const calculatePnLByDate = (sysTransactions) => {
    return sysTransactions.reduce((acc, value) => {
      const { date, quantite, prixAchat, prixVente, taxValue = 0 } = value;

      // Ensure date exists and convert to a Date object
      const dateInMilliseconds = date?.seconds ? date.seconds * 1000 : null;
      const parsedDate = dateInMilliseconds ? new Date(dateInMilliseconds) : null;

      if (!parsedDate || Number.isNaN(parsedDate)) {
        console.warn('Invalid or missing date:', date);
        return acc;
      }
      const formattedDate = formatDateWithoutLeadingZeros(parsedDate);
  
      // Parsing numeric fields with fallback to 0 for NaN cases
      const parsedPrixAchat = parseFloat(prixAchat) || 0;
      const parsedPrixVente = parseFloat(prixVente) || 0;
      const parsedQuantite = parseFloat(quantite) || 0;
      const parsedTaxValue = parseFloat(taxValue) || 0;

      // PnL calculation logic
      const achat = parsedPrixAchat * parsedQuantite + parsedQuantite * parsedPrixAchat * parsedTaxValue;
      const vente = parsedPrixVente * parsedQuantite - parsedQuantite * parsedPrixVente * parsedTaxValue;
      let pnl = vente - achat;
      let taxAmount = 0;

      if (pnl > 0) {
        taxAmount = pnl * 0.15;
        pnl *= 0.85;
      }

      if (!acc[parsedDate]) {
        acc[parsedDate] = { pnl: 0, totalTax: 0 };
      }

      acc[parsedDate].pnl += pnl;
      acc[parsedDate].totalTax += taxAmount;

      return acc;
    }, {});
  };


  // Example Usage
  const getDateKey = (date, filterType) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const week = Math.ceil(day / 7);

    switch (filterType) {
      case 'semaine':
        return `${year}-S${week}`;
      case 'mois':
        return `${year}-${month}`; // Month as `year-month` without padding
      case 'trimestre':
        return `${year}-T${Math.ceil(month / 3)}`;
      case 'anne':
        return `${year}`;
      default:
        return `${day}/${month}/${year}`; // Use consistent `DD/MM/YYYY` format for 'jour'
    }
  };

  const aggregatePnL = (pnlByDate, filterType) => {
    return Object.entries(pnlByDate).reduce((acc, [date, { pnl, totalTax }]) => {
      const key = getDateKey(date, filterType);

      // Initialize the accumulation object for the current key if not present
      if (!acc[key]) {
        acc[key] = { pnl: 0, totalTax: 0 };
      }

      // Ensure pnl and totalTax are numbers; use 0 as fallback for NaN
      const safePnl = Number.isNaN(pnl) ? 0 : pnl;
      const safeTotalTax = Number.isNaN(totalTax) ? 0 : totalTax;

      // Aggregate values
      acc[key].pnl += safePnl;
      acc[key].totalTax += safeTotalTax;

      return acc;
    }, {});
  };


  const getDateForSorting = (dateString, filterType) => {
    if (filterType === 'semaine') {
      const [year, week] = dateString.split('-S');
      const startDate = new Date(year, 0, 1); // Start of the year
      const daysOffset = (parseInt(week, 10) - 1) * 7;
      return new Date(startDate.setDate(startDate.getDate() + daysOffset));
    }
    if (filterType === 'trimestre') {
      const [year, quarter] = dateString.split('-T');
      const month = (parseInt(quarter, 10) - 1) * 3;
      return new Date(year, month, 1);
    }
    if (filterType === 'mois') {
      const [year, month] = dateString.split('-').map(Number);
      return new Date(year, month - 1, 1); // Month adjusted for zero index
    }
    if (filterType === 'anne') {
      return new Date(`${dateString}-01-01`); // Set to January 1st of the year
    }

    // For 'jour', assume `DD/MM/YYYY` format, splitting manually
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  // Example usage
  const [filterType, setFilterType] = useState('mois');
  const pnlByDate = calculatePnLByDate(sysTransactions);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(dayjs(new Date()));
  // Recalculate filtered PnL data when filterType changes
  const filteredPnL = useMemo(() => {
    let data = aggregatePnL(pnlByDate, filterType);

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      data = Object.fromEntries(
        Object.entries(data).filter(([dateKey]) => {
          const date = new Date(dateKey);
          return date >= start && date <= end;
        })
      );
    }

    return data;
  }, [pnlByDate, filterType, startDate, endDate]);


  const chartData = useMemo(() => {
    const sortedDates = Object.keys(filteredPnL).sort((a, b) =>
      getDateForSorting(a, filterType) - getDateForSorting(b, filterType)
    );

    return {
      labels: sortedDates,
      datasets: [
        {
          label: `PnL - ${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`,
          data: sortedDates.map(date => filteredPnL[date].pnl),
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          fill: false,
        },
      ],
    };
  }, [filteredPnL, filterType]);

  const handleFilterChange = (event) => {
    setFilterType(event.target.value);
  };
  const options = {
    scales: {
      x: { title: { display: true, text: 'Période' } },
      y: { title: { display: true, text: 'PnL' } },
    },

  };


  const groupedPnLData = aggregatePnL(pnlByDate, 'monthly'); // Change to 'quarterly' or 'yearly' as needed

  const barChartData = {
    labels: Object.keys(groupedPnLData),
    datasets: [
      {
        label: 'PnL',
        data: Object.values(groupedPnLData).map(item => item.pnl),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };
  const rows = useMemo(() =>
    Object.keys(filteredPnL).map((dateKey, index) => {
      return {
        id: index,
        date: dateKey,
        pnl: filteredPnL[dateKey].pnl,
        totalTax: filteredPnL[dateKey].totalTax,
      };
    }), [filteredPnL]);


  const columns = [
    { field: 'date', headerName: 'Date', width: 150 },
    {
      field: 'pnl', headerName: '+/-Value', width: 200,

      renderCell: ({ value }) => (
        <Typography
          variant="h6"
          color={value > 0 ? '#019875' : value === 0 ? 'black' : '#e8305f'}
          sx={{ textTransform: 'none' }}
        >
          {formatNumber(value)}
        </Typography>
      ),

    },
    // { field: 'totalTax', headerName: 'Total Tax', width: 150 },
  ];

  return (
    <>
      <Helmet>
        <title> Tableau de bord </title>
      </Helmet>

      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card
              style={{
                padding: '20px',
              }}
            >
              <Stack direction={"row"} spacing={2}>


                <FormControl fullWidth variant="outlined" style={{ marginBottom: '1rem' }}>
                  <InputLabel id="time-period-select-label">Période</InputLabel>
                  <Select
                    labelId="time-period-select-label"
                    id="time-period-select"
                    value={filterType}
                    onChange={handleFilterChange}
                    label="Time Period"
                  >
                    <MenuItem value="jour">Jour</MenuItem>
                    {/* <MenuItem value="semaine">Semaine</MenuItem> */}
                    <MenuItem value="mois">Mois</MenuItem>
                    {/* <MenuItem value="trimestre">Trimestre</MenuItem> */}
                    <MenuItem value="anne">Anne</MenuItem>
                  </Select>
                </FormControl>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      maxDate={endDate} // Start date cannot exceed end date
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      minDate={startDate} // End date cannot be before start date
                      maxDate={dayjs(new Date())} // End date cannot exceed today's date
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Box>
                </LocalizationProvider>

              </Stack>
              <Stack direction={"row"}>
                <Box >


                  <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={10}
                    sx={{ height: "500px" }}
                    rowsPerPageOptions={[10, 20, 50]}

                  />
                </Box>
                <Box
                  style={{
                    width: '100%',
                    height: '500px',
                  }}
                >

                  {
                    chartType === "line" ? (

                      <Line data={chartData} options={options} />
                    ) : (

                      <Bar
                        data={barChartData}
                        options={{
                          scales: {
                            x: { title: { display: true, text: 'Periode' } },
                            y: { title: { display: true, text: 'PnL' } },
                          },
                          plugins: {
                            legend: { display: true },


                          }
                        }}
                      />
                    )
                  }
                </Box>
              </Stack>

            </Card>

          </Grid>
          <Grid item xs={12}>
            <Card
              style={{
                padding: '20px',
              }}
            >
              <Typography variant="h4" sx={{ mb: 5 }}>
                Resultats
              </Typography>
              <DataGrid
                rows={updatedStatsData}
                columns={[
                  { field: 'id', headerName: 'Titre', width: 260 },
                  {
                    field: 'montantDifference',
                    headerName: '+/- Value',
                    width: 300,
                    renderCell: ({ value }) => (
                      <Typography variant="h6" color={value > 0 ? '#019875' : '#e8305f'} sx={{ textTransform: 'none' }}>
                        {formatNumber(value)}
                      </Typography>
                    ),
                  },
                  {
                    field: 'quantiteDifference',
                    headerName: 'Difference Qte',
                    width: 300,
                    renderCell: ({ value }) => (
                      <Typography
                        variant="h6"
                        color={value < 0 ? '#019875' : value === 0 ? 'black' : '#e8305f'}
                        sx={{ textTransform: 'none' }}
                      >
                        {-value}
                      </Typography>
                    ),
                  },
                  {
                    field: 'totalPnl',
                    headerName: 'Total Systeme',
                    width: 300,
                    renderCell: ({ value }) => (
                      <Typography variant="h6" color={value > 0 ? '#019875' : value === 0 ? 'black' : '#e8305f'} sx={{ textTransform: 'none' }}>
                        {formatNumber(value)}
                      </Typography>
                    ),
                  },
                  {
                    field: 'pnlDifference',
                    headerName: 'Diff. (Systeme - Banque)',
                    width: 300,
                    renderCell: ({ value }) => (
                      <Typography
                        variant="h6"
                        color={
                          value > 1
                            ? '#019875' // Green if value > 1
                            : value >= -1 && value <= 1
                              ? 'black' // Black if value is between 0 and 1 (inclusive)
                              : '#e8305f' // Red if value < 0
                        }
                        sx={{ textTransform: 'none' }}
                      >                        {formatNumber(value)}
                      </Typography>
                    ),
                  },
                  {
                    field: 'totalTax',
                    headerName: 'Total IGR',
                    width: 300,
                    renderCell: ({ value }) => (
                      <Typography variant="h6" color={'black'} sx={{ textTransform: 'none' }}>


                        {formatNumber(value)}
                      </Typography>
                    ),
                  },
                  {
                    field: 'totalTaxValue',
                    headerName: 'Total IGR Value',
                    width: 300,
                    renderCell: ({ value }) => (
                      <Typography variant="h6" color={'black'} sx={{ textTransform: 'none' }}>
                        {formatNumber(value)}
                      </Typography>
                    ),
                  },
                ]}
                style={{ height: 400, width: '100%' }}
                rowsPerPageOptions={[5]}
                pageSize={5}
                disableRowSelectionOnClick
                disableMultipleRowSelection
                checkboxSelection={false}
                disableColumnMenu
                sx={{
                  '& .MuiDataGrid-cell': {
                    border: '1px solid rgba(200, 200, 200, 1)',
                  },
                  '& .MuiDataGrid-row': {
                    borderBottom: '1px solid rgba(200, 200, 200, 1)',
                  },
                }}
              />
              <Stack direction="row" spacing={2} sx={{ mt: 5 }}>
                <Stack direction="column" sx={{ mt: 5 }}>
                  <Typography variant="h6">Total Difference Qte</Typography>
                  <TextField

                    value={-updatedStatsData.reduce((acc, value) => acc + value.quantiteDifference, 0)}
                    InputProps={{
                      readOnly: true,
                      sx: { color: '#019875' }, // Custom text color
                    }}
                    variant="outlined"
                    sx={{ width: 200 }} // Adjust width as necessary
                  />
                </Stack>

                <Stack direction="column" sx={{ mt: 5 }}>
                  <Typography variant="h6">Total IGR</Typography>
                  <TextField
                    value={formatNumber(Object.values(totalTaxByTitre).reduce((acc, value) => acc + value, 0))}
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="outlined"
                    sx={{ width: 200 }} // Adjust width as necessary
                  />
                </Stack>


                <Stack direction="column" sx={{ mt: 5 }}>
                  <Typography variant="h6">Total IGR Value</Typography>
                  <TextField
                    value={formatNumber(Object.values(totalTaxValueByTitre).reduce((acc, value) => acc + value, 0))}
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="outlined"
                    sx={{ width: 200 }} // Adjust width as necessary
                  />
                </Stack>

              </Stack>
            </Card>
          </Grid>


          <Grid item xs={12} md={6} lg={8}>
            <AppConversionRates
              title="Conversion Rates"
              handleCompChange={handleValuesChange}
              subheader="(+43%) than last year"
              chartData={groupByTitre}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppCurrentVisits
              title="Composition"
              chartData={groupByTitre}
              handleCompChange={handleCompChange}
              chartColors={[
                theme.palette.primary.main,
                theme.palette.info.main,
                theme.palette.warning.main,
                theme.palette.error.main,
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppWebsiteVisits
              title="Historique"
              subheader="(+43%) than last year"
              chartLabels={['02/01/2021', '03/01/2021', '04/01/2021', '05/01/2021', '06/01/2021', '07/01/2021']}
              chartData={[
                {
                  name: 'Team A',
                  type: 'column',
                  fill: 'solid',
                  data: [23, 11, 22, 27],
                },
                {
                  name: 'Team B',
                  type: 'area',
                  fill: 'gradient',
                  data: [44, 55, 41, 67, 22, 43, 21, 41],
                },
                {
                  name: 'Team C',
                  type: 'line',
                  fill: 'solid',
                  data: [30, 25, 36, 30, 45, 35, 64, 52],
                },
                {
                  name: 'Team C',
                  type: 'line',
                  fill: 'solid',
                  data: [30, 25, 36, 30, 45, 35, 64, 52],
                },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppCurrentSubject
              title="Current Subject"
              chartLabels={['English', 'History', 'Physics', 'Geography', 'Chinese', 'Math']}
              chartData={[
                { name: 'Series 1', data: [80, 50, 30, 40, 100, 20] },
                { name: 'Series 2', data: [20, 30, 40, 80, 20, 80] },
                { name: 'Series 3', data: [44, 76, 78, 13, 43, 10] },
              ]}
              chartColors={[...Array(6)].map(() => theme.palette.text.secondary)}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppNewsUpdate
              title="News Update"
              list={[...Array(5)].map((_, index) => ({
                id: faker.datatype.uuid(),
                title: faker.name.jobTitle(),
                description: faker.name.jobTitle(),
                image: `/assets/images/covers/cover_${index + 1}.jpg`,
                postedAt: faker.date.recent(),
              }))}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppOrderTimeline
              title="Order Timeline"
              list={[...Array(5)].map((_, index) => ({
                id: faker.datatype.uuid(),
                title: [
                  '1983, orders, $4220',
                  '12 Invoices have been paid',
                  'Order #37745 from September',
                  'New order placed #XF-2356',
                  'New order placed #XF-2346',
                ][index],
                type: `order${index + 1}`,
                time: faker.date.past(),
              }))}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppTrafficBySite
              title="Traffic by Site"
              list={[
                {
                  name: 'FaceBook',
                  value: 323234,
                  icon: <Iconify icon={'eva:facebook-fill'} color="#1877F2" width={32} />,
                },
                {
                  name: 'Google',
                  value: 341212,
                  icon: <Iconify icon={'eva:google-fill'} color="#DF3E30" width={32} />,
                },
                {
                  name: 'Linkedin',
                  value: 411213,
                  icon: <Iconify icon={'eva:linkedin-fill'} color="#006097" width={32} />,
                },
                {
                  name: 'Twitter',
                  value: 443232,
                  icon: <Iconify icon={'eva:twitter-fill'} color="#1C9CEA" width={32} />,
                },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppTasks
              title="Tasks"
              list={[
                { id: '1', label: 'Create FireStone Logo' },
                { id: '2', label: 'Add SCSS and JS files if required' },
                { id: '3', label: 'Stakeholder Meeting' },
                { id: '4', label: 'Scoping & Estimations' },
                { id: '5', label: 'Sprint Showcase' },
              ]}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

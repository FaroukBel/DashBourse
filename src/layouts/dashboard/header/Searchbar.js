import { useEffect, useState } from 'react';
// @mui
import { styled } from '@mui/material/styles';
import { collection, getDocs } from 'firebase/firestore';
import { Input, Slide, Button, IconButton, InputAdornment, ClickAwayListener, Stack, Typography } from '@mui/material';
// utils
import { bgBlur } from '../../../utils/cssStyles';
// component
import Iconify from '../../../components/iconify';
import { db } from '../../../config/firebase-config';

// ----------------------------------------------------------------------

const HEADER_MOBILE = 64;
const HEADER_DESKTOP = 92;

const StyledSearchbar = styled('div')(({ theme }) => ({
  ...bgBlur({ color: theme.palette.background.default }),
  top: 0,
  left: 0,
  zIndex: 99,
  width: '100%',
  display: 'flex',
  position: 'absolute',
  alignItems: 'center',
  height: HEADER_MOBILE,
  padding: theme.spacing(0, 3),
  boxShadow: theme.customShadows.z8,
  [theme.breakpoints.up('md')]: {
    height: HEADER_DESKTOP,
    padding: theme.spacing(0, 5),
  },
}));

// ----------------------------------------------------------------------

export default function Searchbar() {
  const [open, setOpen] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const handleOpen = () => {
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const listTransactionRef = collection(db, 'bank_transactions');
  const getTransactionsList = async () => {
    const transactionSnapshot = await getDocs(listTransactionRef);

    const transactionListData = transactionSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setTransactions(transactionListData);
  };

  useEffect(() => {
    getTransactionsList();
  }, []);

  const { totalAchat, totalVente, totalQuantite, totalDiv, totalDivQte, pnlAction, totalTVA, globalPnl, taxImmoTotal } =
    transactions.reduce(
      (acc, value) => {
        // Parse fields as numbers and handle missing fields
        const type = value.av || 'achat';
        const prix = parseFloat(value.montant) || 0;
        // Calculate global pnl
        if (type === 'achat') {
          acc.totalAchat += parseFloat(prix);
        } else {
          acc.totalVente += parseFloat(prix);
        }

        acc.globalPnl = acc.totalVente - acc.totalAchat;

        return acc;
      },
      {
        totalAchat: 0,
        totalVente: 0,
        globalPnl: 0,
      }
    );
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
  return (
    <ClickAwayListener onClickAway={handleClose}>
   
      <Stack direction="row-reverse" width={'100%'} fullWidth mx={3}>
        <Stack direction={'row'}>
          <Typography
            variant="h6"
            color={'text.primary'}
            sx={{
              fontWeight: 'bold',
              fontSize: '1.5rem',
            }}
          >
            +/- Value
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: globalPnl > 0 ? 'success.main' : 'error.main',
              fontWeight: 'bold',
              fontSize: '1.5rem',
              ml: 2,
              mr: 2,
            }}
          >
            {formatNumber(globalPnl.toFixed(2))} DH
          </Typography>
        </Stack>
      </Stack>
    </ClickAwayListener>
  );
}

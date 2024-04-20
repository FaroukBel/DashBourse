import { Helmet } from 'react-helmet-async';
import { useState } from 'react';

// @mui
import { Button, Container, Stack, Typography } from '@mui/material';
import { AchatBankCard } from '../components/cards/AchatBankCard';
import { DividendeCard } from '../components/cards/DividendeCard';
import { VenteCard } from '../components/cards/VenteCard';
import { TaxImmobiliere } from '../components/cards/TaxImmoCard';
import { VenteBankCard } from '../components/cards/VenteBankCard';

// ----------------------------------------------------------------------

export default function BankTransactionsPage() {
  const [selectedService, setSelectedService] = useState('Achat');

  return (
    <>
      <Helmet>
        <title> Dashboard: Products | Minimal UI </title>
      </Helmet>

      <Container fullWidth maxWidth="xl" sx={{ mt: 3 }}>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Operations Bancaire
        </Typography>

        <Stack direction="column" spacing={3}>
          {selectedService === 'Achat' && (
            <Stack direction="row" spacing={3} fullwidth>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} width={'100%'}>
                <AchatBankCard />
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} width={'100%'}>
                <VenteBankCard />
              </Stack>
            </Stack>
          )}
        </Stack>
      </Container>
    </>
  );
}

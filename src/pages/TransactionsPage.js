import { Helmet } from 'react-helmet-async';
import { useState } from 'react';

// @mui
import { Button, Container, Stack, Typography } from '@mui/material';
import { AchatCard } from '../components/cards/AchatCard';
import { DividendeCard } from '../components/cards/DividendeCard';
import { VenteCard } from '../components/cards/VenteCard';
import { TaxImmobiliere } from '../components/cards/TaxImmoCard';

// ----------------------------------------------------------------------

export default function TransactionsPage() {
  const [selectedService, setSelectedService] = useState('Achat');

  return (
    <>
      <Helmet>
        <title> Operations </title>
      </Helmet>

      <Container fullWidth maxWidth="xl" sx={{ mt: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="center" mb={5} fullWidth>
          <Typography fontSize={39} sx={{ mb: 5 }}>
            Operations
          </Typography>
        </Stack>
        <Stack direction="row" flexWrap="wrap-reverse" alignItems="center" justifyContent="flex-end" sx={{ mb: 5 }}>
          <Stack direction="row" spacing={1} flexShrink={0}>
            {/* <ProductFilterSidebar
              openFilter={openFilter}
              onOpenFilter={handleOpenFilter}
              onCloseFilter={handleCloseFilter}
            />
            <ProductSort /> */}
            <Button
              variant={selectedService === 'Achat' ? 'contained' : 'outlined'}
              onClick={() => {
                if (selectedService !== 'Achat') setSelectedService('Achat');
              }}
            >
              Achat/Vente
            </Button>
            <Button
              variant={selectedService === 'Dividende' ? 'contained' : 'outlined'}
              onClick={() => {
                if (selectedService !== 'Dividende') setSelectedService('Dividende');
              }}
            >
              Dividendes
            </Button>
            <Button
              variant={selectedService === 'tax' ? 'contained' : 'outlined'}
              onClick={() => {
                if (selectedService !== 'tax') setSelectedService('tax');
              }}
            >
              Tax Immobiliere
            </Button>
          </Stack>
        </Stack>
        <Stack direction="column" spacing={3}>
          {selectedService === 'Achat' && (
            <Stack direction="row" spacing={3} fullwidth>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} width={'100%'}>
                <AchatCard />
              </Stack>
            </Stack>
          )}
          <Stack direction="row" spacing={3} fullwidth>
            {selectedService === 'Dividende' && (
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} width={'100%'}>
                <DividendeCard />
              </Stack>
            )}
            {selectedService === 'tax' && (
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} width={'100%'}>
                <TaxImmobiliere />
              </Stack>
            )}
          </Stack>
        </Stack>
      </Container>
    </>
  );
}

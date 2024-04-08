import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
// @mui
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import frLocale from 'date-fns/locale/fr';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { frFR } from '@mui/x-date-pickers/locales';

// ----------------------------------------------------------------------

export default function TransactionsPage() {
  const [prixAchat, setPrixAchat] = useState(0);
  const [prixVente, setPrixVente] = useState(0);
  const [quantiteAchat, setQuantiteAchat] = useState(0);
  const [quantiteVente, setQuantiteVente] = useState(0);
  const [commissionAchat, setCommissionAchat] = useState(0);
  const [commissionVente, setCommissionVente] = useState(0);
  const [totalAchat, setTotalAchat] = useState(0);
  const [totalVente, setTotalVente] = useState(0);
  const [totalCommissionAchat, setTotalCommissionAchat] = useState(0);
  const [totalCommissionVente, setTotalCommissionVente] = useState(0);

  const options = [
    'AFMA SA',
    'Afric Industries Sa',
    'Afriquia Gaz',
    'Agma Lahlou-Tazi',
    'Akdital',
    'Alliances',
    'Aluminum du Maroc',
    'Aradei Capital',
    'Atlanta',
    'Attijariwafa Bank',
    'Auto Hall',
    'Auto Nejma',
    'Balima',
    'BCP',
    'Bmce Bank',
    'Cartier Saada',
    'CDM',
    'CFG',
    'CIH',
    'Ciments Du Maroc',
    'Colorado',
    'Compagnie Sucrerie Marocaine',
    'CTM',
    'Dari Couspate',
    'Delattre Levivier Maroc',
    'Delta Holding S.A',
    'Disty Tech',
    'Disway',
    'Douja Prom Addoha',
    'Ennakl Automobiles SA',
    'Fenie Brossette',
    'Hps',
    'IB Maroc Com',
    'Immorente Invest',
    'Involys',
    'Itissalat Al-Maghrib',
    'Jet Contractors',
    'Label Vie',
    'LafargeHolcim Maroc',
    'Les Eaux Minerales Oulmes',
    'Lesieur Cristal',
    'M2M Group',
    'Maghreb Oxygene',
    'Maghrebail',
    'Managem',
    'Maroc Leasing',
    'Marocaine pour le Commerce et l’Industrie Banque',
    'Marocaine Ste de Therapeutique',
    'Med Paper',
    'Micro Data SA',
    'Miniere Touissit',
    'Mutandis',
    'Nationale d’Electrolyse et de Petrochimie Ste',
    'Realis. Mecaniques',
    'Rebab Company',
    'Residences Dar Saada',
    'Risma',
    'S2M',
    'Salafin',
    'Sanlam Maroc',
    'SMI',
    'Societe des Boissons du Maroc',
    'Societe d’Exploitation des Ports',
    'Societe Equipement',
    'Ste de Travaux de Realisation d’Ouvrages et de Con',
    'Ste Nationale de Siderurgie',
    'Ste Promotion Pharmaceutique du Maghreb',
    'Stokvis Nord Afrique',
    'Taqa Morocco SA',
    'Timar',
    'Total Maroc SA',
    'Travaux Generaux De Construction',
    'Unimer',
    'Wafa Assurance',
    'Zellidja S.A',
  ];

  const handleAchatChange = (event) => {
    setPrixAchat(event.target.value);
    setTotalAchat(event.target.value * quantiteAchat);
    setCommissionAchat((event.target.value * quantiteAchat * 0.0044).toFixed(2));
    setTotalCommissionAchat(
      (event.target.value * quantiteAchat * 0.0044 + event.target.value * quantiteAchat).toFixed(2)
    );
  };
  const handleQuantiteAchatChange = (event) => {
    setQuantiteAchat(event.target.value);
    setTotalAchat(prixAchat * event.target.value);
    setCommissionAchat((event.target.value * prixAchat * 0.0044).toFixed(2));
    setTotalCommissionAchat((event.target.value * prixAchat * 0.0044 + event.target.value * prixAchat).toFixed(2));
  };
  const handleVenteChange = (event) => {
    setPrixVente(event.target.value);
    setTotalVente(event.target.value * quantiteVente);
    setCommissionVente((event.target.value * quantiteVente * 0.0044).toFixed(2));
    setTotalCommissionVente(
      (event.target.value * quantiteVente * 0.0044 + event.target.value * quantiteVente).toFixed(2)
    );
  };
  const handleQuantiteVenteChange = (event) => {
    setQuantiteVente(event.target.value);
    setTotalVente(prixVente * event.target.value);
    setCommissionVente((event.target.value * prixVente * 0.0044).toFixed(2));
    setTotalCommissionVente((event.target.value * prixVente * 0.0044 + event.target.value * prixVente).toFixed(2));
  };

  return (
    <>
      <Helmet>
        <title> Dashboard: Products | Minimal UI </title>
      </Helmet>

      <Container fullWidth maxWidth="xl" sx={{ mt: 3 }}>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Products
        </Typography>

        <Stack direction="row" flexWrap="wrap-reverse" alignItems="center" justifyContent="flex-end" sx={{ mb: 5 }}>
          <Stack direction="row" spacing={1} flexShrink={0} sx={{ my: 1 }}>
            {/* <ProductFilterSidebar
              openFilter={openFilter}
              onOpenFilter={handleOpenFilter}
              onCloseFilter={handleCloseFilter}
            />
            <ProductSort /> */}
          </Stack>
        </Stack>
        <Stack direction="column" spacing={3}>
          <Stack direction="row" spacing={3} fullwidth>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} width={'100%'}>
              <Card style={{ width: '100%' }}>
                <CardHeader title="Achat" />
                <CardContent>
                  <Stack direction={'column'} spacing={2}>
                    <Stack direction={'row'} spacing={2}>
                      <FormControl fullWidth fullheight>
                        <InputLabel id="select-titre-label">Titre</InputLabel>

                        <Select labelId="select-titre-label" label="Titre" variant="outlined" size="medium">
                          {options.map((option, index) => (
                            <MenuItem key={index} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Date d'achat"
                          disableFuture
                          className="bg-white"
                          name="birthDate"
                          format="DD-MM-YYYY"
                        />
                      </LocalizationProvider>
                    </Stack>
                    <Stack direction={'row'} spacing={2}>
                      <TextField
                        fullWidth
                        label="Prix d'achat"
                        type="number"
                        variant="outlined"
                        size="medium"
                        value={prixAchat}
                        onChange={handleAchatChange}
                      />
                      <TextField
                        fullWidth
                        label="Quantite"
                        type="number"
                        variant="outlined"
                        size="medium"
                        value={quantiteAchat}
                        onChange={handleQuantiteAchatChange}
                      />
                    </Stack>
                    <Stack direction={'row'} spacing={2}>
                      <TextField
                        fullWidth
                        label="Commission"
                        type="number"
                        variant="outlined"
                        size="medium"
                        value={commissionAchat}
                        InputProps={{
                          readOnly: true,
                          autoFocus: true,
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Total"
                        type="number"
                        variant="outlined"
                        size="medium"
                        value={totalAchat}
                        InputProps={{
                          readOnly: true,
                          autoFocus: true,
                        }}
                      />
                    </Stack>
                    <TextField
                      fullWidth
                      label="Total + Commission"
                      type="number"
                      variant="outlined"
                      size="medium"
                      value={totalCommissionAchat}
                      InputProps={{
                        readOnly: true,
                        autoFocus: true,
                      }}
                    />
                    <Stack direction={'row'} spacing={2}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="medium"
                        style={{ color: 'black', borderColor: 'gray' }}
                      >
                        Effacer
                      </Button>
                      <Button fullWidth variant="contained" size="medium" color="success" style={{ color: 'white' }}>
                        Acheter
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} width={'100%'}>
              <Card style={{ width: '100%' }}>
                <CardHeader title="Vente" />
                <CardContent>
                  <Stack direction={'column'} spacing={2}>
                    <Stack direction={'row'} spacing={2}>
                      <FormControl fullWidth fullheight>
                        <InputLabel id="select-titre-label">Titre</InputLabel>

                        <Select labelId="select-titre-label" label="Titre" variant="outlined" size="medium">
                          {options.map((option, index) => (
                            <MenuItem key={index} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <LocalizationProvider
                        dateAdapter={AdapterDayjs}
                        localeText={frFR.components.MuiLocalizationProvider.defaultProps.localeText}
                      >
                        <DatePicker
                          label="Date de vente"
                          disableFuture
                          className="bg-white"
                          name="birthDate"
                          format="DD-MM-YYYY"
                        />
                      </LocalizationProvider>
                    </Stack>
                    <Stack direction={'row'} spacing={2}>
                      <TextField
                        fullWidth
                        label="Prix de vente"
                        type="number"
                        variant="outlined"
                        size="medium"
                        value={prixVente}
                        onChange={handleVenteChange}
                      />
                      <TextField
                        fullWidth
                        label="Quantite"
                        type="number"
                        variant="outlined"
                        size="medium"
                        value={quantiteVente}
                        onChange={handleQuantiteVenteChange}
                      />
                    </Stack>
                    <Stack direction={'row'} spacing={2}>
                      <TextField
                        fullWidth
                        label="Commission"
                        type="number"
                        variant="outlined"
                        size="medium"
                        value={commissionVente}
                        InputProps={{
                          readOnly: true,
                          autoFocus: true,
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Total"
                        type="number"
                        variant="outlined"
                        size="medium"
                        value={totalVente}
                        InputProps={{
                          readOnly: true,
                          autoFocus: true,
                        }}
                      />
                    </Stack>
                    <TextField
                      fullWidth
                      label="Total + Commission"
                      type="number"
                      variant="outlined"
                      size="medium"
                      value={totalCommissionVente}
                      InputProps={{
                        readOnly: true,
                        autoFocus: true,
                      }}
                    />
                    <Stack direction={'row'} spacing={2}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="medium"
                        style={{ color: 'black', borderColor: 'gray' }}
                      >
                        Effacer
                      </Button>
                      <Button fullWidth variant="contained" size="medium" color="error" style={{ color: 'white' }}>
                        Vendre
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={3} fullwidth>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} width={'100%'}>
              <Card style={{ width: '100%' }}>
                <CardHeader title="Dividendes" />
                <CardContent>
                  <Stack direction={'column'} spacing={2}>
                    <Stack direction={'row'} spacing={2}>
                      <FormControl fullWidth fullheight>
                        <InputLabel id="select-titre-label">Titre</InputLabel>

                        <Select labelId="select-titre-label" label="Titre" variant="outlined" size="medium">
                          {options.map((option, index) => (
                            <MenuItem key={index} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Date d'achat"
                          disableFuture
                          className="bg-white"
                          name="birthDate"
                          format="DD-MM-YYYY"
                        />
                      </LocalizationProvider>
                    </Stack>
                    <Stack direction={'row'} spacing={2}>
                      <TextField
                        fullWidth
                        label="Prix d'achat"
                        type="number"
                        variant="outlined"
                        size="medium"
                        value={prixAchat}
                        onChange={handleAchatChange}
                      />
                      <TextField
                        fullWidth
                        label="Quantite"
                        type="number"
                        variant="outlined"
                        size="medium"
                        value={quantiteAchat}
                        onChange={handleQuantiteAchatChange}
                      />
                    </Stack>
                    <Stack direction={'row'} spacing={2}>
                      <TextField
                        fullWidth
                        label="Commission"
                        type="number"
                        variant="outlined"
                        size="medium"
                        value={commissionAchat}
                        InputProps={{
                          readOnly: true,
                          autoFocus: true,
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Total"
                        type="number"
                        variant="outlined"
                        size="medium"
                        value={totalAchat}
                        InputProps={{
                          readOnly: true,
                          autoFocus: true,
                        }}
                      />
                    </Stack>
                    <TextField
                      fullWidth
                      label="Total + Commission"
                      type="number"
                      variant="outlined"
                      size="medium"
                      value={totalCommissionAchat}
                      InputProps={{
                        readOnly: true,
                        autoFocus: true,
                      }}
                    />
                    <Stack direction={'row'} spacing={2}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="medium"
                        style={{ color: 'black', borderColor: 'gray' }}
                      >
                        Effacer
                      </Button>
                      <Button fullWidth variant="contained" size="medium" color="success" style={{ color: 'white' }}>
                        Acheter
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} width={'100%'}>
              <Card style={{ width: '100%' }}>
                <CardHeader title="Tax Immobilieres" />
                <CardContent>
                  <Stack direction={'column'} spacing={2}>
                    <Stack direction={'row'} spacing={2}>
                      <FormControl fullWidth fullheight>
                        <InputLabel id="select-titre-label">Titre</InputLabel>

                        <Select labelId="select-titre-label" label="Titre" variant="outlined" size="medium">
                          {options.map((option, index) => (
                            <MenuItem key={index} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <LocalizationProvider
                        dateAdapter={AdapterDayjs}
                        localeText={frFR.components.MuiLocalizationProvider.defaultProps.localeText}
                      >
                        <DatePicker
                          label="Date de vente"
                          disableFuture
                          className="bg-white"
                          name="birthDate"
                          format="DD-MM-YYYY"
                        />
                      </LocalizationProvider>
                    </Stack>
                    <Stack direction={'row'} spacing={2}>
                      <TextField
                        fullWidth
                        label="Prix de vente"
                        type="number"
                        variant="outlined"
                        size="medium"
                        value={prixVente}
                        onChange={handleVenteChange}
                      />
                      <TextField
                        fullWidth
                        label="Quantite"
                        type="number"
                        variant="outlined"
                        size="medium"
                        value={quantiteVente}
                        onChange={handleQuantiteVenteChange}
                      />
                    </Stack>
                    <Stack direction={'row'} spacing={2}>
                      <TextField
                        fullWidth
                        label="Commission"
                        type="number"
                        variant="outlined"
                        size="medium"
                        value={commissionVente}
                        InputProps={{
                          readOnly: true,
                          autoFocus: true,
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Total"
                        type="number"
                        variant="outlined"
                        size="medium"
                        value={totalVente}
                        InputProps={{
                          readOnly: true,
                          autoFocus: true,
                        }}
                      />
                    </Stack>
                    <TextField
                      fullWidth
                      label="Total + Commission"
                      type="number"
                      variant="outlined"
                      size="medium"
                      value={totalCommissionVente}
                      InputProps={{
                        readOnly: true,
                        autoFocus: true,
                      }}
                    />
                    <Stack direction={'row'} spacing={2}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="medium"
                        style={{ color: 'black', borderColor: 'gray' }}
                      >
                        Effacer
                      </Button>
                      <Button fullWidth variant="contained" size="medium" color="error" style={{ color: 'white' }}>
                        Vendre
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}

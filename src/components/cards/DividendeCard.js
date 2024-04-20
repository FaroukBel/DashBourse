import React, { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { titres } from '../../utils/titres';

export const DividendeCard = () => {
  const [dateEngagement, setDateEngagement] = useState(new Date());
  const [datePaiement, setDatePaiement] = useState(new Date());
  const [prixAchat, setPrixAchat] = useState(0);
  const [quantiteAchat, setQuantiteAchat] = useState(0);
  const [commissionAchat, setCommissionAchat] = useState(0);
  const [totalAchat, setTotalAchat] = useState(0);
  const [totalCommissionAchat, setTotalCommissionAchat] = useState(0);

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

  return (
    <Card style={{ width: '100%' }}>
      <CardHeader title="Dividendes" />
      <CardContent>
        <Stack direction={'column'} spacing={2}>
          <Stack direction={'row'} spacing={2}>
            <FormControl fullWidth fullheight>
              <InputLabel id="select-titre-label">Titre</InputLabel>

              <Select labelId="select-titre-label" label="Titre" variant="outlined" size="medium">
                {titres.map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <FormControl fullWidth fullheight>
                <DatePicker
                  label="Date d'engagement"
                  disableFuture
                  className="bg-white"
                  name="birthDate"
                  format="DD-MM-YYYY"
                  onChange={(newValue) => setDateEngagement(newValue)}
                />
              </FormControl>
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <FormControl fullWidth fullheight>
                <DatePicker
                  label="Date de détachement"
                  disableFuture
                  className="bg-white"
                  name="birthDate"
                  format="DD-MM-YYYY"
                  onChange={(newValue) => setDatePaiement(newValue)}
                />
              </FormControl>
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
            <Button fullWidth variant="outlined" size="medium" style={{ color: 'black', borderColor: 'gray' }}>
              Effacer
            </Button>
            <Button fullWidth variant="contained" size="medium" color="success" style={{ color: 'white' }}>
              Ajouter
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

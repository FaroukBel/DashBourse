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
import { frFR } from '@mui/x-date-pickers/locales';
import { titres } from '../../utils/titres';

export const TaxImmobiliere = () => {
  const [prixAchat, setPrixAchat] = useState(0);
  const [selectedTitre, setSelectedTitre] = useState('Tax Immobiliere');

  const handleAchatChange = (event) => {
    setPrixAchat(event.target.value);
  };

  return (
    <Card style={{ width: '60%' }}>
      <CardHeader title="Tax Immobilieres" />
      <CardContent>
        <Stack direction={'column'} spacing={2}>
          <Stack direction={'row'} spacing={2}>
            <FormControl fullWidth fullheight>
              <InputLabel id="select-titre-label">Titre</InputLabel>

              <Select labelId="select-titre-label" label="Titre" variant="outlined" size="medium">
                {<MenuItem>Tax Immobiliere</MenuItem>}
              </Select>
            </FormControl>

            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              localeText={frFR.components.MuiLocalizationProvider.defaultProps.localeText}
            >
              <DatePicker
                label="Date"
                disableFuture
                className="bg-white"X
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
              value={prixAchat}
              onChange={handleAchatChange}
            />
          </Stack>

          <Stack direction={'row'} spacing={2}>
            <Button fulwqlWidth variant="outlined" size="medium" style={{ color: 'black', borderColor: 'gray' }}>
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

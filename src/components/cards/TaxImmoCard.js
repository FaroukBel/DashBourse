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
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { addDoc, collection } from 'firebase/firestore';
import { frFR } from '@mui/x-date-pickers/locales';
import { db } from '../../config/firebase-config';

export const TaxImmobiliere = () => {
  const [prixAchat, setPrixAchat] = useState(0);

  const [date, setDate] = useState(dayjs(new Date()));

  const listAchatRef = collection(db, 'Transactions');

  const showSuccessAlert = () => {
    Swal.fire({
      icon: 'success',
      title: 'Succès',
      text: 'Achat ajouté avec succès',
    });
  };

  const showInfoAlert = () => {
    Swal.fire({
      icon: 'info',
      title: 'Info',
      text: 'Veuillez remplir tous les champs',
    });
  };
  const handleAchatChange = (event) => {
    setPrixAchat(event.target.value);
  };
  const handleTaxSubmit = async () => {
    try {
      if (!date || !prixAchat) {
        showInfoAlert();
        return;
      }

      await addDoc(listAchatRef, {
        titre: 'Tax Immobiliere',
        type: 'tax immobiliere',
        date: new Date(date),

        prix: prixAchat,
      });
      showSuccessAlert();
      setPrixAchat('');
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };
  return (
    <Card style={{ width: '60%' }}>
      <CardHeader title="Tax Immobilieres" />
      <CardContent>
        <Stack direction={'column'} spacing={2}>
          <Stack direction={'row'} spacing={2}>
            <TextField
              fullWidth
              label="Titre"
              variant="outlined"
              size="medium"
              value={'Tax Immobiliere'}
              inputProps={{ readOnly: true }}
            />

            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              localeText={frFR.components.MuiLocalizationProvider.defaultProps.localeText}
            >
              <DatePicker
                label="Date"
                disableFuture
                className="bg-white"
                X
                name="birthDate"
                format="DD-MM-YYYY"
                value={date}
                onChange={(newDate) => setDate(newDate)}
              />
            </LocalizationProvider>
          </Stack>
          <Stack direction={'row'} spacing={2}>
            <TextField
              fullWidth
              label="Montant"
              type="number"
              variant="outlined"
              size="medium"
              value={prixAchat}
              onChange={handleAchatChange}
            />
          </Stack>

          <Stack direction={'row'} spacing={2}>
            <Button
              fulwqlWidth
              variant="outlined"
              size="medium"
              style={{ color: 'black', borderColor: 'gray' }}
              onClick={() => {
                setPrixAchat('');
              }}
            >
              Effacer
            </Button>
            <Button
              fullWidth
              variant="contained"
              size="medium"
              color="success"
              style={{ color: 'white' }}
              onClick={handleTaxSubmit}
            >
              Ajouter
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

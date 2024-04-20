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
import Swal from 'sweetalert2';
import { addDoc, collection } from 'firebase/firestore';
import { frFR } from '@mui/x-date-pickers/locales';
import { titres } from '../../utils/titres';
import { db } from '../../config/firebase-config';

export const VenteCard = () => {
  const [prixVente, setPrixVente] = useState(0);
  const [quantiteVente, setQuantiteVente] = useState(0);
  const [commissionVente, setCommissionVente] = useState(0);
  const [totalVente, setTotalVente] = useState(0);
  const [totalCommissionVente, setTotalCommissionVente] = useState(0);
  const [dateVente, setDateVente] = useState(new Date());
  const [selectedTitre, setSelectedTitre] = useState('Titre');
  const listVenteRef = collection(db, 'Transactions');

  const showSuccessAlert = () => {
    Swal.fire({
      icon: 'success',
      title: 'Succès',
      text: 'Vente ajouté avec succès',
    });
  };

  const showInfoAlert = () => {
    Swal.fire({
      icon: 'info',
      title: 'Info',
      text: 'Veuillez remplir tous les champs',
    });
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

  const handleVenteSubmit = async () => {
    try {
      if (!selectedTitre || !dateVente || !prixVente || !quantiteVente) {
        showInfoAlert();
        return;
      }

      await addDoc(listVenteRef, {
        titre: selectedTitre,
        date: new Date(dateVente),

        prix: prixVente,
        type: 'vente',
        quantite: quantiteVente,
      });
      showSuccessAlert();
      setPrixVente('');
      setQuantiteVente('');
      setCommissionVente(0);
      setTotalVente(0);
      setTotalCommissionVente(0);
      setDateVente(new Date());
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };
  return (
    <Card style={{ width: '100%' }}>
      <CardHeader title="Vente" />
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
            <Button fullWidth variant="outlined" size="medium" style={{ color: 'black', borderColor: 'gray' }}>
              Effacer
            </Button>
            <Button
              fullWidth
              variant="contained"
              size="medium"
              color="error"
              style={{ color: 'white' }}
              onClick={handleVenteSubmit}
            >
              Vendre
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

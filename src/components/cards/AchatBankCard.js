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
import { addDoc, collection } from 'firebase/firestore';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Swal from 'sweetalert2';
import { titres } from '../../utils/titres';
import { db } from '../../config/firebase-config';

export const AchatBankCard = () => {
  const [prixAchat, setPrixAchat] = useState(null);
  const [quantiteAchat, setQuantiteAchat] = useState(null);

  const [dateAchat, setDateAchat] = useState(new Date());
  const [montant, setMontant] = useState('');
  const [selectedType, setSelectedType] = useState('Action');
  const [selectedTitre, setSelectedTitre] = useState('Titre');
  const listAchatRef = collection(db, 'bank_transactions');

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

  const handleAchatSubmit = async () => {
    try {
      if (selectedType !== 'Tax Immobilier') {
        if (!selectedTitre || !dateAchat || !prixAchat || !quantiteAchat || !montant) {
          showInfoAlert();
          return;
        }
      }

      await addDoc(listAchatRef, {
        titre: selectedTitre,
        selectedDate: new Date(dateAchat),
        prix: prixAchat,
        av: 'achat',
        type: selectedType,
        quantite: quantiteAchat,
        montant,
      });
      showSuccessAlert();
      setPrixAchat('');
      setQuantiteAchat('');

      setMontant('');

      setDateAchat(new Date());
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };
  return (
    <>
      <Card style={{ width: '100%' }}>
        <CardHeader title="Achat" />
        <CardContent>
          <Stack direction={'column'} spacing={2}>
            <Stack direction={'row'} spacing={2}>
              <FormControl fullWidth fullheight>
                <InputLabel id="select-titre-label">Titre</InputLabel>

                <Select
                  labelId="select-titre-label"
                  label="Titre"
                  variant="outlined"
                  size="medium"
                  onChange={(event) => {
                    setSelectedTitre(event.target.value);
                  }}
                >
                  {selectedType === 'Tax Immobilier' && <MenuItem value="Tax Immobilier">Tax Immobilieres</MenuItem>}
                  {selectedType !== 'Tax Immobilier' &&
                    titres.map((option, index) => (
                      <MenuItem key={index} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Stack>
            <Stack direction={'row'} spacing={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Date"
                  disableFuture
                  className="bg-white"
                  format="DD-MM-YYYY"
                  onChange={(newValue) => {
                    setDateAchat(newValue);
                  }}
                />
              </LocalizationProvider>
              <FormControl fullWidth fullheight>
                <InputLabel id="select-titre-label">Type</InputLabel>

                <Select
                  labelId="select-titre-label"
                  label="Type"
                  variant="outlined"
                  size="medium"
                  onChange={(event) => {
                    setSelectedType(event.target.value);
                  }}
                >
                  <MenuItem value="Action">Action</MenuItem>
                  <MenuItem value="Tax Immobilier">Tax Immobilieres</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            {selectedType !== 'Tax Immobilier' && (
              <Stack direction={'row'} spacing={2}>
                <TextField
                  fullWidth
                  label={
                    selectedType === 'Action'
                      ? "Prix d'achat"
                      : selectedType === 'Introduction'
                      ? "Prix d'introduction"
                      : selectedType === 'Dividende'
                      ? 'Montant du dividende'
                      : 'Prix'
                  }
                  type="number"
                  variant="outlined"
                  size="medium"
                  value={prixAchat}
                  onChange={(event) => setPrixAchat(event.target.value)}
                />
                <TextField
                  fullWidth
                  label="Quantite"
                  type="number"
                  variant="outlined"
                  size="medium"
                  value={quantiteAchat}
                  onChange={(event) => setQuantiteAchat(event.target.value)}
                />
              </Stack>
            )}
            <TextField
              fullWidth
              label="Montant"
              type="number"
              variant="outlined"
              size="medium"
              value={montant}
              onChange={(event) => setMontant(event.target.value)}
            />

            <Stack direction={'row'} spacing={2}>
              <Button
                fullWidth
                variant="outlined"
                size="medium"
                style={{ color: 'black', borderColor: 'gray' }}
                onClick={() => {
                  setPrixAchat('');
                  setQuantiteAchat('');
                  setMontant('');
                }}
              >
                Effacer
              </Button>
              <Button
                fullWidth
                variant="contained"
                size="medium"
                color="error"
                style={{ color: 'white' }}
                onClick={handleAchatSubmit}
              >
                Ajouter
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </>
  );
};

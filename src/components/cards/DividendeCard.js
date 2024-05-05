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
import { addDoc, collection } from 'firebase/firestore';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { db } from '../../config/firebase-config';
import { titres } from '../../utils/titres';

export const DividendeCard = () => {
  const [dateEngagement, setDateEngagement] = useState(dayjs(new Date()));
  const [datePaiement, setDatePaiement] = useState(dayjs(new Date()));
  const [prixAchat, setPrixAchat] = useState('');
  const [quantiteAchat, setQuantiteAchat] = useState('');
  const [commissionAchat, setCommissionAchat] = useState(0);
  const [totalAchat, setTotalAchat] = useState(0);
  const [totalCommissionAchat, setTotalCommissionAchat] = useState(0);
  const [selectedTitre, setSelectedTitre] = useState('Titre');

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
    setTotalAchat(event.target.value * quantiteAchat);
    const pnlCommission = event.target.value * quantiteAchat * 0.15;
    setCommissionAchat(pnlCommission.toFixed(2));
    setTotalCommissionAchat(
      (event.target.value * quantiteAchat - pnlCommission).toFixed(2)
    );
  };
  const handleQuantiteAchatChange = (event) => {
    setQuantiteAchat(event.target.value);
    setTotalAchat(prixAchat * event.target.value);
    const pnlCommission = event.target.value * prixAchat * 0.15;
    setCommissionAchat( pnlCommission).toFixed(2);
    setTotalCommissionAchat((event.target.value * prixAchat - pnlCommission).toFixed(2));
  };
  const handleShareSubmit = async () => {
    try {
      if (selectedTitre === 'Titre' || !dateEngagement || !datePaiement || !prixAchat || !quantiteAchat) {
        showInfoAlert();
        return;
      }

      await addDoc(listAchatRef, {
        titre: selectedTitre,
        type: 'dividende',
        dateEngagement: new Date(dateEngagement),
        datePaiement: new Date(datePaiement),
        prix: prixAchat,

        quantite: quantiteAchat,
      });
      showSuccessAlert();
      setPrixAchat('');
      setQuantiteAchat('');
      setCommissionAchat(0);
      setTotalAchat(0);
      setTotalCommissionAchat(0);
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  return (
    <Card style={{ width: '100%' }}>
      <CardHeader title="Dividendes" />
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
                onChange={(e) => setSelectedTitre(e.target.value)}
                value={selectedTitre}
              >
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
                  value={dateEngagement}
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
                  value={datePaiement}
                  format="DD-MM-YYYY"
                  onChange={(newValue) => setDatePaiement(newValue)}
                />
              </FormControl>
            </LocalizationProvider>
          </Stack>

          <Stack direction={'row'} spacing={2}>
            <TextField
              fullWidth
              label="Quantite"
              type="number"
              variant="outlined"
              size="medium"
              value={quantiteAchat}
              onChange={handleQuantiteAchatChange}
            />
            <TextField
              fullWidth
              label="Prix"
              type="number"
              variant="outlined"
              size="medium"
              value={prixAchat}
              onChange={handleAchatChange}
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
              onClick={() => {
                setPrixAchat('');
                setQuantiteAchat('');
                setCommissionAchat(0);
                setTotalAchat(0);
                setTotalCommissionAchat(0);
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
              onClick={handleShareSubmit}
            >
              Ajouter
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

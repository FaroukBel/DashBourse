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
import Slide from '@mui/material/Slide';
import { titres } from '../../utils/titres';
import { db } from '../../config/firebase-config';

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export const AchatCard = () => {
  const [prixAchat, setPrixAchat] = useState(null);
  const [quantiteAchat, setQuantiteAchat] = useState(null);
  const [commissionAchat, setCommissionAchat] = useState(0);
  const [totalAchat, setTotalAchat] = useState(0);
  const [totalCommissionAchat, setTotalCommissionAchat] = useState(0);
  const [dateAchat, setDateAchat] = useState(new Date());
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

  const handleAchatSubmit = async () => {
    try {
      if (!selectedTitre || !dateAchat || !prixAchat || !quantiteAchat) {
        showInfoAlert();
        return;
      }

      await addDoc(listAchatRef, {
        titre: selectedTitre,
        date: new Date(dateAchat),
        prix: prixAchat,
        type: 'achat',
        quantite: quantiteAchat,
      });
      showSuccessAlert();
      setPrixAchat('');
      setQuantiteAchat('');
      setCommissionAchat(0);
      setTotalAchat(0);
      setTotalCommissionAchat(0);
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
                  {titres.map((option, index) => (
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
                  format="DD-MM-YYYY"
                  onChange={(newValue) => {
                    setDateAchat(newValue);
                  }}
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
              <Button fullWidth variant="outlined" size="medium" style={{ color: 'black', borderColor: 'gray' }}>
                Effacer
              </Button>
              <Button
                fullWidth
                variant="contained"
                size="medium"
                color="success"
                style={{ color: 'white' }}
                onClick={handleAchatSubmit}
              >
                Acheter
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </>
  );
};

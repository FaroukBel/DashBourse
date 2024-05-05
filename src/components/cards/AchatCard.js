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
  const prixRef = React.useRef();
  const quantiteRef = React.useRef();
  const venteRef = React.useRef();

  const [prixAchat, setPrixAchat] = useState(null);
  const [prixVente, setPrixVente] = useState(null);
  const [quantiteAchat, setQuantiteAchat] = useState(null);
  const [commissionAchat, setCommissionAchat] = useState(0);
  const [commissionVente, setCommissionVente] = useState(0);
  const [totalAchat, setTotalAchat] = useState(0);
  const [totalVente, setTotalVente] = useState(0);
  const [PNL, setPNL] = useState(0);

  const [totalCommissionAchat, setTotalCommissionAchat] = useState(0);
  const [totalCommissionVente, setTotalCommissionVente] = useState(0);
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

    const pnlCommission =
      (
        totalCommissionVente -
        (event.target.value * quantiteAchat - event.target.value * quantiteAchat * 0.0044).toFixed(2)
      ).toFixed(2) * 0.15;

    if (
      totalCommissionVente -
        (event.target.value * quantiteAchat - event.target.value * quantiteAchat * 0.0044).toFixed(2) <
      0
    ) {
      setPNL(
        (
          totalCommissionVente -
          (event.target.value * quantiteAchat - event.target.value * quantiteAchat * 0.0044).toFixed(2)
        ).toFixed(2)
      );
    } else {
      setPNL(
        (
          totalCommissionVente -
          (event.target.value * quantiteAchat - event.target.value * quantiteAchat * 0.0044).toFixed(2)
        ).toFixed(2) - pnlCommission
      );
    }
  };

  const handleVenteChange = (event) => {
    setPrixVente(event.target.value);
    setTotalVente(event.target.value * quantiteAchat);
    setCommissionVente((event.target.value * quantiteAchat * 0.0044).toFixed(2));
    setTotalCommissionVente(
      (event.target.value * quantiteAchat - event.target.value * quantiteAchat * 0.0044).toFixed(2)
    );
    const pnlCommission =
      (
        (event.target.value * quantiteAchat - event.target.value * quantiteAchat * 0.0044).toFixed(2) -
        totalCommissionAchat
      ).toFixed(2) * 0.15;

    if (
      (event.target.value * quantiteAchat - event.target.value * quantiteAchat * 0.0044).toFixed(2) -
        totalCommissionAchat <
      0
    ) {
      setPNL(
        (
          (event.target.value * quantiteAchat - event.target.value * quantiteAchat * 0.0044).toFixed(2) -
          totalCommissionAchat
        ).toFixed(2)
      );
    } else {
      setPNL(
        (
          (event.target.value * quantiteAchat - event.target.value * quantiteAchat * 0.0044).toFixed(2) -
          totalCommissionAchat
        ).toFixed(2) - pnlCommission
      );
    }
  };
  const handleQuantiteAchatChange = (event) => {
    setQuantiteAchat(event.target.value);

    const totalCommissionAchatVar = (event.target.value * prixAchat * 0.0044 + event.target.value * prixAchat).toFixed(
      2
    );
    const totalCommissionVenteVar = (event.target.value * prixVente - event.target.value * prixVente * 0.0044).toFixed(
      2
    );

    setTotalAchat(event.target.value * prixAchat);
    setCommissionAchat((event.target.value * prixAchat * 0.0044).toFixed(2));
    setTotalCommissionAchat(totalCommissionAchatVar);

    setTotalVente(event.target.value * prixVente);
    setCommissionVente((event.target.value * prixVente * 0.0044).toFixed(2));
    setTotalCommissionVente(totalCommissionVenteVar);

    if (totalCommissionVenteVar - totalCommissionAchatVar < 0) {
      setPNL((totalCommissionVenteVar - totalCommissionAchatVar).toFixed(2));

    } else {
      const pnlCommission = (totalCommissionVenteVar - totalCommissionAchatVar) * 0.15;

      setPNL(((totalCommissionVenteVar - totalCommissionAchatVar).toFixed(2) - pnlCommission).toFixed(2));

    }
  };

  const handleAchatSubmit = async () => {
    try {
      if (selectedTitre === 'Titre' || !dateAchat || !prixAchat || !prixVente || !quantiteAchat) {
        showInfoAlert();
        return;
      }

      await addDoc(listAchatRef, {
        titre: selectedTitre,
        date: new Date(dateAchat),
        prixAchat,
        prixVente,
        quantite: quantiteAchat,
      });
      showSuccessAlert();
      setPrixAchat('');
      setPrixVente('');
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
        <CardHeader title="Transaction" />
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      prixRef.current.focus();
                    }
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
                    prixAchat.current.focus();
                  }}
                />
              </LocalizationProvider>
            </Stack>
            <Stack direction={'row'} spacing={2}>
              <TextField
                fullWidth
                inputRef={quantiteRef}
                label="Quantite"
                type="number"
                variant="outlined"
                size="medium"
                value={quantiteAchat}
                onChange={handleQuantiteAchatChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    prixRef.current.focus();
                  }
                }}
              />
              <TextField
                fullWidth
                inputRef={prixRef}
                label="Prix d'achat"
                type="number"
                variant="outlined"
                size="medium"
                value={prixAchat}
                onChange={handleAchatChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    venteRef.current.focus();
                  }
                }}
              />
              <TextField
                fullWidth
                inputRef={venteRef}
                label="Prix de ventre"
                type="number"
                variant="outlined"
                size="medium"
                value={prixVente}
                onChange={handleVenteChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAchatSubmit();
                  }
                }}
              />
            </Stack>
            <Stack direction={'row'} spacing={2}>
              <TextField
                fullWidth
                label="Commission Achat"
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
                label="Commission Vente"
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
                label="Total Achat"
                type="number"
                variant="outlined"
                size="medium"
                value={totalCommissionAchat}
                InputProps={{
                  readOnly: true,
                  autoFocus: true,
                }}
              />
              <TextField
                fullWidth
                label="Total Vente"
                type="number"
                variant="outlined"
                size="medium"
                value={totalCommissionVente}
                InputProps={{
                  readOnly: true,
                  autoFocus: true,
                }}
              />
            </Stack>

            <TextField
              fullWidth
              label="+/- Value"
              type="number"
              variant="outlined"
              size="medium"
              value={PNL}
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
                Ajouter
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </>
  );
};

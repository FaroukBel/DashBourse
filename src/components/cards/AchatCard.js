import React, { useEffect, useMemo, useState } from 'react';
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
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Swal from 'sweetalert2';
import Slide from '@mui/material/Slide';
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
  const [selectedTaxValue, setSelectedTaxValue] = useState(0.0044);
  const listAchatRef = collection(db, 'Transactions');
  const [titres, setTitres] = useState([]);

  useEffect(() => {
    const getTitres = async () => {
      const titresData = await getDoc(doc(db, 'utils', 'titresDoc'));


      if (titresData.exists()) {
        setTitres(titresData.data().titres);
      } else {
        console.log('No such document!');
      }
    
    };

    getTitres();
  }, []);
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
    const achatValue = event.target.value;

    setPrixAchat(achatValue);
    setTotalAchat(achatValue * quantiteAchat);
    setCommissionAchat((achatValue * quantiteAchat * selectedTaxValue).toFixed(2));
    setTotalCommissionAchat((achatValue * quantiteAchat * selectedTaxValue + achatValue * quantiteAchat).toFixed(2));

    const pnlCommission =
      (
        totalCommissionVente - (achatValue * quantiteAchat - achatValue * quantiteAchat * selectedTaxValue).toFixed(2)
      ).toFixed(2) * 0.15;

    if (
      totalCommissionVente - (achatValue * quantiteAchat - achatValue * quantiteAchat * selectedTaxValue).toFixed(2) <
      0
    ) {
      setPNL(
        (
          totalCommissionVente - (achatValue * quantiteAchat - achatValue * quantiteAchat * selectedTaxValue).toFixed(2)
        ).toFixed(2)
      );
    } else {
      setPNL(
        (
          totalCommissionVente - (achatValue * quantiteAchat - achatValue * quantiteAchat * selectedTaxValue).toFixed(2)
        ).toFixed(2) - pnlCommission
      );
    }
  };

  const handleVenteChange = (event) => {
    const venteValue = event.target.value;

    setPrixVente(venteValue);
    setTotalVente(venteValue * quantiteAchat);
    setCommissionVente((venteValue * quantiteAchat * selectedTaxValue).toFixed(2));
    setTotalCommissionVente((venteValue * quantiteAchat - venteValue * quantiteAchat * selectedTaxValue).toFixed(2));
    const pnlCommission =
      (
        (venteValue * quantiteAchat - venteValue * quantiteAchat * selectedTaxValue).toFixed(2) - totalCommissionAchat
      ).toFixed(2) * 0.15;

    if (
      (venteValue * quantiteAchat - venteValue * quantiteAchat * selectedTaxValue).toFixed(2) - totalCommissionAchat <
      0
    ) {
      setPNL(
        (
          (venteValue * quantiteAchat - venteValue * quantiteAchat * selectedTaxValue).toFixed(2) - totalCommissionAchat
        ).toFixed(2)
      );
    } else {
      setPNL(
        (
          (venteValue * quantiteAchat - venteValue * quantiteAchat * selectedTaxValue).toFixed(2) - totalCommissionAchat
        ).toFixed(2) - pnlCommission
      );
    }
  };
  const handleQuantiteAchatChange = (event) => {
    const quantiteAchatValue = event.target.value;

    setQuantiteAchat(quantiteAchatValue);

    const totalCommissionAchatVar = (
      quantiteAchatValue * prixAchat * selectedTaxValue +
      quantiteAchatValue * prixAchat
    ).toFixed(2);
    const totalCommissionVenteVar = (
      quantiteAchatValue * prixVente -
      quantiteAchatValue * prixVente * selectedTaxValue
    ).toFixed(2);

    setTotalAchat(quantiteAchatValue * prixAchat);
    setCommissionAchat((quantiteAchatValue * prixAchat * selectedTaxValue).toFixed(2));
    setTotalCommissionAchat(totalCommissionAchatVar);

    setTotalVente(quantiteAchatValue * prixVente);
    setCommissionVente((quantiteAchatValue * prixVente * selectedTaxValue).toFixed(2));
    setTotalCommissionVente(totalCommissionVenteVar);

    if (totalCommissionVenteVar - totalCommissionAchatVar < 0) {
      setPNL((totalCommissionVenteVar - totalCommissionAchatVar).toFixed(2));
    } else {
      const pnlCommission = (totalCommissionVenteVar - totalCommissionAchatVar) * 0.15;

      setPNL(((totalCommissionVenteVar - totalCommissionAchatVar).toFixed(2) - pnlCommission).toFixed(2));
    }
  };

  const handleTaxValueChange = (event) => {
    setSelectedTaxValue(event.target.value);

    const totalCommissionAchatVar = (
      quantiteAchat * prixAchat * event.target.value +
      quantiteAchat * prixAchat
    ).toFixed(2);

    const totalCommissionVenteVar = (
      quantiteAchat * prixVente -
      quantiteAchat * prixVente * event.target.value
    ).toFixed(2);
    setPrixAchat(prixAchat);
    setTotalAchat(quantiteAchat * prixAchat);
    setTotalVente(quantiteAchat * prixVente);
    setCommissionAchat((quantiteAchat * prixAchat * event.target.value).toFixed(2));
    setCommissionVente((quantiteAchat * prixVente * event.target.value).toFixed(2));
    setTotalCommissionAchat(totalCommissionAchatVar);
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
        type: 'action',
        taxValue: selectedTaxValue,
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
              <FormControl fullWidth fullheight>
                <InputLabel id="select-titre-label">% Commission</InputLabel>

                <Select
                  labelId="select-titre-label"
                  label="% Commission"
                  variant="outlined"
                  size="medium"
                  value={selectedTaxValue}
                  defaultValue={selectedTaxValue}
                  onChange={(event) => {
                    handleTaxValueChange(event);
                  }}
                >
                  <MenuItem value={0.0044}>0.44%</MenuItem>
                  <MenuItem value={0.0077}>0.77%</MenuItem>
                </Select>
              </FormControl>
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

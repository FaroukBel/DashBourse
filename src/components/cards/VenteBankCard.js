import React, { useEffect, useState } from 'react';
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

export const VenteBankCard = () => {
  const quantiteRef = React.useRef();
  const prixRef = React.useRef();
  const montantRef = React.useRef();
  const [prixVente, setPrixVente] = useState(null);
  const [quantiteVente, setQuantiteVente] = useState(null);

  const [dateVente, setDateVente] = useState(new Date());
  const [montant, setMontant] = useState('');
  const [selectedType, setSelectedType] = useState('Action');
  const [selectedTitre, setSelectedTitre] = useState('Titre');
  const listVenteRef = collection(db, 'bank_transactions');
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

  const handleVenteSubmit = async () => {
    try {
      if (selectedType !== 'Tax Immobilier') {
        if (selectedTitre === 'Titre' || !dateVente || !prixVente || !quantiteVente || !montant) {
          showInfoAlert();
          return;
        }
      }

      await addDoc(listVenteRef, {
        titre: selectedTitre,
        selectedDate: new Date(dateVente),
        prix: prixVente,
        av: 'vente',
        type: selectedType,
        quantite: quantiteVente,
        montant,
      });
      showSuccessAlert();
      setPrixVente('');
      setQuantiteVente('');

      setMontant('');

      setDateVente(new Date());
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };
  return (
    <>
      <Card style={{ width: '100%' }}>
        <CardHeader title="Vente" />
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
                  label="Date de vente"
                  disableFuture
                  className="bg-white"
                  format="DD-MM-YYYY"
                  onChange={(newValue) => {
                    setDateVente(newValue);
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
                    prixRef.current.focus();
                  }}
                >
                  <MenuItem value="Action">Action</MenuItem>

                  <MenuItem value="Dividende">Dividende</MenuItem>
                  <MenuItem value="Tax Immobilier">Tax Immobilieres</MenuItem>
                  <MenuItem value="Gratuite">Action Gratuite</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            {selectedType !== 'Tax Immobilier' && (
              <Stack direction={'row'} spacing={2}>
                <TextField
                  fullWidth
                  label="Quantite"
                  type="number"
                  variant="outlined"
                  inputRef={quantiteRef}
                  size="medium"
                  value={quantiteVente}
                  onChange={(event) => setQuantiteVente(event.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      prixRef.current.focus();
                    }
                  }}
                />
                <TextField
                  fullWidth
                  label="Prix de vente"
                  type="number"
                  variant="outlined"
                  size="medium"
                  value={prixVente}
                  inputRef={prixRef}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      montantRef.current.focus();
                    }
                  }}
                  onChange={(event) => setPrixVente(event.target.value)}
                />
              </Stack>
            )}
            <TextField
              fullWidth
              inputRef={montantRef}
              label="Montant"
              type="number"
              variant="outlined"
              size="medium"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleVenteSubmit();
                }
              }}
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
                  setPrixVente('');
                  setQuantiteVente('');
                  setMontant('');
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
                onClick={handleVenteSubmit}
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

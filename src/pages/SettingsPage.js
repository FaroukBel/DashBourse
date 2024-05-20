import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';

// @mui
import {
  Button,
  Card,
  Container,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { collection, addDoc, setDoc, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { db } from '../config/firebase-config';

// ----------------------------------------------------------------------

export default function SettingsPage() {
  const [selectedService, setSelectedService] = useState('Achat');
  const [selectFontSize, setSelectedFontSize] = useState('large');
  const [societe, setSociete] = useState('');
  const [selectedSociete, setSelectedSociete] = useState('');
  const [titresState, setTitres] = useState([]);

  const deleteTitres = async ({ titre }) => {
    try {
      const result = await Swal.fire({
        title: 'Êtes-vous sûr ?',
        text: `Voulez-vous supprimer le titre : "${titre}" ?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimez-le !',
        cancelButtonText: 'Non, gardez-le',
      });

      if (result.isConfirmed) {
        const docRef = doc(db, 'utils', 'titresDoc');
        await updateDoc(docRef, {
          titres: arrayRemove(titre),
        });
        setSelectedSociete('');
        Swal.fire('Supprimé !', 'Le titre a été supprimé.', 'success');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du titre:', error);
    }
  };

  const saveTitres = async ({ titre }) => {
    try {
      const docRef = doc(db, 'utils', 'titresDoc');
      await updateDoc(docRef, {
        titres: arrayUnion(titre),
      });
      setSociete('');
      Swal.fire('Succès !', 'Le titre a été ajouté.', 'success');
    } catch (error) {
      console.error("Erreur lors de l'ajout du titre:", error);
    }
  };
  useEffect(() => {
    const getTitres = async () => {
      const docRef = doc(db, 'utils', 'titresDoc');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setTitres(docSnap.data().titres);
      } else {
        console.log('No such document!');
      }
    };

    getTitres();
  }, [saveTitres]);
  return (
    <>
      <Helmet>
        <title> Operations </title>
      </Helmet>

      <Container fullWidth maxWidth="xl" sx={{ mt: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="center" mb={5} fullWidth>
          <Typography fontSize={39} sx={{ mb: 5 }}>
            Parametres
          </Typography>
        </Stack>

        <Card sx={{ p: 2, borderRadius: 2, bgcolor: 'background.white' }}>
          <Stack direction="column" alignItems="start" justifyContent="space-between" spacing={4} mb={5} fullWidth>
            <Typography fontSize={25}>Societés</Typography>
            <Stack direction={'column'} spacing={4} fullWidth minWidth={"50%"}>
              <Stack direction={'row'} fullWidth>
                <TextField
                  fullWidth
                  label="Nom de la societé"
                  variant="standard"
                  sx={{ mr: 2 }}
                  onChange={(event) => {
                    setSociete(event.target.value);
                  }}
                  value={societe}
                />

                <Button
                  variant="contained"
                  color="primary"
                  sx={{ ml: 2 }}
                  onClick={() => {
                    setTitres([...titresState, societe]);
                    saveTitres({ titre: societe });
                  }}
                >
                  Ajouter
                </Button>
              </Stack>
              <Stack direction={'row'}>
                <FormControl fullWidth>
                  <InputLabel id="select-titre-label">Titre</InputLabel>

                  <Select
                    labelId="select-titre-label"
                    label="Titre"
                    variant="outlined"
                    size="medium"
                    value={selectedSociete}
                    onChange={(event) => {
                      setSelectedSociete(event.target.value);
                    }}
                  >
                    {titresState.map((option, index) => (
                      <MenuItem key={index} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  color="error"
                  sx={{ ml: 2 }}
                  onClick={() => {
                    deleteTitres({ titre: selectedSociete });
                  }}
                >
                  Supprimer
                </Button>
              </Stack>
            </Stack>
            <Divider orientation="horizontal" />
            <Typography fontSize={25}>Texte</Typography>
            <Stack direction={'row'} fullWidth minWidth={"50%"}>
              <FormControl fullWidth>
                <InputLabel id="select-titre-label">Titre</InputLabel>

                <Select
                  labelId="select-titre-label"
                  label="Titre"
                  variant="outlined"
                  size="medium"
                  value={selectFontSize}
                  onChange={(event) => setSelectedFontSize(event.target.value)}
                >
                  <MenuItem value={'petit'}>Petit</MenuItem>
                  <MenuItem value={'medium'}>Medium</MenuItem>
                  <MenuItem value={'large'}>Large</MenuItem>
                </Select>
              </FormControl>

              <Button variant="contained" color="primary" sx={{ ml: 2 }}>
                Appliquer
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Container>
    </>
  );
}

import { Helmet } from 'react-helmet-async';
import { useMemo, useState } from 'react';

// @mui
import {
  Button,
  Card,
  CardHeader,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Percent } from '@mui/icons-material';

// ----------------------------------------------------------------------

export default function ToolsPage() {
  const [selectedService, setSelectedService] = useState('Achat');
  const [selectFontSize, setSelectedFontSize] = useState('large');
  const [cmpList, setCmpList] = useState([{ prix: '', quantite: '' }]);
  const [maxMinList, setMaxMinList] = useState([{ prix: '', prct: '' }]);
  const [cmpTotalQte, setCmpTotalQte] = useState(0);
  const [cmp, setCmp] = useState(0);
  const [maxMinTotal, setMaxMinTotal] = useState(0);

  const addCmp = ({ prix, quatite }) => {
    setCmpList([...cmpList, { prix, quatite }]);
  };

  const addMaxMin = ({ prix, prct }) => {
    setMaxMinList([...maxMinList, { prix, prct }]);
  };

  const handleMaxMinChange = (index, key, value) => {
    const newMaxMinList = [...maxMinList];
    newMaxMinList[index][key] = value;
    setMaxMinList(newMaxMinList);
  };

  const handleCmpChange = (index, key, value) => {
    const newCmpList = [...cmpList];
    newCmpList[index][key] = value;
    setCmpList(newCmpList);

    let totalQte = 0;
    let total = 0;

    cmpList.forEach((cmp) => {
      totalQte += parseFloat(cmp.quantite);
      total += cmp.prix * cmp.quantite;
    });

    setCmpTotalQte(totalQte);
    const cmp = total / totalQte;

    setCmp(cmp);
  };

  const handleMaxMinCalculation = useMemo(() => {
    let total = 0;

    maxMinList.forEach((item, index) => {
      if (index === 0) {
        total += parseFloat(item.prix) * (item.prct / 100) + parseFloat(item.prix);
      } else {
        total += total * (item.prct / 100);
      }
    });
    setMaxMinTotal(total);
  }, [maxMinList]);

  const handleCmpCalculation = useMemo(() => {
    let totalQte = 0;
    let total = 0;
    cmpList.forEach((cmp) => {
      totalQte += parseFloat(cmp.quantite);
      total += cmp.prix * cmp.quantite;
    });

    setCmpTotalQte(totalQte);

    const cmp = total / totalQte;

    setCmp(cmp);
  }, [cmpList]);
  return (
    <>
      <Helmet>
        <title> Operations </title>
      </Helmet>

      <Container fullWidth maxWidth="xxl" sx={{ mt: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="center" mb={5} fullWidth>
          <Typography fontSize={39} sx={{ mb: 5 }}>
            Outils
          </Typography>
        </Stack>
        <Grid container direction={'row'} spacing={2}>
          <Grid item xs={12} md={12} lg={12} xl={6} sx={{ mb: 3 }}>
            <Card sx={{ p: 2, borderRadius: 2, bgcolor: 'background.white' }} fullWidth>
              <Stack direction="column" alignItems="start" justifyContent="space-between" spacing={4} mb={5}>
                <Stack direction={'column'}>
                  <Stack direction={'row'} alignItems="start" justifyContent="space-between" mb={5}>
                    <CardHeader title="Calculer le CMP" subheader="Calculez le prix moyen d'achat de vos actions" />
                    <Stack direction={'row'} alignItems={'end'} justifyContent={'end'} height={60}>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ ml: 2 }}
                        onClick={() => addCmp({ prix: 0, quantite: 0 })}
                      >
                        Ajouter
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        sx={{ ml: 2 }}
                        onClick={() =>
                          setCmpList([
                            {
                              prix: 0,
                              quantite: 0,
                            },
                          ])
                        }
                      >
                        Effacer tout
                      </Button>
                    </Stack>
                  </Stack>
                  <Stack direction={'column'} spacing={2} mb={4} ml={4}>
                    {cmpList.map((cmp, index) => (
                      <Stack direction={'row'} key={index} spacing={4}>
                        <TextField
                          label="Quantite"
                          variant="standard"
                          sx={{ mr: 2 }}
                          value={cmp.quantite}
                          onChange={(event) => {
                            handleCmpChange(index, 'quantite', event.target.value);
                          }}
                        />
                        <TextField
                          label="Prix"
                          variant="standard"
                          sx={{ mr: 2 }}
                          value={cmp.prix}
                          onChange={(event) => {
                            handleCmpChange(index, 'prix', event.target.value);
                          }}
                        />
                        <Stack>
                          <Button
                            variant="contained"
                            color="error"
                            sx={{ ml: 2 }}
                            onClick={() => {
                              const newCmpList = [...cmpList];
                              newCmpList.splice(index, 1);
                              setCmpList(newCmpList);
                            }}
                          >
                            Supprimer
                          </Button>
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                  <Stack direction={'row'} spacing={2} ml={4}>
                    <Stack direction={'column'} spacing={2}>
                      <Typography>Quantite</Typography>
                      <TextField value={cmpTotalQte} inputProps={{ readOnly: true }} />
                    </Stack>
                    <Stack direction={'column'} spacing={2}>
                      <Typography>Prix Moyen</Typography>
                      <TextField value={cmp} inputProps={{ readOnly: true }} />
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={12} md={12} lg={12} xl={6} sx={{ mb: 3 }}>
            <Card sx={{ p: 2, borderRadius: 2, bgcolor: 'background.white' }}>
              <Stack
                direction="column"
                alignItems="start"
                justifyContent="space-between"
                spacing={4}
                mb={5}
                width={700}
              >
                <Stack direction={'column'} width={700}>
                  <Stack direction={'row'} width={700} alignItems="start" justifyContent="space-between" mb={5}>
                    <CardHeader title="Calculer la valeur max/min" />
                    <Stack direction={'row'} alignItems={'end'} justifyContent={'end'} height={60}>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ ml: 2 }}
                        onClick={() => {
                          if (maxMinList.length === 0) {
                            addMaxMin({ prix: 0, prct: 0 });
                          } else {
                            addMaxMin({ prix: maxMinTotal, prct: 0 });
                          }
                        }}
                      >
                        Ajouter
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        sx={{ ml: 2 }}
                        onClick={() =>
                          setMaxMinList([
                            {
                              prix: 0,
                              prct: 0,
                            },
                          ])
                        }
                      >
                        Effacer tout
                      </Button>
                    </Stack>
                  </Stack>
                  <Stack direction={'column'} spacing={2} mb={4} ml={4}>
                    {maxMinList.map((item, index) => (
                      <Stack direction={'row'} key={index} spacing={4}>
                        {index > 0 ? (
                          <TextField
                            label="Prix"
                            variant="standard"
                            sx={{ mr: 2 }}
                            inputProps={{ readOnly: true }}
                            value={parseFloat(item.prix).toFixed(2)}
                          />
                        ) : (
                          <TextField
                            label="Prix"
                            variant="standard"
                            sx={{ mr: 2 }}
                            value={item.prix}
                            onChange={(event) => {
                              handleMaxMinChange(index, 'prix', event.target.value);
                            }}
                          />
                        )}
                        <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
                          <InputLabel htmlFor="outlined-adornment-password">Pourcentage</InputLabel>
                          <OutlinedInput
                            id="outlined-adornment-password"
                            endAdornment={
                              <InputAdornment position="end">
                                <IconButton aria-label="toggle password visibility" edge="end">
                                  <Percent />
                                </IconButton>
                              </InputAdornment>
                            }
                            label="Pourcentage"
                            variant="standard"
                            sx={{ mr: 2 }}
                            value={item.prct}
                            onChange={(event) => {
                              handleMaxMinChange(index, 'prct', event.target.value);
                            }}
                          />
                        </FormControl>
                        <Stack>
                          <Button
                            variant="contained"
                            color="error"
                            sx={{ ml: 2 }}
                            onClick={() => {
                              const newMaxMinList = [...maxMinList];
                              newMaxMinList.splice(index, 1);
                              setMaxMinList(newMaxMinList);
                            }}
                          >
                            Supprimer
                          </Button>
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                  <Stack direction={'row'} spacing={2} ml={4}>
                    <Stack direction={'column'} spacing={2}>
                      <Typography>Prix</Typography>
                      <TextField value={maxMinTotal.toFixed(2)} inputProps={{ readOnly: true }} />
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

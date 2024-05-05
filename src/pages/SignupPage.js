import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
// @mui
import { styled } from '@mui/material/styles';
import { Link, Container, Typography, Divider, Stack, Button } from '@mui/material';
// hooks
import { signInWithPopup } from 'firebase/auth';
import {auth,googleProvider} from '../config/firebase-config';
import useResponsive from '../hooks/useResponsive';
// components
import Logo from '../components/logo';
import Iconify from '../components/iconify';
// sections
import { SignupForm } from '../sections/auth/signup';


// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const StyledSection = styled('div')(({ theme }) => ({
  width: '100%',
  maxWidth: 480,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  boxShadow: theme.customShadows.card,
  backgroundColor: theme.palette.background.default,
}));

const StyledContent = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function SignupPage() {
  const mdUp = useResponsive('up', 'md');
  const navigate = useNavigate();

  const signUpWithGoogle = async() => {
    try {
      const result = await signInWithPopup(auth, googleProvider)

      const user = result.user;
    navigate('/dashboard', { replace: true });

    }
    catch (error) {
      console.log(error)
    }
  }
  return (
    <>
      <Helmet>
        <title> S'inscrire </title>
      </Helmet>

      <StyledRoot>
      
      
        <Container maxWidth="sm">
          <StyledContent>
            <Typography variant="h4" gutterBottom>
              Crée un compte sur DashBourse
            </Typography>

            <Typography variant="body2" sx={{ mb: 5 }}>
              Vos avez déjà un compte ? &nbsp;
              <Link variant="subtitle2" href='/login'>S'authentifier</Link>
            </Typography>

            <Stack direction="row" spacing={2}>
              <Button fullWidth size="large" color="inherit" variant="outlined" onClick={signUpWithGoogle}>
                <Iconify icon="eva:google-fill" color="#DF3E30" width={22} height={22} />
              </Button>

             
            </Stack>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
               Ou
              </Typography>
            </Divider>

            <SignupForm />
          </StyledContent>
        </Container>
      </StyledRoot>
    </>
  );
}

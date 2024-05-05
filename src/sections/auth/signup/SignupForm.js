import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Link, Stack, IconButton, InputAdornment, TextField, Checkbox } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import { tr } from 'date-fns/locale';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../config/firebase-config';
import Iconify from '../../../components/iconify';


// ----------------------------------------------------------------------

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleClick =async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user
      
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <>
      <Stack spacing={3}>
        <TextField name="email" label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />

        <TextField
          name="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        <Checkbox name="remember" label="Restez connecté" />
        
      </Stack>

      <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleClick}>
        Crée un compte
      </LoadingButton>
    </>
  );
}

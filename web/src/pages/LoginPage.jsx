import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button, TextInput, Title, Paper } from '@mantine/core';
import '../styles/loginPage.css';
import { login } from '../fetchAPI';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState(location.state?.email || '');
  const [password, setPassword] = useState(location.state?.password || '');
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null);

    if (!username || !password) {
      setError('Wprowadź login i hasło!');
      return;
    }

    const response = await login(username, password);
    if (response.error) {
      const translatedError =
        response.error === 'Invalid email or password'
          ? 'Nieprawidłowy email lub hasło'
          : response.error;

      setError(translatedError);
    } else {
      navigate('/map');
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <img src="/logo.png" alt="Logo" className="login-logo" />
        <Title order={1} className="login-title">MapCarpatia</Title>
      </div>

      <Paper className="login-form" shadow="md" radius="lg" p="xl">
        <Title order={3} className="login-subtitle">Zaloguj się</Title>

        <TextInput
          placeholder="Email"
          value={username}
          onChange={(e) => setUsername(e.currentTarget.value)}
          leftSection={<img src="/icons/mail.svg" alt="mail" className="input-icon" />}
        />
        <TextInput
          placeholder="Hasło"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          leftSection={<img src="/icons/password.svg" alt="password" className="input-icon" />}
        />

        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

        <Button color="#195b35" radius="xl" fullWidth mt="md" onClick={handleLogin}>
          Zaloguj się
        </Button>

        <Button
          variant="subtle"
          fullWidth
          component={Link}
          to="/register"
          color="gray"
        >
          Nie masz konta? Zarejestruj się
        </Button>
      </Paper>
    </div>
  );
}

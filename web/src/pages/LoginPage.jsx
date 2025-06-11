import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextInput, Title, Paper } from '@mantine/core';
import { Link } from 'react-router-dom';
import '../styles/loginPage.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username && password) {
      navigate('/map');
    } else {
      alert('Wprowadź login i hasło!');
    }
  };

  const handleRegister = () => {
    alert('Funkcja rejestracji jeszcze nie gotowa 🙂');
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

        <Button color="#195b35" radius="xl" fullWidth mt="md" onClick={handleLogin}>
          Zaloguj się
        </Button>

        <Button
          variant="subtle"
          fullWidth
          component={Link}
          to="/register"
          color = 'gray'
        >
          Nie masz konta? Zarejestruj się
        </Button>

      </Paper>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, TextInput, Title, Paper } from '@mantine/core';
import '../styles/registerPage.css';



export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

const [errors, setErrors] = useState({
  firstName: '',
  lastName: '',
  email: '',
  password: ''
});


const handleRegister = () => {
  const nameRegex = /^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const newErrors = {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  };

  if (!firstName) newErrors.firstName = 'Imię jest wymagane.';
  else if (!nameRegex.test(firstName)) newErrors.firstName = 'Imię musi zaczynać się z wielkiej litery i zawierać tylko litery.';

  if (!lastName) newErrors.lastName = 'Nazwisko jest wymagane.';
  else if (!nameRegex.test(lastName)) newErrors.lastName = 'Nazwisko musi zaczynać się z wielkiej litery i zawierać tylko litery.';

  if (!email) newErrors.email = 'Email jest wymagany.';
  else if (!emailRegex.test(email)) newErrors.email = 'Nieprawidłowy format adresu email.';

  if (!password) newErrors.password = 'Hasło jest wymagane.';
  else if (password.length < 6) newErrors.password = 'Hasło musi mieć co najmniej 6 znaków.';

  setErrors(newErrors);

  const hasErrors = Object.values(newErrors).some(error => error !== '');
  if (!hasErrors) {
    alert('Zarejestrowano pomyślnie!');
    navigate('/');
  }
};



  return (
    <div className="register-container">
      <div className="register-header">
        <img src="/logo.png" alt="Logo" className="register-logo" />
        <Title order={1} className="register-title">MapCarpatia</Title>
      </div>

      <Paper className="register-form" shadow="md" radius="lg" p="xl">
        <Title order={3} className="register-subtitle">Rejestracja</Title>

       <TextInput
        placeholder="Imię"
        value={firstName}
        onChange={(e) => setFirstName(e.currentTarget.value)}
        leftSection={<img src="/icons/user.svg" alt="user" className="input-icon" />}
        error={errors.firstName}
        description={errors.firstName && ' '}
        />

        <TextInput
        placeholder="Nazwisko"
        value={lastName}
        onChange={(e) => setLastName(e.currentTarget.value)}
        leftSection={<img src="/icons/user_full.svg" alt="user full" className="input-icon" />}
        error={errors.lastName}
        description={errors.lastName && ' '}
        />

        <TextInput
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
        leftSection={<img src="/icons/mail.svg" alt="mail" className="input-icon" />}
        error={errors.email}
        description={errors.email && ' '}
        />

        <TextInput
        placeholder="Hasło"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
        leftSection={<img src="/icons/password.svg" alt="password" className="input-icon" />}
        error={errors.password}
        description={errors.password && ' '}
        />



        <Button color="#195b35" radius="xl" fullWidth mt="md" onClick={handleRegister}>
          Zarejestruj się
        </Button>

        <Button
          variant="subtle"
          color="gray"
          fullWidth
          mt="xs"
          component={Link}
          to="/"
        >
          Masz już konto? Zaloguj się
        </Button>
      </Paper>
    </div>
  );
}

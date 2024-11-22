import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/login.module.css';

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .get('http://localhost:5501/usuarios')
      .then((response) => {
        const user = response.data.find(
          (u) => u.email === email && u.password === password
        );
        if (user) {
          setUser(user);
          navigate('/home');
        } else {
          setError('Credenciais inválidas. Verifique seu email e senha.');
        }
      })
      .catch((error) => {
        console.error('Erro ao conectar ao servidor:', error);
        setError('Erro ao conectar ao servidor. Tente novamente mais tarde.');
      });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.header}>Login</h1>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.button}>
            Entrar
          </button>
        </form>
        <button
          onClick={() => navigate('/cadastro')}
          className={styles.link}
        >
          Não tem uma conta? Cadastre-se
        </button>
      </div>
    </div>
  );
}

export default Login;

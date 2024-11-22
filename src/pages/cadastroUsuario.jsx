import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './cadastro.module.css';

function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const novoUsuario = { nome, email, password, role: 'user' };

    axios
      .post('http://localhost:5501/usuarios', novoUsuario)
      .then(() => {
        setSuccess('Cadastro realizado com sucesso! Redirecionando para o login...');
        setTimeout(() => navigate('/login'), 2000); 
      })
      .catch((error) => {
        console.error('Erro ao cadastrar usuário:', error);
        setError('Erro ao cadastrar usuário. Tente novamente.');
      });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.header}>Cadastro</h1>
        {error && <p className={styles.errorMessage}>{error}</p>}
        {success && <p className={styles.successMessage}>{success}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={styles.input}
            required
          />
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
            Cadastrar
          </button>
        </form>
        <button
          onClick={() => navigate('/login')}
          className={styles.link}
        >
          Já tem uma conta? Faça login
        </button>
      </div>
    </div>
  );
}

export default Cadastro;

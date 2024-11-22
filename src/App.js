import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login';
import CadastroUsuario from './components/cadastroUsuario';
import Home from './components/home';

function App() {
  const [user, setUser] = useState(null); 

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />

        <Route path="/cadastro" element={<CadastroUsuario />} />

        <Route path="/home" element={user ? <Home user={user} /> : <Navigate to="/login" replace />} />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { GlobalStateProvider } from './context/GlobalStateContext';
import AppRoutes from './routes/AppRoutes';
import './styles/global.css';

function App() {
  return (
    <GlobalStateProvider>
      <Router>
        <AppRoutes />
      </Router>
    </GlobalStateProvider>
  );
}

export default App;

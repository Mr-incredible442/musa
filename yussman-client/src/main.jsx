// Root.jsx (or main.jsx)
import React, { useContext } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthContextProvider, AuthContext } from './context/AuthContext';
import AuthenticatedContexts from './AuthenticatedContexts.jsx';

const Root = () => {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      {user ? (
        <AuthenticatedContexts>
          <App />
        </AuthenticatedContexts>
      ) : (
        <App />
      )}
    </BrowserRouter>
  );
};

// Export the Root component for Fast Refresh to work properly
export default Root;

// Render the Root component
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthContextProvider>
      <Root />
    </AuthContextProvider>
  </React.StrictMode>,
);

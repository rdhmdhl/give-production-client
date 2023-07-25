import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {AuthContextProvider} from './context/AuthContext';

// wrap entire application with AuthContextProvider, so a user can be reached by any pat of the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AuthContextProvider>
      <App />
    </AuthContextProvider>
);

// reportWebVitals();

import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App.tsx';
import LoadWasm from './LoadWasm.tsx'

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#1fc2e6',
        },
        secondary: {
            main: '#1f5ee6',
        },
    },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <HashRouter>
            <LoadWasm>
                <ThemeProvider theme={darkTheme}>
                    <CssBaseline />
                    <App />
                </ThemeProvider>
            </LoadWasm>
        </HashRouter>
    </React.StrictMode >
);
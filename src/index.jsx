import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App.tsx';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';
import './types/WasmTypes.d.ts';
import './lib/wasm_exec.js';

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

const go = new window.Go();
WebAssembly.instantiateStreaming(fetch("crypto.wasm"), go.importObject).then(async (result) => {
    go.run(result.instance);
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <HashRouter>
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <App />
            </ThemeProvider>
        </HashRouter>
    </React.StrictMode >
);
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useLocation } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'react-pro-sidebar/dist/css/styles.css';

import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <App location={useLocation()} />
        </BrowserRouter>
    </React.StrictMode>
);
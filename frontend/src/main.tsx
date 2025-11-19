import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import AppWrapper from './App.tsx';
import {AuthProvider} from "./context/AuthContext";
import './i18n/i18n.ts';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
            <AuthProvider>
                <AppWrapper/>
            </AuthProvider>
    </StrictMode>,
)

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './components/Landing.jsx';

const App = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Landing />} />
        </Routes>
    </BrowserRouter>
);

const container = document.getElementById('react-app');
if (container) {
    createRoot(container).render(<App />);
}

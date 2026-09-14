import '../css/app.css';
import '@fontsource/geist/400.css';
import '@fontsource/geist/500.css';
import '@fontsource/geist/600.css';
import '@fontsource/geist/700.css';
import '@fontsource/geist-mono/400.css';
import '@fontsource/geist-mono/500.css';

import { createRoot } from 'react-dom/client';
import App from './components/App.jsx';

const el = document.getElementById('app');
if (el) {
    createRoot(el).render(<App />);
}

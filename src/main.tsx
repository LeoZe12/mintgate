
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('Starting app initialization...');

try {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  console.log('Root element found, creating React root...');
  const root = createRoot(rootElement);
  
  console.log('Rendering App component...');
  root.render(<App />);
  
  console.log('App rendered successfully!');
} catch (error) {
  console.error('Failed to initialize app:', error);
  
  // Fallback rendering
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h1 style="color: red;">Erro ao Inicializar Aplicação</h1>
        <p>Ocorreu um erro ao carregar a aplicação. Verifique o console para mais detalhes.</p>
        <p style="color: #666; font-size: 14px;">Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}</p>
      </div>
    `;
  }
}

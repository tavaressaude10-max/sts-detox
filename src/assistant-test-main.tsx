// Entrada de diagnóstico local. Não está entre as entradas do build de produção.
// Usa o MESMO componente e StrictMode, isolando somente roteador/menus/página.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AssistenteTavares } from './components/AssistenteTavares';
import './styles.css';

const root = document.getElementById('root');
if (root && import.meta.env.DEV) {
  createRoot(root).render(
    <StrictMode>
      <main style={{ padding: '2rem', maxWidth: '50rem' }}>
        <h1>Teste isolado F4 — Assistente Tavares</h1>
        <p>Mesmo chat e respostas, sem roteador, menus, vídeos ou outros diálogos.</p>
        <p>Abra o assistente, digite “Quais são os livros?”, envie e feche o chat.</p>
        <p>Esta página é somente para diagnóstico local. Não envia dados de diagnóstico.</p>
      </main>
      <AssistenteTavares />
    </StrictMode>,
  );
}

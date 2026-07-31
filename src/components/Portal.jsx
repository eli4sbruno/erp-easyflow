import { createPortal } from 'react-dom';

export default function Portal({ children }) {
  // Isso renderiza o conteúdo diretamente dentro do body do HTML
  return createPortal(children, document.body);
}
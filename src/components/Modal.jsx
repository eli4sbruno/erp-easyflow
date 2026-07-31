// src/components/Modal.jsx
import React from 'react';
import Portal from './Portal';

export default function Modal({ isOpen, children }) {
  // Se o modal não estiver aberto, não renderiza nada
  if (!isOpen) return null;

  return (
    <Portal>
      {/* Fundo escuro que cobre toda a tela */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
        {/* O 'children' é o conteúdo da janela branca que vamos passar dentro de cada módulo */}
        {children}
      </div>
    </Portal>
  );
}
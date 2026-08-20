import React from 'react';
import Modal from "@/components/modals/Modal";

export default function ModalConfirmarExclusao({ isOpen, onClose, onConfirm, titulo, mensagem }) {
  return (
    <Modal isOpen={isOpen}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">{titulo || 'Confirmar Exclusão?'}</h3>
          <p className="text-slate-500 text-sm">{mensagem || 'Tem certeza que deseja apagar este registo? A ação não pode ser desfeita.'}</p>
        </div>
        <div className="p-4 border-t border-slate-100 flex justify-center gap-3 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-[#E74C3C] text-white font-medium hover:bg-red-700 rounded-lg shadow-sm">Sim, apagar</button>
        </div>
      </div>
    </Modal>
  );
}
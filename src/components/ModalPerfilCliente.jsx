import React, { useState, useEffect } from 'react';
import Portal from './Portal';

const CloseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;

export default function ModalPerfilCliente({ isOpen, cliente, onClose }) {
  const [abaAtiva, setAbaAtiva] = useState('Dados');

  // Garante que o modal abra sempre na aba "Dados" quando um novo cliente for selecionado
  useEffect(() => {
    if (isOpen) {
      setAbaAtiva('Dados');
    }
  }, [isOpen, cliente]);

  if (!isOpen || !cliente) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex justify-end bg-black/30 backdrop-blur-sm transition-all">
        {/* Adicionei a animação de slide-in no tailwind caso já tenha configurado, ou um fade básico */}
        <div className="bg-white w-full max-w-4xl h-full shadow-2xl animate-fade-in flex overflow-hidden">
          
          {/* Coluna Esquerda - Resumo */}
          <div className="w-1/3 bg-slate-50 p-8 border-r border-slate-200 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-[#0F4C81] text-white flex items-center justify-center text-3xl font-bold shadow-lg mb-4">
              {cliente.nome.substring(0, 2).toUpperCase()}
            </div>
            <h3 className="font-bold text-lg text-slate-800">{cliente.nome}</h3>
            <p className="text-xs text-slate-500 mb-6 uppercase">ID #{cliente.id.toString().padStart(4, '0')}</p>
            <button className="w-full bg-[#1B9C85] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#15806c] transition-colors">
              + Novo Pedido
            </button>
          </div>

          {/* Coluna Direita - Detalhes e Abas */}
          <div className="flex-1 flex flex-col bg-white">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#0F4C81]">Dossiê do Cliente</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
                <CloseIcon />
              </button>
            </div>
            
            <div className="flex border-b border-slate-100 px-2">
              {['Dados', 'Histórico', 'Financeiro'].map((aba) => (
                <button 
                  key={aba} 
                  onClick={() => setAbaAtiva(aba)} 
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${abaAtiva === aba ? 'border-[#1B9C85] text-[#1B9C85]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  {aba}
                </button>
              ))}
            </div>
            
            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
              {abaAtiva === 'Dados' && (
                <div className="space-y-4"> 
                  <h4 className="text-sm font-bold text-slate-700">Contatos</h4> 
                  <p className="text-sm text-slate-600">
                    E-mail: {cliente.email} <br/> 
                    Tel: {cliente.tel}
                  </p>
                </div>
              )}
              {abaAtiva === 'Histórico' && (
                <div className="text-sm text-slate-500">
                  <p>Histórico de compras e pedidos será listado aqui.</p>
                </div>
              )}
              {abaAtiva === 'Financeiro' && (
                <div className="text-sm text-slate-500">
                  <p>Visão geral de pagamentos, débitos e créditos do cliente.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
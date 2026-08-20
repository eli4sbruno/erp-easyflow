import React, { useState } from 'react';
import Portal from "@/modules/portal/Portal";

const CloseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const CheckIcon = () => <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;

export default function ModalAssinaturaGov({ isOpen, onClose, documentoRef, onSuccess }) {
  const [etapa, setEtapa] = useState('confirmacao'); // 'confirmacao', 'carregando', 'sucesso'

  if (!isOpen) return null;

  const handleAssinar = () => {
    setEtapa('carregando');
    
    // Aqui entrará a requisição real (fetch/axios) para a sua API / backend que fala com o Gov.br
    // Simulando um tempo de resposta da API (3 segundos)
    setTimeout(() => {
      setEtapa('sucesso');
    }, 3000);
  };

  const handleConcluir = () => {
    setEtapa('confirmacao'); // Reseta para a próxima vez
    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200 w-full max-w-md overflow-hidden animate-fade-in relative">
          
          {/* Cabeçalho */}
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded uppercase tracking-wider">gov.br</span>
              Assinatura Digital
            </h3>
            {etapa !== 'carregando' && (
              <button onClick={handleConcluir} className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50">
                <CloseIcon />
              </button>
            )}
          </div>

          {/* Corpo do Modal */}
          <div className="p-8 text-center min-h-[250px] flex flex-col justify-center items-center">
            
            {etapa === 'confirmacao' && (
              <div className="space-y-4 animate-fade-in">
                <div className="w-16 h-16 bg-blue-50 text-[#0F4C81] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <h4 className="text-lg font-bold text-slate-800">Assinar Documento</h4>
                <p className="text-sm text-slate-500">
                  Você está prestes a assinar digitalmente o documento referente a: <br/>
                  <strong className="text-[#0F4C81]">{documentoRef || 'Documento do Sistema'}</strong>
                </p>
                <div className="pt-4 flex gap-3 justify-center">
                  <button onClick={handleConcluir} className="px-5 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
                  <button onClick={handleAssinar} className="px-5 py-2 bg-[#1B9C85] text-white font-medium hover:bg-[#15826e] rounded-lg shadow-sm transition-colors text-sm">Autenticar e Assinar</button>
                </div>
              </div>
            )}

            {etapa === 'carregando' && (
              <div className="space-y-4 animate-fade-in flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-[#1B9C85] rounded-full animate-spin mb-4"></div>
                <h4 className="text-lg font-bold text-slate-800">A processar assinatura...</h4>
                <p className="text-sm text-slate-500">A comunicar com os servidores do Gov.br. Por favor, aguarde.</p>
              </div>
            )}

            {etapa === 'sucesso' && (
              <div className="space-y-4 animate-fade-in flex flex-col items-center">
                <CheckIcon />
                <h4 className="text-lg font-bold text-slate-800">Assinatura Concluída!</h4>
                <p className="text-sm text-slate-500">O documento foi assinado com sucesso e possui validade jurídica.</p>
                <div className="pt-4">
                  <button onClick={handleConcluir} className="px-8 py-2 bg-[#0F4C81] text-white font-medium hover:bg-[#0c3e6a] rounded-lg shadow-sm transition-colors text-sm">Fechar</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </Portal>
  );
}
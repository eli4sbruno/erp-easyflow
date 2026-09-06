import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Icons } from './Icons';
import ModalPDV from '@/modules/vendas/components/ModalPDV'; 

const CartIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>;

export default function Header({ setMobileOpen }) {
  const [time, setTime] = useState(new Date());
  const [showPDV, setShowPDV] = useState(false);
  const location = useLocation();
  
  const activeRoute = location.pathname.substring(1) || 'dashboard';

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'F12') {
        e.preventDefault();
        setShowPDV(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const titulos = {
    dashboard: 'Dashboard Geral',
    financeiro: 'Financeiro',
    producao: 'Controle de Produção',
    vendas: 'Gestão de Vendas',
    clientes: 'Gestão de Clientes',
    estoque: 'Estoque de Materiais',
    configuracoes: 'Configurações do Sistema'
  };

  return (
    <>
      {/* Classe print:hidden adicionada direto no header */}
      <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 md:px-8 border-b border-slate-200 z-30 shrink-0 print:hidden">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-slate-600 hover:text-[#0F4C81]"
          >
            <Icons.Menu />
          </button>
          <h1 className="text-xl md:text-2xl font-semibold text-[#0F4C81]">
            {titulos[activeRoute] || 'ERP EasyFlow'}
          </h1>
        </div>

        <div className="flex items-center space-x-3 md:space-x-6">
          <button 
            onClick={() => setShowPDV(true)}
            className="hidden sm:flex items-center gap-2 bg-[#1B9C85] hover:bg-[#15806c] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors active:scale-95"
            title="Abrir Frente de Caixa (F12)"
          >
            <CartIcon /> Caixa Rápido [F12]
          </button>

          <button 
            onClick={() => setShowPDV(true)}
            className="sm:hidden flex items-center justify-center w-9 h-9 bg-[#1B9C85] hover:bg-[#15806c] text-white rounded-lg shadow-sm transition-colors active:scale-95"
          >
            <CartIcon />
          </button>

          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-medium text-slate-700">
              {time.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            <span className="text-xs text-slate-500">
              {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1B9C85] animate-pulse"></div>
            <span className="text-xs font-semibold text-[#1B9C85] hidden sm:block">Sistema Online</span>
          </div>
        </div>
      </header>

      <ModalPDV isOpen={showPDV} onClose={() => setShowPDV(false)} />
    </>
  );
}
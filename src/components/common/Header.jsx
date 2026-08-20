import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

export default function Header({ setMobileOpen, activeTab }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Dicionário de títulos baseado no id da aba
  const titulos = {
    dashboard: 'Dashboard Geral',
    financeiro: 'Financeiro',
    producao: 'Controle de Produção',
    vendas: 'Gestão de Vendas',
    estoque: 'Estoque de Materiais',
    configuracoes: 'Configurações do Sistema'
  };

  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 md:px-8 border-b border-slate-200 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setMobileOpen(true)}
          className="md:hidden text-slate-600 hover:text-[#0F4C81]"
        >
          <Icons.Menu />
        </button>
        {/* Título dinâmico renderizado aqui */}
        <h1 className="text-xl md:text-2xl font-semibold text-[#0F4C81]">
          {titulos[activeTab] || 'ERP Easyflow'}
        </h1>
      </div>

      <div className="flex items-center space-x-4 md:space-x-6">
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
  );
}
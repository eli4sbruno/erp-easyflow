import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout({ session, handleLogout }) {
  // O estado do menu mobile agora vive no Layout, pois ele afeta tanto o Header (botão de abrir) 
  // quanto a Sidebar (o menu em si fechando/abrindo)
  const [isMobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F5F7FA] font-sans overflow-hidden text-slate-800">
      
      {/* Sidebar com as props passadas corretamente */}
      <Sidebar 
        isMobileOpen={isMobileOpen} 
        setMobileOpen={setMobileOpen} 
        session={session}
        handleLogout={handleLogout}
      />

      {/* Container Principal */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header recebe apenas a função para abrir o menu mobile */}
        <Header setMobileOpen={setMobileOpen} />

        {/* Área de Conteúdo Dinâmico */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
          
          {/* 
            O componente <Outlet /> é a "janela" mágica do React Router. 
            É exatamente aqui que os componentes das suas páginas (Dashboard, Vendas, etc.) 
            serão injetados dependendo da URL atual.
          */}
          <Outlet /> 
          
        </main>
      </div>
      
      {/* Estilos Globais de Scrollbar e Animação que estavam no seu App.jsx */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}
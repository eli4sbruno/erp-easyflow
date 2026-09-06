import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icons } from './Icons';

// Ícones Customizados para a Sidebar
const CalendarIcon = () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>;
const ChevronLeft = () => <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>;
const ChevronRight = () => <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>;
const LogoutIcon = () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>;

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
  { id: 'agenda', label: 'Agenda', icon: CalendarIcon }, // <-- Módulo da Agenda plugado aqui
  { id: 'financeiro', label: 'Financeiro', icon: Icons.Financeiro },
  { id: 'producao', label: 'Produção', icon: Icons.Producao },
  { id: 'vendas', label: 'Vendas', icon: Icons.Vendas },
  { id: 'clientes', label: 'Clientes', icon: Icons.RH }, 
  { id: 'estoque', label: 'Estoque', icon: Icons.Estoque },
  { id: 'configuracoes', label: 'Configurações', icon: Icons.Configuracoes },
];

export default function Sidebar({ isMobileOpen, setMobileOpen, session, handleLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estado que controla se a sidebar está expandida ou minimizada (Apenas Desktop)
  const [isMinimized, setIsMinimized] = useState(false);
  
  const activeRoute = location.pathname.substring(1) || 'dashboard';

  return (
    <>
      {/* Fundo escuro quando a sidebar abre no mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden print:hidden" 
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-50
        bg-[#1B263B] text-slate-300 flex flex-col
        transition-all duration-300 ease-in-out
        print:hidden
        ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
        ${isMinimized ? 'md:w-20 w-64' : 'w-64'}
      `}>
        
        {/* BOTÃO FLUTUANTE DE MINIMIZAR (Escondido no mobile) */}
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className="hidden md:flex absolute -right-3 top-6 w-6 h-6 bg-[#1B9C85] text-white rounded-full items-center justify-center shadow-lg hover:bg-[#15806c] transition-colors z-[60] cursor-pointer border border-[#1B263B]"
          title={isMinimized ? "Expandir Menu" : "Minimizar Menu"}
        >
          {isMinimized ? <ChevronRight /> : <ChevronLeft />}
        </button>

        {/* HEADER DA SIDEBAR */}
        <div className={`h-16 bg-[#0F4C81] text-white flex items-center justify-center font-bold tracking-wider border-b border-[#1B263B] shadow-sm shrink-0 transition-all overflow-hidden ${isMinimized ? 'text-sm px-2' : 'text-xl'}`}>
          {isMinimized ? 'ERP' : 'ERP EASYFLOW'}
        </div>
        
        {/* NAVEGAÇÃO / LINKS */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
          
          {/* Título de Seção Inteligente */}
          {isMinimized ? (
            <div className="text-[10px] font-bold text-slate-500 text-center mb-4 border-b border-slate-700 pb-2">MENU</div>
          ) : (
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 ml-3 whitespace-nowrap">Menu Principal</div>
          )}

          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                navigate(`/${item.id}`); 
                setMobileOpen(false);
              }}
              title={isMinimized ? item.label : ""} // Dica flutuante (tooltip) quando fechado
              className={`
                w-full flex items-center py-3 rounded-lg transition-all duration-200
                ${isMinimized ? 'justify-center px-0' : 'px-4 space-x-3'}
                ${activeRoute === item.id 
                  ? 'bg-[#1B9C85] text-white shadow-md' 
                  : 'hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <div className="flex items-center justify-center shrink-0">
                <item.icon />
              </div>
              {!isMinimized && <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>
        
        {/* ÁREA DO USUÁRIO E LOGOUT */}
        <div className={`p-4 border-t border-slate-700 shrink-0 flex ${isMinimized ? 'flex-col items-center gap-3' : 'items-center space-x-3'}`}>
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white shrink-0 font-bold" title={session?.user?.email}>
            {session?.user?.email?.substring(0, 2).toUpperCase() || 'US'}
          </div>
          
          {isMinimized ? (
            // Logout quando minimizado (Apenas o ícone para caber)
            <button 
              onClick={handleLogout}
              title="Encerrar Sessão"
              className="p-2 text-red-400 hover:bg-red-400/10 hover:text-red-300 rounded-lg transition-colors"
            >
              <LogoutIcon />
            </button>
          ) : (
            // Logout quando expandido
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-sm font-semibold text-white truncate w-32" title={session?.user?.email}>
                {session?.user?.email || 'Usuário'}
              </span>
              <button 
                onClick={handleLogout}
                className="text-xs text-red-400 hover:text-red-300 flex items-center mt-1 transition-colors w-fit"
              >
                Encerrar Sessão
              </button>
            </div>
          )}
        </div>

      </aside>
    </>
  );
}
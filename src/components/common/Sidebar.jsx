import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icons } from './Icons';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
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
  
  const activeRoute = location.pathname.substring(1) || 'dashboard';

  return (
    <>
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden print:hidden" 
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      {/* Classe print:hidden adicionada no aside */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-[#1B263B] text-slate-300 flex flex-col
        transition-transform duration-300 ease-in-out
        print:hidden
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-16 bg-[#0F4C81] text-white flex items-center justify-center font-bold text-xl tracking-wider border-b border-[#1B263B] shadow-sm shrink-0">
          ERP EASYFLOW
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 ml-2">Menu Principal</div>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                navigate(`/${item.id}`); 
                setMobileOpen(false);
              }}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                ${activeRoute === item.id 
                  ? 'bg-[#1B9C85] text-white shadow-md' 
                  : 'hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <item.icon />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-700 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white shrink-0 font-bold">
              {session?.user?.email?.substring(0, 2).toUpperCase() || 'US'}
            </div>
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
          </div>
        </div>
      </aside>
    </>
  );
}
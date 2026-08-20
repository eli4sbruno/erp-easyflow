import React from 'react';
import { Icons } from './Icons';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
  { id: 'financeiro', label: 'Financeiro', icon: Icons.Financeiro },
  { id: 'producao', label: 'Produção', icon: Icons.Producao },
  { id: 'vendas', label: 'Vendas', icon: Icons.Vendas },
  { id: 'estoque', label: 'Estoque', icon: Icons.Estoque },
  { id: 'compras', label: 'Compras', icon: Icons.Estoque },
  { id: 'rh', label: 'RH', icon: Icons.RH },
  { id: 'marketing', label: 'Marketing', icon: Icons.Marketing },
  { id: 'configuracoes', label: 'Configurações', icon: Icons.Configuracoes },
];

export default function Sidebar({ activeTab, setActiveTab, isMobileOpen, setMobileOpen }) {
  return (
    <>
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-[#1B263B] text-slate-300 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-16 bg-[#0F4C81] text-white flex items-center justify-center font-bold text-xl tracking-wider border-b border-[#1B263B] shadow-sm">
          ERP EASYFLOW
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 ml-2">Menu Principal</div>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileOpen(false);
              }}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                ${activeTab === item.id 
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
        
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white">
              US
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold text-white">Usuário Master</span>
              <span className="text-xs text-slate-400">Admin</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './components/Login';
import Dashboard from './components/Dashboard'; 
import Financeiro from './components/Financeiro';
import Estoque from './components/Estoque';
import Vendas from './components/Vendas';
import Producao from './components/Producao';
import RH from './components/RH';
import Compras from './components/Compras';
import Marketing from './components/Marketing';
import Configuracoes from './components/Configuracoes';
import Clientes from './components/Clientes';

// Conjunto de ícones vetoriais
const Icons = {
  Dashboard: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>,
  Financeiro: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
  Producao: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>,
  Vendas: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>,
  Estoque: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>,
  RH: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>,
  Configuracoes: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>,
  Menu: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>,
  Logout: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
};

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
  { id: 'financeiro', label: 'Financeiro', icon: Icons.Financeiro },
  { id: 'producao', label: 'Produção', icon: Icons.Producao },
  { id: 'vendas', label: 'Vendas', icon: Icons.Vendas },
  { id: 'clientes', label: 'Clientes', icon: Icons.RH },
  { id: 'estoque', label: 'Estoque', icon: Icons.Estoque },
  { id: 'configuracoes', label: 'Configurações', icon: Icons.Configuracoes },
];

const Sidebar = ({ activeTab, setActiveTab, isMobileOpen, setMobileOpen, session, handleLogout }) => (
  <>
    {isMobileOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}
    <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#1B263B] text-slate-300 flex flex-col transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="h-16 bg-[#0F4C81] text-white flex items-center justify-center font-bold text-xl tracking-wider border-b border-[#1B263B] shadow-sm shrink-0">
        ERP EASYFLOW
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 ml-2">Menu Principal</div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveTab(item.id); setMobileOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === item.id ? 'bg-[#1B9C85] text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}
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
              {session?.user?.email || 'Utilizador'}
            </span>
            <button 
              onClick={handleLogout}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mt-1 transition-colors w-fit"
            >
              <Icons.Logout />
              Encerrar Sessão
            </button>
          </div>
        </div>
      </div>
    </aside>
  </>
);

const Header = ({ setMobileOpen, activeTab }) => {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const titulos = {
    dashboard: 'Dashboard Geral',
    financeiro: 'Financeiro',
    producao: 'Controle de Produção',
    vendas: 'Gestão de Vendas',
    estoque: 'Estoque de Materiais',
    configuracoes: 'Configurações do Sistema'
  };

  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 md:px-8 border-b border-slate-200 z-30 shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={() => setMobileOpen(true)} className="md:hidden text-slate-600 hover:text-[#0F4C81]"><Icons.Menu /></button>
        <h1 className="text-xl md:text-2xl font-semibold text-[#0F4C81]">
          {titulos[activeTab] || 'ERP Easyflow'}
        </h1>
      </div>
      <div className="flex items-center space-x-4 md:space-x-6">
        <div className="hidden md:flex flex-col text-right">
          <span className="text-sm font-medium text-slate-700">{time.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          <span className="text-xs text-slate-500">{time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1B9C85] animate-pulse"></div>
          <span className="text-xs font-semibold text-[#1B9C85] hidden sm:block">Sistema Online</span>
        </div>
      </div>
    </header>
  );
};

export default function App() {
  // 1. MOCK: Iniciamos com um usuário genérico já logado
  const [session, setSession] = useState({
    user: { email: 'dev@easyflow.com' }
  });
  
  // 2. MOCK: Definimos como false para não exibir a tela de loading
  const [isCheckingSession, setIsCheckingSession] = useState(false); 
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileOpen, setMobileOpen] = useState(false);

  // 3. MOCK: Comente o useEffect do Supabase para evitar chamadas de rede
  /*
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsCheckingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);
  */

  const handleLogout = async () => {
    // Apaga a sessão mockada ao clicar em sair
    setSession(null); 
  };

  // Ecrã de Loading Inicial
  if (isCheckingSession) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F5F7FA]">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#0F4C81] rounded-full animate-spin"></div>
          <p className="font-medium">A carregar o sistema...</p>
        </div>
      </div>
    );
  }

  // Ecrã de Login (se não houver sessão)
  if (!session) {
    return <Login setSession={setSession} />;
  }

  // ERP Principal (se houver sessão)
  return (
    <div className="flex h-screen bg-[#F5F7FA] font-sans overflow-hidden text-slate-800">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileOpen={isMobileOpen} 
        setMobileOpen={setMobileOpen} 
        session={session}
        handleLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header setMobileOpen={setMobileOpen} activeTab={activeTab} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
          {/* As rotas agora estão isoladas por componente */}
          {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
          {activeTab === 'financeiro' && <div className="max-w-7xl mx-auto h-full"><Financeiro /></div>}
          {activeTab === 'estoque' && <div className="max-w-7xl mx-auto h-full"><Estoque /></div>}
          {activeTab === 'vendas' && <div className="max-w-7xl mx-auto h-full"><Vendas /></div>}
          {activeTab === 'producao' && <div className="max-w-7xl mx-auto h-full"><Producao /></div>}
          {activeTab === 'clientes' && <div className="max-w-7xl mx-auto h-full"><Clientes /></div>}
          {activeTab === 'configuracoes' && <div className="max-w-7xl mx-auto h-full"><Configuracoes /></div>}
        </main>
      </div>

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
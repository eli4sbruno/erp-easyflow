import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from "@/supabaseClient";

// 1. Imports Limpos: Somente os módulos que estarão na V1
import Login from "@/modules/login/Login";
import Dashboard from "@/modules/dashboard/Dashboard";
import Financeiro from "@/modules/financeiro/Financeiro";
import Clientes from "@/modules/clientes/Clientes";
import Estoque from "@/modules/estoque/Estoque";
import Vendas from "@/modules/vendas/Vendas";
import Producao from "@/modules/producao/Producao";
import Agenda from '@/modules/agenda/Agenda';
import Configuracoes from "@/modules/configuracoes/Configuracoes";

// 2. Import do nosso novo Layout (que já contém Sidebar e Header)
import MainLayout from "@/components/common/MainLayout";

export default function App() {
  const [session, setSession] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true); 

  // Lógica de Autenticação do Supabase (Mantida idêntica à sua)
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null); 
  };

  // Ecrã de Loading Inicial (Mantido idêntico ao seu)
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

  return (
    <Router>
      <Routes>
        {/* Rota Pública: Tela de Login */}
        <Route 
          path="/login" 
          element={!session ? <Login setSession={setSession} /> : <Navigate to="/dashboard" replace />} 
        />

        {/* 
          Rotas Privadas (Protegidas)
          Se não houver sessão, joga pro login. Se houver, renderiza o MainLayout.
          Tudo o que está dentro do MainLayout será jogado no <Outlet /> dele.
        */}
        <Route 
          element={session ? <MainLayout session={session} handleLogout={handleLogout} /> : <Navigate to="/login" replace />}
        >
          {/* Se o usuário acessar a raiz do site, redireciona para o dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Nossas telas da V1 */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/financeiro" element={<div className="max-w-7xl mx-auto h-full"><Financeiro /></div>} />
          <Route path="/estoque" element={<div className="max-w-7xl mx-auto h-full"><Estoque /></div>} />
          <Route path="/vendas" element={<div className="max-w-7xl mx-auto h-full"><Vendas /></div>} />
          <Route path="/producao" element={<div className="max-w-7xl mx-auto h-full"><Producao /></div>} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/clientes" element={<div className="max-w-7xl mx-auto h-full"><Clientes /></div>} />
          <Route path="/configuracoes" element={<div className="max-w-7xl mx-auto h-full"><Configuracoes /></div>} />
        </Route>
      </Routes>
    </Router>
  );
}
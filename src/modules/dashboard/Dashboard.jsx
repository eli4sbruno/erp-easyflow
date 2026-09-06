"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from "@/supabaseClient";

// Importação dos Modais para as Ações Rápidas
import ModalPedidoVenda from "@/modules/vendas/components/ModalPedidoVenda";
import ModalPagamento from "@/modules/financeiro/components/ModalPagamento";
import ModalNovaOS from "@/modules/producao/components/ModalNovaOS";

// --- Ícones Principais ---
const SalesIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>;
const OSIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>;
const FinanceIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const StockIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>;

// --- Ícones Secundários ---
const TrendingUpIcon = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>;
const TrendingDownIcon = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"></path></svg>;
const SearchIcon = () => <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;

const MiniChartDecoration = ({ color }) => (
  <div className={`absolute bottom-0 right-4 flex items-end gap-1 opacity-20 pointer-events-none text-${color}`}>
    <div className="w-2.5 h-4 bg-current rounded-t-[2px]"></div>
    <div className="w-2.5 h-7 bg-current rounded-t-[2px]"></div>
    <div className="w-2.5 h-12 bg-current rounded-t-[2px]"></div>
    <div className="w-2.5 h-9 bg-current rounded-t-[2px]"></div>
    <div className="w-2.5 h-16 bg-current rounded-t-[2px]"></div>
  </div>
);

export default function Dashboard({ setActiveTab }) {
  const [userName, setUserName] = useState('Usuário');
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados dos Modais de Ações Rápidas
  const [isModalVendaOpen, setIsModalVendaOpen] = useState(false);
  const [isModalPagamentoOpen, setIsModalPagamentoOpen] = useState(false);
  const [isModalOSOpen, setIsModalOSOpen] = useState(false);

  const [kpis, setKpis] = useState({
    vendasMes: 0,
    osPendentes: 0,
    saldoMensal: 0,
    alertasEstoque: 0
  });

  const [ultimasVendas, setUltimasVendas] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email) setUserName(user.email.split('@')[0]);

    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString();

    try {
      // 1. DADOS CALCULADOS PELO SUPABASE VIA RPC (Performance Ouro)
      const { data: summary, error: summaryError } = await supabase.rpc('get_dashboard_summary', { 
        mes_inicio: primeiroDiaMes 
      });

      if (summaryError) {
        console.error("Erro ao buscar resumo na RPC:", summaryError);
      }

      // 2. CONTAGEM EXATA DE O.S PENDENTES
      const { count: osCount } = await supabase.from('producao')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Pendente', 'Em Andamento']);

      // 3. VENDAS RECENTES (Para a tabela inferior)
      const { data: ultimosPedidos } = await supabase.from('vendas')
        .select('id, servico, valor_total, status, created_at, clientes(nome_razao)')
        .order('created_at', { ascending: false })
        .limit(5);
        
      const { data: ultimasTransacoes } = await supabase.from('transacoes')
        .select('id, cliente, descricao, valor, status, created_at')
        .eq('tipo', 'receita')
        .is('venda_id', null)
        .order('created_at', { ascending: false })
        .limit(5);

      const listaPedidos = (ultimosPedidos || []).map(v => ({
        id: `pedido-${v.id}`,
        cliente: v.clientes?.nome_razao || 'Sem Nome',
        servico: v.servico || 'Pedido de Venda',
        valor_total: v.valor_total,
        status: v.status,
        data: new Date(v.created_at)
      }));

      const listaPdv = (ultimasTransacoes || []).map(t => ({
        id: `pdv-${t.id}`,
        cliente: t.cliente || 'Cliente Balcão',
        servico: t.descricao || 'Caixa Rápido',
        valor_total: t.valor,
        status: t.status === 'Pago' ? 'Concluído' : t.status,
        data: new Date(t.created_at)
      }));

      // Junta as duas listas, ordena pela data mais recente e pega as 5 primeiras
      const mesclado = [...listaPedidos, ...listaPdv].sort((a, b) => b.data - a.data).slice(0, 5);
      setUltimasVendas(mesclado);

      // 4. ATUALIZA O ESTADO DOS KPIs
      setKpis({ 
        vendasMes: summary?.faturamento_total || 0, 
        osPendentes: osCount || 0, 
        saldoMensal: summary?.saldo_liquido || 0, 
        alertasEstoque: summary?.alertas_estoque || 0 
      });

    } catch (error) {
      console.error("Erro ao carregar Dashboard:", error);
    }
    setIsLoading(false);
  };

  const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Orçamento': return 'bg-slate-100 text-slate-600';
      case 'Aguardando Aprovação': return 'bg-amber-100 text-amber-700';
      case 'Em Produção': return 'bg-blue-100 text-blue-700';
      case 'Pronto': return 'bg-indigo-100 text-indigo-700';
      case 'Entregue': 
      case 'Concluído': return 'bg-green-100 text-green-700';
      case 'Pendente': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 w-full">
      
      {/* CABEÇALHO SIMPLIFICADO */}
      <div className="mb-2">
        <p className="text-slate-500 font-medium text-lg">
          Bem-vindo de volta, <span className="font-bold text-[#0F4C81]">{userName}</span>
        </p>
      </div>

      {/* GRID DE CARDS PRINCIPAIS ENFILEIRADOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        
        {/* Card 1: Vendas */}
        <div 
          onClick={() => setActiveTab('vendas')}
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-5 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#0F4C81]/10 text-[#0F4C81] flex items-center justify-center">
              <SalesIcon />
            </div>
            <span className="text-slate-700 font-semibold text-[15px]">Faturamento</span>
          </div>
          
          <div className="text-2xl font-bold text-slate-800 mb-5 relative z-10">
            {isLoading ? '...' : formatarMoeda(kpis.vendasMes)}
          </div>
          
          <div className="flex items-center gap-2 relative z-10">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100/80 text-green-700 font-bold text-[10px] border border-green-200/50">
              <TrendingUpIcon /> +12%
            </span>
            <span className="text-slate-400 text-[11px] font-medium">vs. último mês</span>
          </div>
          <MiniChartDecoration color="slate-400" />
        </div>

        {/* Card 2: Produção */}
        <div 
          onClick={() => setActiveTab('producao')}
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-5 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <OSIcon />
            </div>
            <span className="text-slate-700 font-semibold text-[15px]">O.S em Produção</span>
          </div>
          
          <div className="text-2xl font-bold text-slate-800 mb-5 relative z-10">
            {isLoading ? '...' : kpis.osPendentes}
          </div>
          
          <div className="flex items-center gap-2 relative z-10">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100/80 text-green-700 font-bold text-[10px] border border-green-200/50">
              <TrendingUpIcon /> +5%
            </span>
            <span className="text-slate-400 text-[11px] font-medium">vs. último mês</span>
          </div>
          <MiniChartDecoration color="slate-400" />
        </div>

        {/* Card 3: Financeiro */}
        <div 
          onClick={() => setActiveTab('financeiro')}
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-5 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#1B9C85]/10 text-[#1B9C85] flex items-center justify-center">
              <FinanceIcon />
            </div>
            <span className="text-slate-700 font-semibold text-[15px]">Saldo Líquido Real</span>
          </div>
          
          <div className={`text-2xl font-bold mb-5 relative z-10 ${kpis.saldoMensal >= 0 ? 'text-slate-800' : 'text-[#E74C3C]'}`}>
            {isLoading ? '...' : formatarMoeda(kpis.saldoMensal)}
          </div>
          
          <div className="flex items-center gap-2 relative z-10">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100/80 text-green-700 font-bold text-[10px] border border-green-200/50">
              <TrendingUpIcon /> +8%
            </span>
            <span className="text-slate-400 text-[11px] font-medium">vs. último mês</span>
          </div>
          <MiniChartDecoration color="slate-400" />
        </div>

        {/* Card 4: Estoque */}
        <div 
          onClick={() => setActiveTab('estoque')}
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-5 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#E74C3C]/10 text-[#E74C3C] flex items-center justify-center">
              <StockIcon />
            </div>
            <span className="text-slate-700 font-semibold text-[15px]">Estoque Alerta</span>
          </div>
          
          <div className="text-2xl font-bold text-slate-800 mb-5 relative z-10">
            {isLoading ? '...' : kpis.alertasEstoque}
          </div>
          
          <div className="flex items-center gap-2 relative z-10">
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] border ${kpis.alertasEstoque > 0 ? 'bg-red-100/80 text-red-700 border-red-200/50' : 'bg-green-100/80 text-green-700 border-green-200/50'}`}>
              {kpis.alertasEstoque > 0 ? <TrendingDownIcon /> : <TrendingUpIcon />} 
              {kpis.alertasEstoque > 0 ? '-2% Saúde' : 'Tudo Ok'}
            </span>
            <span className="text-slate-400 text-[11px] font-medium">Itens abaixo do mínimo</span>
          </div>
          <MiniChartDecoration color="slate-400" />
        </div>

      </div>

      {/* ÁREA INFERIOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Tabela */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-lg text-slate-800">Vendas e Faturamentos Recentes</h3>
            <button onClick={() => setActiveTab('vendas')} className="text-[13px] font-bold text-[#0F4C81] hover:underline bg-[#0F4C81]/5 px-3 py-1.5 rounded-lg transition-colors">
              Ver todas
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 font-semibold text-slate-400 uppercase tracking-wider text-[11px]">Cliente</th>
                  <th className="pb-3 font-semibold text-slate-400 uppercase tracking-wider text-[11px]">Serviço / Produto</th>
                  <th className="pb-3 font-semibold text-slate-400 uppercase tracking-wider text-[11px] text-right">Valor</th>
                  <th className="pb-3 font-semibold text-slate-400 uppercase tracking-wider text-[11px] text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr><td colSpan="4" className="py-6 text-center text-slate-400 text-sm">Carregando...</td></tr>
                ) : ultimasVendas.length === 0 ? (
                  <tr><td colSpan="4" className="py-6 text-center text-slate-400 text-sm">Nenhuma movimentação recente registrada.</td></tr>
                ) : (
                  ultimasVendas.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 font-bold text-slate-800 pr-4 text-[13px]">
                        {v.cliente}
                      </td>
                      <td className="py-3.5 text-slate-500 truncate max-w-[130px] pr-4 text-[13px]">
                        {v.servico}
                      </td>
                      <td className="py-3.5 text-right font-bold text-slate-800 pr-4 text-[13px]">
                        {formatarMoeda(v.valor_total)}
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${getStatusColor(v.status)}`}>
                          {v.status || 'Orçamento'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Atalhos com abertura de Modal */}
        <div className="bg-[#1B263B] rounded-2xl p-6 shadow-md text-white flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#0F4C81] rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
          
          <h3 className="font-bold text-lg text-white mb-6 relative z-10">Ações Rápidas</h3>
          
          <div className="space-y-3 flex-1 relative z-10">
            <button onClick={() => setIsModalVendaOpen(true)} className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 p-4 rounded-xl flex items-center gap-4 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <SalesIcon />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">Nova Venda</div>
                <div className="text-[11px] text-slate-300 font-medium">Criar pedido ou orçamento</div>
              </div>
            </button>

            <button onClick={() => setIsModalPagamentoOpen(true)} className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 p-4 rounded-xl flex items-center gap-4 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <FinanceIcon />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">Lançamento de Caixa</div>
                <div className="text-[11px] text-slate-300 font-medium">Registrar entrada ou despesa</div>
              </div>
            </button>

            <button onClick={() => setIsModalOSOpen(true)} className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 p-4 rounded-xl flex items-center gap-4 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <OSIcon />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">Nova O.S</div>
                <div className="text-[11px] text-slate-300 font-medium">Criar ordem de produção</div>
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* Renderização dos Modais */}
      <ModalPedidoVenda 
        isOpen={isModalVendaOpen} 
        onClose={() => setIsModalVendaOpen(false)} 
        onSuccess={fetchDashboardData} 
      />
      
      <ModalPagamento 
        isOpen={isModalPagamentoOpen} 
        onClose={() => setIsModalPagamentoOpen(false)} 
        onSuccess={fetchDashboardData} 
      />
      
      <ModalNovaOS 
        isOpen={isModalOSOpen} 
        onClose={() => setIsModalOSOpen(false)} 
        onSuccess={fetchDashboardData} 
      />
    </div>
  );
}
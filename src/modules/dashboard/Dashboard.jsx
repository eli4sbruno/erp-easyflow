import React, { useState, useEffect } from 'react';
import { supabase } from "@/supabaseClient";
import ModalPagamento from "@/modules/financeiro/components/ModalPagamento";
import ModalNovaOS from "@/modules/producao/components/ModalNovaOS";

const formatMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const Icons = {
  Financeiro: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
  Producao: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>,
  Alert: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>,
  Clientes: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
};

const KPICards = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {data.map((kpi, index) => (
        <div key={index} className={`bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow border-l-4 ${kpi.borderColor || 'border-l-[#0F4C81]'}`}>
          <h3 className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wide">{kpi.title}</h3>
          <div className="text-2xl font-bold text-slate-800 mb-2">{kpi.value}</div>
          <div className={`text-sm font-semibold flex items-center gap-1 ${kpi.color}`}>
            {kpi.status}
          </div>
        </div>
      ))}
    </div>
  );
};

const MainContentArea = ({ recentOrders, chartData, isLoading, onOpenReceita, onOpenOrdem, totalClientes, itensCriticosEstoque }) => {
  const maxValorGrafico = chartData && chartData.length > 0 ? Math.max(...chartData.map(d => Math.max(d.receita, d.despesa, 100))) : 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#0F4C81]">Fluxo de Caixa (Últimos 6 meses)</h2>
            <div className="flex gap-4 text-xs font-medium">
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#1B9C85]"></div> Receitas</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#0F4C81]"></div> Despesas</span>
            </div>
          </div>
          
          <div className="h-48 flex justify-between gap-2 md:gap-4 mt-4 pt-4 border-t border-slate-100">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400">A processar dados...</div>
            ) : chartData?.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400">Sem dados suficientes</div>
            ) : (
              chartData.map((data, i) => {
                const alturaReceita = (data.receita / maxValorGrafico) * 100;
                const alturaDespesa = (data.despesa / maxValorGrafico) * 100;
                
                return (
                  <div key={i} className="flex-1 h-full flex flex-col justify-end group">
                    <div className="flex justify-center gap-1 w-full h-full items-end">
                      <div 
                        className="w-1/2 bg-[#1B9C85] rounded-t-sm transition-all duration-700 ease-out group-hover:opacity-80" 
                        style={{ height: `${alturaReceita}%`, minHeight: data.receita > 0 ? '4px' : '0' }}
                        title={`Receita: ${formatMoeda(data.receita)}`}
                      ></div>
                      <div 
                        className="w-1/2 bg-[#0F4C81] rounded-t-sm transition-all duration-700 ease-out group-hover:opacity-80" 
                        style={{ height: `${alturaDespesa}%`, minHeight: data.despesa > 0 ? '4px' : '0' }}
                        title={`Despesa: ${formatMoeda(data.despesa)}`}
                      ></div>
                    </div>
                    <div className="text-xs text-center mt-2 text-slate-400 font-medium capitalize shrink-0">
                      {data.label}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#0F4C81]">Receitas Recentes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Ref</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">A calcular dados...</td></tr>
                ) : recentOrders.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">Nenhuma venda registada.</td></tr>
                ) : (
                  recentOrders.map((order, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-400 text-xs uppercase">{order.id}</td>
                      <td className="px-6 py-4 text-slate-800 font-medium">{order.client}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{order.value}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.statusColor}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-red-100 text-[#E74C3C] rounded-lg"><Icons.Alert /></div>
            <h2 className="text-lg font-semibold text-slate-800">Central de Alertas</h2>
          </div>
          <div className="space-y-3">
            {itensCriticosEstoque > 0 && (
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 flex gap-3 items-start">
                <span className="text-orange-500 mt-0.5">📦</span>
                <div>
                  <p className="text-sm font-semibold text-orange-900">Estoque Crítico</p>
                  <p className="text-xs text-orange-700 mt-1">Existem {itensCriticosEstoque} itens abaixo do mínimo recomendado.</p>
                </div>
              </div>
            )}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex gap-3 items-start">
              <span className="text-[#0F4C81] mt-0.5">👥</span>
              <div>
                <p className="text-sm font-semibold text-blue-900">Base de Clientes</p>
                <p className="text-xs text-blue-700 mt-1">Total de {totalClientes} clientes registados no CRM.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-[#0F4C81] p-6 rounded-xl shadow-md text-white">
          <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={onOpenReceita}
              className="bg-white/10 hover:bg-white/20 p-3 rounded-lg text-sm font-medium transition-colors text-left flex flex-col gap-2"
            >
              <Icons.Financeiro /> Nova Receita
            </button>
            <button 
              onClick={onOpenOrdem}
              className="bg-white/10 hover:bg-white/20 p-3 rounded-lg text-sm font-medium transition-colors text-left flex flex-col gap-2"
            >
             <Icons.Producao /> Nova O.S
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [kpiData, setKpiData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [totalClientes, setTotalClientes] = useState(0);
  const [itensCriticosEstoque, setItensCriticosEstoque] = useState(0);
  const [isLoadingDash, setIsLoadingDash] = useState(true);

  const [isReceitaOpen, setIsReceitaOpen] = useState(false);
  const [isOrdemOpen, setIsOrdemOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoadingDash(true);
    
    // Buscar Transações Financeiras
    const { data: transacoes } = await supabase.from('transacoes').select('*');
    
    // Buscar Clientes
    const { count: countClientes } = await supabase.from('clientes').select('*', { count: 'exact', head: true });
    setTotalClientes(countClientes || 0);

    // Buscar Estoque Crítico
    const { data: estoque } = await supabase.from('estoque').select('*');
    const criticos = estoque ? estoque.filter(item => Number(item.quantidade) <= Number(item.estoque_minimo)).length : 0;
    setItensCriticosEstoque(criticos);

    let totalFaturamento = 0;
    let totalDespesas = 0;
    let totalAPagar = 0;

    transacoes?.forEach(trx => {
      const valor = Number(trx.valor) || 0;
      if (trx.tipo === 'receita' && trx.status === 'Pago') totalFaturamento += valor;
      if (trx.tipo === 'despesa' && trx.status === 'Pago') totalDespesas += valor;
      if (trx.tipo === 'despesa' && trx.status === 'Pendente') totalAPagar += valor;
    });

    const lucro = totalFaturamento - totalDespesas;

    setKpiData([
      { title: 'Faturamento', value: formatMoeda(totalFaturamento), status: 'Real', color: 'text-[#1B9C85]', borderColor: 'border-l-[#1B9C85]' },
      { title: 'Lucro Líquido', value: formatMoeda(lucro), status: lucro >= 0 ? 'Saudável' : 'Negativo', color: lucro >= 0 ? 'text-[#1B9C85]' : 'text-[#E74C3C]', borderColor: 'border-l-[#0F4C81]' },
      { title: 'Contas a Pagar', value: formatMoeda(totalAPagar), status: totalAPagar > 0 ? 'Atenção' : 'Em dia', color: totalAPagar > 0 ? 'text-[#E74C3C]' : 'text-[#1B9C85]', borderColor: 'border-l-[#E74C3C]' },
      { title: 'Clientes CRM', value: countClientes || 0, status: 'Ativos', color: 'text-[#0F4C81]', borderColor: 'border-l-blue-500' },
    ]);

    const recentes = transacoes
      ?.filter(trx => trx.tipo === 'receita')
      .slice(0, 4)
      .map(trx => ({
        id: trx.id ? trx.id.toString().substring(0, 8) : '---',
        client: trx.cliente || 'Cliente Diversos',
        value: formatMoeda(trx.valor),
        status: trx.status === 'Pago' ? 'Faturado' : 'Pendente',
        statusColor: trx.status === 'Pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }));
    setRecentOrders(recentes || []);

    const ultimos6Meses = [];
    const hoje = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      ultimos6Meses.push({
        mes: d.getMonth(),
        ano: d.getFullYear(),
        label: d.toLocaleDateString('pt-BR', { month: 'short' }),
        receita: 0,
        despesa: 0
      });
    }

    transacoes?.forEach(trx => {
      if (!trx.vencimento) return;
      const [anoStr, mesStr] = trx.vencimento.split('-');
      if (!anoStr || !mesStr) return;
      const trxAno = parseInt(anoStr, 10);
      const trxMes = parseInt(mesStr, 10) - 1;

      const mesIndex = ultimos6Meses.findIndex(m => m.mes === trxMes && m.ano === trxAno);
      if (mesIndex !== -1 && trx.status === 'Pago') {
        const valor = Number(trx.valor) || 0;
        if (trx.tipo === 'receita') ultimos6Meses[mesIndex].receita += valor;
        if (trx.tipo === 'despesa') ultimos6Meses[mesIndex].despesa += valor;
      }
    });

    setChartData(ultimos6Meses);
    setIsLoadingDash(false);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in relative z-0">
        <KPICards data={kpiData} isLoading={isLoadingDash} />
        <MainContentArea 
          recentOrders={recentOrders} 
          chartData={chartData} 
          isLoading={isLoadingDash} 
          onOpenReceita={() => setIsReceitaOpen(true)}
          onOpenOrdem={() => setIsOrdemOpen(true)}
          totalClientes={totalClientes}
          itensCriticosEstoque={itensCriticosEstoque}
        />
      </div>

      <ModalPagamento 
        isOpen={isReceitaOpen} 
        onClose={() => setIsReceitaOpen(false)} 
        onSuccess={fetchDashboardData} 
      />

      <ModalNovaOS 
        isOpen={isOrdemOpen} 
        onClose={() => setIsOrdemOpen(false)} 
        onSuccess={fetchDashboardData} 
      />
    </>
  );
}
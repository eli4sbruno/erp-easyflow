import React from 'react';
import { Icons } from './Icons';

const recentOrders = [
  { id: '#1042', client: 'Tech Solutions LTDA', value: 'R$ 12.500', status: 'Faturado', statusColor: 'bg-green-100 text-green-800' },
  { id: '#1043', client: 'Comercial Silva', value: 'R$ 4.200', status: 'Em Produção', statusColor: 'bg-blue-100 text-blue-800' },
  { id: '#1044', client: 'Indústrias Matarazzo', value: 'R$ 28.900', status: 'Pendente', statusColor: 'bg-yellow-100 text-yellow-800' },
  { id: '#1045', client: 'Loja do Centro', value: 'R$ 1.850', status: 'Faturado', statusColor: 'bg-green-100 text-green-800' },
];

export default function MainContentArea() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Gráfico Simulado */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#0F4C81]">Fluxo de Caixa (Últimos 6 meses)</h2>
            <button className="text-sm text-[#1B9C85] font-medium hover:underline">Ver Detalhes</button>
          </div>
          
          <div className="h-48 flex items-end justify-between gap-2 md:gap-4 mt-4 pt-4 border-t border-slate-100">
            {[40, 70, 45, 90, 65, 85].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end group">
                <div className="flex justify-center gap-1">
                  <div className="w-1/2 bg-[#1B9C85] rounded-t-sm transition-all duration-500 ease-out group-hover:opacity-80" style={{ height: `${height}%` }}></div>
                  <div className="w-1/2 bg-[#0F4C81] rounded-t-sm transition-all duration-500 ease-out group-hover:opacity-80" style={{ height: `${height * 0.6}%` }}></div>
                </div>
                <div className="text-xs text-center mt-2 text-slate-400 font-medium">
                  {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'][i]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabela de Pedidos */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#0F4C81]">Produção e Vendas Recentes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Pedido</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{order.id}</td>
                    <td className="px-6 py-4">{order.client}</td>
                    <td className="px-6 py-4 font-semibold">{order.value}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.statusColor}`}>{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-red-100 text-[#E74C3C] rounded-lg"><Icons.Alert /></div>
            <h2 className="text-lg font-semibold text-[#E74C3C]">Central de Alertas</h2>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 bg-red-50 rounded-lg border border-red-100 flex gap-3 items-start">
              <span className="text-[#E74C3C] mt-0.5">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-red-900">3 Contas vencendo hoje</p>
                <p className="text-xs text-red-700 mt-1">Valor total: R$ 8.450,00</p>
              </div>
            </div>
            
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 flex gap-3 items-start">
              <span className="text-orange-600 mt-0.5">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-orange-900">Estoque Crítico</p>
                <p className="text-xs text-orange-700 mt-1">Chapa de Aço 5mm abaixo do mínimo de segurança.</p>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex gap-3 items-start">
              <span className="text-[#0F4C81] mt-0.5">ℹ️</span>
              <div>
                <p className="text-sm font-semibold text-blue-900">Meta de Vendas</p>
                <p className="text-xs text-blue-700 mt-1">Equipe atingiu 85% da meta do mês.</p>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-4 py-2 text-sm font-semibold text-slate-500 hover:text-[#0F4C81] transition-colors">
            Ver todos os alertas →
          </button>
        </div>
        
        <div className="bg-[#0F4C81] p-6 rounded-xl shadow-md text-white">
          <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg text-sm font-medium transition-colors text-left flex flex-col gap-2">
              <Icons.Financeiro /> Nova Receita
            </button>
            <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg text-sm font-medium transition-colors text-left flex flex-col gap-2">
              <Icons.Producao /> Nova Ordem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
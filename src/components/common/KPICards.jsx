import React from 'react';

const kpiData = [
  { title: 'Faturamento', value: 'R$ 145.200,00', status: '+12.5%', isPositive: true, color: 'text-[#1B9C85]' },
  { title: 'Lucro Líquido', value: 'R$ 42.800,00', status: '+5.2%', isPositive: true, color: 'text-[#1B9C85]' },
  { title: 'Contas a Pagar', value: 'R$ 15.430,00', status: 'Atenção', isPositive: false, color: 'text-[#E74C3C]' },
  { title: 'Ordens Produção', value: '24 Ativas', status: 'Dentro da meta', isPositive: true, color: 'text-[#0F4C81]' },
];

export default function KPICards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {kpiData.map((kpi, index) => (
        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wide">{kpi.title}</h3>
          <div className="text-2xl font-bold text-slate-800 mb-2">{kpi.value}</div>
          <div className={`text-sm font-semibold flex items-center gap-1 ${kpi.color}`}>
            {kpi.isPositive ? '↑' : '↓'} {kpi.status}
          </div>
        </div>
      ))}
    </div>
  );
}

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function PainelRelatorios() {
  // Dados fictícios estruturados para o gráfico
  const data = [
    { name: 'Jan', receita: 4000, despesa: 2400 },
    { name: 'Fev', receita: 3000, despesa: 1398 },
    { name: 'Mar', receita: 5000, despesa: 3800 },
    { name: 'Abr', receita: 2780, despesa: 3908 },
    { name: 'Mai', receita: 6890, despesa: 4800 },
    { name: 'Jun', receita: 8390, despesa: 3800 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h4 className="text-xs font-semibold text-slate-500 uppercase">Faturamento (Acumulado)</h4>
          <p className="text-2xl font-bold text-[#0F4C81] mt-2">R$ 29.860,00</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h4 className="text-xs font-semibold text-slate-500 uppercase">Custos Operacionais</h4>
          <p className="text-2xl font-bold text-[#E74C3C] mt-2">R$ 20.106,00</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h4 className="text-xs font-semibold text-slate-500 uppercase">Lucro Líquido Real</h4>
          <p className="text-2xl font-bold text-[#1B9C85] mt-2">R$ 9.754,00</p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Comparativo Receita vs. Despesas</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="receita" fill="#1B9C85" name="Receitas (R$)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="despesa" fill="#E74C3C" name="Despesas (R$)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
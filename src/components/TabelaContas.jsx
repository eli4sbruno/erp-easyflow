import React from 'react';

export default function TabelaContas() {
  // Dados fictícios
  const contas = [
    { id: 1, tipo: 'Pagar', entidade: 'Fornecedor Gráfica Lda', valor: 2500, vencimento: '15/07/2026', status: 'Atrasado' },
    { id: 2, tipo: 'Receber', entidade: 'Diego Fernandes', valor: 120, vencimento: '18/07/2026', status: 'Pendente' },
    { id: 3, tipo: 'Pagar', entidade: 'Energia Elétrica', valor: 450, vencimento: '20/07/2026', status: 'Pendente' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
      <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Contas a Pagar e Receber</h3>
        <button className="text-xs bg-[#0F4C81] text-white px-3 py-1.5 rounded hover:bg-[#0c3e6a]">Gerar Boleto</button>
      </div>
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
          <tr>
            <th className="px-6 py-4">Tipo</th>
            <th className="px-6 py-4">Entidade</th>
            <th className="px-6 py-4">Vencimento</th>
            <th className="px-6 py-4 text-right">Valor</th>
            <th className="px-6 py-4 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {contas.map(c => (
            <tr key={c.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-bold">{c.tipo}</td>
              <td className="px-6 py-4 font-medium">{c.entidade}</td>
              <td className="px-6 py-4">{c.vencimento}</td>
              <td className="px-6 py-4 text-right font-semibold">{c.valor.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</td>
              <td className="px-6 py-4 text-center">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${c.status === 'Atrasado' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                  {c.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
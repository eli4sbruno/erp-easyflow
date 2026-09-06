import React, { useState } from 'react';
import { supabase } from "@/supabaseClient";

export default function TabelaContas({ transacoes, onUpdate }) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Filtra apenas as contas que estão pendentes e ordena por vencimento
  const contasPendentes = transacoes
    .filter(t => t.status === 'Pendente')
    .sort((a, b) => new Date(a.data_vencimento || 0) - new Date(b.data_vencimento || 0));

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return 'Sem Prazo';
    const data = new Date(dataStr);
    data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
    return data.toLocaleDateString('pt-BR');
  };

  const verificarAtraso = (dataStr) => {
    if (!dataStr) return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataVenc = new Date(dataStr);
    dataVenc.setMinutes(dataVenc.getMinutes() + dataVenc.getTimezoneOffset());
    return dataVenc < hoje;
  };

  const marcarComoPago = async (id, tipo) => {
    const confirmacao = window.confirm(`Deseja confirmar a baixa desta conta a ${tipo}?`);
    if (!confirmacao) return;

    setIsProcessing(true);
    const { error } = await supabase
      .from('transacoes')
      .update({ status: 'Pago' })
      .eq('id', id);

    if (error) {
      alert(`Erro ao atualizar o banco de dados: ${error.message}`);
    } else {
      if (onUpdate) onUpdate(); // Atualiza a tela inteira do Financeiro
    }
    setIsProcessing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
      <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Contas a Pagar e Receber (Pendentes)</h3>
        <button className="text-xs bg-[#0F4C81] hover:bg-[#0c3e6a] text-white px-3 py-2 rounded-lg font-semibold transition-colors">
          Exportar Relatório
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Origem / Destino</th>
              <th className="px-6 py-4">Vencimento</th>
              <th className="px-6 py-4 text-right">Valor (R$)</th>
              <th className="px-6 py-4 text-center">Situação</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contasPendentes.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                  Nenhuma conta pendente no momento. Tudo em dia! 🎉
                </td>
              </tr>
            ) : (
              contasPendentes.map(conta => {
                const estaAtrasado = verificarAtraso(conta.data_vencimento);
                const isReceber = conta.tipo === 'receita';

                return (
                  <tr key={conta.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold ${isReceber ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {isReceber ? 'A Receber' : 'A Pagar'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{conta.cliente || 'Sem Nome'}</div>
                      <div className="text-xs text-slate-400">{conta.descricao || conta.categoria}</div>
                    </td>
                    
                    <td className={`px-6 py-4 font-medium ${estaAtrasado ? 'text-red-500' : 'text-slate-600'}`}>
                      {formatarData(conta.data_vencimento)}
                    </td>
                    
                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                      {formatarMoeda(conta.valor)}
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${estaAtrasado ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                        {estaAtrasado ? 'Atrasado' : 'A Vencer'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <button 
                        disabled={isProcessing}
                        onClick={() => marcarComoPago(conta.id, isReceber ? 'receber' : 'pagar')}
                        className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 ${isReceber ? 'bg-[#1B9C85] hover:bg-[#15806c] text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                      >
                        {isReceber ? 'Receber Dinheiro' : 'Confirmar Pagamento'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
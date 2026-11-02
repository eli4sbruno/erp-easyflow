import React, { useState, useEffect } from 'react';
import { supabase } from "@/supabaseClient";
import ModalPagamento from "@/modules/financeiro/components/ModalPagamento";

// --- Ícones ---
const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>;
const SearchIcon = () => <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;

const formatMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

export default function Financeiro() {
  const [transacoes, setTransacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTransacoes();
  }, []);

  const fetchTransacoes = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('transacoes')
      .select('*')
      .order('data_vencimento', { ascending: false });

    if (error) {
      console.error('Erro ao buscar transações:', error);
    } else {
      setTransacoes(data || []);
    }
    setIsLoading(false);
  };

  const apagarTransacao = async (id) => {
    if (!window.confirm("Deseja realmente excluir este lançamento financeiro?")) return;
    
    setTransacoes(transacoes.filter(t => t.id !== id));
    const { error } = await supabase.from('transacoes').delete().eq('id', id);
    if (error) {
      alert(`Erro ao excluir: ${error.message}`);
      fetchTransacoes();
    }
  };

  const totalReceitas = transacoes
    .filter(t => t.tipo === 'receita' && t.status === 'Pago')
    .reduce((acc, curr) => acc + Number(curr.valor || 0), 0);

  const totalDespesas = transacoes
    .filter(t => t.tipo === 'despesa' && t.status === 'Pago')
    .reduce((acc, curr) => acc + Number(curr.valor || 0), 0);

  const saldoCaixa = totalReceitas - totalDespesas;

  const transacoesFiltradas = transacoes.filter(t => {
    const termo = searchTerm.toLowerCase();
    const cliente = (t.cliente || '').toLowerCase();
    const descricao = (t.descricao || '').toLowerCase();
    const categoria = (t.categoria || '').toLowerCase();
    return cliente.includes(termo) || descricao.includes(termo) || categoria.includes(termo);
  });

  return (
    <div className="space-y-6 animate-fade-in relative z-0 pb-32">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F4C81]">Gestão Financeira</h2>
          <p className="text-sm text-slate-500">Controlo de receitas, despesas e fluxo de caixa.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-[#1B9C85] hover:bg-[#15806c] text-white rounded-xl font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-2"
        >
          <PlusIcon /> Novo Lançamento
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-[#1B9C85]">
          <h3 className="text-xs font-semibold text-slate-500 uppercase mb-1">Total Entradas (Pagas)</h3>
          <div className="text-2xl font-bold text-[#1B9C85]">{formatMoeda(totalReceitas)}</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-[#E74C3C]">
          <h3 className="text-xs font-semibold text-slate-500 uppercase mb-1">Total Saídas (Pagas)</h3>
          <div className="text-2xl font-bold text-[#E74C3C]">{formatMoeda(totalDespesas)}</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-[#0F4C81]">
          <h3 className="text-xs font-semibold text-slate-500 uppercase mb-1">Saldo em Caixa</h3>
          <div className={`text-2xl font-bold ${saldoCaixa >= 0 ? 'text-[#0F4C81]' : 'text-[#E74C3C]'}`}>
            {formatMoeda(saldoCaixa)}
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <SearchIcon />
          </div>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, descrição ou categoria..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:border-[#1B9C85] text-sm" 
          />
        </div>
      </div>

      {/* Tabela de Transações */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Cliente / Fornecedor</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan="8" className="px-6 py-8 text-center text-slate-400">A carregar transações...</td></tr>
              ) : transacoesFiltradas.length === 0 ? (
                <tr><td colSpan="8" className="px-6 py-8 text-center text-slate-400">Nenhum registo financeiro encontrado.</td></tr>
              ) : (
                transacoesFiltradas.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-xs">
                      {t.data_vencimento ? new Date(t.data_vencimento).toLocaleDateString('pt-BR') : '---'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${t.tipo === 'receita' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {t.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{t.cliente || '---'}</td>
                    <td className="px-6 py-4 text-slate-500">{t.descricao || '---'}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">{t.categoria || '---'}</td>
                    <td className={`px-6 py-4 font-bold ${t.tipo === 'receita' ? 'text-[#1B9C85]' : 'text-[#E74C3C]'}`}>
                      {t.tipo === 'despesa' ? `- ${formatMoeda(t.valor)}` : formatMoeda(t.valor)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${t.status === 'Pago' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                        {t.status || 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => apagarTransacao(t.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Excluir">
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Pagamento / Lançamento */}
      {isModalOpen && (
        <ModalPagamento 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchTransacoes();
          }} 
        />
      )}
    </div>
  );
}
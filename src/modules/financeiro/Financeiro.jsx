import React, { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";
import ModalPagamento from "@/modules/financeiro/components/ModalPagamento";
import ModalConfirmarExclusao from "@/components/modals/ModalConfirmarExclusao";
import TabelaContas from "@/modules/financeiro/TabelaContas";

// Ícones Auxiliares
const ConciliacaoIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>;
const CloseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const CheckIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>;
const TrashIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const FilterIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>;
const UndoIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>;
const EditIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>;

export default function Financeiro() {
  const [activeView, setActiveView] = useState('lancamentos'); 
  
  const [isPagamentoOpen, setIsPagamentoOpen] = useState(false);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transacaoParaExcluir, setTransacaoParaExcluir] = useState(null);

  const [showEstornoModal, setShowEstornoModal] = useState(false);
  const [transacaoParaEstornar, setTransacaoParaEstornar] = useState(null);
  
  const [isEditOrcamentoOpen, setIsEditOrcamentoOpen] = useState(false);
  const [orcamentoEditando, setOrcamentoEditando] = useState(null);
  const [novoLimiteOrcamento, setNovoLimiteOrcamento] = useState('');

  const [transacoes, setTransacoes] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filtroPeriodo, setFiltroPeriodo] = useState('mes_atual');

  useEffect(() => {
    fetchTransacoes();
    fetchOrcamentos();
  }, []);

  const fetchTransacoes = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('transacoes').select('*').order('data_vencimento', { ascending: false });
    if (!error) setTransacoes(data || []);
    setIsLoading(false);
  };

  const fetchOrcamentos = async () => {
    const { data, error } = await supabase.from('orcamentos').select('*').order('centro', { ascending: true });
    if (!error) setOrcamentos(data || []);
  };

  const handleExcluir = (id) => {
    setTransacaoParaExcluir(id);
    setShowDeleteModal(true);
  };

  const confirmarExclusao = async () => {
    if (transacaoParaExcluir) {
      const { error } = await supabase.from('transacoes').delete().eq('id', transacaoParaExcluir);
      if (!error) setTransacoes(transacoes.filter(trx => trx.id !== transacaoParaExcluir));
    }
    setShowDeleteModal(false);
    setTransacaoParaExcluir(null);
  };

  const handleEstornar = (trx) => {
    setTransacaoParaEstornar(trx);
    setShowEstornoModal(true);
  };

  const confirmarEstorno = async () => {
    if (transacaoParaEstornar) {
      const { error } = await supabase.from('transacoes').update({ status: 'Cancelado' }).eq('id', transacaoParaEstornar.id);
      
      if (!error) {
        setTransacoes(transacoes.map(trx => trx.id === transacaoParaEstornar.id ? { ...trx, status: 'Cancelado' } : trx));
      } else {
        alert("Erro ao estornar a transação.");
      }
    }
    setShowEstornoModal(false);
    setTransacaoParaEstornar(null);
  };

  const marcarComoPago = async (id) => {
    setTransacoes(transacoes.map(trx => trx.id === id ? { ...trx, status: 'Pago' } : trx));
    const { error } = await supabase.from('transacoes').update({ status: 'Pago' }).eq('id', id);
    if (error) {
      alert("Erro ao atualizar o status.");
      fetchTransacoes();
    }
  };

  const abrirEdicaoOrcamento = (orc) => {
    setOrcamentoEditando(orc);
    setNovoLimiteOrcamento(orc.limite.toString());
    setIsEditOrcamentoOpen(true);
  };

  const salvarNovoOrcamento = async () => {
    // Corrigido para aceitar limites altos como "5.000,00"
    const valorTratado = Number(novoLimiteOrcamento.toString().replace(/\./g, '').replace(',', '.'));
    if (isNaN(valorTratado)) return alert("Valor inválido.");

    const { error } = await supabase.from('orcamentos').update({ limite: valorTratado }).eq('id', orcamentoEditando.id);
    
    if (error) {
      alert(`Erro: ${error.message}`);
    } else {
      fetchOrcamentos();
      setIsEditOrcamentoOpen(false);
    }
  };

  const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);

  const formatarData = (dataStr) => {
    if (!dataStr) return 'A definir';
    const data = new Date(dataStr);
    data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
    return data.toLocaleDateString('pt-BR');
  };

  const transacoesFiltradas = transacoes.filter(trx => {
    if (filtroPeriodo === 'todos') return true;
    
    const dataTrx = new Date(trx.data_vencimento || trx.vencimento || trx.created_at);
    const hoje = new Date();
    
    if (filtroPeriodo === 'mes_atual') {
      return dataTrx.getMonth() === hoje.getMonth() && dataTrx.getFullYear() === hoje.getFullYear();
    }
    
    if (filtroPeriodo === 'mes_passado') {
      const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      return dataTrx.getMonth() === mesPassado.getMonth() && dataTrx.getFullYear() === mesPassado.getFullYear();
    }
    
    if (filtroPeriodo === '7_dias') {
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(hoje.getDate() - 7);
      return dataTrx >= seteDiasAtras && dataTrx <= hoje;
    }
    
    return true;
  });

  const totalSaldo = transacoesFiltradas.filter(t => t.status === 'Pago' && t.tipo === 'receita').reduce((acc, curr) => acc + Number(curr.valor), 0) - 
                     transacoesFiltradas.filter(t => t.status === 'Pago' && t.tipo === 'despesa').reduce((acc, curr) => acc + Number(curr.valor), 0);
  const totalReceber = transacoesFiltradas.filter(t => t.status === 'Pendente' && t.tipo === 'receita').reduce((acc, curr) => acc + Number(curr.valor), 0);
  const totalPagar = transacoesFiltradas.filter(t => t.status === 'Pendente' && t.tipo === 'despesa').reduce((acc, curr) => acc + Number(curr.valor), 0);

  const menuAbas = [
    { id: 'lancamentos', label: 'Lançamentos Diários' },
    { id: 'contas', label: 'A Pagar / A Receber' },
    { id: 'orcamentos', label: 'Controle Orçamentário' },
    { id: 'relatorios', label: 'Fluxo e Relatórios' },
    { id: 'conciliacao', label: 'Conciliação Bancária' },
    { id: 'fiscal', label: 'NFe e Boletos' }
  ];

  return (
    <div className="space-y-6 animate-fade-in z-0 relative pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F4C81]">Gestão Financeira</h2>
          <p className="text-slate-500 text-sm">Controle de fluxo de caixa, planos de contas e saúde financeira.</p>
        </div>
        <div className="flex w-full sm:w-auto">
          <button 
            onClick={() => setIsPagamentoOpen(true)}
            className="w-12 h-12 rounded-full bg-[#0F4C81] hover:bg-[#0a3863] text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 group"
            title="Novo Lançamento"
          >
            <svg className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-[#0F4C81]">
          <h3 className="text-sm font-medium text-slate-500 uppercase">Saldo (Período Selecionado)</h3>
          <p className={`text-3xl font-bold mt-2 ${totalSaldo >= 0 ? 'text-slate-800' : 'text-[#E74C3C]'}`}>
            {formatarMoeda(totalSaldo)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-[#1B9C85]">
          <h3 className="text-sm font-medium text-slate-500 uppercase">A Receber</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">{formatarMoeda(totalReceber)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-[#E74C3C]">
          <h3 className="text-sm font-medium text-slate-500 uppercase">A Pagar</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">{formatarMoeda(totalPagar)}</p>
        </div>
      </div>

      <div className="flex border-b border-slate-200 overflow-x-auto custom-scrollbar">
        {menuAbas.map((aba) => (
          <button 
            key={aba.id}
            onClick={() => setActiveView(aba.id)}
            className={`pb-3 px-4 md:px-6 font-semibold text-sm transition-colors whitespace-nowrap ${
              activeView === aba.id ? 'border-b-2 border-[#0F4C81] text-[#0F4C81]' : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {aba.label}
          </button>
        ))}
      </div>

      {activeView === 'lancamentos' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
          
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-semibold text-slate-800">Histórico de Movimentações</h3>
            
            <div className="relative flex items-center">
              <div className="absolute left-3 text-slate-400 pointer-events-none">
                <FilterIcon />
              </div>
              <select 
                value={filtroPeriodo}
                onChange={(e) => setFiltroPeriodo(e.target.value)}
                className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-[#0F4C81] cursor-pointer"
              >
                <option value="mes_atual">Mês Atual</option>
                <option value="mes_passado">Mês Passado</option>
                <option value="7_dias">Últimos 7 Dias</option>
                <option value="todos">Todo o Histórico</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Entidade</th>
                  <th className="px-6 py-4">Categoria / C. Custo</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">A carregar dados...</td></tr>
                ) : transacoesFiltradas.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">Nenhuma transação encontrada para este período.</td></tr>
                ) : (
                  transacoesFiltradas.map((trx) => {
                    const isCancelado = trx.status === 'Cancelado';
                    
                    return (
                      <tr key={trx.id} className={`transition-colors ${isCancelado ? 'opacity-60 bg-slate-50' : 'hover:bg-slate-50'}`}>
                        <td className="px-6 py-4 font-medium">{formatarData(trx.data_vencimento || trx.vencimento)}</td>
                        <td className="px-6 py-4">
                          <div className={`font-semibold text-slate-800 ${isCancelado && 'line-through decoration-slate-400'}`}>{trx.cliente}</div>
                          <div className="text-xs text-slate-400">{trx.descricao}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs block w-fit mb-1">{trx.categoria || 'Geral'}</span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                            {trx.centro_custo || 'Geral'}
                          </span>
                        </td>
                        <td className={`px-6 py-4 font-semibold ${isCancelado ? 'text-slate-400 line-through' : trx.tipo === 'receita' ? 'text-[#1B9C85]' : 'text-[#E74C3C]'}`}>
                          {trx.tipo === 'receita' ? '+' : '-'} {formatarMoeda(trx.valor)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            trx.status === 'Pago' ? 'bg-green-100 text-green-800' : 
                            trx.status === 'Cancelado' ? 'bg-slate-200 text-slate-500' : 
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {trx.status === 'Cancelado' ? 'Anulado' : trx.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            
                            {/* SE PENDENTE: Pode Pagar */}
                            {trx.status === 'Pendente' && (
                              <button 
                                onClick={() => marcarComoPago(trx.id)}
                                className="p-1.5 text-slate-400 hover:text-[#1B9C85] hover:bg-green-50 rounded-lg transition-colors"
                                title="Confirmar Recebimento/Pagamento"
                              >
                                <CheckIcon />
                              </button>
                            )}

                            {/* SE PAGO: Estorno é permitido */}
                            {trx.status === 'Pago' && (
                              <button 
                                onClick={() => handleEstornar(trx)}
                                className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Estornar / Cancelar Transação"
                              >
                                <UndoIcon />
                              </button>
                            )}

                            {/* SE CANCELADO: Ação bloqueada (apenas informativo) */}
                            {trx.status === 'Cancelado' && (
                              <span className="text-[10px] font-bold text-slate-300 uppercase cursor-not-allowed mr-2">
                                Bloqueado
                              </span>
                            )}

                            {/* MODO DEV/TESTE: Botão de excluir sempre visível */}
                            <button 
                              onClick={() => handleExcluir(trx.id)}
                              className="p-1.5 text-slate-400 hover:text-[#E74C3C] hover:bg-red-50 rounded-lg transition-colors"
                              title="Modo Teste: Excluir Lançamento Definitivamente"
                            >
                              <TrashIcon />
                            </button>

                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === 'contas' && <TabelaContas transacoes={transacoes} onUpdate={fetchTransacoes} />}

      {activeView === 'orcamentos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {orcamentos.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-400">Carregando limites orçamentários...</div>
          ) : (
            orcamentos.map((orc) => {
              const gastoAtual = transacoes
                .filter(t => t.tipo === 'despesa' && t.status === 'Pago' && t.centro_custo === orc.centro)
                .reduce((acc, curr) => acc + Number(curr.valor), 0);
              
              const limite = Number(orc.limite);
              const percentual = limite > 0 ? Math.min((gastoAtual / limite) * 100, 100) : 100;
              const isCritico = percentual >= 90;
              const isAtencao = percentual >= 75 && percentual < 90;
              
              let corBarra = 'bg-[#1B9C85]';
              if (isAtencao) corBarra = 'bg-orange-400';
              if (isCritico) corBarra = 'bg-[#E74C3C]';

              return (
                <div key={orc.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative group hover:shadow-md transition-shadow">
                  <button 
                    onClick={() => abrirEdicaoOrcamento(orc)}
                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-[#0F4C81] hover:bg-blue-50 rounded-lg transition-colors md:opacity-0 group-hover:opacity-100"
                    title="Editar Orçamento Mensal"
                  >
                    <EditIcon />
                  </button>

                  <div className="flex justify-between items-start mb-4 pr-10">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${corBarra}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                      </div>
                      <h3 className="font-bold text-slate-800">{orc.centro}</h3>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${isCritico ? 'bg-red-100 text-red-700' : isAtencao ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                      {percentual.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Utilizado:</span>
                      <span className="font-semibold text-slate-800">{formatarMoeda(gastoAtual)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Orçamento (Mês):</span>
                      <span className="font-semibold text-[#0F4C81]">{formatarMoeda(limite)}</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2.5 mt-4 overflow-hidden">
                    <div className={`h-2.5 rounded-full transition-all duration-1000 ${corBarra}`} style={{ width: `${percentual}%` }}></div>
                  </div>
                  
                  <p className="text-xs text-slate-400 mt-3 text-center">
                    Restam <span className="font-bold text-slate-600">{formatarMoeda(limite - gastoAtual)}</span> disponíveis
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeView === 'conciliacao' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in p-8 text-center">
          <div className="w-16 h-16 bg-blue-50 text-[#0F4C81] rounded-full flex items-center justify-center mx-auto mb-4">
            <ConciliacaoIcon />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Conciliação Automática</h3>
          <p className="text-slate-500 text-sm max-w-lg mx-auto mb-6">
            Importação de ficheiros OFX/CSV do seu banco para cruzar automaticamente os extratos reais com os lançamentos efetuados no sistema.
          </p>
          <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Configurar Integração Bancária (Em Breve)</button>
        </div>
      )}

      <ModalPagamento 
        isOpen={isPagamentoOpen} 
        onClose={() => setIsPagamentoOpen(false)} 
        onSuccess={fetchTransacoes} 
      />

      <ModalConfirmarExclusao 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onConfirm={confirmarExclusao} 
        titulo="Excluir Transação?" 
        mensagem="Tem certeza que deseja excluir esta transação? Em ambiente de produção o recomendado é utilizar a opção de estorno." 
      />

      <ModalConfirmarExclusao 
        isOpen={showEstornoModal} 
        onClose={() => setShowEstornoModal(false)} 
        onConfirm={confirmarEstorno} 
        titulo="Estornar Transação?" 
        mensagem="Ao confirmar, esta transação será anulada e o valor será removido do saldo do seu caixa. Deseja prosseguir com o estorno?" 
      />

      {isEditOrcamentoOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#0F4C81]">Ajustar Orçamento</h3>
                <button onClick={() => setIsEditOrcamentoOpen(false)} className="text-slate-400 hover:text-slate-600"><CloseIcon /></button>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-500 mb-4">
                  Defina o novo limite mensal para o centro de custo <strong className="text-slate-800">{orcamentoEditando?.centro}</strong>.
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Novo Limite (R$)</label>
                  <input
                    type="number"
                    value={novoLimiteOrcamento}
                    onChange={(e) => setNovoLimiteOrcamento(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1B9C85] text-slate-800 font-bold text-lg"
                    placeholder="Ex: 5000"
                    onKeyDown={(e) => e.key === 'Enter' && salvarNovoOrcamento()}
                  />
                </div>
                <div className="mt-6 flex gap-3">
                  <button onClick={() => setIsEditOrcamentoOpen(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
                    Cancelar
                  </button>
                  <button onClick={salvarNovoOrcamento} className="flex-1 py-2.5 bg-[#1B9C85] text-white rounded-xl font-bold shadow-md hover:bg-[#15806c] active:scale-95 transition-transform">
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
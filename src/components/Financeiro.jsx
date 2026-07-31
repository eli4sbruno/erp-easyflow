import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import ModalPagamento from './ModalPagamento';
import ModalNovaDespesa from './ModalNovaDespesa';
import ModalConfirmarExclusao from './ModalConfirmarExclusao'; 
import PainelRelatorios from './PainelRelatorios'; // <-- Novo Import
import TabelaContas from './TabelaContas'; // <-- Novo Import
import PainelFiscal from './PainelFiscal';


// Ícones Auxiliares para os novos painéis
const RelatorioIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>;
const ConciliacaoIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>;
const NFeIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;

export default function Financeiro() {
  // Novo estado de abas expandido
  const [activeView, setActiveView] = useState('lancamentos'); 
  
  const [isReceitaOpen, setIsReceitaOpen] = useState(false);
  const [isDespesaOpen, setIsDespesaOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transacaoParaExcluir, setTransacaoParaExcluir] = useState(null);
  
  const [transacoes, setTransacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const orcamentos = [
    { centro: 'Administrativo', limite: 15000 },
    { centro: 'Produção', limite: 45000 },
    { centro: 'Vendas', limite: 8000 },
    { centro: 'Marketing', limite: 12000 },
    { centro: 'Logística', limite: 10000 }
  ];

  useEffect(() => {
    fetchTransacoes();
  }, []);

  const fetchTransacoes = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('transacoes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar transações:', error);
    } else {
      setTransacoes(data || []);
    }
    setIsLoading(false);
  };

  const handleExcluir = (id) => {
    setTransacaoParaExcluir(id);
    setShowDeleteModal(true);
  };

  const confirmarExclusao = async () => {
    if (transacaoParaExcluir) {
      const { error } = await supabase
        .from('transacoes')
        .delete()
        .eq('id', transacaoParaExcluir);

      if (error) {
        console.error('Erro ao deletar:', error);
      } else {
        setTransacoes(transacoes.filter(trx => trx.id !== transacaoParaExcluir));
      }
    }
    setShowDeleteModal(false);
    setTransacaoParaExcluir(null);
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return 'A definir';
    const data = new Date(dataStr);
    data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
    return data.toLocaleDateString('pt-BR');
  };

  const totalSaldo = transacoes.filter(t => t.status === 'Pago' && t.tipo === 'receita').reduce((acc, curr) => acc + Number(curr.valor), 0) - 
                     transacoes.filter(t => t.status === 'Pago' && t.tipo === 'despesa').reduce((acc, curr) => acc + Number(curr.valor), 0);
  const totalReceber = transacoes.filter(t => t.status === 'Pendente' && t.tipo === 'receita').reduce((acc, curr) => acc + Number(curr.valor), 0);
  const totalPagar = transacoes.filter(t => t.status === 'Pendente' && t.tipo === 'despesa').reduce((acc, curr) => acc + Number(curr.valor), 0);

  // Array de Abas para facilitar a renderização
  const menuAbas = [
    { id: 'lancamentos', label: 'Lançamentos Diários' },
    { id: 'contas', label: 'A Pagar / A Receber' },
    { id: 'orcamentos', label: 'Controle Orçamentário' },
    { id: 'relatorios', label: 'Fluxo e Relatórios' },
    { id: 'conciliacao', label: 'Conciliação Bancária' },
    { id: 'fiscal', label: 'NFe e Boletos' }
  ];

  return (
    <div className="space-y-6 animate-fade-in z-0 relative">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F4C81]">Gestão Financeira</h2>
          <p className="text-slate-500 text-sm">Controle de fluxo de caixa, planos de contas e saúde financeira.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setIsDespesaOpen(true)}
            className="flex-1 sm:flex-none bg-white border border-[#E74C3C] text-[#E74C3C] hover:bg-red-50 px-4 py-2.5 rounded-lg font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <span>-</span> Nova Despesa
          </button>
          <button 
            onClick={() => setIsReceitaOpen(true)}
            className="flex-1 sm:flex-none bg-[#1B9C85] hover:bg-[#15826e] text-white px-4 py-2.5 rounded-lg font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <span>+</span> Nova Receita
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-[#0F4C81]">
          <h3 className="text-sm font-medium text-slate-500 uppercase">Saldo em Caixa Real</h3>
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

      {/* Menu de Abas (Scrollable em mobile) */}
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

      {/* ==========================================
          VIEWS (CONTEÚDO DAS ABAS)
          ========================================== */}

      {/* ABA 1: LANÇAMENTOS DIÁRIOS */}
      {activeView === 'lancamentos' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800">Histórico de Movimentações</h3>
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
                ) : transacoes.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">Nenhuma transação encontrada.</td></tr>
                ) : (
                  transacoes.map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium">{formatarData(trx.vencimento)}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{trx.cliente}</div>
                        <div className="text-xs text-slate-400">{trx.descricao}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs block w-fit mb-1">{trx.categoria || 'Geral'}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                          {trx.centro_custo || 'Geral'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 font-semibold ${trx.tipo === 'receita' ? 'text-[#1B9C85]' : 'text-[#E74C3C]'}`}>
                        {trx.tipo === 'receita' ? '+' : '-'} {formatarMoeda(trx.valor)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${trx.status === 'Pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {trx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => handleExcluir(trx.id)}
                          className="p-1.5 text-slate-400 hover:text-[#E74C3C] hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir Transação"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: CONTAS A PAGAR / RECEBER */}
      {activeView === 'contas' && (
  <TabelaContas transacoes={transacoes} onUpdate={fetchTransacoes} />
)}

      {/* ABA 3: CONTROLE ORÇAMENTÁRIO */}
      {activeView === 'orcamentos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {orcamentos.map((orc, index) => {
            const gastoAtual = transacoes
              .filter(t => t.tipo === 'despesa' && t.status === 'Pago' && t.centro_custo === orc.centro)
              .reduce((acc, curr) => acc + Number(curr.valor), 0);
            
            const percentual = Math.min((gastoAtual / orc.limite) * 100, 100);
            const isCritico = percentual >= 90;
            const isAtencao = percentual >= 75 && percentual < 90;
            
            let corBarra = 'bg-[#1B9C85]';
            if (isAtencao) corBarra = 'bg-orange-400';
            if (isCritico) corBarra = 'bg-[#E74C3C]';

            return (
              <div key={index} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
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
                    <span className="font-semibold text-slate-800">{formatarMoeda(orc.limite)}</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2.5 mt-4 overflow-hidden">
                  <div className={`h-2.5 rounded-full transition-all duration-1000 ${corBarra}`} style={{ width: `${percentual}%` }}></div>
                </div>
                
                <p className="text-xs text-slate-400 mt-3 text-center">
                  Restam <span className="font-bold text-slate-600">{formatarMoeda(orc.limite - gastoAtual)}</span> disponíveis
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* ABA 4: RELATÓRIOS E FLUXO DE CAIXA */}
      {activeView === 'relatorios' && (
        <PainelRelatorios />
      )}

      {/* ABA 5: CONCILIAÇÃO BANCÁRIA */}
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

      {/* ABA 6: NOTAS E BOLETOS */}
      {activeView === 'fiscal' && <PainelFiscal />}

      {/* Modais Isolados */}
      <ModalPagamento 
        isOpen={isReceitaOpen} 
        onClose={() => setIsReceitaOpen(false)} 
        onSuccess={fetchTransacoes} 
      />

      <ModalNovaDespesa 
        isOpen={isDespesaOpen} 
        onClose={() => setIsDespesaOpen(false)} 
        onSuccess={fetchTransacoes} 
      />

      <ModalConfirmarExclusao 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onConfirm={confirmarExclusao} 
        titulo="Excluir Transação?" 
        mensagem="Tem certeza que deseja excluir esta transação? A ação não pode ser desfeita." 
      />

    </div>
  );
}
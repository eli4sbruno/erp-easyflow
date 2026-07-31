import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import ModalNovaOS from './ModalNovaOS';
import ModalConfirmarExclusao from './ModalConfirmarExclusao'; 
import ModalPagamento from './ModalPagamento'; // <-- Importando o Checkout!

export default function Producao() {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ordemParaExcluir, setOrdemParaExcluir] = useState(null);
  
  // Estados para o Checkout de Faturamento
  const [showCheckout, setShowCheckout] = useState(false);
  const [dadosCheckout, setDadosCheckout] = useState(null);

  const [ordens, setOrdens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrdens();
  }, []);

  const fetchOrdens = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('producao') 
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar ordens:', error);
    } else {
      setOrdens(data || []);
    }
    setIsLoading(false);
  };

  const atualizarStatus = async (id, novoStatus) => {
    const { error } = await supabase
      .from('producao')
      .update({ status: novoStatus })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar o status.');
    } else {
      fetchOrdens();
    }
  };

  const handleExcluir = (id) => {
    setOrdemParaExcluir(id);
    setShowDeleteModal(true);
  };

  const confirmarExclusao = async () => {
    if (ordemParaExcluir) {
      const { error } = await supabase
        .from('producao')
        .delete()
        .eq('id', ordemParaExcluir);

      if (error) {
        console.error('Erro ao apagar:', error);
      } else {
        setOrdens(ordens.filter(o => o.id !== ordemParaExcluir));
      }
    }
    setShowDeleteModal(false);
    setOrdemParaExcluir(null);
  };

  // Esta função é chamada assim que a O.S termina de gravar no banco
  const handleOSSalva = (dadosFaturamento) => {
    fetchOrdens(); // Atualiza a tabela na tela
    
    // Se a O.S devolveu dados (Cliente, Valor > 0), abre o Checkout para cobrar
    if (dadosFaturamento && dadosFaturamento.valor > 0) {
      setDadosCheckout(dadosFaturamento);
      setShowCheckout(true);
    }
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return '---';
    const data = new Date(dataStr);
    data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
    return data.toLocaleDateString('pt-BR');
  };

  const getStatusStyle = (statusName) => {
    switch (statusName) {
      case 'Concluída': return 'bg-green-100 text-green-800';
      case 'Em Andamento': return 'bg-blue-100 text-blue-800';
      case 'Cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800'; // Pendente
    }
  };

  // Cálculos para Resumo
  const totalOrdens = ordens.length;
  const emAndamento = ordens.filter(o => o.status === 'Em Andamento').length;
  const concluidas = ordens.filter(o => o.status === 'Concluída').length;

  return (
    <div className="space-y-6 animate-fade-in z-0 relative">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F4C81]">Gestão de Ordens de Serviço (O.S)</h2>
          <p className="text-slate-500 text-sm">Controle de produções internas e para clientes.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#0F4C81] hover:bg-[#0c3e6a] text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-colors flex items-center gap-2"
        >
          <span>+</span> Nova O.S
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-[#0F4C81]">
          <h3 className="text-sm font-medium text-slate-500 uppercase">Total de O.S</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">{totalOrdens}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-blue-500">
          <h3 className="text-sm font-medium text-slate-500 uppercase">Em Andamento</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{emAndamento}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-green-500">
          <h3 className="text-sm font-medium text-slate-500 uppercase">Concluídas</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{concluidas}</p>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">O.S #</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Solicitante</th>
                <th className="px-6 py-4">Abertura</th>
                <th className="px-6 py-4">Responsável</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-400">A carregar dados...</td></tr>
              ) : ordens.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-400">Nenhuma Ordem de Serviço encontrada.</td></tr>
              ) : (
                ordens.map((ordem) => (
                  <tr key={ordem.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-xs font-mono text-slate-400 uppercase">{ordem.id.substring(0, 8)}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      <span className={`px-2 py-1 rounded text-xs ${ordem.tipo_op === 'Interna' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                        {ordem.tipo_op}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{ordem.solicitante_nome}</td>
                    <td className="px-6 py-4 text-slate-500">{formatarData(ordem.data_abertura)}</td>
                    <td className="px-6 py-4 text-slate-600">{ordem.responsavel}</td>
                    <td className="px-6 py-4 text-center">
                      <select 
                        value={ordem.status}
                        onChange={(e) => atualizarStatus(ordem.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold focus:outline-none cursor-pointer border border-transparent hover:border-slate-300 transition-colors ${getStatusStyle(ordem.status)}`}
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Em Andamento">Em Andamento</option>
                        <option value="Concluída">Concluída</option>
                        <option value="Cancelada">Cancelada</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center flex justify-center gap-2">
                      <button 
                        onClick={() => handleExcluir(ordem.id)}
                        className="p-1.5 text-slate-400 hover:text-[#E74C3C] hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir O.S"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalNovaOS 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onSuccess={handleOSSalva} 
      />

      <ModalConfirmarExclusao 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onConfirm={confirmarExclusao} 
        titulo="Apagar O.S?" 
        mensagem="Tem certeza que deseja apagar esta Ordem de Serviço? A ação não pode ser desfeita." 
      />

      {/* NOVO: Modal de Checkout, ativado logo a seguir a salvar uma OS de Cliente com valor > 0 */}
      <ModalPagamento 
        isOpen={showCheckout}
        dadosIniciais={dadosCheckout}
        onClose={() => setShowCheckout(false)}
        onSuccess={() => {
          alert('Faturamento registado com sucesso no Financeiro!');
          setShowCheckout(false);
        }}
      />

    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { supabase } from "@/supabaseClient";


export default function Compras() {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [compraParaExcluir, setCompraParaExcluir] = useState(null);
  
  // Estados para listar os dados
  const [compras, setCompras] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados do Formulário
  const [fornecedor, setFornecedor] = useState('');
  const [item, setItem] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [dataPedido, setDataPedido] = useState(new Date().toISOString().split('T')[0]);
  const [dataEntrega, setDataEntrega] = useState('');
  const [status, setStatus] = useState('Pendente');

  // Buscar dados ao carregar
  useEffect(() => {
    fetchCompras();
  }, []);

  const fetchCompras = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('compras')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar compras:', error);
    } else {
      setCompras(data || []);
    }
    setIsLoading(false);
  };

  const handleSalvarCompra = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("Sessão expirada. Faça login novamente.");
      return;
    }

    if (!fornecedor || !item || !quantidade || !valorTotal) {
      alert("Por favor, preencha os campos obrigatórios (Fornecedor, Item, Qtd e Valor).");
      return;
    }

    const novaCompra = {
      user_id: user.id,
      fornecedor,
      item,
      quantidade: Number(quantidade),
      valor_total: Number(valorTotal),
      data_pedido: dataPedido || null,
      data_entrega: dataEntrega || null,
      status
    };

    const { error } = await supabase.from('compras').insert([novaCompra]);

    if (error) {
      console.error('Erro ao guardar compra:', error);
      alert('Erro ao registar o pedido de compra.');
    } else {
      fecharModal();
      fetchCompras();
    }
  };

  const atualizarStatus = async (id, novoStatus) => {
    const { error } = await supabase
      .from('compras')
      .update({ status: novoStatus })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar o status.');
    } else {
      fetchCompras(); // Recarrega para mostrar a alteração
    }
  };

  const fecharModal = () => {
    setShowModal(false);
    setFornecedor('');
    setItem('');
    setQuantidade('');
    setValorTotal('');
    setDataPedido(new Date().toISOString().split('T')[0]);
    setDataEntrega('');
    setStatus('Pendente');
  };

  const handleExcluir = (id) => {
    setCompraParaExcluir(id);
    setShowDeleteModal(true);
  };

  const confirmarExclusao = async () => {
    if (compraParaExcluir) {
      const { error } = await supabase
        .from('compras')
        .delete()
        .eq('id', compraParaExcluir);

      if (error) {
        console.error('Erro ao apagar:', error);
      } else {
        setCompras(compras.filter(c => c.id !== compraParaExcluir));
      }
    }
    setShowDeleteModal(false);
    setCompraParaExcluir(null);
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return 'N/A';
    const data = new Date(dataStr);
    data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
    return data.toLocaleDateString('pt-BR');
  };

  const getStatusStyle = (statusName) => {
    switch (statusName) {
      case 'Recebido': return 'bg-green-100 text-green-800 border-green-200';
      case 'Aprovado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Em Trânsito': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Cancelado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-orange-100 text-orange-800 border-orange-200'; // Pendente
    }
  };

  // Cálculos para Resumo
  const totalPedidos = compras.length;
  const pendentesAprovacao = compras.filter(c => c.status === 'Pendente').length;
  const valorTotalCompras = compras
    .filter(c => c.status !== 'Cancelado')
    .reduce((acc, curr) => acc + Number(curr.valor_total), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabeçalho do Módulo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F4C81]">Gestão de Compras</h2>
          <p className="text-slate-500 text-sm">Controlo de pedidos a fornecedores e receção de materiais.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#0F4C81] hover:bg-[#0c3e6a] text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-colors flex items-center gap-2"
        >
          <span>+</span> Novo Pedido de Compra
        </button>
      </div>

      {/* Cards de Resumo Rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-[#0F4C81]">
          <h3 className="text-sm font-medium text-slate-500 uppercase">Total de Pedidos</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">{totalPedidos}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-orange-400">
          <h3 className="text-sm font-medium text-slate-500 uppercase">Aguardando Aprovação</h3>
          <p className="text-3xl font-bold text-orange-500 mt-2">{pendentesAprovacao}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-[#E74C3C]">
          <h3 className="text-sm font-medium text-slate-500 uppercase">Volume Financeiro</h3>
          <p className="text-3xl font-bold text-[#E74C3C] mt-2">{formatarMoeda(valorTotalCompras)}</p>
        </div>
      </div>

      {/* Tabela de Compras */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Histórico de Pedidos (OC)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">OC #</th>
                <th className="px-6 py-4">Fornecedor</th>
                <th className="px-6 py-4">Item / Qtd</th>
                <th className="px-6 py-4 text-right">Valor Total</th>
                <th className="px-6 py-4">Previsão Entrega</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-400">A carregar dados do Supabase...</td></tr>
              ) : compras.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-400">Nenhum pedido de compra registado.</td></tr>
              ) : (
                compras.map((compra) => (
                  <tr key={compra.id} className={`hover:bg-slate-50 ${compra.status === 'Cancelado' ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400 uppercase">
                      {compra.id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{compra.fornecedor}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{compra.item}</div>
                      <div className="text-xs text-slate-500">Qtd: {compra.quantidade}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-[#E74C3C]">
                      {formatarMoeda(compra.valor_total)}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{formatarData(compra.data_entrega)}</td>
                    <td className="px-6 py-4 text-center">
                      <select 
                        value={compra.status}
                        onChange={(e) => atualizarStatus(compra.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold focus:outline-none cursor-pointer border hover:shadow-sm transition-all ${getStatusStyle(compra.status)}`}
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Aprovado">Aprovado</option>
                        <option value="Em Trânsito">Em Trânsito</option>
                        <option value="Recebido">Recebido</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center flex justify-center gap-2">
                      <button 
                        onClick={() => handleExcluir(compra.id)}
                        className="p-1.5 text-slate-400 hover:text-[#E74C3C] hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir Pedido"
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

      {/* Modal Nova Compra */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-[#0F4C81]">Nova Ordem de Compra (OC)</h3>
              <button onClick={fecharModal} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fornecedor</label>
                <input 
                  type="text" 
                  value={fornecedor}
                  onChange={(e) => setFornecedor(e.target.value)}
                  placeholder="Ex: Indústria Siderúrgica XYZ" 
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81]" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Item / Matéria-Prima</label>
                <input 
                  type="text" 
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  placeholder="Ex: Chapa de Aço 5mm" 
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81]" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade</label>
                  <input 
                    type="number" 
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    placeholder="Ex: 50" 
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Total (R$)</label>
                  <input 
                    type="number" 
                    value={valorTotal}
                    onChange={(e) => setValorTotal(e.target.value)}
                    placeholder="0.00" 
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] font-semibold text-[#E74C3C]" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data do Pedido</label>
                  <input 
                    type="date" 
                    value={dataPedido}
                    onChange={(e) => setDataPedido(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] text-slate-700" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Previsão de Entrega</label>
                  <input 
                    type="date" 
                    value={dataEntrega}
                    onChange={(e) => setDataEntrega(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] text-slate-700" 
                  />
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button onClick={fecharModal} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
              <button 
                onClick={handleSalvarCompra}
                className="px-4 py-2 bg-[#0F4C81] text-white font-medium hover:bg-[#0c3e6a] rounded-lg shadow-sm transition-colors"
              >
                Gerar Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir Pedido?</h3>
              <p className="text-slate-500 text-sm">Tem certeza que deseja apagar este pedido de compra? A ação não pode ser desfeita.</p>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-center gap-3 bg-slate-50">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Cancelar</button>
              <button onClick={confirmarExclusao} className="px-4 py-2 bg-[#E74C3C] text-white font-medium hover:bg-red-700 rounded-lg shadow-sm">Sim, apagar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
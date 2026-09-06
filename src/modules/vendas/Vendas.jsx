"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";
import ModalPedidoVenda from "@/modules/vendas/components/ModalPedidoVenda";
import ModalPagamento from "@/modules/financeiro/components/ModalPagamento";

// Ícones
const SearchIcon = () => <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;
const FilterIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>;
const EditIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>;
const MenuIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>;
const PrintIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;

export default function Vendas() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  
  const [menuAbertoId, setMenuAbertoId] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const [pedidos, setPedidos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const statusList = ['Orçamento', 'Aguardando Aprovação', 'Em Produção', 'Pronto', 'Entregue', 'Cancelada'];

  useEffect(() => {
    fetchPedidos();
  }, []);

  useEffect(() => {
    const handleClickFora = () => setMenuAbertoId(null);
    window.addEventListener('click', handleClickFora);
    return () => window.removeEventListener('click', handleClickFora);
  }, []);

  const fetchPedidos = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('vendas')
      .select(`*, clientes:cliente_id(nome_razao, telefone)`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar pedidos:', error);
    } else {
      setPedidos(data || []);
    }
    setIsLoading(false);
  };

  const formatMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  const atualizarStatus = async (id, novoStatus) => {
    // Atualiza otimista (instantâneo na UI)
    setPedidos(pedidos.map(p => p.id === id ? { ...p, status: novoStatus } : p));
    
    // Atualiza no banco
    const { error } = await supabase.from('vendas').update({ status: novoStatus }).eq('id', id);
    if (error) {
      console.error("Erro ao atualizar status", error);
      fetchPedidos(); // reverte se falhar
    }
  };

  const apagarPedido = async (id) => {
    const confirmacao = window.confirm(
      "Deseja realmente CANCELAR esta venda?\n\nO status será alterado para 'Cancelada'. O histórico financeiro será mantido por questões de auditoria."
    );
    
    if (!confirmacao) return;

    // Atualiza otimista (instantâneo na UI)
    setPedidos(pedidos.map(p => p.id === id ? { ...p, status: 'Cancelada' } : p));

    // Atualiza no banco
    const { error } = await supabase.from('vendas').update({ status: 'Cancelada' }).eq('id', id);
    
    if (error) {
      alert(`Erro ao cancelar venda: ${error.message}`);
      fetchPedidos(); // reverte se falhar
    }
  };

  const abrirNovoPedido = () => {
    setPedidoSelecionado(null);
    setIsModalOpen(true);
  };

  const abrirEdicaoPedido = (pedido) => {
    setPedidoSelecionado(pedido);
    setIsModalOpen(true);
  };

  const handlePedidoSalvo = () => {
    fetchPedidos(); // Apenas recarrega a tabela, pois o ModalPedidoVenda já fez as cobranças.
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setMenuAbertoId(menuAbertoId === id ? null : id);
  };

  const pedidosFiltrados = pedidos.filter(p => {
    const termo = searchTerm.toLowerCase();
    const nomeCliente = (p.clientes?.nome_razao || p.cliente || '').toLowerCase();
    const descServico = (p.servico || p.descricao || '').toLowerCase();
    
    return p.id?.toString().includes(termo) || 
           nomeCliente.includes(termo) || 
           descServico.includes(termo);
  });

  return (
    <>
      <div className="space-y-6 animate-fade-in relative z-0 pb-32">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#0F4C81]">Gestão de Vendas</h2>
            <p className="text-sm text-slate-500">Acompanhamento de orçamentos, pedidos e clientes.</p>
          </div>
          
          <div className="flex w-full sm:w-auto">
            <button 
              onClick={abrirNovoPedido}
              className="w-12 h-12 rounded-full bg-[#0F4C81] hover:bg-[#0a3863] text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 group"
              title="Novo Pedido"
            >
              <svg className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Dashboard de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-amber-400">
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-1">Aguardando Aprovação</h3>
            <div className="text-2xl font-bold text-slate-800">
              {pedidos.filter(p => p.status === 'Aguardando Aprovação').length}
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-[#0F4C81]">
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-1">Orçamentos Abertos</h3>
            <div className="text-2xl font-bold text-slate-800">
              {formatMoeda(pedidos.filter(p => p.status === 'Orçamento').reduce((acc, curr) => acc + Number(curr.valor_total || curr.valor || 0), 0))}
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-[#1B9C85]">
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-1">Vendas Concluídas</h3>
            <div className="text-2xl font-bold text-slate-800">
              {formatMoeda(pedidos.filter(p => p.status === 'Pronto' || p.status === 'Entregue').reduce((acc, curr) => acc + Number(curr.valor_total || curr.valor || 0), 0))}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <SearchIcon />
            </div>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, pedido ou serviço..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:border-[#1B9C85] focus:ring-[#1B9C85] text-sm" 
            />
          </div>
          <button className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors">
            <FilterIcon /> Filtros
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-visible">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Ref</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Resumo dos Itens</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center w-24">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-400">A carregar dados...</td></tr>
                ) : pedidosFiltrados.length === 0 ? (
                  <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-400">Nenhum pedido encontrado.</td></tr>
                ) : (
                  pedidosFiltrados.map((pedido, i) => (
                    <tr key={pedido.id || i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-[#0F4C81]">
                        <button onClick={() => abrirEdicaoPedido(pedido)} className="hover:underline">
                          #{pedido.id || '---'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {pedido.data ? new Date(pedido.data).toLocaleDateString('pt-BR') : '---'}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {pedido.clientes?.nome_razao || pedido.cliente || 'Sem Nome'}
                      </td>
                      <td className="px-6 py-4 text-slate-500 truncate max-w-[180px]" title={pedido.servico}>
                        {pedido.servico || pedido.descricao || '---'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {formatMoeda(pedido.valor_total || pedido.valor)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative inline-block w-full max-w-[150px]">
                          <select
                            value={pedido.status || 'Orçamento'}
                            onChange={(e) => atualizarStatus(pedido.id, e.target.value)}
                            className={`appearance-none w-full pl-3 pr-8 py-1.5 rounded-md text-[10px] uppercase tracking-wider font-bold border focus:outline-none focus:ring-1 cursor-pointer transition-colors
                              ${pedido.status === 'Orçamento' ? 'bg-slate-100 text-slate-600 border-slate-200 focus:ring-slate-400' : 
                                pedido.status === 'Aguardando Aprovação' ? 'bg-amber-100 text-amber-700 border-amber-200 focus:ring-amber-500' : 
                                pedido.status === 'Em Produção' ? 'bg-blue-100 text-blue-700 border-blue-200 focus:ring-blue-500' : 
                                pedido.status === 'Pronto' ? 'bg-indigo-100 text-indigo-700 border-indigo-200 focus:ring-indigo-500' : 
                                pedido.status === 'Entregue' ? 'bg-green-100 text-green-700 border-green-200 focus:ring-green-500' : 
                                'bg-red-100 text-red-700 border-red-200 focus:ring-red-500'
                              }`}
                          >
                            {statusList.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-70">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center relative">
                        <button 
                          onClick={(e) => toggleMenu(e, pedido.id)}
                          className={`p-2 rounded-lg transition-colors ${menuAbertoId === pedido.id ? 'bg-slate-200 text-[#0F4C81]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                        >
                          <MenuIcon />
                        </button>

                        {menuAbertoId === pedido.id && (
                          <div className="absolute right-14 top-1/2 -translate-y-1/2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-fade-in origin-right">
                            
                            <button 
                              onClick={() => { abrirEdicaoPedido(pedido); setMenuAbertoId(null); }} 
                              className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0F4C81] flex items-center gap-3 transition-colors"
                            >
                              <EditIcon /> Visualizar / Editar
                            </button>

                            <button 
                              onClick={() => { alert('Em breve: Geração de PDF'); setMenuAbertoId(null); }} 
                              className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#1B9C85] flex items-center gap-3 transition-colors"
                            >
                              <PrintIcon /> Imprimir Orçamento
                            </button>

                            <div className="h-px bg-slate-100 my-1 mx-3"></div>

                            <button 
                              onClick={() => { apagarPedido(pedido.id); setMenuAbertoId(null); }} 
                              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium"
                            >
                              <TrashIcon /> Cancelar Venda
                            </button>
                            
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ModalPedidoVenda 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handlePedidoSalvo}
        pedidoSelecionado={pedidoSelecionado} 
      />

    </>
  );
}
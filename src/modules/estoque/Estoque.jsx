"use client";
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/supabaseClient";
import ModalNovoItemEstoque from "./components/ModalNovoItemEstoque"; 
import ModalMovimentacaoEstoque from "./components/ModalMovimentacaoEstoque"; 
import ModalHistoricoProduto from "./components/ModalHistoricoProduto"; 

// Ícones para o nosso novo Menu Dropdown
const MenuIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>;
const EditIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>;
const HistoryIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>;
const MoveIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;

export default function Estoque() {
  const [isNovoItemOpen, setIsNovoItemOpen] = useState(false);
  const [isMovimentacaoOpen, setIsMovimentacaoOpen] = useState(false);
  const [isHistoricoOpen, setIsHistoricoOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  
  // Controle do Menu Dropdown
  const [menuAbertoId, setMenuAbertoId] = useState(null);
  
  const [itens, setItens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProdutos = async () => {
    setIsLoading(true);
    // SOFT DELETE: Busca apenas itens ativos
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (!error) setItens(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  // Fechar o menu ao clicar fora dele
  useEffect(() => {
    const handleClickFora = () => setMenuAbertoId(null);
    window.addEventListener('click', handleClickFora);
    return () => window.removeEventListener('click', handleClickFora);
  }, []);

  const abrirMovimentacao = (produto) => {
    setProdutoSelecionado(produto);
    setIsMovimentacaoOpen(true);
  };

  const abrirEdicao = (produto) => {
    setProdutoSelecionado(produto);
    setIsNovoItemOpen(true); 
  };

  const abrirCriacao = () => {
    setProdutoSelecionado(null);
    setIsNovoItemOpen(true);
  };

  const abrirHistorico = (produto) => {
    setProdutoSelecionado(produto);
    setIsHistoricoOpen(true);
  };

  const inativarProduto = async (produto) => {
    const confirmacao = window.confirm(`Tem certeza que deseja inativar o item "${produto.nome}" do sistema?\nO estoque será zerado e ele não aparecerá mais em novas vendas.`);
    if (!confirmacao) return;

    // 1. Inativa o produto e ZERA a quantidade atual
    const { error } = await supabase.from('produtos').update({ 
      ativo: false, 
      quantidade_atual: 0 
    }).eq('id', produto.id);

    if (error) {
      alert("Erro ao inativar o item.");
    } else {
      // 2. Se tinha saldo, registra a perda/ajuste no histórico para auditoria
      if (produto.quantidade_atual > 0) {
        await supabase.from('movimentacoes_estoque').insert([{
          produto_id: produto.id,
          tipo_movimentacao: 'AJUSTE_SAIDA',
          quantidade: produto.quantidade_atual,
          observacao: 'Baixa de estoque (Item Inativado)'
        }]);
      }
      fetchProdutos();
    }
    setMenuAbertoId(null);
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation(); // Impede que o clique feche o menu imediatamente
    setMenuAbertoId(menuAbertoId === id ? null : id);
  };

  return (
    <div className="p-6 pb-32">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#0F4C81]">Controle de Estoque</h2>
          <p className="text-slate-500">Gerencie seus materiais e produtos</p>
        </div>
        
        <button 
          onClick={abrirCriacao}
          className="w-12 h-12 rounded-full bg-[#0F4C81] hover:bg-[#0a3863] text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 group shrink-0"
          title="Novo Item"
        >
          <svg className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
          </svg>
        </button>
      </div>

      {/* Dashboard de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0F4C81] flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total de Itens</p>
            <h3 className="text-2xl font-bold text-slate-800">{itens.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Estoque Baixo</p>
            <h3 className="text-2xl font-bold text-red-600">
              {itens.filter(item => item.categoria !== 'Serviço' && item.quantidade_atual <= item.estoque_minimo).length}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Custo Total em Estoque</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                itens.reduce((total, item) => total + (item.quantidade_atual * (item.custo_medio || 0)), 0)
              )}
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Produto</th>
              <th className="p-4 font-semibold text-slate-600">Categoria</th>
              <th className="p-4 font-semibold text-slate-600 text-right">Saldo Atual</th>
              <th className="p-4 font-semibold text-slate-600 text-center w-24">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
               <tr>
                <td colSpan="4" className="p-8 text-center text-slate-500">Carregando estoque...</td>
              </tr>
            ) : itens.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-slate-500">Nenhum item cadastrado no banco de dados.</td>
              </tr>
            ) : (
              itens.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-800 font-medium">{item.nome}</td>
                  <td className="p-4 text-slate-500 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${item.categoria === 'Serviço' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                      {item.categoria}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {item.categoria === 'Serviço' ? (
                      <span className="text-slate-400 text-sm">-</span>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className={`font-bold ${item.quantidade_atual <= item.estoque_minimo ? 'text-red-500' : 'text-slate-800'}`}>
                          {item.quantidade_atual} <span className="font-normal text-sm text-slate-500">{item.unidade_medida}</span>
                        </span>
                        {item.quantidade_atual <= item.estoque_minimo && (
                          <span className="text-[10px] text-red-500 bg-red-50 px-2 py-0.5 rounded-full mt-1 font-bold uppercase tracking-wider">Estoque Baixo</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-center relative">
                    
                    {/* Botão de Três Pontinhos */}
                    <button 
                      onClick={(e) => toggleMenu(e, item.id)}
                      className={`p-2 rounded-lg transition-colors ${menuAbertoId === item.id ? 'bg-slate-200 text-[#0F4C81]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                    >
                      <MenuIcon />
                    </button>

                    {/* Menu Flutuante (Dropdown) */}
                    {menuAbertoId === item.id && (
                      <div className="absolute right-12 top-1/2 -translate-y-1/2 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-fade-in origin-right">
                        
                        {item.categoria !== 'Serviço' && (
                          <>
                            <button 
                              onClick={() => { abrirMovimentacao(item); setMenuAbertoId(null); }} 
                              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#1B9C85] flex items-center gap-3 transition-colors"
                            >
                              <MoveIcon /> Mover ⇄
                            </button>
                            <div className="h-px bg-slate-100 my-1 mx-3"></div>
                          </>
                        )}

                        <button 
                          onClick={() => { abrirEdicao(item); setMenuAbertoId(null); }} 
                          className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0F4C81] flex items-center gap-3 transition-colors"
                        >
                          <EditIcon /> Editar Item
                        </button>
                        
                        {item.categoria !== 'Serviço' && (
                          <button 
                            onClick={() => { abrirHistorico(item); setMenuAbertoId(null); }} 
                            className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-3 transition-colors"
                          >
                            <HistoryIcon /> Ver Extrato
                          </button>
                        )}
                        
                        <div className="h-px bg-slate-100 my-1 mx-3"></div>

                        <button 
                          onClick={() => inativarProduto(item)} 
                          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium"
                        >
                          <TrashIcon /> Inativar Item
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

      {/* Modais */}
      <ModalNovoItemEstoque 
        isOpen={isNovoItemOpen} 
        onClose={() => setIsNovoItemOpen(false)} 
        onSuccess={fetchProdutos} 
        itemParaEditar={produtoSelecionado}
      />

      <ModalMovimentacaoEstoque 
        isOpen={isMovimentacaoOpen} 
        onClose={() => setIsMovimentacaoOpen(false)} 
        onSuccess={fetchProdutos} 
        produto={produtoSelecionado}
      />

      <ModalHistoricoProduto 
        isOpen={isHistoricoOpen} 
        onClose={() => setIsHistoricoOpen(false)} 
        produto={produtoSelecionado}
      />
    </div>
  );
}
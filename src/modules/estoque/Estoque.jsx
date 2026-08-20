import React, { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";
import ModalNovoItemEstoque from "./components/ModalNovoItemEstoque";
import ModalConfirmarExclusao from "@/components/modals/ModalConfirmarExclusao";

export default function Estoque() {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemParaExcluir, setItemParaExcluir] = useState(null);
  
  const [itens, setItens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEstoque();
  }, []);

  const fetchEstoque = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('estoque')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar estoque:', error);
    } else {
      setItens(data || []);
    }
    setIsLoading(false);
  };

  const handleExcluir = (id) => {
    setItemParaExcluir(id);
    setShowDeleteModal(true);
  };

  const confirmarExclusao = async () => {
    if (itemParaExcluir) {
      const { error } = await supabase
        .from('estoque')
        .delete()
        .eq('id', itemParaExcluir);

      if (error) {
        console.error('Erro ao apagar item:', error);
      } else {
        setItens(itens.filter(item => item.id !== itemParaExcluir));
      }
    }
    setShowDeleteModal(false);
    setItemParaExcluir(null);
  };

  const getStatus = (qtd, min) => {
    if (qtd <= 0) return { label: 'Sem Estoque', color: 'bg-red-100 text-red-800' };
    if (qtd <= min) return { label: 'Baixo (Crítico)', color: 'bg-orange-100 text-orange-800' };
    return { label: 'Normal', color: 'bg-green-100 text-green-800' };
  };

  const totalItens = itens.length;
  const itensCriticos = itens.filter(i => Number(i.quantidade) <= Number(i.estoque_minimo)).length;

  return (
    <div className="space-y-6 animate-fade-in relative z-0">
      {/* Cabeçalho do Módulo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F4C81]">Controlo de Estoque</h2>
          <p className="text-slate-500 text-sm">Gestão de matérias-primas e produtos acabados.</p>
        </div>
        
        {/* Botão Redondo com Animação */}
        <div className="flex w-full sm:w-auto justify-end">
          <button 
            onClick={() => setShowModal(true)}
            className="w-12 h-12 rounded-full bg-[#0F4C81] hover:bg-[#0a3863] text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 group"
            title="Novo Item"
          >
            <svg className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Cards de Resumo Rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-[#0F4C81]">
          <h3 className="text-sm font-medium text-slate-500 uppercase">Total de Itens (SKUs)</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">{totalItens}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-[#E74C3C]">
          <h3 className="text-sm font-medium text-slate-500 uppercase">Itens em Alerta (Baixo)</h3>
          <p className="text-3xl font-bold text-[#E74C3C] mt-2">{itensCriticos}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-[#1B9C85]">
          <h3 className="text-sm font-medium text-slate-500 uppercase">Status Geral</h3>
          <p className="text-2xl font-bold text-[#1B9C85] mt-2">
            {itensCriticos === 0 && totalItens > 0 ? 'Saudável' : (totalItens === 0 ? 'Vazio' : 'Requer Atenção')}
          </p>
        </div>
      </div>

      {/* Tabela de Estoque */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Inventário Atual</h3>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Pesquisar item ou código..." 
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0F4C81]"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nome do Item</th>
                <th className="px-6 py-4">Cód. Barras</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4 text-right">Qtd Atual</th>
                <th className="px-6 py-4 text-right">Mínimo</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-400">A carregar dados...</td></tr>
              ) : itens.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-400">Nenhum item registado no estoque.</td></tr>
              ) : (
                itens.map((item) => {
                  const status = getStatus(item.quantidade, item.estoque_minimo);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold text-slate-800">{item.nome}</td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">
                        {item.codigo_barras || <span className="text-slate-300">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">{item.categoria}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-700">
                        {item.quantidade} <span className="text-xs font-normal text-slate-400">{item.unidade_medida}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500">{item.estoque_minimo}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button className="p-1.5 text-slate-400 hover:text-[#0F4C81] hover:bg-blue-50 rounded-lg transition-colors" title="Editar Quantidade">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                          </button>
                          <button 
                            onClick={() => handleExcluir(item.id)}
                            className="p-1.5 text-slate-400 hover:text-[#E74C3C] hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir Item"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
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

      <ModalNovoItemEstoque 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onSuccess={fetchEstoque} 
      />

      <ModalConfirmarExclusao 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onConfirm={confirmarExclusao} 
        titulo="Apagar Item?" 
        mensagem="Tem certeza que deseja apagar este item do inventário? A ação não pode ser desfeita." 
      />
    </div>
  );
}
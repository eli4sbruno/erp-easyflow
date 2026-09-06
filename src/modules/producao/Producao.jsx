"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";
import ModalNovaOS from "@/modules/producao/components/ModalNovaOS";
import ImprimirOS from "@/modules/producao/components/ImprimirOS"; // <-- IMPORT ADICIONADO AQUI
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// --- Ícones ---
const SearchIcon = () => <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;
const MenuIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>;
const EyeIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>;
const EditIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const ClockIcon = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const KanbanIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 5h4v14H4V5zm6 0h4v10h-4V5zm6 0h4v7h-4V5z"></path></svg>;
const ListIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h2v2H4V6zm0 5h2v2H4v-2zm0 5h2v2H4v-2zm4-10h12v2H8V6zm0 5h12v2H8v-2zm0 5h12v2H8v-2z"></path></svg>;
const PrinterIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>; // <-- ÍCONE ADICIONADO AQUI

export default function Producao() {
  const [ordens, setOrdens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Controle de Visualização (Kanban vs Histórico)
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'historico'
  
  // Controle de Modais e Menus
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [osSelecionada, setOsSelecionada] = useState(null);
  const [menuAbertoId, setMenuAbertoId] = useState(null);
  
  // <-- ESTADO DE IMPRESSÃO ADICIONADO AQUI
  const [osParaImprimir, setOsParaImprimir] = useState(null);

  const statusList = ['Pendente', 'Em Andamento', 'Concluída', 'Cancelada'];

  useEffect(() => {
    fetchOrdens();
  }, []);

  // Fecha o Kebab Menu se clicar fora dele
  useEffect(() => {
    const handleClickFora = () => setMenuAbertoId(null);
    window.addEventListener('click', handleClickFora);
    return () => window.removeEventListener('click', handleClickFora);
  }, []);

  const fetchOrdens = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('producao')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar ordens de serviço:', error);
    } else {
      setOrdens(data || []);
    }
    setIsLoading(false);
  };

  const abrirNovaOS = () => {
    setOsSelecionada(null);
    setIsModalOpen(true);
  };

  const abrirEdicaoOS = (os) => {
    let osParaEditar = { ...os };
    if (typeof os.materiais_utilizados === 'string') {
      try {
        osParaEditar.itensCusto = JSON.parse(os.materiais_utilizados);
      } catch (e) {
        osParaEditar.itensCusto = [];
      }
    } else if (Array.isArray(os.materiais_utilizados)) {
      osParaEditar.itensCusto = os.materiais_utilizados;
    }
    
    setOsSelecionada(osParaEditar);
    setIsModalOpen(true);
  };

  const apagarOS = async (id) => {
    const confirmacao = window.confirm(
      "Deseja realmente CANCELAR esta Ordem de Serviço?\n\nO status será alterado para 'Cancelada' para mantermos o histórico de produção e auditoria intactos."
    );
    
    if (!confirmacao) return;

    // Atualização otimista (instantâneo na UI)
    setOrdens(prevOrdens => prevOrdens.map(os => os.id === id ? { ...os, status: 'Cancelada' } : os));
    
    // Atualiza no banco
    const { error } = await supabase.from('producao').update({ status: 'Cancelada' }).eq('id', id);
    
    if (error) {
      alert("Erro ao cancelar O.S.");
      fetchOrdens(); // reverte em caso de erro
    }
  };

  const atualizarStatus = async (id, novoStatus) => {
    setOrdens(prevOrdens => prevOrdens.map(os => os.id === id ? { ...os, status: novoStatus } : os));
    const { error } = await supabase.from('producao').update({ status: novoStatus }).eq('id', id);
    if (error) {
      console.error("Erro ao atualizar status", error);
      fetchOrdens(); 
    }
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setMenuAbertoId(menuAbertoId === id ? null : id);
  };

  const formatData = (dataStr) => {
    if (!dataStr) return '---';
    const dataObj = new Date(dataStr);
    dataObj.setMinutes(dataObj.getMinutes() + dataObj.getTimezoneOffset());
    return dataObj.toLocaleDateString('pt-BR');
  };

  const shortId = (id) => {
    if (!id) return '';
    const strId = id.toString();
    return strId.length > 8 ? strId.substring(0, 8).toUpperCase() : strId.toUpperCase();
  };

  // --- LÓGICA DO PANGEA DND ---
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    if (destination.droppableId !== source.droppableId) {
      const novoStatus = destination.droppableId;
      atualizarStatus(draggableId, novoStatus);
    }
  };

  // Filtragem
  const ordensFiltradas = ordens.filter(os => {
    const termo = searchTerm.toLowerCase();
    const nomeBusca = (os.solicitante_nome || '').toLowerCase();
    const descBusca = (os.descricao_solicitacao || os.descricao || '').toLowerCase();
    return nomeBusca.includes(termo) || descBusca.includes(termo) || os.id?.toString().toLowerCase().includes(termo);
  });

  const colunasKanban = {
    'Pendente': ordensFiltradas.filter(os => os.status === 'Pendente' || !os.status),
    'Em Andamento': ordensFiltradas.filter(os => os.status === 'Em Andamento'),
    'Concluída': ordensFiltradas.filter(os => os.status === 'Concluída'),
    'Cancelada': ordensFiltradas.filter(os => os.status === 'Cancelada'),
  };

  const coresColuna = {
    'Pendente': 'border-t-amber-400 bg-amber-50/30',
    'Em Andamento': 'border-t-blue-500 bg-blue-50/30',
    'Concluída': 'border-t-emerald-500 bg-emerald-50/30',
    'Cancelada': 'border-t-red-500 bg-red-50/30'
  };

  const coresTag = {
    'Pendente': 'bg-amber-100 text-amber-700',
    'Em Andamento': 'bg-blue-100 text-blue-700',
    'Concluída': 'bg-emerald-100 text-emerald-700',
    'Cancelada': 'bg-red-100 text-red-700'
  };

  return (
    <div className="space-y-6 animate-fade-in relative z-0 h-full flex flex-col pb-6 print:hidden">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-[#0F4C81]">Controle de Produção</h2>
          <p className="text-sm text-slate-500">
            {viewMode === 'kanban' 
              ? 'Arraste os cards para atualizar o status das Ordens de Serviço.' 
              : 'Histórico completo e detalhado de todas as produções.'}
          </p>
        </div>
        
        <button 
          onClick={abrirNovaOS}
          className="w-12 h-12 rounded-full bg-[#0F4C81] hover:bg-[#0a3863] text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 group shrink-0"
          title="Nova O.S"
        >
          <svg className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
        </button>
      </div>

      {/* CARDS DE RESUMO E BUSCA */}
      <div className="flex flex-col lg:flex-row gap-6 shrink-0">
        <div className="flex-1 grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-[#0F4C81]">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total de O.S</h3>
            <div className="text-2xl font-black text-slate-800">{ordens.length}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-[#3498db]">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Em Andamento</h3>
            <div className="text-2xl font-black text-[#3498db]">{colunasKanban['Em Andamento'].length}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-[#1B9C85]">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Concluídas</h3>
            <div className="text-2xl font-black text-[#1B9C85]">{colunasKanban['Concluída'].length}</div>
          </div>
        </div>
        
        <div className="w-full lg:w-fit flex flex-col sm:flex-row gap-3 mt-auto mb-auto">
          {/* Toggle de Visualização */}
          <div className="flex bg-slate-200/60 p-1 rounded-xl shrink-0">
            <button 
              onClick={() => setViewMode('kanban')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-[#0F4C81]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <KanbanIcon /> Kanban
            </button>
            <button 
              onClick={() => setViewMode('historico')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'historico' ? 'bg-white shadow-sm text-[#0F4C81]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <ListIcon /> Histórico
            </button>
          </div>

          <div className="w-full lg:w-72 bg-white p-2 rounded-xl shadow-sm border border-slate-100 flex items-center">
            <div className="pl-3 pointer-events-none text-slate-400">
              <SearchIcon />
            </div>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar O.S, cliente ou desc..." 
              className="w-full px-3 py-2 bg-transparent focus:outline-none text-sm font-medium text-slate-700" 
            />
          </div>
        </div>
      </div>

      {/* CONDIÇÃO DE RENDERIZAÇÃO: KANBAN OU HISTÓRICO */}
      {viewMode === 'kanban' ? (
        
        /* QUADRO KANBAN (DRAG AND DROP) */
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex-1 flex gap-6 overflow-x-auto custom-scrollbar pb-4 min-h-[500px]">
            {isLoading ? (
              <div className="w-full flex items-center justify-center text-slate-400 font-medium">Carregando quadro de produção...</div>
            ) : (
              statusList.map(status => (
                <div 
                  key={status}
                  className={`flex flex-col w-80 shrink-0 bg-slate-50/80 border-t-4 rounded-xl shadow-sm transition-colors ${coresColuna[status]}`}
                >
                  <div className="p-4 border-b border-slate-200/50 flex justify-between items-center bg-white/50 rounded-t-lg">
                    <h3 className="font-bold text-slate-700">{status}</h3>
                    <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-slate-500 shadow-sm border border-slate-100">
                      {colunasKanban[status].length}
                    </span>
                  </div>

                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 flex flex-col gap-3 p-3 overflow-y-auto custom-scrollbar transition-colors ${snapshot.isDraggingOver ? 'bg-slate-200/50' : ''}`}
                      >
                        {colunasKanban[status].length === 0 && !snapshot.isDraggingOver && (
                          <div className="text-center py-8 text-xs font-medium text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                            Solte cards aqui
                          </div>
                        )}
                        
                        {colunasKanban[status].map((os, index) => (
                          <Draggable key={os.id} draggableId={String(os.id)} index={index}>
                            {(provided, snapshot) => (
                              <div 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onDoubleClick={() => abrirEdicaoOS(os)}
                                className={`bg-white p-4 rounded-xl border group relative ${
                                  snapshot.isDragging 
                                    ? 'border-[#0F4C81] shadow-2xl ring-4 ring-[#0F4C81]/10 z-50' 
                                    : 'shadow-sm border-slate-200 hover:border-[#0F4C81]/30 transition-colors'
                                }`}
                                style={{ ...provided.draggableProps.style }}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex gap-2 items-center">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${coresTag[status]}`}>
                                      #{shortId(os.id)}
                                    </span>
                                    {os.tipo_op === 'Interna' && (
                                      <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[9px] font-bold uppercase tracking-wider">Interna</span>
                                    )}
                                  </div>

                                  <button 
                                    type="button"
                                    onMouseDown={(e) => e.stopPropagation()} 
                                    onClick={(e) => toggleMenu(e, os.id)}
                                    className="text-slate-300 hover:text-[#0F4C81] p-1 rounded transition-colors -mr-2 -mt-2 cursor-pointer"
                                  >
                                    <MenuIcon />
                                  </button>

                                  {menuAbertoId === os.id && (
                                    <div className="absolute right-6 top-8 w-44 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-[100] animate-fade-in origin-top-right">
                                      <button 
                                        type="button"
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={(e) => { e.stopPropagation(); abrirEdicaoOS(os); setMenuAbertoId(null); }} 
                                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[#0F4C81] flex items-center gap-2"
                                      >
                                        <EyeIcon /> Visualizar / Editar
                                      </button>
                                      
                                      {/* <-- BOTÃO DE IMPRESSÃO ADICIONADO AQUI --> */}
                                      <button 
                                        type="button"
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={(e) => { e.stopPropagation(); setOsParaImprimir(os); setMenuAbertoId(null); }} 
                                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[#0F4C81] flex items-center gap-2"
                                      >
                                        <PrinterIcon /> Imprimir O.S
                                      </button>

                                      <div className="h-px bg-slate-100 my-1 mx-2"></div>
                                      <button 
                                        type="button"
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={(e) => { e.stopPropagation(); apagarOS(os.id); setMenuAbertoId(null); }} 
                                        className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                                      >
                                        <TrashIcon /> Apagar O.S
                                      </button>
                                    </div>
                                  )}
                                </div>

                                <div className="mb-3">
                                  <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1">{os.solicitante_nome || 'Sem Cliente'}</h4>
                                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed" title={os.descricao_solicitacao || os.descricao}>
                                    {os.descricao_solicitacao || os.descricao || 'Sem descrição detalhada do serviço.'}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                                    <ClockIcon /> {formatData(os.data_abertura)}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9px] font-bold" title={`Responsável: ${os.responsavel || 'Equipe'}`}>
                                      {(os.responsavel || 'Eq').substring(0, 2).toUpperCase()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))
            )}
          </div>
        </DragDropContext>
        
      ) : (

        /* LISTA HISTÓRICO (TABELA) */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                <tr>
                  <th className="px-6 py-4">ID / O.S</th>
                  <th className="px-6 py-4">Cliente / Solicitante</th>
                  <th className="px-6 py-4">Descrição</th>
                  <th className="px-6 py-4">Abertura</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">Carregando histórico...</td></tr>
                ) : ordensFiltradas.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">Nenhuma Ordem de Serviço encontrada.</td></tr>
                ) : (
                  ordensFiltradas.map(os => (
                    <tr key={os.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#0F4C81]">#{shortId(os.id)}</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {os.tipo_op === 'Interna' ? 'Interna' : 'Cliente'}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {os.solicitante_nome || 'Sem Nome'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-500 truncate max-w-xs" title={os.descricao_solicitacao || os.descricao}>
                          {os.descricao_solicitacao || os.descricao || '---'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {formatData(os.data_abertura)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${coresTag[os.status || 'Pendente']}`}>
                          {os.status || 'Pendente'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => abrirEdicaoOS(os)} 
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-[#0F4C81] rounded-lg transition-colors"
                            title="Visualizar / Editar"
                          >
                            <EditIcon />
                          </button>
                          
                          {/* <-- BOTÃO DE IMPRIMIR NA TABELA --> */}
                          <button 
                            onClick={() => setOsParaImprimir(os)} 
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-[#0F4C81] rounded-lg transition-colors"
                            title="Imprimir O.S"
                          >
                            <PrinterIcon />
                          </button>

                          <button 
                            onClick={() => apagarOS(os.id)} 
                            className="p-2 bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                            title="Excluir O.S"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ModalNovaOS 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchOrdens} 
        dadosIniciais={osSelecionada} 
      />

      {/* RENDERIZAÇÃO DO COMPONENTE DE IMPRESSÃO */}
      {osParaImprimir && (
        <ImprimirOS os={osParaImprimir} onClose={() => setOsParaImprimir(null)} />
      )}
      
    </div>
  );
}
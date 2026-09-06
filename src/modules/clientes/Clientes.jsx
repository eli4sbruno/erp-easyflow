"use client";
import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { supabase } from "@/supabaseClient";
import ModalNovoCliente from "@/modules/clientes/components/ModalNovoCliente";
import ModalPerfilCliente from "@/modules/clientes/components/ModalPerfilCliente";

// Ícones
const SearchIcon = () => <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;
const TableIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>;
const KanbanIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg>;
const WhatsappIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.012c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>;
const EditIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>;
const MenuIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>;
const ProfileIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;

export default function Clientes() {
  const [viewMode, setViewMode] = useState('tabela'); 
  const [clienteAtivo, setClienteAtivo] = useState(null);
  const [clienteParaEditar, setClienteParaEditar] = useState(null); 
  const [isNovoClienteOpen, setIsNovoClienteOpen] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [menuAbertoId, setMenuAbertoId] = useState(null);

  const funil = ['Prospecção', 'Qualificação', 'Diagnóstico', 'Proposta', 'Em Negociação', 'Aguardando Aprovação', 'Fechado'];

  const fetchClientes = async () => {
    setIsLoading(true);
    // Busca apenas clientes ativos (Soft Delete)
    const { data, error } = await supabase.from('clientes').select('*').eq('ativo', true).order('created_at', { ascending: false });
    if (error) {
      console.error("Erro ao buscar clientes:", error);
    } else {
      setClientes(data.map(c => ({ 
        ...c, 
        estagio_funil: c.estagio_funil || 'Prospecção', 
        status_temperatura: c.status_temperatura || 'Frio', 
        tags: c.tags || [] 
      })));
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchClientes(); }, []);

  useEffect(() => {
    const handleClickFora = () => setMenuAbertoId(null);
    window.addEventListener('click', handleClickFora);
    return () => window.removeEventListener('click', handleClickFora);
  }, []);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    
    // Atualização otimista
    const itensAtualizados = [...clientes];
    const clienteIndex = itensAtualizados.findIndex(c => c.id.toString() === draggableId);
    
    if (clienteIndex !== -1) {
      itensAtualizados[clienteIndex] = { 
        ...itensAtualizados[clienteIndex], 
        estagio_funil: destination.droppableId 
      };
      setClientes(itensAtualizados);
    }

    await supabase.from('clientes').update({ estagio_funil: destination.droppableId }).eq('id', draggableId);
  };

  const atualizarEstagio = async (clienteId, novoEstagio) => {
    setClientes(clientes.map(c => c.id === clienteId ? { ...c, estagio_funil: novoEstagio } : c));
    const { error } = await supabase.from('clientes').update({ estagio_funil: novoEstagio }).eq('id', clienteId);
    if (error) console.error("Erro ao atualizar estágio", error);
  };

  // Função de Inativar (Soft Delete)
  const inativarCliente = async (clienteId) => {
    const confirmacao = window.confirm("Deseja realmente inativar este cliente? O histórico de vendas será mantido.");
    if (!confirmacao) return;

    // Atualização otimista na tela (remove da lista)
    setClientes(clientes.filter(c => c.id !== clienteId));

    // Atualiza no banco
    const { error } = await supabase.from('clientes').update({ ativo: false }).eq('id', clienteId);
    if (error) {
      console.error("Erro ao inativar", error);
      fetchClientes(); // reverte em caso de erro
    }
  };

  const clientesFiltrados = clientes.filter(c => {
    const termo = searchTerm.toLowerCase();
    const nomeBusca = (c.nome_razao || '').toLowerCase();
    const emailBusca = (c.email || '').toLowerCase();
    const docBusca = (c.documento || '').toLowerCase();
    const tagsBusca = (c.tags || []).join(' ').toLowerCase();

    return nomeBusca.includes(termo) || emailBusca.includes(termo) || docBusca.includes(termo) || tagsBusca.includes(termo);
  });

  const getStatusColor = (status) => ({ 'Quente': 'bg-green-500', 'Morno': 'bg-yellow-500', 'Frio': 'bg-blue-400' }[status] || 'bg-slate-300');
  
  const abrirWhatsApp = (tel) => tel && window.open(`https://wa.me/55${tel.replace(/\D/g, '')}`, '_blank');
  
  const abrirEdicao = (cliente) => {
    setClienteParaEditar(cliente);
    setIsNovoClienteOpen(true);
  };

  const abrirNovoCliente = () => {
    setClienteParaEditar(null);
    setIsNovoClienteOpen(true);
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setMenuAbertoId(menuAbertoId === id ? null : id);
  };

  return (
    <div className="space-y-6 animate-fade-in relative z-0 pb-32">
      
      {/* CABEÇALHO */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0F4C81]">Gestão de Clientes (CRM)</h2>
          <p className="text-sm text-slate-500">Base completa de contatos e histórico de relacionamento.</p>
        </div>
        <button 
          onClick={abrirNovoCliente}
          className="w-12 h-12 rounded-full bg-[#0F4C81] hover:bg-[#0a3863] text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 group shrink-0"
          title="Novo Cliente"
        >
          <svg className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
        </button>
      </div>

      {/* BARRA DE PESQUISA E FILTROS */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><SearchIcon /></div>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Pesquisar cliente, documento ou tag..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0F4C81]" />
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
          <button onClick={() => setViewMode('tabela')} className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'tabela' ? 'bg-white text-[#0F4C81] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <TableIcon /> Lista
          </button>
          <button onClick={() => setViewMode('kanban')} className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white text-[#0F4C81] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <KanbanIcon /> Funil
          </button>
        </div>
      </div>

      {/* RENDERIZAÇÃO DA VISUALIZAÇÃO */}
      {viewMode === 'tabela' ? (
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible">
          <div className="overflow-x-auto overflow-y-visible pb-12">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Nome / Razão Social</th>
                  <th className="px-6 py-4">Contato</th>
                  <th className="px-6 py-4">Estágio no Funil</th>
                  <th className="px-6 py-4">Tags</th>
                  <th className="px-6 py-4 text-center w-24">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400 font-medium">A buscar clientes...</td></tr>
                ) : clientesFiltrados.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">Nenhum cliente encontrado.</td></tr>
                ) : (
                  clientesFiltrados.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div title={`Temperatura: ${c.status_temperatura}`} className={`w-2.5 h-2.5 rounded-full shrink-0 ${getStatusColor(c.status_temperatura)}`} />
                          <span 
                            className="font-semibold text-slate-800 cursor-pointer hover:text-[#0F4C81] transition-colors"
                            onClick={() => setClienteAtivo(c)}
                          >
                            {c.nome_razao || 'Sem Nome'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-800">{c.email || '-'}</div>
                        <div className="text-xs text-slate-400">{c.telefone || 'Sem telefone'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative inline-block w-full max-w-[140px]">
                          <select
                            value={c.estagio_funil}
                            onChange={(e) => atualizarEstagio(c.id, e.target.value)}
                            className="appearance-none w-full pl-3 pr-8 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100 focus:outline-none focus:ring-1 focus:ring-[#0F4C81] cursor-pointer transition-colors hover:bg-blue-100"
                          >
                            {funil.map(f => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-700">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 flex flex-wrap gap-1">
                        {c.tags && c.tags.length > 0 ? c.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[10px] font-bold uppercase">
                            {tag}
                          </span>
                        )) : <span className="text-xs text-slate-400">-</span>}
                      </td>
                      <td className="px-6 py-4 text-center relative">
                        <button 
                          onClick={(e) => toggleMenu(e, c.id)}
                          className={`p-2 rounded-lg transition-colors ${menuAbertoId === c.id ? 'bg-slate-200 text-[#0F4C81]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                        >
                          <MenuIcon />
                        </button>

                        {menuAbertoId === c.id && (
                          <div className="absolute right-14 top-1/2 -translate-y-1/2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-fade-in origin-right">
                            <button 
                              onClick={() => { setClienteAtivo(c); setMenuAbertoId(null); }} 
                              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0F4C81] flex items-center gap-3 transition-colors"
                            >
                              <ProfileIcon /> Ver Perfil
                            </button>
                            
                            {c.telefone && c.telefone !== 'Sem telefone' && (
                              <button 
                                onClick={() => { abrirWhatsApp(c.telefone); setMenuAbertoId(null); }} 
                                className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#1B9C85] flex items-center gap-3 transition-colors"
                              >
                                <WhatsappIcon /> WhatsApp
                              </button>
                            )}
                            
                            <div className="h-px bg-slate-100 my-1 mx-3"></div>

                            <button 
                              onClick={() => { abrirEdicao(c); setMenuAbertoId(null); }} 
                              className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0F4C81] flex items-center gap-3 transition-colors"
                            >
                              <EditIcon /> Editar Cliente
                            </button>

                            {/* NOVO BOTÃO INATIVAR */}
                            <button 
                              type="button"
                              onClick={() => { inativarCliente(c.id); setMenuAbertoId(null); }} 
                              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 flex items-center gap-3 transition-colors"
                            >
                              <TrashIcon /> Inativar Cliente
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

      ) : (
        
        /* KANBAN DE CRM */
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar items-start min-h-[60vh]">
            {funil.map(estagio => {
              const clientesNaColuna = clientesFiltrados.filter(c => c.estagio_funil === estagio);
              
              return (
                <div key={estagio} className="bg-[#f1f2f4] rounded-xl w-[300px] shrink-0 flex flex-col max-h-[75vh]">
                  <div className="px-4 py-3 flex justify-between items-center cursor-default">
                    <h3 className="font-bold text-slate-700 text-sm">{estagio}</h3>
                    <span className="bg-slate-200 px-2 py-0.5 rounded-full text-xs font-bold text-slate-600">
                      {clientesNaColuna.length}
                    </span>
                  </div>
                  
                  <Droppable droppableId={estagio}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef} 
                        {...provided.droppableProps} 
                        className={`flex-1 flex flex-col gap-3 p-3 overflow-y-auto custom-scrollbar pb-32 transition-colors ${snapshot.isDraggingOver ? 'bg-[#e4e6ea]' : ''}`}
                      >
                        {clientesNaColuna.map((c, index) => (
                          <Draggable key={c.id.toString()} draggableId={c.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div 
                                ref={provided.innerRef} 
                                {...provided.draggableProps} 
                                {...provided.dragHandleProps} 
                                onDoubleClick={() => setClienteAtivo(c)} 
                                className={`bg-white p-4 rounded-xl border group relative cursor-grab active:cursor-grabbing ${
                                  snapshot.isDragging 
                                    ? 'border-[#0F4C81] shadow-2xl ring-4 ring-[#0F4C81]/10 z-50' 
                                    : 'shadow-sm border-slate-200 hover:border-[#0F4C81]/30 transition-colors'
                                }`}
                                style={{ ...provided.draggableProps.style }}
                              >
                                
                                <div className="absolute top-2 right-2">
                                  <button 
                                    type="button"
                                    onMouseDown={(e) => e.stopPropagation()} 
                                    onClick={(e) => toggleMenu(e, c.id)}
                                    className={`p-1 rounded-md transition-colors ${menuAbertoId === c.id ? 'bg-slate-200 text-[#0F4C81]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                  >
                                    <MenuIcon />
                                  </button>

                                  {menuAbertoId === c.id && (
                                    <div className="absolute right-0 top-full w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-[100] animate-fade-in origin-top-right">
                                      <button 
                                        type="button"
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={() => { setClienteAtivo(c); setMenuAbertoId(null); }} 
                                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0F4C81] flex items-center gap-3 transition-colors"
                                      >
                                        <ProfileIcon /> Ver Perfil
                                      </button>
                                      
                                      {c.telefone && c.telefone !== 'Sem telefone' && (
                                        <button 
                                          type="button"
                                          onMouseDown={(e) => e.stopPropagation()}
                                          onClick={() => { abrirWhatsApp(c.telefone); setMenuAbertoId(null); }} 
                                          className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#1B9C85] flex items-center gap-3 transition-colors"
                                        >
                                          <WhatsappIcon /> WhatsApp
                                        </button>
                                      )}
                                      
                                      <div className="h-px bg-slate-100 my-1 mx-3"></div>

                                      <button 
                                        type="button"
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={() => { abrirEdicao(c); setMenuAbertoId(null); }} 
                                        className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0F4C81] flex items-center gap-3 transition-colors"
                                      >
                                        <EditIcon /> Editar Cliente
                                      </button>

                                      {/* NOVO BOTÃO INATIVAR NO KANBAN */}
                                      <button 
                                        type="button"
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={() => { inativarCliente(c.id); setMenuAbertoId(null); }} 
                                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 flex items-center gap-3 transition-colors"
                                      >
                                        <TrashIcon /> Inativar Cliente
                                      </button>
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-1 mb-2 pr-6">
                                  <div title={`Temperatura: ${c.status_temperatura}`} className={`w-8 h-1.5 rounded-full ${getStatusColor(c.status_temperatura)}`} />
                                  {c.tags && c.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase truncate max-w-[80px]">
                                      {tag}
                                    </span>
                                  ))}
                                </div>

                                <h4 className="font-bold text-sm text-slate-800 leading-tight mb-1 pr-6">{c.nome_razao || 'Sem nome'}</h4>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                  {c.telefone || 'Sem telefone'}
                                </p>

                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        <div className="w-full mt-2 text-left py-2 px-2 text-slate-400 text-xs font-medium hover:text-slate-600 hover:bg-slate-200 rounded cursor-pointer transition-colors" onClick={abrirNovoCliente}>
                           + Adicionar cliente
                        </div>
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* MODAIS */}
      <ModalPerfilCliente isOpen={!!clienteAtivo} cliente={clienteAtivo} onClose={() => setClienteAtivo(null)} />
      
      <ModalNovoCliente 
        isOpen={isNovoClienteOpen} 
        onClose={() => setIsNovoClienteOpen(false)} 
        onSuccess={fetchClientes} 
        clienteParaEditar={clienteParaEditar}
      />
    </div>
  );
}
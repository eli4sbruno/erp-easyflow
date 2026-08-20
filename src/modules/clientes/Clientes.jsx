import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { supabase } from "@/supabaseClient";
import ModalNovoCliente from "@/modules/clientes/components/ModalNovoCliente";
import ModalPerfilCliente from "@/modules/clientes/components/ModalPerfilCliente";

// Ícones
const SearchIcon = () => <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;
const TableIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>;
const KanbanIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg>;
const WhatsappIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.012c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>;

export default function Clientes() {
  const [viewMode, setViewMode] = useState('kanban'); // Iniciando direto no Kanban para você ver a diferença
  const [clienteAtivo, setClienteAtivo] = useState(null);
  const [isNovoClienteOpen, setIsNovoClienteOpen] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClientes = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('clientes').select('*').order('created_at', { ascending: false });
    if (error) console.error("Erro ao buscar clientes:", error);
    else {
      setClientes(data.map(c => ({ 
        ...c, 
        nome: c.nome_razao || 'Sem nome', 
        tel: c.telefone || 'Sem telefone', 
        estagio_funil: c.estagio_funil || 'Prospecção', 
        status_temperatura: c.status_temperatura || 'Frio', 
        tags: c.tags || [] 
      })));
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchClientes(); }, []);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    
    // Atualização otimista (muda na tela antes de ir pro banco para não ter delay)
    const itensAtualizados = Array.from(clientes);
    const clienteIndex = itensAtualizados.findIndex(c => c.id.toString() === draggableId);
    if (clienteIndex !== -1) {
      itensAtualizados[clienteIndex].estagio_funil = destination.droppableId;
      setClientes(itensAtualizados);
    }

    // Salva no banco de dados
    await supabase.from('clientes').update({ estagio_funil: destination.droppableId }).eq('id', draggableId);
  };

  const clientesFiltrados = clientes.filter(c => {
    const termo = searchTerm.toLowerCase();
    return c.nome.toLowerCase().includes(termo) || 
           (c.email || '').toLowerCase().includes(termo) || 
           (c.documento || '').includes(termo) || 
           (c.tags || []).join(' ').toLowerCase().includes(termo);
  });

  const getStatusColor = (status) => ({ 'Quente': 'bg-green-500', 'Morno': 'bg-yellow-500', 'Frio': 'bg-blue-400' }[status] || 'bg-slate-300');
  const abrirWhatsApp = (tel) => tel && tel !== 'Sem telefone' && window.open(`https://wa.me/55${tel.replace(/\D/g, '')}`, '_blank');
  
  const funil = ['Prospecção', 'Qualificação', 'Diagnóstico', 'Proposta', 'Em Negociação', 'Aguardando Aprovação', 'Fechado'];

  return (
    <div className="space-y-6 animate-fade-in relative z-0">
      
      {/* CABEÇALHO */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0F4C81]">Gestão de Clientes (CRM)</h2>
          <p className="text-sm text-slate-500">Base completa de contatos e histórico de relacionamento.</p>
        </div>
        <button 
          onClick={() => setIsNovoClienteOpen(true)}
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
        
        /* ---------------- VIEW: TABELA (Restaurada) ---------------- */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Nome / Razão Social</th>
                  <th className="px-6 py-4">Contato</th>
                  <th className="px-6 py-4">Estágio no Funil</th>
                  <th className="px-6 py-4">Tags</th>
                  <th className="px-6 py-4 text-center">Ações</th>
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
                          <span className="font-semibold text-slate-800">{c.nome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-800">{c.email || '-'}</div>
                        <div className="text-xs text-slate-400">{c.tel !== 'Sem telefone' ? c.tel : '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100">
                          {c.estagio_funil}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex flex-wrap gap-1">
                        {c.tags && c.tags.length > 0 ? c.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[10px] font-bold uppercase">
                            {tag}
                          </span>
                        )) : <span className="text-xs text-slate-400">-</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-4">
                          <button 
                            onClick={() => abrirWhatsApp(c.tel)}
                            className="text-[#1B9C85] hover:text-[#15826e] transition-colors"
                            title="Chamar no WhatsApp"
                          >
                            <WhatsappIcon />
                          </button>
                          <button onClick={() => setClienteAtivo(c)} className="text-[#0F4C81] hover:underline font-medium text-xs transition-colors">
                            Ver Perfil
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

      ) : (
        
        /* ---------------- VIEW: KANBAN (Trello Style) ---------------- */
        <DragDropContext onDragEnd={onDragEnd}>
          {/* Fundo do Kanban um pouco mais sutil se quiser: bg-slate-50 p-4 rounded-xl */}
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar items-start min-h-[60vh]">
            {funil.map(estagio => {
              const clientesNaColuna = clientesFiltrados.filter(c => c.estagio_funil === estagio);
              
              return (
                <Droppable key={estagio} droppableId={estagio}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.droppableProps} 
                      // Estilo de Coluna do Trello: Fundo cinza, bordas arredondadas
                      className={`bg-[#f1f2f4] rounded-xl w-[300px] shrink-0 flex flex-col max-h-[75vh] transition-colors ${snapshot.isDraggingOver ? 'bg-[#e4e6ea]' : ''}`}
                    >
                      {/* Cabeçalho da Coluna */}
                      <div className="px-4 py-3 flex justify-between items-center cursor-default">
                        <h3 className="font-bold text-slate-700 text-sm">{estagio}</h3>
                        <span className="bg-slate-200 px-2 py-0.5 rounded-full text-xs font-bold text-slate-600">
                          {clientesNaColuna.length}
                        </span>
                      </div>
                      
                      {/* Área dos Cards */}
                      <div className="p-2 overflow-y-auto flex-1 space-y-2 custom-scrollbar">
                        {clientesNaColuna.map((c, index) => (
                          <Draggable key={c.id.toString()} draggableId={c.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div 
                                ref={provided.innerRef} 
                                {...provided.draggableProps} 
                                {...provided.dragHandleProps} 
                                // Estilo do Card Trello: Fundo branco, sombra, ring no hover
                                className={`bg-white p-3 rounded-lg shadow-sm border border-transparent hover:ring-2 hover:ring-[#0F4C81]/50 cursor-grab active:cursor-grabbing group relative ${snapshot.isDragging ? 'shadow-lg ring-2 ring-[#0F4C81]' : ''}`}
                              >
                                
                                {/* Etiqueta / Temperatura */}
                                <div className="flex flex-wrap gap-1 mb-2">
                                  <div title={`Temperatura: ${c.status_temperatura}`} className={`w-8 h-1.5 rounded-full ${getStatusColor(c.status_temperatura)}`} />
                                  {c.tags && c.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase truncate max-w-[80px]">
                                      {tag}
                                    </span>
                                  ))}
                                </div>

                                {/* Conteúdo Principal */}
                                <h4 className="font-bold text-sm text-slate-800 leading-tight mb-1">{c.nome}</h4>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                  {c.tel !== 'Sem telefone' ? c.tel : 'Sem telefone'}
                                </p>

                                {/* Ações (Aparecem no Hover do card) */}
                                <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => setClienteAtivo(c)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-1 rounded text-xs font-semibold transition-colors">
                                    Perfil
                                  </button>
                                  <button onClick={() => abrirWhatsApp(c.tel)} className="w-8 flex items-center justify-center bg-green-50 hover:bg-green-100 text-green-600 rounded transition-colors" title="WhatsApp">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.012c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                  </button>
                                </div>

                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        {/* Botão sutil no final da coluna como no Trello */}
                        {clientesNaColuna.length > 0 && (
                           <div className="w-full text-left py-2 px-2 text-slate-400 text-xs font-medium hover:text-slate-600 hover:bg-slate-200 rounded cursor-pointer transition-colors" onClick={() => setIsNovoClienteOpen(true)}>
                              + Adicionar cliente
                           </div>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* MODAIS */}
      <ModalPerfilCliente isOpen={!!clienteAtivo} cliente={clienteAtivo} onClose={() => setClienteAtivo(null)} />
      <ModalNovoCliente isOpen={isNovoClienteOpen} onClose={() => setIsNovoClienteOpen(false)} onSuccess={fetchClientes} />
    </div>
  );
}
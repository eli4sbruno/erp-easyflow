import React, { useState } from 'react';

// Ícones auxiliares
const TableIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>;
const KanbanIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg>;
const SearchIcon = () => <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;

export default function ClientesCRM() {
  const [viewMode, setViewMode] = useState('tabela'); // 'tabela' ou 'kanban'
  const [searchTerm, setSearchTerm] = useState('');

  // Dados fictícios baseados na imagem e no CRM
  const clientes = [
    { id: 1, nome: 'Diego Fernandes', email: 'diego@rocket.com', telefone: '(34) 99999-9999', status: 'Quente', estagio: 'Em Negociação', tags: ['VIP', 'Identidade Visual'] },
    { id: 2, nome: 'Clínica Sorriso', email: 'contato@sorriso.com', telefone: '(34) 98888-8888', status: 'Frio', estagio: 'Prospecção', tags: ['Saúde'] },
    { id: 3, nome: 'Restaurante Sabor', email: 'vendas@sabor.com', telefone: '(34) 97777-7777', status: 'Morno', estagio: 'Aguardando Aprovação', tags: ['Varejo', 'Impressos'] },
    { id: 4, nome: 'Tech Solutions', email: 'ti@tech.com', telefone: '(34) 96666-6666', status: 'Quente', estagio: 'Fechado', tags: ['B2B'] },
  ];

  // Filtro de busca
  const clientesFiltrados = clientes.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Colunas do Kanban
  const funil = ['Prospecção', 'Qualificação', 'Diagnóstico', 'Em Negociação', 'Aguardando Aprovação', 'Fechado'];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Quente': return 'bg-green-500';
      case 'Morno': return 'bg-yellow-500';
      case 'Frio': return 'bg-red-500';
      default: return 'bg-slate-300';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in z-0 relative">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F4C81]">Gestão de Clientes (CRM)</h2>
          <p className="text-slate-500 text-sm">Base completa de contatos, histórico e funil de vendas.</p>
        </div>
        <button className="w-full sm:w-auto bg-[#0F4C81] hover:bg-[#0c3e6a] text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-colors">
          + Novo Cliente
        </button>
      </div>

      {/* Barra de Busca e Controles de Visualização */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input 
            type="text" 
            placeholder="Pesquisar por nome, e-mail ou tag..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81]"
          />
        </div>
        
        {/* Toggle Tabela / Kanban */}
        <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
          <button 
            onClick={() => setViewMode('tabela')}
            className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'tabela' ? 'bg-white text-[#0F4C81] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <TableIcon /> Lista
          </button>
          <button 
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white text-[#0F4C81] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <KanbanIcon /> Funil (Kanban)
          </button>
        </div>
      </div>

      {/* ==========================================
          VISÃO TABELA
          ========================================== */}
      {viewMode === 'tabela' && (
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
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div title={`Temperatura: ${cliente.status}`} className={`w-2.5 h-2.5 rounded-full ${getStatusColor(cliente.status)}`} />
                        <span className="font-semibold text-slate-800">{cliente.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-800">{cliente.email}</div>
                      <div className="text-xs text-slate-400">{cliente.telefone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                        {cliente.estagio}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex flex-wrap gap-1">
                      {cliente.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[10px] font-bold uppercase">
                          {tag}
                        </span>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-[#0F4C81] hover:text-[#0c3e6a] text-xs font-semibold">
                        Ver Dossiê
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
          VISÃO KANBAN (FUNIL)
          ========================================== */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar items-start">
          {funil.map(estagio => {
            const clientesNaColuna = clientesFiltrados.filter(c => c.estagio === estagio);
            
            return (
              <div key={estagio} className="bg-slate-50 rounded-xl border border-slate-200 w-80 shrink-0 flex flex-col max-h-[70vh]">
                <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-100 rounded-t-xl">
                  <h3 className="font-semibold text-slate-700 text-sm">{estagio}</h3>
                  <span className="bg-white px-2 py-0.5 rounded text-xs font-bold text-slate-500 border border-slate-200">
                    {clientesNaColuna.length}
                  </span>
                </div>
                
                <div className="p-3 overflow-y-auto flex-1 space-y-3">
                  {clientesNaColuna.map(cliente => (
                    <div key={cliente.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                          <div title={`Temperatura: ${cliente.status}`} className={`w-2 h-2 rounded-full ${getStatusColor(cliente.status)}`} />
                          {cliente.nome}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">{cliente.telefone}</p>
                      <div className="flex flex-wrap gap-1">
                        {cliente.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {clientesNaColuna.length === 0 && (
                    <div className="border-2 border-dashed border-slate-200 rounded-lg h-24 flex items-center justify-center text-slate-400 text-xs">
                      Vazio
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
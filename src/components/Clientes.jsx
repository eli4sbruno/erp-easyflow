import React, { useState } from 'react';
import ModalNovoCliente from './ModalNovoCliente';
import ModalPerfilCliente from './ModalPerfilCliente'; // <-- Importamos o novo modal

const SearchIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;

export default function Clientes() {
  const [clienteAtivo, setClienteAtivo] = useState(null);
  const [isNovoClienteOpen, setIsNovoClienteOpen] = useState(false);

  const clientes = [
    { id: 1, nome: 'Diego Fernandes', email: 'diego@rocket.com', tel: '(34) 99999-9999', ultimaCompra: '09/07/2026' },
    { id: 2, nome: 'Clínica Sorriso', email: 'contato@sorriso.com', tel: '(34) 98888-8888', ultimaCompra: '09/07/2026' },
  ];

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0F4C81]">Gestão de Clientes</h2>
          <p className="text-sm text-slate-500">Base completa de contatos e histórico de relacionamento.</p>
        </div>
        <button 
          onClick={() => setIsNovoClienteOpen(true)}
          className="bg-[#0F4C81] hover:bg-[#0a3863] text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-shadow shadow-sm"
        >
          + Novo Cliente
        </button>
      </div>

      {/* Busca */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><SearchIcon /></div>
          <input type="text" placeholder="Pesquisar clientes..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B9C85]" />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Nome / Razão Social</th>
              <th className="px-6 py-4">Contato</th>
              <th className="px-6 py-4">Telefone</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clientes.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">{c.nome}</td>
                <td className="px-6 py-4">{c.email}</td>
                <td className="px-6 py-4">{c.tel}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => setClienteAtivo(c)} className="text-[#0F4C81] hover:underline font-medium text-xs">
                    Ver Perfil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modais Isolados */}
      <ModalPerfilCliente 
        isOpen={!!clienteAtivo} // Transforma o objeto num booleano (true se existir cliente, false se null)
        cliente={clienteAtivo} 
        onClose={() => setClienteAtivo(null)} 
      />

      <ModalNovoCliente 
        isOpen={isNovoClienteOpen} 
        onClose={() => setIsNovoClienteOpen(false)} 
      />
    </div>
  );
}
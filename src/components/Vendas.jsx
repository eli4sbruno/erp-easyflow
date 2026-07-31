import React, { useState } from 'react';
import ModalPedidoVenda from './ModalPedidoVenda';
import ModalPagamento from './ModalPagamento'; // <-- Importamos o Checkout!

// Ícones
const SearchIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;
const FilterIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>;
const EditIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>;

export default function Vendas() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  
  // Estados para o Checkout Financeiro
  const [showCheckout, setShowCheckout] = useState(false);
  const [dadosCheckout, setDadosCheckout] = useState(null);

  const [pedidos] = useState([
    { id: 'PED-1042', data: '09/07/2026', cliente: 'Diego Fernandes', servico: 'Cartões de Visita...', valor: 120.00, status: 'Em Produção', responsavel: 'Digital Gráfica' },
    { id: 'PED-1043', data: '09/07/2026', cliente: 'Clínica Sorriso', servico: 'Identidade Visual...', valor: 1500.00, status: 'Aguardando Aprovação', responsavel: 'Elias Bruno' },
    { id: 'PED-1044', data: '08/07/2026', cliente: 'Restaurante Sabor', servico: 'Banners 90x120cm...', valor: 180.00, status: 'Orçamento', responsavel: 'Guilherme' },
    { id: 'PED-1045', data: '07/07/2026', cliente: 'Tech Solutions', servico: 'Adesivos Vinil...', valor: 250.00, status: 'Pronto', responsavel: 'Digital Gráfica' },
  ]);

  const formatMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Orçamento': return 'bg-slate-100 text-slate-700';
      case 'Aguardando Aprovação': return 'bg-amber-100 text-amber-800';
      case 'Em Produção': return 'bg-blue-100 text-blue-800';
      case 'Pronto': return 'bg-indigo-100 text-indigo-800';
      case 'Entregue': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
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

  // Esta função é chamada quando o Pedido é salvo com sucesso
  const handlePedidoSalvo = (dadosFaturamento) => {
    // Se há dados de faturamento (Valor > 0), abre o checkout
    if (dadosFaturamento && dadosFaturamento.valor > 0) {
      setDadosCheckout(dadosFaturamento);
      setShowCheckout(true);
    }
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in relative z-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#0F4C81]">Gestão de Vendas</h2>
            <p className="text-sm text-slate-500">Acompanhamento de orçamentos, pedidos e clientes.</p>
          </div>
          <button 
            onClick={abrirNovoPedido}
            className="bg-[#0F4C81] hover:bg-[#0a3863] text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <span>+ Novo Pedido</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-amber-400">
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-1">Aguardando Aprovação</h3>
            <div className="text-2xl font-bold text-slate-800">03</div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-[#0F4C81]">
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-1">Orçamentos Abertos</h3>
            <div className="text-2xl font-bold text-slate-800">R$ 1.850,00</div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-[#1B9C85]">
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-1">Vendas Concluídas (Mês)</h3>
            <div className="text-2xl font-bold text-slate-800">R$ 4.230,00</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <SearchIcon />
            </div>
            <input type="text" placeholder="Buscar por cliente, pedido ou serviço..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B9C85] text-sm" />
          </div>
          <button className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors">
            <FilterIcon /> Filtros
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Ref</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Resumo dos Itens</th>
                  <th className="px-6 py-4">Responsável</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pedidos.map((pedido, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#0F4C81]">
                      <button onClick={() => abrirEdicaoPedido(pedido)} className="hover:underline">{pedido.id}</button>
                    </td>
                    <td className="px-6 py-4 text-xs">{pedido.data}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{pedido.cliente}</td>
                    <td className="px-6 py-4 text-slate-500 truncate max-w-[180px]" title={pedido.servico}>{pedido.servico}</td>
                    <td className="px-6 py-4 text-slate-600 text-xs font-medium">{pedido.responsavel}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{formatMoeda(pedido.valor)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${getStatusColor(pedido.status)}`}>{pedido.status}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => abrirEdicaoPedido(pedido)}
                        className="text-slate-400 hover:text-[#0F4C81] p-1 bg-white border border-transparent hover:border-slate-200 rounded transition-all"
                        title="Ver / Editar Pedido"
                      >
                        <EditIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ModalPedidoVenda 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handlePedidoSalvo} // Adicionado o retorno de sucesso
        pedidoSelecionado={pedidoSelecionado} 
      />

      {/* NOVO: Modal de Checkout, ativado logo a seguir a salvar um Pedido */}
      <ModalPagamento 
        isOpen={showCheckout}
        dadosIniciais={dadosCheckout}
        onClose={() => setShowCheckout(false)}
        onSuccess={() => {
          alert('Faturamento registado com sucesso no Financeiro!');
          setShowCheckout(false);
        }}
      />
    </>
  );
}
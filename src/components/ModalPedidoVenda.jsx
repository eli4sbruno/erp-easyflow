import React, { useState } from 'react';
import Portal from './Portal';
import ModalNovoCliente from './ModalNovoCliente';

const CloseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const UserAddIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>;
const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;

export default function ModalPedidoVenda({ isOpen, onClose, onSuccess, pedidoSelecionado }) {
  const [isNovoClienteOpen, setIsNovoClienteOpen] = useState(false);
  const dataHoje = new Date().toISOString().split('T')[0];

  const [cliente, setCliente] = useState('');
  const [itensPedido, setItensPedido] = useState([
    { id: 1, descricao: 'Cartões de Visita 1000un', qtd: 1, precoUnitario: 120.00 },
  ]);

  const formatMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  const totalCarrinho = itensPedido.reduce((acc, item) => acc + (item.qtd * item.precoUnitario), 0);

  const handleSalvar = () => {
    // Num cenário real com Supabase, aqui você faria o insert na tabela de pedidos
    const valorFinal = pedidoSelecionado ? pedidoSelecionado.valor : totalCarrinho;
    const nomeCliente = pedidoSelecionado ? pedidoSelecionado.cliente : (cliente || 'Cliente Balcão');
    
    onClose();

    // Passa os dados para o Vendas.jsx abrir o Checkout!
    if (onSuccess && valorFinal > 0) {
      onSuccess({
        cliente: nomeCliente,
        valor: valorFinal,
        origem: 'Vendas',
        ref: pedidoSelecionado ? pedidoSelecionado.id : `PED-${Math.floor(Math.random() * 10000)}`
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
          
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
            <h3 className="text-lg font-bold text-[#0F4C81]">
              {pedidoSelecionado ? `Editar Pedido: ${pedidoSelecionado.id}` : 'Registrar Novo Pedido'}
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50">
              <CloseIcon />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            <div className="space-y-8">
              
              {/* Seção 1: Cliente */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">1</span> Dados do Cliente
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Buscar Cliente *</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        defaultValue={pedidoSelecionado ? pedidoSelecionado.cliente : cliente}
                        onChange={(e) => setCliente(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1B9C85] focus:ring-1 focus:ring-[#1B9C85]" 
                        placeholder="Nome da empresa ou cliente..." 
                      />
                      <button onClick={() => setIsNovoClienteOpen(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 border border-slate-200">
                        <UserAddIcon /> Novo
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Telefone / WhatsApp</label>
                    <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 cursor-not-allowed" placeholder="(00) 00000-0000" disabled />
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Seção 2: Itens do Pedido */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">2</span> Itens do Pedido & Detalhes
                </h4>
                
                <div className="flex flex-col sm:flex-row gap-2 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Buscar produto ou digitar serviço</label>
                    <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#1B9C85]" placeholder="Ex: Banner 90x120 Lona Brilho" />
                  </div>
                  <div className="w-full sm:w-24">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Qtd</label>
                    <input type="number" defaultValue="1" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#1B9C85]" />
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Valor Unit. (R$)</label>
                    <input type="number" placeholder="0,00" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#1B9C85]" />
                  </div>
                  <button className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 h-[38px]">
                    <PlusIcon /> Add
                  </button>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Descrição do Item</th>
                        <th className="px-4 py-3 text-center">Qtd</th>
                        <th className="px-4 py-3 text-right">Unitário</th>
                        <th className="px-4 py-3 text-right">Subtotal</th>
                        <th className="px-4 py-3 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {itensPedido.map((item, index) => (
                        <tr key={index} className="bg-white hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-800">{item.descricao}</td>
                          <td className="px-4 py-3 text-center">{item.qtd}</td>
                          <td className="px-4 py-3 text-right">{formatMoeda(item.precoUnitario)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-[#0F4C81]">{formatMoeda(item.qtd * item.precoUnitario)}</td>
                          <td className="px-4 py-3 text-center">
                            <button className="text-slate-400 hover:text-red-500 p-1" title="Remover Item"><TrashIcon /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Vendedor (Atendimento)</label>
                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1B9C85]">
                      <option value="">Selecione...</option>
                      <option value="elias">Elias Bruno</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Responsável pela Execução / Setor</label>
                    <select 
                      defaultValue={pedidoSelecionado ? (pedidoSelecionado.responsavel === 'Digital Gráfica' ? 'grafica' : 'elias') : ''}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1B9C85]"
                    >
                      <option value="">Selecione...</option>
                      <option value="elias">Elias Bruno (Design)</option>
                      <option value="grafica">Digital Gráfica (Produção)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Observações do Pedido</label>
                  <textarea 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1B9C85] custom-scrollbar" 
                    rows="3" 
                    placeholder="Detalhes..."
                    defaultValue={pedidoSelecionado ? pedidoSelecionado.observacoes : ''}
                  ></textarea>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Seção 3: Valores e Datas */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">3</span> Fechamento e Prazos
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Data do Pedido *</label>
                    <input 
                      type="date" 
                      defaultValue={pedidoSelecionado ? pedidoSelecionado.data.split('/').reverse().join('-') : dataHoje} 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1B9C85] bg-white text-slate-700" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Previsão de Entrega</label>
                    <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1B9C85] bg-white text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Status do Pedido</label>
                    <select 
                      defaultValue={pedidoSelecionado ? pedidoSelecionado.status : 'Orçamento'}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#1B9C85] bg-white"
                    >
                      <option value="Orçamento">Orçamento</option>
                      <option value="Aguardando Aprovação">Aguardando Aprovação</option>
                      <option value="Em Produção">Em Produção</option>
                      <option value="Pronto">Pronto</option>
                      <option value="Entregue">Entregue</option>
                    </select>
                  </div>
                </div>

                {/* Exibição do Valor Final */}
                <div className="flex justify-end mt-4">
                  <div className="bg-[#0F4C81] text-white p-3 rounded-lg flex justify-between items-center shadow-inner w-full md:w-1/2">
                    <span className="font-semibold">Valor Total (Ir para Checkout):</span>
                    <span className="text-xl font-bold">R$ {formatMoeda(pedidoSelecionado ? pedidoSelecionado.valor : totalCarrinho)}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
            <button onClick={onClose} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-white transition-colors">
              Cancelar
            </button>
            <button onClick={handleSalvar} className="px-6 py-2 bg-[#1B9C85] hover:bg-[#15806c] text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
              Salvar Pedido
            </button>
          </div>

        </div>
      </div>
      
      <ModalNovoCliente isOpen={isNovoClienteOpen} onClose={() => setIsNovoClienteOpen(false)} />
    </Portal>
  );
}
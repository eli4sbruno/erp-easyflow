import React, { useState, useEffect } from 'react';
import Portal from "@/modules/portal/Portal";
import ModalNovoCliente from "@/modules/clientes/components/ModalNovoCliente";
import ModalPagamento from "@/modules/financeiro/components/ModalPagamento";
import ModalNovaOS from "@/modules/producao/components/ModalNovaOS";
import { supabase } from "@/supabaseClient";

const CloseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const UserAddIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>;
const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const OSIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>;

export default function ModalPedidoVenda({ isOpen, onClose, onSuccess, pedidoSelecionado }) {
  // Controle de Modais Integrados
  const [isNovoClienteOpen, setIsNovoClienteOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOS, setShowOS] = useState(false);

  const dataHoje = new Date().toISOString().split('T')[0];

  // Estados do Cliente (Autocomplete)
  const [clienteBusca, setClienteBusca] = useState('');
  const [clientesSugeridos, setClientesSugeridos] = useState([]);
  const [showSugestoes, setShowSugestoes] = useState(false);
  const [clienteSelecionadoObj, setClienteSelecionadoObj] = useState(null);

  // Estados do Formulário do Pedido
  const [itensPedido, setItensPedido] = useState([]);
  const [vendedor, setVendedor] = useState('Elias Bruno');
  const [responsavel, setResponsavel] = useState('Digital Gráfica');
  const [observacoes, setObservacoes] = useState('');
  const [dataPedido, setDataPedido] = useState(dataHoje);
  const [previsaoEntrega, setPrevisaoEntrega] = useState('');
  const [status, setStatus] = useState('Orçamento');

  // Estados do Novo Item do Carrinho
  const [novoItemDesc, setNovoItemDesc] = useState('');
  const [novoItemQtd, setNovoItemQtd] = useState(1);
  const [novoItemValor, setNovoItemValor] = useState('');

  // Carrega os dados se for edição
  useEffect(() => {
    if (pedidoSelecionado) {
      // Ajuste: Puxar o nome do cliente e o ID caso venha de um JOIN do banco
      const nomeCliente = pedidoSelecionado.clientes?.nome_razao || pedidoSelecionado.cliente || '';
      setClienteBusca(nomeCliente);
      
      // Reconstrói o objeto do cliente para a validação do ID passar ao editar
      if (pedidoSelecionado.cliente_id) {
        setClienteSelecionadoObj({
          id: pedidoSelecionado.cliente_id,
          nome_razao: nomeCliente,
          telefone: pedidoSelecionado.clientes?.telefone || ''
        });
      }

      setItensPedido(pedidoSelecionado.itens || []);
      setStatus(pedidoSelecionado.status || 'Orçamento');
      setObservacoes(pedidoSelecionado.observacoes || '');
      setResponsavel(pedidoSelecionado.responsavel || 'Digital Gráfica');
    } else {
      resetForm();
    }
  }, [pedidoSelecionado, isOpen]);

  const resetForm = () => {
    setClienteBusca('');
    setClienteSelecionadoObj(null);
    setItensPedido([]);
    setStatus('Orçamento');
    setObservacoes('');
    setNovoItemDesc('');
    setNovoItemValor('');
    setNovoItemQtd(1);
  };

  // BUSCA INTELIGENTE DE CLIENTES NO BANCO
  const buscarClientes = async (termo) => {
    setClienteBusca(termo);
    setClienteSelecionadoObj(null);

    if (termo.length < 2) {
      setClientesSugeridos([]);
      setShowSugestoes(false);
      return;
    }

    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .ilike('nome_razao', `%${termo}%`)
      .limit(5);

    if (!error && data) {
      setClientesSugeridos(data);
      setShowSugestoes(true);
    }
  };

  const selecionarCliente = (cliente) => {
    setClienteBusca(cliente.nome_razao);
    setClienteSelecionadoObj(cliente);
    setShowSugestoes(false);
  };

  // LÓGICA DO CARRINHO DE ITENS
  const formatMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  const totalCarrinho = itensPedido.reduce((acc, item) => acc + (item.qtd * item.precoUnitario), 0);

  const adicionarItem = () => {
    if (!novoItemDesc || !novoItemValor) return alert('Preencha a descrição e o valor do item.');
    const novoItem = {
      id: Date.now(),
      descricao: novoItemDesc,
      qtd: Number(novoItemQtd),
      precoUnitario: Number(novoItemValor.toString().replace(',', '.'))
    };
    setItensPedido([...itensPedido, novoItem]);
    setNovoItemDesc('');
    setNovoItemValor('');
    setNovoItemQtd(1);
  };

  const removerItem = (id) => {
    setItensPedido(itensPedido.filter(item => item.id !== id));
  };

  // SALVAR NO SUPABASE
  const handleSalvar = async (acaoSecundaria = null) => {
    if (!clienteSelecionadoObj || !clienteSelecionadoObj.id) {
      return alert('Por favor, busque e selecione um cliente da lista sugerida para vincular o cadastro.');
    }
    
    const dadosPedido = {
      cliente_id: clienteSelecionadoObj.id,
      valor_total: totalCarrinho,
      status: status,
      responsavel: responsavel,
      observacoes: observacoes,
      data: dataPedido,
      servico: itensPedido.map(i => `${i.qtd}x ${i.descricao}`).join(' | '),
    };

    let resultError;

    if (pedidoSelecionado?.id) {
      // Atualizar pedido existente
      const { error } = await supabase.from('vendas').update(dadosPedido).eq('id', pedidoSelecionado.id);
      resultError = error;
    } else {
      // Criar novo pedido
      const { error } = await supabase.from('vendas').insert([dadosPedido]);
      resultError = error;
    }

    if (resultError) {
      console.error('Erro ao salvar pedido:', resultError);
      alert(`Erro ao salvar no banco de dados: ${resultError.message}`);
      return;
    }

    // Se houver uma ação secundária (Abrir Modal OS ou Financeiro), não fecha o form principal ainda
    if (acaoSecundaria === 'checkout') {
      setShowCheckout(true);
    } else if (acaoSecundaria === 'os') {
      setShowOS(true);
    } else {
      // Salvar simples
      onSuccess && onSuccess();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      {/* Container Principal do Modal de Vendas */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9990] flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in" onClick={() => setShowSugestoes(false)}>
          
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
            <h3 className="text-lg font-bold text-[#0F4C81]">
              {pedidoSelecionado?.id ? `Editar Pedido: ${pedidoSelecionado.id}` : 'Registrar Novo Pedido'}
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50">
              <CloseIcon />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            <div className="space-y-8">
              
              {/* Seção 1: Cliente Autocomplete */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">1</span> Dados do Cliente
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 relative">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Buscar Cliente *</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input 
                          type="text" 
                          value={clienteBusca}
                          onChange={(e) => buscarClientes(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1B9C85] focus:ring-1 focus:ring-[#1B9C85]" 
                          placeholder="Digite o nome do cliente..." 
                        />
                        {showSugestoes && clientesSugeridos.length > 0 && (
                          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                            {clientesSugeridos.map(c => (
                              <div key={c.id} onClick={() => selecionarCliente(c)} className="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0">
                                <div className="text-sm font-bold text-slate-800">{c.nome_razao}</div>
                                <div className="text-xs text-slate-500">{c.telefone || 'Sem telefone'} - {c.email || ''}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button onClick={() => setIsNovoClienteOpen(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 border border-slate-200 shrink-0">
                        <UserAddIcon /> Novo
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Telefone / WhatsApp</label>
                    <input 
                      type="text" 
                      value={clienteSelecionadoObj?.telefone || ''} 
                      className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm ${clienteSelecionadoObj ? 'bg-white text-slate-700 font-medium' : 'bg-slate-50 cursor-not-allowed'}`} 
                      placeholder="(00) 00000-0000" 
                      readOnly 
                    />
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Seção 2: Itens Reais do Pedido */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">2</span> Itens do Pedido & Detalhes
                </h4>
                
                <div className="flex flex-col sm:flex-row gap-2 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Produto ou Serviço</label>
                    <input type="text" value={novoItemDesc} onChange={(e) => setNovoItemDesc(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#1B9C85]" placeholder="Ex: Banner 90x120 Lona Brilho" />
                  </div>
                  <div className="w-full sm:w-24">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Qtd</label>
                    <input type="number" min="1" value={novoItemQtd} onChange={(e) => setNovoItemQtd(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#1B9C85]" />
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Valor Unit. (R$)</label>
                    <input type="number" step="0.01" value={novoItemValor} onChange={(e) => setNovoItemValor(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#1B9C85]" />
                  </div>
                  <button onClick={adicionarItem} className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 h-[38px]">
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
                      {itensPedido.length === 0 && (
                        <tr><td colSpan="5" className="px-4 py-6 text-center text-slate-400 text-sm">Nenhum item adicionado ao pedido.</td></tr>
                      )}
                      {itensPedido.map((item) => (
                        <tr key={item.id} className="bg-white hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-800">{item.descricao}</td>
                          <td className="px-4 py-3 text-center">{item.qtd}</td>
                          <td className="px-4 py-3 text-right">{formatMoeda(item.precoUnitario)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-[#0F4C81]">{formatMoeda(item.qtd * item.precoUnitario)}</td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => removerItem(item.id)} className="text-slate-400 hover:text-red-500 p-1" title="Remover Item"><TrashIcon /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Vendedor (Atendimento)</label>
                    <select value={vendedor} onChange={(e) => setVendedor(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1B9C85]">
                      <option value="Elias Bruno">Elias Bruno (Elias Bruno | Branding & Design)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Responsável pela Execução / Setor</label>
                    <select value={responsavel} onChange={(e) => setResponsavel(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1B9C85]">
                      <option value="Elias Bruno">Design / Estratégia (Elias Bruno)</option>
                      <option value="Digital Gráfica">Produção Gráfica (Digital Gráfica)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Observações do Pedido</label>
                  <textarea 
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1B9C85] custom-scrollbar" 
                    rows="3" 
                    placeholder="Ex: Cliente vai retirar na gráfica..."
                  ></textarea>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Seção 3: Valores, Datas e Botões Conectados */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">3</span> Fechamento e Conexões
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Data do Pedido *</label>
                    <input type="date" value={dataPedido} onChange={(e) => setDataPedido(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1B9C85] bg-white text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Previsão de Entrega</label>
                    <input type="date" value={previsaoEntrega} onChange={(e) => setPrevisaoEntrega(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1B9C85] bg-white text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Status do Pedido</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#1B9C85] bg-white">
                      <option value="Orçamento">Orçamento</option>
                      <option value="Aguardando Aprovação">Aguardando Aprovação</option>
                      <option value="Em Produção">Em Produção</option>
                      <option value="Pronto">Pronto</option>
                      <option value="Entregue">Entregue</option>
                    </select>
                  </div>
                </div>

                {/* BOTÕES INTELIGENTES (OS e FINANCEIRO) */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-inner">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button 
                      onClick={() => handleSalvar('os')}
                      className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 hover:text-[#0F4C81] hover:border-[#0F4C81] rounded-lg text-sm font-bold transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                      <OSIcon /> Gerar O.S (Produção)
                    </button>
                  </div>

                  <button 
                    onClick={() => handleSalvar('checkout')}
                    className="w-full sm:w-auto bg-[#0F4C81] hover:bg-[#0a3863] text-white px-6 py-2.5 rounded-lg flex justify-between items-center gap-6 shadow-md transition-all active:scale-95"
                  >
                    <span className="font-semibold text-sm">Ir para Checkout (Receber):</span>
                    <span className="text-lg font-bold">R$ {formatMoeda(totalCarrinho)}</span>
                  </button>
                </div>

              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
            <span className="text-xs text-slate-400">As conexões (O.S/Financeiro) salvam o pedido atual automaticamente.</span>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-white transition-colors">
                Fechar
              </button>
              <button onClick={() => handleSalvar(null)} className="px-6 py-2 bg-[#1B9C85] hover:bg-[#15806c] text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                Apenas Salvar Pedido
              </button>
            </div>
          </div>

        </div>
      </div>
      
      {/* RENDERIZAÇÃO DOS MODAIS CONECTADOS COM Z-INDEX SUPERIOR */}
      <div className="relative z-[10000]">
        <ModalNovoCliente isOpen={isNovoClienteOpen} onClose={() => setIsNovoClienteOpen(false)} />
        
        {/* Passa os dados pré-preenchidos para facilitar a criação no Financeiro e O.S */}
        <ModalPagamento 
          isOpen={showCheckout} 
          dadosIniciais={{ cliente: clienteBusca, valor: totalCarrinho, descricao: `Faturamento Ref Pedido Vendas` }}
          onClose={() => { setShowCheckout(false); onClose(); onSuccess && onSuccess(); }} 
        />
        
        <ModalNovaOS 
          isOpen={showOS} 
          dadosIniciais={{ solicitante_nome: clienteBusca, tipo_op: responsavel === 'Digital Gráfica' ? 'Externa' : 'Interna', observacoes: itensPedido.map(i => `${i.qtd}x ${i.descricao}`).join(' | ') }}
          onClose={() => { setShowOS(false); onClose(); onSuccess && onSuccess(); }} 
        />
      </div>

    </Portal>
  );
}
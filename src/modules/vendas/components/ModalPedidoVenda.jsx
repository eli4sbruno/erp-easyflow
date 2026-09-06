import React, { useState, useEffect } from 'react';
import ModalNovoCliente from "@/modules/clientes/components/ModalNovoCliente";
import ModalPagamento from "@/modules/financeiro/components/ModalPagamento";
import ModalNovaOS from "@/modules/producao/components/ModalNovaOS";
import { supabase } from "@/supabaseClient";

// --- Ícones ---
const CloseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const TagIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>;
const SearchIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;
const OSIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>;
const UserAddIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>;

// --- Helper Functions ---
const formatMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
const parseMoedaToNumber = (v) => Number(v.toString().replace(/\./g, '').replace(',', '.'));

// ALIAS NAS PROPS PARA EVITAR CONFLITO DE NOME DE FUNÇÃO
export default function ModalPedidoVenda({ isOpen, onClose: propOnClose, onSuccess: propOnSuccess, pedidoSelecionado }) {
  const [etapaAtual, setEtapaAtual] = useState(1);

  const [isNovoClienteOpen, setIsNovoClienteOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOS, setShowOS] = useState(false);
  const [vendaGerada, setVendaGerada] = useState(null);
  
  // Memória do Fluxo (Se deve cobrar depois da O.S)
  const [fluxoPosOS, setFluxoPosOS] = useState(null); 

  const dataHoje = new Date().toISOString().split('T')[0];

  const [itensPedido, setItensPedido] = useState([]);
  const [produtoBusca, setProdutoBusca] = useState('');
  const [produtosSugeridos, setProdutosSugeridos] = useState([]);
  const [showSugestoesProduto, setShowSugestoesProduto] = useState(false);
  const [novoItemDesc, setNovoItemDesc] = useState('');
  const [novoItemQtd, setNovoItemQtd] = useState(1);
  const [novoItemValor, setNovoItemValor] = useState('');
  const [novoItemProdutoId, setNovoItemProdutoId] = useState(null);
  const [gerarOSVinculada, setGerarOSVinculada] = useState(false);

  const [clienteBusca, setClienteBusca] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState(''); 
  const [clienteEndereco, setClienteEndereco] = useState(''); 
  const [clientesSugeridos, setClientesSugeridos] = useState([]);
  const [showSugestoes, setShowSugestoes] = useState(false);
  const [clienteSelecionadoObj, setClienteSelecionadoObj] = useState(null);

  const [desconto, setDesconto] = useState('');
  const [status, setStatus] = useState('Em Produção');
  const [vendedor, setVendedor] = useState('Elias Bruno');
  const [condicaoPagamento, setCondicaoPagamento] = useState('À Vista');
  const [observacoes, setObservacoes] = useState('');
  const [dataPedido, setDataPedido] = useState(dataHoje);

  const subtotalCarrinho = itensPedido.reduce((acc, item) => acc + (item.qtd * item.precoUnitario), 0);
  const valorDesconto = parseMoedaToNumber(desconto || 0);
  
  const totalCalculado = subtotalCarrinho - (isNaN(valorDesconto) ? 0 : valorDesconto);
  const totalCarrinho = Math.max(0, totalCalculado);

  useEffect(() => {
    if (pedidoSelecionado) {
      setEtapaAtual(1);
      setItensPedido(pedidoSelecionado.itens || []); 
      setClienteBusca(pedidoSelecionado.clientes?.nome_razao || pedidoSelecionado.cliente || '');
      setClienteTelefone(pedidoSelecionado.clientes?.telefone || '');
      if (pedidoSelecionado.cliente_id) setClienteSelecionadoObj({ id: pedidoSelecionado.cliente_id });
      setStatus(pedidoSelecionado.status || 'Orçamento');
      setDesconto(pedidoSelecionado.desconto || '');
      setVendaGerada(pedidoSelecionado);
    } else {
      resetForm();
    }
  }, [pedidoSelecionado, isOpen]);

  const resetForm = () => {
    setEtapaAtual(1);
    setItensPedido([]); setProdutoBusca(''); setNovoItemDesc(''); setNovoItemValor(''); setNovoItemQtd(1); setNovoItemProdutoId(null);
    setClienteBusca(''); setClienteTelefone(''); setClienteEndereco(''); setClienteSelecionadoObj(null);
    setStatus('Em Produção'); setDesconto(''); setObservacoes(''); setGerarOSVinculada(false);
    setVendaGerada(null);
    setFluxoPosOS(null);
  };

  const fecharSugestoes = () => {
    setShowSugestoes(false);
    setShowSugestoesProduto(false);
  };

  const buscarProdutos = async (termo) => {
    setProdutoBusca(termo); setNovoItemDesc(termo); setNovoItemProdutoId(null);
    if (termo.length < 2) { setProdutosSugeridos([]); setShowSugestoesProduto(false); return; }
    
    const { data } = await supabase
      .from('produtos')
      .select('id, nome, preco_venda, unidade_medida')
      .eq('ativo', true) 
      .ilike('nome', `%${termo}%`)
      .limit(5);
    
    if (data) { setProdutosSugeridos(data); setShowSugestoesProduto(true); }
  };

  const selecionarProduto = (produto) => {
    setProdutoBusca(produto.nome); setNovoItemDesc(produto.nome);
    setNovoItemValor(produto.preco_venda ? produto.preco_venda.toString() : '');
    document.getElementById('input-qtd')?.focus(); 
  };

  const adicionarItem = () => {
    if (!novoItemDesc || !novoItemValor) return alert('Preencha descrição e valor.');
    const valorTratado = Number(novoItemValor.toString().replace(/\./g, '').replace(',', '.'));
    if (isNaN(valorTratado)) return alert('Valor inválido.');

    setItensPedido([...itensPedido, {
      id: Date.now(),
      produto_id: novoItemProdutoId,
      descricao: novoItemDesc,
      qtd: Number(novoItemQtd),
      precoUnitario: valorTratado
    }]);
    
    setNovoItemDesc(''); setProdutoBusca(''); setNovoItemValor(''); setNovoItemQtd(1); setNovoItemProdutoId(null);
    setShowSugestoesProduto(false);
    setProdutosSugeridos([]);
  };

  const removerItem = (id) => setItensPedido(itensPedido.filter(item => item.id !== id));

  const buscarClientes = async (termo) => {
    setClienteBusca(termo);
    if (clienteSelecionadoObj && termo !== clienteSelecionadoObj?.nome_razao) setClienteSelecionadoObj(null);
    if (termo.length < 2) { setClientesSugeridos([]); setShowSugestoes(false); return; }
    const { data } = await supabase.from('clientes').select('id, nome_razao, telefone, logradouro').ilike('nome_razao', `%${termo}%`).limit(5);
    if (data) { setClientesSugeridos(data); setShowSugestoes(true); }
  };

  const selecionarCliente = (cliente) => {
    setClienteBusca(cliente.nome_razao); setClienteTelefone(cliente.telefone || ''); setClienteEndereco(cliente.logradouro || '');
    setClienteSelecionadoObj(cliente); setShowSugestoes(false);
  };

  const proximaEtapa = () => {
    if (etapaAtual === 1 && itensPedido.length === 0) return alert("Adicione pelo menos um item ao pedido.");
    if (etapaAtual === 2 && !clienteBusca.trim()) return alert("O nome do cliente é obrigatório.");
    setEtapaAtual(etapaAtual + 1);
  };

  const voltarEtapa = () => setEtapaAtual(etapaAtual - 1);

  const handleFinalizar = async (acao = 'salvar') => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Erro: Sessão não encontrada. Faça login novamente.");
      return;
    }

    let clienteId = clienteSelecionadoObj?.id;

    if (!clienteId) {
      const { data: novoCli } = await supabase.from('clientes').insert([{ 
        nome_razao: clienteBusca, telefone: clienteTelefone, logradouro: clienteEndereco, estagio_funil: 'Prospecção', status_temperatura: 'Frio' 
      }]).select('id').single();
      if(novoCli) clienteId = novoCli.id;
    }

    const dadosPedido = {
      user_id: user.id,
      cliente_id: clienteId,
      valor_total: totalCarrinho,
      desconto: isNaN(valorDesconto) ? 0 : valorDesconto,
      condicao_pagamento: condicaoPagamento,
      status: status,
      vendedor: vendedor,
      observacoes: observacoes,
      data: dataPedido,
      servico: itensPedido.map(i => `${i.qtd}x ${i.descricao}`).join(' | '),
    };

    const currentId = vendaGerada?.id || pedidoSelecionado?.id;
    let vendaSalva;

    if (currentId) {
      const { data, error } = await supabase.from('vendas').update(dadosPedido).eq('id', currentId).select().single();
      if (error) return alert(`Erro do Banco: ${error.message}`);
      vendaSalva = data;
      await supabase.from('itens_venda').delete().eq('venda_id', currentId);
    } else {
      const { data, error } = await supabase.from('vendas').insert([dadosPedido]).select().single();
      if (error) return alert(`Erro do Banco: ${error.message}`);
      vendaSalva = data;
    }

    setVendaGerada(vendaSalva);

    if (itensPedido.length > 0) {
      const payloadItens = itensPedido.map(item => ({
        venda_id: vendaSalva.id,
        produto_id: item.produto_id || null, 
        descricao: item.descricao, 
        quantidade: item.qtd,
        preco_unitario: item.precoUnitario 
      }));
      await supabase.from('itens_venda').insert(payloadItens);
    }

    // <-- NOVO FLUXO DE TRANSIÇÃO -->
    if (gerarOSVinculada) {
      setFluxoPosOS(acao); // Guarda na memória se foi o botão de Checkout ou Salvar
      setShowOS(true);     // Intercepta e chama a O.S
    } else if (acao === 'checkout') {
      setShowCheckout(true);
    } else {
      propOnSuccess && propOnSuccess();
      propOnClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9990] flex items-center justify-center p-4 sm:p-6" onClick={fecharSugestoes}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
          
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <h3 className="text-xl font-bold text-[#0F4C81]">
              {pedidoSelecionado?.id ? `Pedido #${pedidoSelecionado.id}` : 'Nova Venda'}
            </h3>
            
            <div className="hidden sm:flex items-center gap-2">
              <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${etapaAtual >= 1 ? 'bg-[#1B9C85] text-white' : 'bg-slate-100 text-slate-400'}`}>1</span>
              <div className={`w-8 h-1 rounded ${etapaAtual >= 2 ? 'bg-[#1B9C85]' : 'bg-slate-100'}`}></div>
              <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${etapaAtual >= 2 ? 'bg-[#1B9C85] text-white' : 'bg-slate-100 text-slate-400'}`}>2</span>
              <div className={`w-8 h-1 rounded ${etapaAtual >= 3 ? 'bg-[#1B9C85]' : 'bg-slate-100'}`}></div>
              <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${etapaAtual >= 3 ? 'bg-[#1B9C85] text-white' : 'bg-slate-100 text-slate-400'}`}>3</span>
            </div>

            <button onClick={propOnClose} className="text-slate-400 hover:text-slate-600">
              <CloseIcon />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
            
            {etapaAtual === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-end mb-2">
                  <h4 className="text-lg font-bold text-slate-800">Itens do Pedido</h4>
                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 shadow-sm transition-colors">
                    <input type="checkbox" checked={gerarOSVinculada} onChange={(e) => setGerarOSVinculada(e.target.checked)} className="rounded text-[#0F4C81] focus:ring-[#0F4C81] w-4 h-4" />
                    <span className="text-sm font-semibold text-[#0F4C81] select-none flex items-center gap-1"><OSIcon /> Exige Ordem de Serviço (O.S)</span>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><TagIcon /> Buscar Produto/Serviço</label>
                    <input type="text" value={produtoBusca} onChange={(e) => buscarProdutos(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && adicionarItem()} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1B9C85]" placeholder="Digite para buscar do estoque ou criar novo..." />
                    
                    {showSugestoesProduto && produtosSugeridos.length > 0 && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                        {produtosSugeridos.map(p => (
                          <div key={p.id} onClick={() => selecionarProduto(p)} className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-50 flex justify-between items-center">
                            <div>
                              <div className="font-bold text-slate-800 text-sm">{p.nome}</div>
                              <div className="text-[10px] text-slate-500 uppercase">Unidade: {p.unidade_medida}</div>
                            </div>
                            <div className="text-sm font-semibold text-[#1B9C85]">Valor Unit: {formatMoeda(p.preco_venda)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="w-full sm:w-20">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Qtd</label>
                    <input id="input-qtd" type="number" min="1" value={novoItemQtd} onChange={(e) => setNovoItemQtd(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1B9C85]" />
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Vlr. Unitário (R$)</label>
                    <input type="text" value={novoItemValor} onChange={(e) => setNovoItemValor(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && adicionarItem()} placeholder="0,00" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1B9C85]" />
                  </div>
                  <div className="flex items-end">
                    <button type="button" onClick={adicionarItem} className="w-full sm:w-auto px-5 py-2.5 bg-[#0F4C81] hover:bg-[#0a3863] text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1 shadow-sm">
                      <PlusIcon /> Add
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-4">Item</th>
                        <th className="px-5 py-4 text-center">Qtd</th>
                        <th className="px-5 py-4 text-right">Preço Unit.</th>
                        <th className="px-5 py-4 text-right">Subtotal</th>
                        <th className="px-5 py-4 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {itensPedido.length === 0 ? (
                        <tr><td colSpan="5" className="px-5 py-12 text-center text-slate-400">Carrinho vazio. Adicione itens acima.</td></tr>
                      ) : (
                        itensPedido.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-5 py-3 font-medium text-slate-800">
                              {item.descricao}
                              {item.produto_id && <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#1B9C85]/10 text-[#1B9C85] border border-[#1B9C85]/20 uppercase">Estoque</span>}
                            </td>
                            <td className="px-5 py-3 text-center">{item.qtd}</td>
                            <td className="px-5 py-3 text-right">{formatMoeda(item.precoUnitario)}</td>
                            <td className="px-5 py-3 text-right font-bold text-[#0F4C81]">{formatMoeda(item.qtd * item.precoUnitario)}</td>
                            <td className="px-5 py-3 text-center">
                              <button type="button" onClick={() => removerItem(item.id)} className="text-slate-400 hover:text-red-500 transition-colors"><TrashIcon /></button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {etapaAtual === 2 && (
              <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
                <h4 className="text-lg font-bold text-slate-800 mb-2">Dados do Cliente</h4>
                
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><SearchIcon /> Buscar ou Cadastrar Cliente *</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={clienteBusca}
                          onChange={(e) => buscarClientes(e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1B9C85] focus:ring-1 focus:ring-[#1B9C85] font-medium text-slate-800"
                          placeholder="Ex: Gráfica Digital Ltda"
                        />
                        {showSugestoes && clientesSugeridos.length > 0 && (
                          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                            {clientesSugeridos.map(c => (
                              <div key={c.id} onClick={() => selecionarCliente(c)} className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 flex flex-col gap-1">
                                <span className="text-sm font-bold text-slate-800">{c.nome_razao}</span>
                                <span className="text-xs text-slate-500">{c.telefone || 'Sem telefone'}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button type="button" onClick={() => setIsNovoClienteOpen(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 border border-slate-200 shrink-0">
                        <UserAddIcon /> Novo
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp / Telefone</label>
                      <input type="text" value={clienteTelefone} onChange={(e) => setClienteTelefone(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1B9C85]" placeholder="(00) 00000-0000" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Rápido (Opcional)</label>
                      <input type="text" value={clienteEndereco} onChange={(e) => setClienteEndereco(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1B9C85]" placeholder="Bairro ou Rua" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {etapaAtual === 3 && (
              <div className="space-y-6 animate-fade-in">
                <h4 className="text-lg font-bold text-slate-800 mb-2">Checkout e Fechamento</h4>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status Final</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-700 focus:outline-none focus:border-[#0F4C81]">
                          <option value="Orçamento">Apenas Orçamento</option>
                          <option value="Em Produção">Aprovado / Em Produção</option>
                          <option value="Aguardando Aprovação">Aguardando Aprovação</option>
                          <option value="Pronto">Pronto para Entrega</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pagamento Acordado</label>
                        <select value={condicaoPagamento} onChange={(e) => setCondicaoPagamento(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium focus:outline-none focus:border-[#0F4C81]">
                          <option value="À Vista">À Vista Total</option>
                          <option value="50% Entrada / 50% Entrega">50% Sinal / 50% Entrega</option>
                          <option value="Faturado (Boleto)">Faturado (Boleto)</option>
                          <option value="Pagamento na Retirada">Pagamento na Retirada</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vendedor</label>
                      <input type="text" value={vendedor} onChange={(e) => setVendedor(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50" readOnly />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notas do Pedido</label>
                      <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0F4C81] custom-scrollbar" rows="3" placeholder="Informações de arte, entrega ou cobrança..."></textarea>
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl flex flex-col justify-between text-white">
                    <div>
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Resumo Financeiro</h5>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-slate-300 font-medium">
                          <span>Subtotal ({itensPedido.length} itens)</span>
                          <span>{formatMoeda(subtotalCarrinho)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-slate-300 font-medium border-b border-slate-700 pb-4">
                          <span>Desconto (R$)</span>
                          <input 
                            type="text" 
                            placeholder="0,00" 
                            value={desconto} 
                            onChange={(e) => setDesconto(e.target.value)} 
                            className="w-24 text-right px-2 py-1 bg-slate-900 border border-slate-600 rounded text-red-400 font-bold focus:outline-none focus:border-red-500"
                          />
                        </div>

                        <div className="flex justify-between items-end pt-2">
                          <span className="font-medium text-slate-300">Total a Pagar</span>
                          <span className="text-4xl font-bold text-[#1B9C85]">{formatMoeda(totalCarrinho)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 space-y-3">
                      {status === 'Orçamento' ? (
                        <button 
                          onClick={() => handleFinalizar('salvar')} 
                          className="w-full py-3.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-colors"
                        >
                          {gerarOSVinculada ? 'Salvar Venda e Preencher O.S (Sem Cobrar)' : 'Apenas Salvar Pedido'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleFinalizar('checkout')} 
                          className="w-full py-3.5 bg-[#1B9C85] hover:bg-[#15806c] text-white rounded-lg font-bold shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                        >
                          {gerarOSVinculada ? 'Preencher O.S e Ir para Pagamento' : 'Finalizar e Cobrar Agora'} 
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0 flex items-center justify-between">
            {etapaAtual > 1 ? (
              <button type="button" onClick={voltarEtapa} className="px-5 py-2.5 text-slate-600 hover:bg-slate-200 font-bold rounded-lg transition-colors">
                ← Voltar
              </button>
            ) : (
              <button type="button" onClick={propOnClose} className="px-5 py-2.5 text-red-500 hover:bg-red-50 font-bold rounded-lg transition-colors">
                Cancelar
              </button>
            )}

            {etapaAtual < 3 && (
              <button type="button" onClick={proximaEtapa} className="px-8 py-2.5 bg-[#0F4C81] hover:bg-[#0a3863] text-white font-bold rounded-lg shadow-sm transition-transform active:scale-95">
                Próximo Passo →
              </button>
            )}
          </div>

        </div>
      </div>
      
      <div className="relative z-[10000]">
        <ModalNovoCliente isOpen={isNovoClienteOpen} onClose={() => setIsNovoClienteOpen(false)} />
        {showCheckout && (
          <ModalPagamento isOpen={showCheckout} dadosIniciais={{ venda_id: vendaGerada?.id, cliente: clienteBusca, valor: totalCarrinho, descricao: `Pedido #${vendaGerada?.id || ''}`, condicao_pagamento: condicaoPagamento }} onClose={() => { setShowCheckout(false); propOnClose(); propOnSuccess && propOnSuccess(); }} />
        )}
        
        {/* <-- FLUXO CONTÍNUO IMPLEMENTADO AQUI --> */}
        {showOS && (
          <ModalNovaOS 
            isOpen={showOS} 
            dadosIniciais={{ 
               venda_id: vendaGerada?.id, 
               solicitante_nome: clienteBusca, 
               observacoes: itensPedido.map(i => `${i.qtd}x ${i.descricao}`).join(' | ') 
            }} 
            onClose={() => { 
               setShowOS(false); 
               // Se o usuário cancelar a O.S, ainda pergunta se ele quer cobrar, senão fecha tudo.
               if (fluxoPosOS === 'checkout') setTimeout(() => setShowCheckout(true), 150);
               else { propOnClose(); propOnSuccess && propOnSuccess(); }
            }} 
            onSuccess={() => {
               setShowOS(false);
               // O.S gerada com sucesso. Joga pro checkout!
               if (fluxoPosOS === 'checkout') setTimeout(() => setShowCheckout(true), 150);
               else { propOnClose(); propOnSuccess && propOnSuccess(); }
            }}
          />
        )}
      </div>
    </>
  );
}
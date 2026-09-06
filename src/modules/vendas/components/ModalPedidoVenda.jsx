import React, { useState, useEffect } from 'react';
import ModalNovoCliente from "@/modules/clientes/components/ModalNovoCliente";
import ModalPagamento from "@/modules/financeiro/components/ModalPagamento";
import { supabase } from "@/supabaseClient";

// --- Ícones ---
const CloseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const TagIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>;
const SearchIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;
const OSIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>;
const UserAddIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>;
const TruckIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>;

const formatMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
const parseMoedaToNumber = (v) => Number(v.toString().replace(/\./g, '').replace(',', '.'));

export default function ModalPedidoVenda({ isOpen, onClose: propOnClose, onSuccess: propOnSuccess, pedidoSelecionado }) {
  const [etapaAtual, setEtapaAtual] = useState(1);

  const [isNovoClienteOpen, setIsNovoClienteOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [vendaGerada, setVendaGerada] = useState(null);
  const dataHoje = new Date().toISOString().split('T')[0];

  const [itensPedido, setItensPedido] = useState([]);
  const [produtoBusca, setProdutoBusca] = useState('');
  const [produtosSugeridos, setProdutosSugeridos] = useState([]);
  const [showSugestoesProduto, setShowSugestoesProduto] = useState(false);
  const [novoItemDesc, setNovoItemDesc] = useState('');
  const [novoItemQtd, setNovoItemQtd] = useState(1);
  const [novoItemValor, setNovoItemValor] = useState('');
  const [novoItemProdutoId, setNovoItemProdutoId] = useState(null);

  // ESTADOS DA O.S EMBUTIDA
  const [gerarOSVinculada, setGerarOSVinculada] = useState(false);
  const [osDescricao, setOsDescricao] = useState('');
  const [osPrazo, setOsPrazo] = useState('');
  const [osResponsavel, setOsResponsavel] = useState('Elias Bruno');

  const [clienteBusca, setClienteBusca] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState(''); 
  const [clienteEndereco, setClienteEndereco] = useState(''); 
  const [clientesSugeridos, setClientesSugeridos] = useState([]);
  const [showSugestoes, setShowSugestoes] = useState(false);
  const [clienteSelecionadoObj, setClienteSelecionadoObj] = useState(null);

  // LOGÍSTICA
  const [metodoEntrega, setMetodoEntrega] = useState('Balcão');
  const [enderecoEntrega, setEnderecoEntrega] = useState('');

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
      setMetodoEntrega(pedidoSelecionado.metodo_entrega || 'Balcão');
      setEnderecoEntrega(pedidoSelecionado.endereco_entrega || '');
      setVendaGerada(pedidoSelecionado);
    } else {
      resetForm();
    }
  }, [pedidoSelecionado, isOpen]);

  const resetForm = () => {
    setEtapaAtual(1);
    setItensPedido([]); setProdutoBusca(''); setNovoItemDesc(''); setNovoItemValor(''); setNovoItemQtd(1); setNovoItemProdutoId(null);
    setClienteBusca(''); setClienteTelefone(''); setClienteEndereco(''); setClienteSelecionadoObj(null);
    setMetodoEntrega('Balcão'); setEnderecoEntrega('');
    setStatus('Em Produção'); setDesconto(''); setObservacoes(''); 
    
    // Reseta a O.S
    setGerarOSVinculada(false); setOsDescricao(''); setOsPrazo(''); setOsResponsavel('Elias Bruno');
    setVendaGerada(null);
  };

  const fecharSugestoes = () => {
    setShowSugestoes(false);
    setShowSugestoesProduto(false);
  };

  const buscarProdutos = async (termo) => {
    setProdutoBusca(termo); setNovoItemDesc(termo); setNovoItemProdutoId(null);
    if (termo.length < 2) { setProdutosSugeridos([]); setShowSugestoesProduto(false); return; }
    
    const { data } = await supabase.from('produtos').select('id, nome, preco_venda, unidade_medida').eq('ativo', true).ilike('nome', `%${termo}%`).limit(5);
    if (data) { setProdutosSugeridos(data); setShowSugestoesProduto(true); }
  };

  const selecionarProduto = (produto) => {
    setProdutoBusca(produto.nome); setNovoItemDesc(produto.nome);
    setNovoItemValor(produto.preco_venda ? produto.preco_venda.toString() : '');
    setNovoItemProdutoId(produto.id); // SALVA O ID PARA DAR BAIXA DEPOIS
    document.getElementById('input-qtd')?.focus(); 
  };

  const adicionarItem = () => {
    if (!novoItemDesc || !novoItemValor) return alert('Preencha descrição e valor.');
    const valorTratado = Number(novoItemValor.toString().replace(/\./g, '').replace(',', '.'));
    if (isNaN(valorTratado)) return alert('Valor inválido.');

    const carrinhoNovo = [...itensPedido, {
      id: Date.now(),
      produto_id: novoItemProdutoId, // ID DO ESTOQUE
      descricao: novoItemDesc,
      qtd: Number(novoItemQtd),
      precoUnitario: valorTratado
    }];
    setItensPedido(carrinhoNovo);
    
    // Auto-preenche a O.S com os itens do carrinho para poupar tempo
    if (!osDescricao) {
       setOsDescricao(carrinhoNovo.map(i => `${i.qtd}x ${i.descricao}`).join('\n'));
    }
    
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
    setClienteBusca(cliente.nome_razao); 
    setClienteTelefone(cliente.telefone || ''); 
    setClienteEndereco(cliente.logradouro || '');
    setEnderecoEntrega(cliente.logradouro || '');
    setClienteSelecionadoObj(cliente); 
    setShowSugestoes(false);
  };

  const proximaEtapa = () => {
    if (etapaAtual === 1 && itensPedido.length === 0) return alert("Adicione pelo menos um item ao pedido.");
    if (etapaAtual === 2 && !clienteBusca.trim()) return alert("O nome do cliente é obrigatório.");
    if (etapaAtual === 2 && gerarOSVinculada && !osDescricao.trim()) return alert("Preencha os Detalhes da Ordem de Serviço ou desmarque a opção.");
    if (etapaAtual === 2 && metodoEntrega !== 'Balcão' && !enderecoEntrega.trim()) return alert("Preencha o endereço de entrega.");
    setEtapaAtual(etapaAtual + 1);
  };

  const voltarEtapa = () => setEtapaAtual(etapaAtual - 1);

  // ----------------------------------------------------
  // FUNÇÃO NOVA: BAIXA DE ESTOQUE INTEGRADA À VENDA
  // ----------------------------------------------------
  const processarBaixaEstoqueVenda = async (itens, vendaId) => {
    // Filtra apenas os itens que vieram do estoque (tem ID)
    const itensDeEstoque = itens.filter(i => i.produto_id);
    if (itensDeEstoque.length === 0) return; 

    for (const item of itensDeEstoque) {
      // 1. Pega o saldo atual
      const { data: produto } = await supabase.from('produtos').select('quantidade_atual').eq('id', item.produto_id).single();
      
      if (produto) {
        const novoSaldo = produto.quantidade_atual - item.qtd;
        
        // 2. Atualiza o saldo
        await supabase.from('produtos').update({ quantidade_atual: novoSaldo }).eq('id', item.produto_id);
        
        // 3. Registra no histórico de movimentação
        await supabase.from('movimentacoes_estoque').insert([{
          produto_id: item.produto_id,
          tipo_movimentacao: 'SAIDA',
          quantidade: item.qtd,
          observacao: `Venda Direta #${vendaId}`
        }]);
      }
    }
  };

  const handleFinalizar = async (acao = 'salvar') => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return alert("Erro: Sessão não encontrada. Faça login novamente.");

    let clienteId = clienteSelecionadoObj?.id;

    if (!clienteId) {
      const { data: novoCli } = await supabase.from('clientes').insert([{ 
        nome_razao: clienteBusca, telefone: clienteTelefone, logradouro: clienteEndereco, estagio_funil: 'Prospecção', status_temperatura: 'Frio' 
      }]).select('id').single();
      if(novoCli) clienteId = novoCli.id;
    }

    const resumoServicos = itensPedido.map(i => `${i.qtd}x ${i.descricao}`).join(' | ');

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
      servico: resumoServicos,
      metodo_entrega: metodoEntrega,
      endereco_entrega: metodoEntrega !== 'Balcão' ? enderecoEntrega : null
    };

    const currentId = vendaGerada?.id || pedidoSelecionado?.id;
    let vendaSalva;

    if (currentId) {
      // ATUALIZAÇÃO
      const { data, error } = await supabase.from('vendas').update(dadosPedido).eq('id', currentId).select().single();
      if (error) return alert(`Erro do Banco: ${error.message}`);
      vendaSalva = data;
      await supabase.from('itens_venda').delete().eq('venda_id', currentId);
    } else {
      // CRIAÇÃO NOVA
      const { data, error } = await supabase.from('vendas').insert([dadosPedido]).select().single();
      if (error) return alert(`Erro do Banco: ${error.message}`);
      vendaSalva = data;
    }

    setVendaGerada(vendaSalva);

    // INSERE OS ITENS NO BANCO
    if (itensPedido.length > 0) {
      const payloadItens = itensPedido.map(item => ({
        venda_id: vendaSalva.id,
        produto_id: item.produto_id || null, 
        descricao: item.descricao, 
        quantidade: item.qtd,
        preco_unitario: item.precoUnitario 
      }));
      await supabase.from('itens_venda').insert(payloadItens);

      // EXECUTA A BAIXA NO ESTOQUE (SÓ SE FOR VENDA NOVA)
      if (!currentId) {
        await processarBaixaEstoqueVenda(itensPedido, vendaSalva.id);
      }
    }

    // GERA A O.S EMBUTIDA (Se marcada)
    if (gerarOSVinculada && !currentId) {
      const novaOS = {
        user_id: user.id,
        venda_id: vendaSalva.id,
        tipo_op: 'Cliente',
        data_abertura: dataHoje, 
        data_conclusao: osPrazo || null,
        solicitante_nome: clienteBusca, 
        descricao_solicitacao: osDescricao || resumoServicos,
        descricao: osDescricao || resumoServicos, 
        responsavel: osResponsavel || vendedor,
        status: 'Pendente',
        observacoes: observacoes,
        tipo_assinatura: 'manual',
        materiais_utilizados: '[]' // A O.S não mexe mais no estoque!
      };

      const { error: errorOS } = await supabase.from('producao').insert([novaOS]);
      if (errorOS) console.error("Aviso: Falha ao gerar a O.S oculta.", errorOS);
    }

    if (acao === 'checkout') {
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
            <button onClick={propOnClose} className="text-slate-400 hover:text-slate-600"><CloseIcon /></button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
            
            {/* ETAPA 1 */}
            {etapaAtual === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h4 className="text-lg font-bold text-slate-800 mb-2">Itens do Pedido</h4>

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
                    <button type="button" onClick={adicionarItem} className="w-full sm:w-auto px-5 py-2.5 bg-[#0F4C81] hover:bg-[#0a3863] text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"><PlusIcon /> Add</button>
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

            {/* ETAPA 2 - CLIENTE, O.S E LOGÍSTICA */}
            {etapaAtual === 2 && (
              <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
                <div className="flex justify-between items-end mb-2">
                  <h4 className="text-lg font-bold text-slate-800">Dados do Pedido</h4>
                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 shadow-sm transition-colors">
                    <input type="checkbox" checked={gerarOSVinculada} onChange={(e) => setGerarOSVinculada(e.target.checked)} className="rounded text-[#0F4C81] focus:ring-[#0F4C81] w-4 h-4" />
                    <span className="text-sm font-semibold text-[#0F4C81] select-none flex items-center gap-1"><OSIcon /> Exige Ordem de Serviço (O.S)</span>
                  </label>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                  
                  {/* DADOS DO CLIENTE */}
                  <div className="space-y-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><SearchIcon /> Buscar ou Cadastrar Cliente *</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input type="text" value={clienteBusca} onChange={(e) => buscarClientes(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1B9C85] font-medium text-slate-800" placeholder="Ex: Gráfica Digital Ltda" />
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
                        <button type="button" onClick={() => setIsNovoClienteOpen(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-lg text-sm font-medium transition-colors border border-slate-200 shrink-0 flex items-center gap-1"><UserAddIcon /> Novo</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp / Telefone</label>
                      <input type="text" value={clienteTelefone} onChange={(e) => setClienteTelefone(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1B9C85]" placeholder="(00) 00000-0000" />
                    </div>
                  </div>

                  {/* BLOCO DA O.S EMBUTIDA */}
                  {gerarOSVinculada && (
                    <div className="pt-5 border-t border-slate-100 animate-fade-in">
                      <h5 className="text-sm font-bold text-[#0F4C81] mb-3 flex items-center gap-2">
                        <OSIcon /> Detalhes da Ordem de Serviço
                      </h5>
                      <div className="space-y-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Descrição do Serviço (Arte, medidas, acabamento) *</label>
                          <textarea
                            value={osDescricao}
                            onChange={(e) => setOsDescricao(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F4C81] custom-scrollbar"
                            rows="2"
                            placeholder="Descreva o que será produzido..."
                          ></textarea>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Prazo de Entrega (Agenda)</label>
                            <input
                              type="date"
                              value={osPrazo}
                              onChange={(e) => setOsPrazo(e.target.value)}
                              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F4C81]"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Responsável</label>
                            <input
                              type="text"
                              value={osResponsavel}
                              onChange={(e) => setOsResponsavel(e.target.value)}
                              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F4C81]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BLOCO DE LOGÍSTICA */}
                  <div className="pt-5 border-t border-slate-100">
                    <h5 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><TruckIcon /> Logística e Entrega</h5>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <label className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${metodoEntrega === 'Balcão' ? 'bg-[#1B9C85]/10 border-[#1B9C85] text-[#1B9C85] font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        <input type="radio" value="Balcão" checked={metodoEntrega === 'Balcão'} onChange={(e) => setMetodoEntrega(e.target.value)} className="hidden" />
                        Retirada no Balcão
                      </label>
                      <label className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${metodoEntrega === 'Motoboy' ? 'bg-[#1B9C85]/10 border-[#1B9C85] text-[#1B9C85] font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        <input type="radio" value="Motoboy" checked={metodoEntrega === 'Motoboy'} onChange={(e) => setMetodoEntrega(e.target.value)} className="hidden" />
                        Via Motoboy
                      </label>
                      <label className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${metodoEntrega === 'Correios' ? 'bg-[#1B9C85]/10 border-[#1B9C85] text-[#1B9C85] font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        <input type="radio" value="Correios" checked={metodoEntrega === 'Correios'} onChange={(e) => setMetodoEntrega(e.target.value)} className="hidden" />
                        Correios
                      </label>
                    </div>

                    {metodoEntrega !== 'Balcão' && (
                      <div className="animate-fade-in">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Exato de Entrega *</label>
                        <textarea value={enderecoEntrega} onChange={(e) => setEnderecoEntrega(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1B9C85] text-sm custom-scrollbar" rows="2" placeholder="Rua, Número, Bairro, Cidade - Ponto de Referência"></textarea>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ETAPA 3 */}
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
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notas do Pedido</label>
                      <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0F4C81] custom-scrollbar" rows="3" placeholder="Informações extras..."></textarea>
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
                          <input type="text" placeholder="0,00" value={desconto} onChange={(e) => setDesconto(e.target.value)} className="w-24 text-right px-2 py-1 bg-slate-900 border border-slate-600 rounded text-red-400 font-bold focus:outline-none focus:border-red-500" />
                        </div>
                        <div className="flex justify-between items-end pt-2">
                          <span className="font-medium text-slate-300">Total a Pagar</span>
                          <span className="text-4xl font-bold text-[#1B9C85]">{formatMoeda(totalCarrinho)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 space-y-3">
                      {status === 'Orçamento' ? (
                        <button onClick={() => handleFinalizar('salvar')} className="w-full py-3.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-colors">
                          Apenas Salvar Pedido
                        </button>
                      ) : (
                        <button onClick={() => handleFinalizar('checkout')} className="w-full py-3.5 bg-[#1B9C85] hover:bg-[#15806c] text-white rounded-lg font-bold shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                          Finalizar e Cobrar Agora 
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
              <button type="button" onClick={voltarEtapa} className="px-5 py-2.5 text-slate-600 hover:bg-slate-200 font-bold rounded-lg transition-colors">← Voltar</button>
            ) : (
              <button type="button" onClick={propOnClose} className="px-5 py-2.5 text-red-500 hover:bg-red-50 font-bold rounded-lg transition-colors">Cancelar</button>
            )}
            {etapaAtual < 3 && (
              <button type="button" onClick={proximaEtapa} className="px-8 py-2.5 bg-[#0F4C81] hover:bg-[#0a3863] text-white font-bold rounded-lg shadow-sm transition-transform active:scale-95">Próximo Passo →</button>
            )}
          </div>

        </div>
      </div>
      
      <div className="relative z-[10000]">
        <ModalNovoCliente isOpen={isNovoClienteOpen} onClose={() => setIsNovoClienteOpen(false)} />
        {showCheckout && (
          <ModalPagamento isOpen={showCheckout} dadosIniciais={{ venda_id: vendaGerada?.id, cliente: clienteBusca, valor: totalCarrinho, descricao: `Pedido #${vendaGerada?.id || ''}`, condicao_pagamento: condicaoPagamento }} onClose={() => { setShowCheckout(false); propOnClose(); propOnSuccess && propOnSuccess(); }} />
        )}
      </div>
    </>
  );
}
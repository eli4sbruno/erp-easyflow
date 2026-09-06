import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import Modal from '@/components/modals/Modal';
import ModalNovoCliente from '@/modules/clientes/components/ModalNovoCliente'; // Import do Modal de Clientes

// --- Ícones ---
const CloseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const TagIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>;
const SearchIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;
const UserAddIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>;

// --- Helper ---
const formatMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

export default function ModalNovaOS({ isOpen, onClose, onSuccess, dadosIniciais }) {
  // Wizard Control
  const [etapaAtual, setEtapaAtual] = useState(1);
  
  // 1. Identificação e Cliente
  const [tipoOP, setTipoOP] = useState('Cliente');
  const [solicitanteNome, setSolicitanteNome] = useState('');
  const [clienteSelecionadoObj, setClienteSelecionadoObj] = useState(null);
  const [clientesSugeridos, setClientesSugeridos] = useState([]);
  const [showSugestoesCliente, setShowSugestoesCliente] = useState(false);
  const [isNovoClienteOpen, setIsNovoClienteOpen] = useState(false);

  const [descricaoSolicitacao, setDescricaoSolicitacao] = useState('');
  const [dataConclusao, setDataConclusao] = useState('');
  const [responsavel, setResponsavel] = useState('Elias Bruno');

  // 2. Materiais (Carrinho de Custos)
  const [itensCusto, setItensCusto] = useState([]);
  const [produtoBusca, setProdutoBusca] = useState('');
  const [produtosSugeridos, setProdutosSugeridos] = useState([]);
  const [showSugestoesProduto, setShowSugestoesProduto] = useState(false);
  
  const [novoItemDesc, setNovoItemDesc] = useState('');
  const [novoItemQtd, setNovoItemQtd] = useState(1);
  const [novoItemCusto, setNovoItemCusto] = useState('');
  const [novoItemProdutoId, setNovoItemProdutoId] = useState(null);
  
  // 3. Fechamento
  const [status, setStatus] = useState('Pendente');
  const [observacoes, setObservacoes] = useState('');
  const [tipoAssinatura, setTipoAssinatura] = useState('manual');
  
  const [isSaving, setIsSaving] = useState(false);

  // Totais de Custo
  const custoTotalMateriais = itensCusto.reduce((acc, item) => acc + (item.qtd * item.custoUnitario), 0);

  useEffect(() => {
    if (isOpen) {
      setEtapaAtual(1);
      if (dadosIniciais) {
        setSolicitanteNome(dadosIniciais.solicitante_nome || '');
        setDescricaoSolicitacao(dadosIniciais.observacoes || '');
        setTipoOP(dadosIniciais.tipo_op || 'Cliente');
      } else {
        resetForm();
      }
    }
  }, [isOpen, dadosIniciais]);

  const resetForm = () => {
    setTipoOP('Cliente'); 
    setSolicitanteNome(''); 
    setClienteSelecionadoObj(null);
    setDescricaoSolicitacao(''); 
    setDataConclusao(''); 
    setResponsavel('Elias Bruno');
    setItensCusto([]); 
    setProdutoBusca(''); 
    setNovoItemDesc(''); 
    setNovoItemCusto(''); 
    setNovoItemQtd(1); 
    setNovoItemProdutoId(null);
    setStatus('Pendente'); 
    setObservacoes(''); 
    setTipoAssinatura('manual');
  };

  const fecharTodasSugestoes = () => {
    setShowSugestoesProduto(false);
    setShowSugestoesCliente(false);
  };

  // BUSCA CLIENTES NO BANCO
  const buscarClientes = async (termo) => {
    setSolicitanteNome(termo);
    if (clienteSelecionadoObj && termo !== clienteSelecionadoObj?.nome_razao) setClienteSelecionadoObj(null);
    
    if (termo.length < 2) { 
      setClientesSugeridos([]); 
      setShowSugestoesCliente(false); 
      return; 
    }
    
    const { data } = await supabase
      .from('clientes')
      .select('id, nome_razao, telefone')
      .ilike('nome_razao', `%${termo}%`)
      .limit(5);
      
    if (data) { 
      setClientesSugeridos(data); 
      setShowSugestoesCliente(true); 
    }
  };

  const selecionarCliente = (cliente) => {
    setSolicitanteNome(cliente.nome_razao);
    setClienteSelecionadoObj(cliente);
    setShowSugestoesCliente(false);
  };

  // BUSCA PRODUTOS NO ESTOQUE
 const buscarProdutos = async (termo) => {
    setProdutoBusca(termo); setNovoItemDesc(termo); setNovoItemProdutoId(null);
    if (termo.length < 2) { setProdutosSugeridos([]); setShowSugestoesProduto(false); return; }
    
    // Adicionado o filtro .eq('ativo', true)
    const { data } = await supabase.from('produtos').select('id, nome, custo_medio, unidade_medida').eq('ativo', true).ilike('nome', `%${termo}%`).limit(5);
    if (data) { setProdutosSugeridos(data); setShowSugestoesProduto(true); }
  };

  const selecionarProduto = (produto) => {
    setProdutoBusca(produto.nome); setNovoItemDesc(produto.nome);
    setNovoItemCusto(produto.custo_medio ? produto.custo_medio.toString() : '0');
    setNovoItemProdutoId(produto.id); setShowSugestoesProduto(false);
    document.getElementById('input-qtd-os')?.focus(); 
  };

  const adicionarItemCusto = () => {
    if (!novoItemDesc) return alert('Preencha a descrição do material.');
    
    // Correção matemática dos milhares
    const custoTratado = Number(novoItemCusto.toString().replace(/\./g, '').replace(',', '.')) || 0;

    setItensCusto([...itensCusto, {
      id: Date.now(),
      produto_id: novoItemProdutoId,
      descricao: novoItemDesc,
      qtd: Number(novoItemQtd),
      custoUnitario: custoTratado
    }]);
    
    // Correção de UX (Limpa e força o fechamento do popup)
    setNovoItemDesc(''); 
    setProdutoBusca(''); 
    setNovoItemCusto(''); 
    setNovoItemQtd(1); 
    setNovoItemProdutoId(null);
    setShowSugestoesProduto(false);
    setProdutosSugeridos([]);
  };

  const removerItemCusto = (id) => setItensCusto(itensCusto.filter(item => item.id !== id));

  // NAVEGAÇÃO DO WIZARD
  const proximaEtapa = () => {
    if (etapaAtual === 1 && (!solicitanteNome.trim() || !descricaoSolicitacao.trim())) {
      return alert("Preencha o Nome do Solicitante e a Descrição do que será feito.");
    }
    setEtapaAtual(etapaAtual + 1);
  };
  const voltarEtapa = () => setEtapaAtual(etapaAtual - 1);

  // BAIXA AUTOMÁTICA DE ESTOQUE
  const processarBaixaEstoque = async (itens, osId) => {
    const itensDeEstoque = itens.filter(i => i.produto_id);
    if (itensDeEstoque.length === 0) return true; 

    for (const item of itensDeEstoque) {
      const { data: produto } = await supabase.from('produtos').select('quantidade_atual').eq('id', item.produto_id).single();
      
      if (produto) {
        const novoSaldo = produto.quantidade_atual - item.qtd;
        await supabase.from('produtos').update({ quantidade_atual: novoSaldo }).eq('id', item.produto_id);
        
        await supabase.from('movimentacoes_estoque').insert([{
          produto_id: item.produto_id,
          tipo_movimentacao: 'SAIDA',
          quantidade: item.qtd,
          observacao: `Consumo O.S #${osId}`
        }]);
      }
    }
  };

  const handleSalvar = async () => {
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Sessão expirada. Faça login novamente.");
      setIsSaving(false);
      return;
    }

    const novaOS = {
      user_id: user.id,
      venda_id: dadosIniciais?.venda_id || null,
      tipo_op: tipoOP,
      data_abertura: dadosIniciais?.data_abertura || new Date().toISOString().split('T')[0], // Mantém a data original na edição
      data_conclusao: dataConclusao || null,
      solicitante_nome: solicitanteNome, 
      descricao_solicitacao: descricaoSolicitacao,
      descricao: descricaoSolicitacao, 
      responsavel: responsavel || 'Não atribuído',
      status: status,
      observacoes: observacoes,
      tipo_assinatura: tipoAssinatura,
      materiais_utilizados: JSON.stringify(itensCusto), 
      valor_materiais: custoTotalMateriais
    };

    let error, data;
    const isEdicao = !!dadosIniciais?.id; // Verifica se a O.S já existe

    if (isEdicao) {
      // MODO EDIÇÃO: Apenas atualiza
      const response = await supabase.from('producao').update(novaOS).eq('id', dadosIniciais.id).select().single();
      error = response.error;
      data = response.data;
    } else {
      // MODO CRIAÇÃO: Insere e desconta do estoque
      const response = await supabase.from('producao').insert([novaOS]).select().single();
      error = response.error;
      data = response.data;

      // ATENÇÃO: Só damos baixa no estoque se for uma O.S NOVA!
      if (data) {
        await processarBaixaEstoque(itensCusto, data.id);
      }
    }

    if (error) {
      console.error('Erro ao salvar O.S:', error);
      alert(`Falha ao salvar a O.S: ${error.message}`);
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    onClose();
    if (onSuccess) onSuccess();
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal isOpen={isOpen}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in" onClick={fecharTodasSugestoes}>
          
          {/* HEADER DO WIZARD */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <h3 className="text-xl font-bold text-[#0F4C81]">Nova Ordem de Serviço</h3>
            
            <div className="hidden sm:flex items-center gap-2">
              <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${etapaAtual >= 1 ? 'bg-[#1B9C85] text-white' : 'bg-slate-100 text-slate-400'}`}>1</span>
              <div className={`w-8 h-1 rounded ${etapaAtual >= 2 ? 'bg-[#1B9C85]' : 'bg-slate-100'}`}></div>
              <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${etapaAtual >= 2 ? 'bg-[#1B9C85] text-white' : 'bg-slate-100 text-slate-400'}`}>2</span>
              <div className={`w-8 h-1 rounded ${etapaAtual >= 3 ? 'bg-[#1B9C85]' : 'bg-slate-100'}`}></div>
              <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${etapaAtual >= 3 ? 'bg-[#1B9C85] text-white' : 'bg-slate-100 text-slate-400'}`}>3</span>
            </div>

            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><CloseIcon /></button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
            
            {/* ETAPA 1: DADOS DO SERVIÇO */}
            {etapaAtual === 1 && (
              <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
                <h4 className="text-lg font-bold text-slate-800 mb-2">O que será produzido?</h4>
                
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value="Cliente" checked={tipoOP === 'Cliente'} onChange={(e) => setTipoOP(e.target.value)} className="text-[#0F4C81]" />
                      <span className="text-sm font-medium">O.S para Cliente</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value="Interna" checked={tipoOP === 'Interna'} onChange={(e) => setTipoOP(e.target.value)} className="text-[#0F4C81]" />
                      <span className="text-sm font-medium">O.S Interna (Uso Próprio)</span>
                    </label>
                  </div>

                  {/* CAMPO DE BUSCA DE CLIENTE INTEGRADO */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <SearchIcon /> Nome do Solicitante / Cliente *
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={solicitanteNome}
                          onChange={(e) => buscarClientes(e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F4C81] bg-slate-50 font-medium text-slate-800"
                          placeholder="Ex: Gráfica Digital Ltda"
                          disabled={!!dadosIniciais?.venda_id} // Desabilita se veio de uma venda fechada
                        />
                        {showSugestoesCliente && clientesSugeridos.length > 0 && (
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
                      
                      {!dadosIniciais?.venda_id && (
                        <button 
                          type="button" 
                          onClick={() => setIsNovoClienteOpen(true)} 
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 border border-slate-200 shrink-0"
                        >
                          <UserAddIcon /> Novo
                        </button>
                      )}
                    </div>
                    {dadosIniciais?.venda_id && <p className="text-xs text-blue-500 mt-1 font-medium">Vinculado automaticamente ao Pedido de Venda.</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Descrição do que deve ser feito *</label>
                    <textarea value={descricaoSolicitacao} onChange={(e) => setDescricaoSolicitacao(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F4C81] custom-scrollbar" rows="4" placeholder="Descreva medidas, arquivos e acabamentos..."></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Prazo Exigido (Opcional)</label>
                      <input type="date" value={dataConclusao} onChange={(e) => setDataConclusao(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F4C81]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Responsável pela Produção</label>
                      <input type="text" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F4C81]" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ETAPA 2: MATERIAIS */}
            {etapaAtual === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h4 className="text-lg font-bold text-slate-800">Materiais Utilizados (Baixa de Estoque)</h4>
                  <p className="text-sm text-slate-500">Adicione os insumos que serão gastos nesta produção para abater do estoque.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><TagIcon /> Buscar Material no Estoque</label>
                    <input type="text" value={produtoBusca} onChange={(e) => buscarProdutos(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && adicionarItemCusto()} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0F4C81]" placeholder="Ex: Lona 440g..." />
                    
                    {showSugestoesProduto && produtosSugeridos.length > 0 && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                        {produtosSugeridos.map(p => (
                          <div key={p.id} onClick={() => selecionarProduto(p)} className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-50 flex justify-between items-center">
                            <div>
                              <div className="font-bold text-slate-800 text-sm">{p.nome}</div>
                              <div className="text-[10px] text-slate-500 uppercase">Unidade: {p.unidade_medida}</div>
                            </div>
                            <div className="text-sm font-semibold text-[#E74C3C]">Custo: {formatMoeda(p.custo_medio)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="w-full sm:w-20">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Qtd Gasta</label>
                    <input id="input-qtd-os" type="number" min="0.01" step="0.01" value={novoItemQtd} onChange={(e) => setNovoItemQtd(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0F4C81]" />
                  </div>
                  <div className="w-full sm:w-28">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Custo Unit. (R$)</label>
                    <input type="text" value={novoItemCusto} onChange={(e) => setNovoItemCusto(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && adicionarItemCusto()} placeholder="0,00" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0F4C81] bg-slate-50" readOnly={!!novoItemProdutoId} />
                  </div>
                  <div className="flex items-end">
                    <button type="button" onClick={adicionarItemCusto} className="w-full sm:w-auto px-5 py-2.5 bg-[#0F4C81] hover:bg-[#0a3863] text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1 shadow-sm">
                      <PlusIcon /> Add
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-4">Material Utilizado</th>
                        <th className="px-5 py-4 text-center">Qtd Gasta</th>
                        <th className="px-5 py-4 text-right">Custo Total</th>
                        <th className="px-5 py-4 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {itensCusto.length === 0 ? (
                        <tr><td colSpan="4" className="px-5 py-12 text-center text-slate-400">Nenhum material listado. Pode avançar sem preencher.</td></tr>
                      ) : (
                        itensCusto.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-5 py-3 font-medium text-slate-800">
                              {item.descricao}
                              {item.produto_id && <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#E74C3C]/10 text-[#E74C3C] border border-[#E74C3C]/20 uppercase">Abate do Estoque</span>}
                            </td>
                            <td className="px-5 py-3 text-center font-bold">{item.qtd}</td>
                            <td className="px-5 py-3 text-right font-semibold text-[#E74C3C]">{formatMoeda(item.qtd * item.custoUnitario)}</td>
                            <td className="px-5 py-3 text-center">
                              <button type="button" onClick={() => removerItemCusto(item.id)} className="text-slate-400 hover:text-red-500 transition-colors"><TrashIcon /></button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {itensCusto.length > 0 && (
                      <tfoot className="bg-slate-50">
                        <tr>
                          <td colSpan="2" className="px-5 py-3 text-right font-bold text-slate-600">Custo Total em Materiais:</td>
                          <td className="px-5 py-3 text-right font-black text-[#E74C3C] text-lg">{formatMoeda(custoTotalMateriais)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            )}

            {/* ETAPA 3: FINALIZAÇÃO */}
            {etapaAtual === 3 && (
              <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
                <h4 className="text-lg font-bold text-slate-800 mb-2">Finalização da O.S</h4>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status Inicial</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-slate-300 rounded-lg p-3 font-bold text-[#0F4C81] focus:outline-none focus:border-[#0F4C81] bg-blue-50">
                      <option value="Pendente">Aguardando Início (Pendente)</option>
                      <option value="Em Andamento">Já comecei (Em Andamento)</option>
                      <option value="Concluída">Pronta (Concluída)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Observações / Alertas Internos</label>
                    <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:border-[#0F4C81] custom-scrollbar" rows="3" placeholder="Anotações para a equipe de produção..."></textarea>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <label className="block text-sm font-medium text-slate-700 mb-3">Método de Validação / Assinatura</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <label className={`flex-1 flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${tipoAssinatura === 'manual' ? 'border-[#0F4C81] bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                        <input type="radio" value="manual" checked={tipoAssinatura === 'manual'} onChange={(e) => setTipoAssinatura(e.target.value)} className="mt-1" />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">Assinatura Manual</span>
                          <span className="text-xs text-slate-500 mt-1">Imprimir via física para cliente assinar.</span>
                        </div>
                      </label>
                      
                      <label className={`flex-1 flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${tipoAssinatura === 'govbr' ? 'border-[#1B9C85] bg-green-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                        <input type="radio" value="govbr" checked={tipoAssinatura === 'govbr'} onChange={(e) => setTipoAssinatura(e.target.value)} className="mt-1" />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            Assinatura Digital <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] rounded uppercase">gov.br</span>
                          </span>
                          <span className="text-xs text-slate-500 mt-1">Validade legal via API do governo.</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* FOOTER WIZARD */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0 flex items-center justify-between">
            {etapaAtual > 1 ? (
              <button type="button" onClick={voltarEtapa} className="px-5 py-2.5 text-slate-600 hover:bg-slate-200 font-bold rounded-lg transition-colors">
                ← Voltar
              </button>
            ) : (
              <button type="button" onClick={onClose} className="px-5 py-2.5 text-red-500 hover:bg-red-50 font-bold rounded-lg transition-colors">
                Cancelar
              </button>
            )}

            {etapaAtual < 3 ? (
              <button type="button" onClick={proximaEtapa} className="px-8 py-2.5 bg-[#0F4C81] hover:bg-[#0a3863] text-white font-bold rounded-lg shadow-sm transition-transform active:scale-95">
                Próximo Passo →
              </button>
            ) : (
              <button type="button" onClick={handleSalvar} disabled={isSaving} className="px-8 py-2.5 bg-[#1B9C85] hover:bg-[#15806c] text-white font-bold rounded-lg shadow-md transition-transform active:scale-95 disabled:opacity-70">
                {isSaving ? 'Gerando O.S...' : 'Finalizar e Gerar O.S'}
              </button>
            )}
          </div>

        </div>
      </Modal>

      {/* Renderiza o modal de Novo Cliente SOBRE o modal de OS */}
      {isNovoClienteOpen && (
        <div className="relative z-[10000]">
          <ModalNovoCliente 
            isOpen={isNovoClienteOpen} 
            onClose={() => setIsNovoClienteOpen(false)} 
          />
        </div>
      )}
    </>
  );
}
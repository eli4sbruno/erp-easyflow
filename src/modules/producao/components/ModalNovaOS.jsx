import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import Modal from '@/components/modals/Modal';
import ModalNovoCliente from '@/modules/clientes/components/ModalNovoCliente';

// --- Ícones ---
const CloseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const SearchIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;

export default function ModalNovaOS({ isOpen, onClose, onSuccess, dadosIniciais }) {
  
  const [tipoOP, setTipoOP] = useState('Cliente');
  const [solicitanteNome, setSolicitanteNome] = useState('');
  const [clienteSelecionadoObj, setClienteSelecionadoObj] = useState(null);
  const [clientesSugeridos, setClientesSugeridos] = useState([]);
  const [showSugestoesCliente, setShowSugestoesCliente] = useState(false);
  const [isNovoClienteOpen, setIsNovoClienteOpen] = useState(false);

  const [descricaoSolicitacao, setDescricaoSolicitacao] = useState('');
  const [dataConclusao, setDataConclusao] = useState('');
  const [responsavel, setResponsavel] = useState('Elias Bruno');

  // Materiais (Apenas Estoque, sem Financeiro)
  const [itensCusto, setItensCusto] = useState([]);
  const [produtoBusca, setProdutoBusca] = useState('');
  const [produtosSugeridos, setProdutosSugeridos] = useState([]);
  const [showSugestoesProduto, setShowSugestoesProduto] = useState(false);
  const [novoItemDesc, setNovoItemDesc] = useState('');
  const [novoItemQtd, setNovoItemQtd] = useState(1);
  const [novoItemProdutoId, setNovoItemProdutoId] = useState(null);
  
  const [status, setStatus] = useState('Pendente');
  const [observacoes, setObservacoes] = useState('');
  const [tipoAssinatura, setTipoAssinatura] = useState('manual');
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
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
    setSolicitanteNome(''); setClienteSelecionadoObj(null);
    setDescricaoSolicitacao(''); setDataConclusao(''); setResponsavel('Elias Bruno');
    setItensCusto([]); setProdutoBusca(''); setNovoItemDesc(''); 
    setNovoItemQtd(1); setNovoItemProdutoId(null);
    setStatus('Pendente'); setObservacoes(''); setTipoAssinatura('manual');
  };

  const fecharTodasSugestoes = () => {
    setShowSugestoesProduto(false);
    setShowSugestoesCliente(false);
  };

  const buscarClientes = async (termo) => {
    setSolicitanteNome(termo);
    if (clienteSelecionadoObj && termo !== clienteSelecionadoObj?.nome_razao) setClienteSelecionadoObj(null);
    if (termo.length < 2) { setClientesSugeridos([]); setShowSugestoesCliente(false); return; }
    
    const { data } = await supabase.from('clientes').select('id, nome_razao, telefone').ilike('nome_razao', `%${termo}%`).limit(5);
    if (data) { setClientesSugeridos(data); setShowSugestoesCliente(true); }
  };

  const selecionarCliente = (cliente) => {
    setSolicitanteNome(cliente.nome_razao); setClienteSelecionadoObj(cliente); setShowSugestoesCliente(false);
  };

  const buscarProdutos = async (termo) => {
    setProdutoBusca(termo); setNovoItemDesc(termo); setNovoItemProdutoId(null);
    if (termo.length < 2) { setProdutosSugeridos([]); setShowSugestoesProduto(false); return; }
    
    // Removido o select do custo_medio para focar só na descrição e baixa
    const { data } = await supabase.from('produtos').select('id, nome, unidade_medida').eq('ativo', true).ilike('nome', `%${termo}%`).limit(5);
    if (data) { setProdutosSugeridos(data); setShowSugestoesProduto(true); }
  };

  const selecionarProduto = (produto) => {
    setProdutoBusca(produto.nome); setNovoItemDesc(produto.nome);
    setNovoItemProdutoId(produto.id); setShowSugestoesProduto(false);
    document.getElementById('input-qtd-os')?.focus(); 
  };

  const adicionarItemCusto = () => {
    if (!novoItemDesc) return alert('Preencha a descrição do material.');

    setItensCusto([...itensCusto, {
      id: Date.now(),
      produto_id: novoItemProdutoId, 
      descricao: novoItemDesc,
      qtd: Number(novoItemQtd)
    }]);
    
    setNovoItemDesc(''); setProdutoBusca(''); setNovoItemQtd(1); setNovoItemProdutoId(null);
    setShowSugestoesProduto(false); setProdutosSugeridos([]);
  };

  const removerItemCusto = (id) => setItensCusto(itensCusto.filter(item => item.id !== id));

  const processarBaixaEstoque = async (itens, osId) => {
    const itensDeEstoque = itens.filter(i => i.produto_id);
    if (itensDeEstoque.length === 0) return; 

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
    if (!solicitanteNome.trim() || !descricaoSolicitacao.trim()) {
      return alert("Preencha o Nome do Solicitante e a Descrição do que será feito.");
    }

    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) { alert("Sessão expirada. Faça login novamente."); setIsSaving(false); return; }

    const novaOS = {
      user_id: user.id,
      venda_id: dadosIniciais?.venda_id || null,
      tipo_op: tipoOP,
      data_abertura: dadosIniciais?.data_abertura || new Date().toISOString().split('T')[0], 
      data_conclusao: dataConclusao || null,
      solicitante_nome: solicitanteNome, 
      descricao_solicitacao: descricaoSolicitacao,
      descricao: descricaoSolicitacao, 
      responsavel: responsavel || 'Não atribuído',
      status: status,
      observacoes: observacoes,
      tipo_assinatura: tipoAssinatura,
      materiais_utilizados: JSON.stringify(itensCusto) // Mantém o registro do que gastou, mas sem o valor $
    };

    let error, data;
    const isEdicao = !!dadosIniciais?.id; 

    if (isEdicao) {
      const response = await supabase.from('producao').update(novaOS).eq('id', dadosIniciais.id).select().single();
      error = response.error;
      data = response.data;
    } else {
      const response = await supabase.from('producao').insert([novaOS]).select().single();
      error = response.error;
      data = response.data;
      if (data) await processarBaixaEstoque(itensCusto, data.id);
    }

    if (error) {
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
        <div className="bg-slate-50 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in" onClick={fecharTodasSugestoes}>
          
          <div className="px-6 py-5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-sm z-10">
            <h3 className="text-xl font-bold text-[#0F4C81] flex items-center gap-2">
              <span className="w-8 h-8 rounded bg-[#1B9C85]/10 text-[#1B9C85] flex items-center justify-center">📋</span> 
              Formulário de Ordem de Serviço
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors bg-slate-100 p-1.5 rounded-full"><CloseIcon /></button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
            
            {/* BLOCO 1: INFORMAÇÕES BÁSICAS */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">1. Identificação do Serviço</h4>
              
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="Cliente" checked={tipoOP === 'Cliente'} onChange={(e) => setTipoOP(e.target.value)} className="text-[#0F4C81]" />
                  <span className="text-sm font-bold text-slate-700">Para Cliente</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="Interna" checked={tipoOP === 'Interna'} onChange={(e) => setTipoOP(e.target.value)} className="text-[#0F4C81]" />
                  <span className="text-sm font-bold text-slate-700">Uso Interno</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">Nome do Solicitante *</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input type="text" value={solicitanteNome} onChange={(e) => buscarClientes(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F4C81] bg-slate-50 font-medium text-slate-800" placeholder="Ex: Gráfica Digital Ltda" disabled={!!dadosIniciais?.venda_id} />
                      {showSugestoesCliente && clientesSugeridos.length > 0 && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                          {clientesSugeridos.map(c => (
                            <div key={c.id} onClick={() => selecionarCliente(c)} className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 flex flex-col gap-1">
                              <span className="text-sm font-bold text-slate-800">{c.nome_razao}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descrição do Serviço (Arte, medidas, acabamento) *</label>
                  <textarea value={descricaoSolicitacao} onChange={(e) => setDescricaoSolicitacao(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F4C81] custom-scrollbar" rows="3"></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prazo de Entrega (Agenda)</label>
                  <input type="date" value={dataConclusao} onChange={(e) => setDataConclusao(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F4C81]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Responsável pela Produção</label>
                  <input type="text" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F4C81]" />
                </div>
              </div>
            </div>

            {/* BLOCO 2: MATERIAIS */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">2. Consumo de Estoque</h4>
              
              <div className="flex flex-col sm:flex-row gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200 relative mb-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Buscar Material no Estoque</label>
                  <input type="text" value={produtoBusca} onChange={(e) => buscarProdutos(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && adicionarItemCusto()} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0F4C81]" placeholder="Clique na sugestão para garantir a baixa..." />
                  
                  {showSugestoesProduto && produtosSugeridos.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                      {produtosSugeridos.map(p => (
                        <div key={p.id} onClick={() => selecionarProduto(p)} className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-50 flex justify-between items-center">
                          <div className="font-bold text-slate-800 text-sm">{p.nome} <span className="text-[10px] text-slate-500 ml-1">({p.unidade_medida})</span></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="w-full sm:w-32">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Qtd Gasta</label>
                  <input id="input-qtd-os" type="number" min="0.01" step="0.01" value={novoItemQtd} onChange={(e) => setNovoItemQtd(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0F4C81]" />
                </div>
                <div className="flex items-end">
                  <button type="button" onClick={adicionarItemCusto} className="w-full sm:w-auto px-5 py-2 bg-[#0F4C81] hover:bg-[#0a3863] text-white rounded-lg text-sm font-bold shadow-sm"><PlusIcon /> Adicionar</button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-4">Material Utilizado</th>
                      <th className="px-5 py-4 text-center">Qtd Gasta</th>
                      <th className="px-5 py-4 text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {itensCusto.length === 0 ? (
                      <tr><td colSpan="3" className="px-5 py-6 text-center text-slate-400">Nenhum material listado. Pode salvar sem preencher.</td></tr>
                    ) : (
                      itensCusto.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="px-5 py-2 font-medium text-slate-800">
                            {item.descricao}
                            {!item.produto_id && <span className="ml-2 text-[10px] text-orange-500 font-bold bg-orange-50 px-2 py-0.5 rounded">⚠️ Sem ID (Não abaterá do estoque)</span>}
                            {item.produto_id && <span className="ml-2 text-[10px] text-[#1B9C85] font-bold bg-[#1B9C85]/10 px-2 py-0.5 rounded">✓ Integrado</span>}
                          </td>
                          <td className="px-5 py-2 text-center font-bold text-slate-700">{item.qtd}</td>
                          <td className="px-5 py-2 text-center">
                            <button type="button" onClick={() => removerItemCusto(item.id)} className="text-slate-400 hover:text-red-500"><TrashIcon /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BLOCO 3: FECHAMENTO */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">3. Configurações Finais</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status Inicial</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 font-bold text-[#0F4C81] focus:outline-none focus:border-[#0F4C81] bg-blue-50">
                    <option value="Pendente">Pendente (Fila)</option>
                    <option value="Em Andamento">Em Andamento (Bancada)</option>
                    <option value="Concluída">Concluída (Pronto)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Método de Assinatura</label>
                  <select value={tipoAssinatura} onChange={(e) => setTipoAssinatura(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81]">
                    <option value="manual">Assinatura Física (Papel)</option>
                    <option value="govbr">Assinatura Digital (Gov.br)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Anotações Internas (Para a equipe)</label>
                  <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:border-[#0F4C81] custom-scrollbar" rows="2"></textarea>
                </div>
              </div>
            </div>

          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-white shrink-0 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
            <button type="button" onClick={onClose} className="px-6 py-3 text-slate-600 hover:bg-slate-100 font-bold rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="button" onClick={handleSalvar} disabled={isSaving} className="px-8 py-3 bg-[#1B9C85] hover:bg-[#15806c] text-white font-bold rounded-lg shadow-md transition-transform active:scale-95 disabled:opacity-70 flex items-center gap-2">
              {isSaving ? 'Salvando...' : 'Salvar Ordem de Serviço'} 
              {!isSaving && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
            </button>
          </div>

        </div>
      </Modal>

      {isNovoClienteOpen && (
        <div className="relative z-[10000]">
          <ModalNovoCliente isOpen={isNovoClienteOpen} onClose={() => setIsNovoClienteOpen(false)} />
        </div>
      )}
    </>
  );
}
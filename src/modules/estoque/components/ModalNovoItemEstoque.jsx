import React, { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";
import Modal from "@/components/modals/Modal";

export default function ModalNovoItemEstoque({ isOpen, onClose, onSuccess, itemParaEditar }) {
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('Matéria-Prima');
  const [quantidade, setQuantidade] = useState('');
  const [estoqueMinimo, setEstoqueMinimo] = useState('');
  const [estoqueMaximo, setEstoqueMaximo] = useState('');
  const [custoMedio, setCustoMedio] = useState('');
  const [precoVenda, setPrecoVenda] = useState(''); 
  const [unidade, setUnidade] = useState('un');
  const [codigoBarras, setCodigoBarras] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- CÁLCULO DE MARGEM DE LUCRO EM TEMPO REAL ---
  const custoNum = parseFloat(custoMedio) || 0;
  const vendaNum = parseFloat(precoVenda) || 0;
  const lucroRS = vendaNum - custoNum;
  const margemPerc = vendaNum > 0 ? (lucroRS / vendaNum) * 100 : 0;

  let corLucro = 'text-slate-400';
  if (vendaNum > 0 && lucroRS > 0) corLucro = 'text-[#1B9C85]'; 
  if (vendaNum > 0 && lucroRS < 0) corLucro = 'text-[#E74C3C]'; 
  if (vendaNum > 0 && lucroRS === 0) corLucro = 'text-amber-500'; 

  const formatMoedaMini = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  useEffect(() => {
    if (isOpen) {
      if (itemParaEditar) {
        setNome(itemParaEditar.nome);
        setCategoria(itemParaEditar.categoria);
        setQuantidade(itemParaEditar.quantidade_atual);
        setEstoqueMinimo(itemParaEditar.estoque_minimo);
        setEstoqueMaximo(itemParaEditar.estoque_maximo || '');
        setCustoMedio(itemParaEditar.custo_medio || '');
        setPrecoVenda(itemParaEditar.preco_venda || ''); 
        setUnidade(itemParaEditar.unidade_medida);
        setCodigoBarras(itemParaEditar.codigo_barras || '');
      } else {
        setNome('');
        setCategoria('Matéria-Prima');
        setQuantidade('');
        setEstoqueMinimo('');
        setEstoqueMaximo('');
        setCustoMedio('');
        setPrecoVenda(''); 
        setUnidade('un');
        setCodigoBarras('');
      }
      setIsSubmitting(false);
    }
  }, [isOpen, itemParaEditar]);

  const handleSalvarItem = async () => {
    const isServico = categoria === 'Serviço';

    // VALIDAÇÃO AJUSTADA: Não exige quantidade e estoque mínimo se for Serviço
    if (!nome || (!isServico && ((!itemParaEditar && quantidade === '') || estoqueMinimo === ''))) {
      alert("Por favor, preencha os campos obrigatórios.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      nome,
      categoria,
      unidade_medida: isServico ? 'un' : unidade, // Serviço geralmente não tem unidade física
      estoque_minimo: isServico ? 0 : (parseFloat(estoqueMinimo) || 0),
      estoque_maximo: isServico ? null : (estoqueMaximo ? parseFloat(estoqueMaximo) : null),
      custo_medio: custoMedio ? parseFloat(custoMedio) : 0,
      preco_venda: precoVenda ? parseFloat(precoVenda) : 0, 
      codigo_barras: codigoBarras || null
    };

    if (!itemParaEditar) {
      payload.quantidade_atual = 0; 
    }

    let error, data;

    if (itemParaEditar) {
      const response = await supabase.from('produtos').update(payload).eq('id', itemParaEditar.id).select().single();
      error = response.error;
      data = response.data;
    } else {
      const response = await supabase.from('produtos').insert([payload]).select().single();
      error = response.error;
      data = response.data;

      // Movimentação inicial de estoque (Ignorado se for Serviço)
      const qtdInicial = parseFloat(quantidade);
      if (!error && !isServico && qtdInicial > 0) {
        const { error: errorHist } = await supabase.from('movimentacoes_estoque').insert([{
          produto_id: data.id,
          tipo_movimentacao: 'ENTRADA',
          quantidade: qtdInicial,
          observacao: 'Saldo Inicial (Cadastro do Produto)'
        }]);
        
        if (errorHist) console.error("Erro ao gravar saldo inicial no histórico:", errorHist);
      }
    }

    setIsSubmitting(false);

    if (error) {
      console.error("Erro ao salvar no Supabase:", error);
      alert(`Falha ao salvar o item: ${error.message}`);
      return;
    }

    if (onSuccess) onSuccess(data);
    onClose();
  };

  const isEdicao = !!itemParaEditar;
  const isServico = categoria === 'Serviço';

  return (
    <Modal isOpen={isOpen}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-[#0F4C81]">
            {isEdicao ? 'Editar Produto / Serviço' : 'Registrar Novo Item'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Produto / Serviço</label>
              <input 
                type="text" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Lona Brilho 440g - Rolo ou Design Gráfico" 
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81]" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
              <select 
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] bg-white text-slate-700"
              >
                <option value="Matéria-Prima">Matéria-Prima</option>
                <option value="Produto Acabado">Produto Acabado</option>
                <option value="Serviço">Serviço</option>
                <option value="Embalagem">Embalagem</option>
                <option value="Ferramenta">Ferramenta</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Código de Barras (Opcional)</label>
              <input 
                type="text" 
                value={codigoBarras}
                onChange={(e) => setCodigoBarras(e.target.value)}
                placeholder="Escaneie ou digite..." 
                disabled={isServico} // Desabilita se for serviço
                className={`w-full border rounded-lg p-2.5 focus:outline-none font-mono ${isServico ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'border-slate-300 focus:border-[#0F4C81]'}`} 
              />
            </div>
          </div>

          <div className={`grid gap-4 pt-2 border-t border-slate-100 mt-2 ${isServico ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-5'}`}>
             
            {!isServico && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unidade</label>
                <select 
                  value={unidade}
                  onChange={(e) => setUnidade(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] bg-white text-slate-700"
                >
                  <option value="un">Un (un)</option>
                  <option value="h">Hora (h)</option>
                  <option value="kg">Quilo (kg)</option>
                  <option value="g">Grama (g)</option>
                  <option value="L">Litro (L)</option>
                  <option value="m">Metro (m)</option>
                  <option value="m2">Metro Quadrado (m²)</option>
                  <option value="cx">Caixa (cx)</option>
                  <option value="fls">Folhas (fls)</option>
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Custo Médio (R$)</label>
              <input 
                type="number" 
                step="0.01"
                value={custoMedio}
                onChange={(e) => setCustoMedio(e.target.value)}
                placeholder="0,00" 
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81]" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Preço Venda (R$)</label>
              <input 
                type="number" 
                step="0.01"
                value={precoVenda}
                onChange={(e) => setPrecoVenda(e.target.value)}
                placeholder="0,00" 
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#1B9C85] font-bold text-[#1B9C85]" 
              />
              {vendaNum > 0 && (
                <div className={`mt-1 text-[10px] font-bold ${corLucro} leading-tight`}>
                  {lucroRS >= 0 ? '+' : ''}{formatMoedaMini(lucroRS)} ({margemPerc.toFixed(1)}%)
                </div>
              )}
            </div>

            {/* RENDERIZAÇÃO CONDICIONAL: Só exibe se NÃO for serviço */}
            {!isServico && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {isEdicao ? 'Saldo (Travado)' : 'Qtd Inicial'}
                  </label>
                  <input 
                    type="number" 
                    step="0.001"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    disabled={isEdicao}
                    placeholder="0" 
                    className={`w-full border rounded-lg p-2.5 focus:outline-none font-semibold ${
                      isEdicao 
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'border-slate-300 focus:border-[#0F4C81] text-[#1B9C85]'
                    }`} 
                    title={isEdicao ? "Use o botão Mover para alterar o saldo" : ""}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estq. Mínimo</label>
                  <input 
                    type="number" 
                    step="0.001"
                    value={estoqueMinimo}
                    onChange={(e) => setEstoqueMinimo(e.target.value)}
                    placeholder="5" 
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#E74C3C] font-semibold text-[#E74C3C]" 
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSalvarItem}
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#0F4C81] text-white font-medium hover:bg-[#0c3e6a] rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar no Banco'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
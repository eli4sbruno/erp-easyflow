import React, { useState, useEffect } from 'react';
import { supabase } from "@/supabaseClient";
import Modal from "@/components/modals/Modal";

const CloseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;

export default function ModalPagamento({ isOpen, onClose, onSuccess, dadosIniciais }) {
  // Novo estado para controlar se é receita ou despesa
  const [tipoTransacao, setTipoTransacao] = useState('receita');
  
  const [entidade, setEntidade] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [condicaoPagamento, setCondicaoPagamento] = useState('avista');
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [categoria, setCategoria] = useState('');
  const [centroCusto, setCentroCusto] = useState('Administrativo');

  // Listas dinâmicas
  const categoriasReceita = ['Venda de Produtos', 'Prestação de Serviços', 'Rendimentos', 'Outras Receitas'];
  const categoriasDespesa = ['Fornecedores', 'Impostos e Taxas', 'Folha de Pagamento', 'Manutenção', 'Marketing', 'Outras Despesas'];
  const centrosCustoList = ['Administrativo', 'Produção', 'Vendas', 'Marketing', 'Logística'];

  // Atualiza a categoria padrão quando o tipo de transação muda
  useEffect(() => {
    setCategoria(tipoTransacao === 'receita' ? categoriasReceita[0] : categoriasDespesa[0]);
  }, [tipoTransacao]);

  useEffect(() => {
    if (isOpen) {
      setEntidade(dadosIniciais?.cliente || '');
      setValorTotal(dadosIniciais?.valor ? dadosIniciais.valor.toString() : '');
      setTipoTransacao('receita'); // Padrão ao abrir
      setCondicaoPagamento('avista');
      setFormaPagamento('PIX');
      setCentroCusto('Administrativo');
    }
  }, [isOpen, dadosIniciais]);

  const handleFaturar = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return alert("Sessão expirada.");
    if (!entidade || !valorTotal || !categoria) return alert("Preencha cliente/fornecedor, valor e plano de contas.");

    const valorFormatado = Number(valorTotal);
    let novasTransacoes = [];
    const hoje = new Date().toISOString().split('T')[0];

    const baseTransacao = {
      user_id: user.id,
      cliente: entidade,
      forma_pagamento: formaPagamento,
      tipo: tipoTransacao, // Dinâmico: 'receita' ou 'despesa'
      categoria: categoria,
      centro_custo: centroCusto,
      descricao: dadosIniciais?.ref ? `Ref: ${dadosIniciais.ref}` : (tipoTransacao === 'receita' ? 'Receita Direta' : 'Despesa Direta')
    };

    if (condicaoPagamento === 'avista') {
      novasTransacoes.push({
        ...baseTransacao,
        descricao: `${baseTransacao.descricao} - À Vista`,
        valor: valorFormatado,
        vencimento: hoje,
        status: 'Pago'
      });
    } else if (condicaoPagamento === 'sinal_entrega') {
      novasTransacoes.push({
        ...baseTransacao,
        descricao: `${baseTransacao.descricao} - Sinal 50%`,
        valor: valorFormatado * 0.5,
        vencimento: hoje,
        status: 'Pago'
      });
      novasTransacoes.push({
        ...baseTransacao,
        descricao: `${baseTransacao.descricao} - Restante 50%`,
        valor: valorFormatado * 0.5,
        vencimento: null, 
        status: 'Pendente'
      });
    }

    const { error } = await supabase.from('transacoes').insert(novasTransacoes);

    if (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao processar o lançamento.');
    } else {
      onClose();
      if (onSuccess) onSuccess();
    }
  };

  if (!isOpen) return null;

  const isReceita = tipoTransacao === 'receita';
  const categoriasAtuais = isReceita ? categoriasReceita : categoriasDespesa;

  return (
    <Modal isOpen={isOpen}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in border border-slate-200">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h3 className={`text-lg font-bold ${isReceita ? 'text-[#0F4C81]' : 'text-[#E74C3C]'}`}>
            {isReceita ? 'Checkout / Faturamento' : 'Registrar Despesa'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl"><CloseIcon /></button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Toggle de Tipo de Transação */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setTipoTransacao('receita')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                isReceita ? 'bg-white text-[#1B9C85] shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Entrada (Receita)
            </button>
            <button
              onClick={() => setTipoTransacao('despesa')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                !isReceita ? 'bg-white text-[#E74C3C] shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Saída (Despesa)
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {isReceita ? 'Cliente / Origem' : 'Fornecedor / Destino'}
            </label>
            <input 
              type="text" 
              value={entidade} 
              onChange={(e) => setEntidade(e.target.value)} 
              placeholder={isReceita ? "Nome do cliente" : "Nome do fornecedor"} 
              className="w-full border rounded-lg p-2.5 focus:outline-none border-slate-300 focus:border-[#0F4C81] bg-slate-50" 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Plano de Contas</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81] bg-white text-sm">
                {categoriasAtuais.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Centro de Custo</label>
              <select value={centroCusto} onChange={(e) => setCentroCusto(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81] bg-white text-sm">
                {centrosCustoList.map(centro => <option key={centro} value={centro}>{centro}</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor Total (R$)</label>
              <input 
                type="number" 
                value={valorTotal} 
                onChange={(e) => setValorTotal(e.target.value)} 
                placeholder="0.00" 
                className={`w-full border rounded-lg p-2.5 focus:outline-none text-lg font-bold border-slate-300 ${isReceita ? 'focus:border-[#0F4C81] text-[#0F4C81]' : 'focus:border-[#E74C3C] text-[#E74C3C]'}`} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Forma de Pagamento</label>
              <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] bg-white text-slate-700">
                <option value="PIX">PIX</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Transferência">Transferência Bancária</option>
                <option value="Boleto">Boleto</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Condição</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setCondicaoPagamento('avista')} 
                className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                  condicaoPagamento === 'avista' 
                    ? (isReceita ? 'border-[#1B9C85] bg-green-50 text-[#1B9C85]' : 'border-[#E74C3C] bg-red-50 text-[#E74C3C]')
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                À Vista (100%)
              </button>
              <button 
                onClick={() => setCondicaoPagamento('sinal_entrega')} 
                className={`p-3 border rounded-lg text-sm font-medium transition-colors flex flex-col items-center ${
                  condicaoPagamento === 'sinal_entrega' 
                    ? 'border-[#0F4C81] bg-blue-50 text-[#0F4C81]' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>50% Sinal +</span><span>50% Restante</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
          <button 
            onClick={handleFaturar} 
            className={`px-6 py-2 text-white font-medium rounded-lg shadow-sm transition-colors ${
              isReceita ? 'bg-[#0F4C81] hover:bg-[#0c3e6a]' : 'bg-[#E74C3C] hover:bg-[#c0392b]'
            }`}
          >
            {isReceita ? 'Faturar' : 'Salvar Despesa'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
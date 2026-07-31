import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Modal from './Modal';

// Ícone para fechar
const CloseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;

export default function ModalPagamento({ isOpen, onClose, onSuccess, dadosIniciais }) {
  const [entidade, setEntidade] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [condicaoPagamento, setCondicaoPagamento] = useState('avista');
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [categoria, setCategoria] = useState('Venda de Produtos');
  const [centroCusto, setCentroCusto] = useState('Administrativo');

  const categoriasReceita = ['Venda de Produtos', 'Prestação de Serviços', 'Rendimentos', 'Outras Receitas'];
  const centrosCustoList = ['Administrativo', 'Produção', 'Vendas', 'Marketing', 'Logística'];

  // Quando o modal abre, verifica se vieram dados da O.S. ou de Vendas
  useEffect(() => {
    if (isOpen) {
      setEntidade(dadosIniciais?.cliente || '');
      setValorTotal(dadosIniciais?.valor ? dadosIniciais.valor.toString() : '');
      setCategoria(dadosIniciais?.origem === 'OS' ? 'Prestação de Serviços' : 'Venda de Produtos');
      setCondicaoPagamento('avista');
      setFormaPagamento('PIX');
      setCentroCusto('Administrativo');
    }
  }, [isOpen, dadosIniciais]);

  const handleFaturar = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return alert("Sessão expirada.");
    if (!entidade || !valorTotal || !categoria) return alert("Preencha cliente, valor e plano de contas.");

    const valorFormatado = Number(valorTotal);
    let novasTransacoes = [];
    const hoje = new Date().toISOString().split('T')[0];

    const baseTransacao = {
      user_id: user.id,
      cliente: entidade,
      forma_pagamento: formaPagamento,
      tipo: 'receita',
      categoria: categoria,
      centro_custo: centroCusto,
      // Se vier uma referência (Ex: OP-123), guarda na observação
      descricao: dadosIniciais?.ref ? `Ref: ${dadosIniciais.ref}` : 'Receita Direta' 
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
      console.error('Erro ao faturar:', error);
      alert('Erro ao processar o pagamento.');
    } else {
      onClose();
      if (onSuccess) onSuccess();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in border border-slate-200">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-[#0F4C81]">Checkout / Faturamento</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl"><CloseIcon /></button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cliente / Origem</label>
            <input type="text" value={entidade} onChange={(e) => setEntidade(e.target.value)} placeholder="Nome do cliente" className="w-full border rounded-lg p-2.5 focus:outline-none border-slate-300 focus:border-[#0F4C81] bg-slate-50" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Plano de Contas</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81] bg-white text-sm">
                {categoriasReceita.map(cat => <option key={cat} value={cat}>{cat}</option>)}
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
              <input type="number" value={valorTotal} onChange={(e) => setValorTotal(e.target.value)} placeholder="0.00" className="w-full border rounded-lg p-2.5 focus:outline-none text-lg font-bold border-slate-300 focus:border-[#0F4C81] text-[#0F4C81]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Forma de Pagamento</label>
              <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] bg-white text-slate-700">
                <option value="PIX">PIX</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Transferência">Transferência Bancária</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Condição</label>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setCondicaoPagamento('avista')} className={`p-3 border rounded-lg text-sm font-medium transition-colors ${condicaoPagamento === 'avista' ? 'border-[#1B9C85] bg-green-50 text-[#1B9C85]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>À Vista (100%)</button>
              <button onClick={() => setCondicaoPagamento('sinal_entrega')} className={`p-3 border rounded-lg text-sm font-medium transition-colors flex flex-col items-center ${condicaoPagamento === 'sinal_entrega' ? 'border-[#0F4C81] bg-blue-50 text-[#0F4C81]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                <span>50% Sinal +</span><span>50% Restante</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
          <button onClick={handleFaturar} className="px-6 py-2 text-white font-medium rounded-lg shadow-sm transition-colors bg-[#0F4C81] hover:bg-[#0c3e6a]">Faturar</button>
        </div>
      </div>
    </Modal>
  );
}
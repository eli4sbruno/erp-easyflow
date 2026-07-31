import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Modal from './Modal';

const CloseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;

export default function ModalNovaDespesa({ isOpen, onClose, onSuccess }) {
  const [fornecedor, setFornecedor] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [condicaoPagamento, setCondicaoPagamento] = useState('avista');
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [categoria, setCategoria] = useState('Fornecedores');
  const [centroCusto, setCentroCusto] = useState('Administrativo');

  const categoriasDespesa = ['Folha de Pagamento', 'Impostos e Taxas', 'Fornecedores', 'Água/Luz/Internet', 'Aluguel', 'Marketing/Publicidade', 'Manutenção', 'Outras Despesas'];
  const centrosCustoList = ['Administrativo', 'Produção', 'Vendas', 'Marketing', 'Logística', 'Direção'];

  useEffect(() => {
    if (isOpen) {
      setFornecedor('');
      setValorTotal('');
      setCondicaoPagamento('avista');
      setFormaPagamento('PIX');
      setCategoria('Fornecedores');
      setCentroCusto('Administrativo');
    }
  }, [isOpen]);

  const handleSalvarDespesa = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return alert("Sessão expirada.");
    if (!fornecedor || !valorTotal || !categoria) return alert("Preencha fornecedor, valor e categoria.");

    const valorFormatado = Number(valorTotal);
    let novasTransacoes = [];
    const hoje = new Date().toISOString().split('T')[0];

    const baseTransacao = {
      user_id: user.id,
      cliente: fornecedor, // O campo na base de dados chama-se 'cliente', mas aqui usamos para a entidade
      forma_pagamento: formaPagamento,
      tipo: 'despesa',
      categoria: categoria,
      centro_custo: centroCusto,
    };

    if (condicaoPagamento === 'avista') {
      novasTransacoes.push({
        ...baseTransacao,
        descricao: 'Pagamento de Despesa',
        valor: valorFormatado,
        vencimento: hoje,
        status: 'Pago'
      });
    } else if (condicaoPagamento === 'adiantamento') {
      novasTransacoes.push({
        ...baseTransacao,
        descricao: 'Adiantamento 50%',
        valor: valorFormatado * 0.5,
        vencimento: hoje,
        status: 'Pago'
      });
      novasTransacoes.push({
        ...baseTransacao,
        descricao: 'Restante 50% - Conclusão',
        valor: valorFormatado * 0.5,
        vencimento: null, 
        status: 'Pendente'
      });
    }

    const { error } = await supabase.from('transacoes').insert(novasTransacoes);

    if (error) {
      console.error('Erro ao salvar despesa:', error);
      alert('Erro ao registar a despesa.');
    } else {
      onClose();
      if (onSuccess) onSuccess();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in border border-red-100">
        <div className="p-6 border-b flex justify-between items-center bg-red-50 border-red-100">
          <h3 className="text-lg font-bold text-[#E74C3C]">Registar Despesa</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 font-bold text-xl"><CloseIcon /></button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fornecedor / Favorecido</label>
            <input type="text" value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} placeholder="Ex: Fornecedor Lda, Conta de Luz..." className="w-full border rounded-lg p-2.5 focus:outline-none border-slate-300 focus:border-[#E74C3C]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Plano de Contas</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#E74C3C] bg-white text-sm">
                {categoriasDespesa.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Centro de Custo</label>
              <select value={centroCusto} onChange={(e) => setCentroCusto(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#E74C3C] bg-white text-sm">
                {centrosCustoList.map(centro => <option key={centro} value={centro}>{centro}</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor Total (R$)</label>
              <input type="number" value={valorTotal} onChange={(e) => setValorTotal(e.target.value)} placeholder="0.00" className="w-full border rounded-lg p-2.5 focus:outline-none text-lg font-bold border-red-200 focus:border-[#E74C3C] text-[#E74C3C]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Forma de Pagamento</label>
              <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#E74C3C] bg-white text-slate-700">
                <option value="PIX">PIX</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Boleto">Boleto</option>
                <option value="Transferência">Transferência Bancária</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Condição</label>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setCondicaoPagamento('avista')} className={`p-3 border rounded-lg text-sm font-medium transition-colors ${condicaoPagamento === 'avista' ? 'border-[#E74C3C] bg-red-50 text-[#E74C3C]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Pago à Vista</button>
              <button onClick={() => setCondicaoPagamento('adiantamento')} className={`p-3 border rounded-lg text-sm font-medium transition-colors flex flex-col items-center ${condicaoPagamento === 'adiantamento' ? 'border-[#E74C3C] bg-red-50 text-[#E74C3C]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                <span>50% Adiantamento +</span><span>50% Restante</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
          <button onClick={handleSalvarDespesa} className="px-6 py-2 text-white font-medium rounded-lg shadow-sm transition-colors bg-[#E74C3C] hover:bg-red-700">Guardar Despesa</button>
        </div>
      </div>
    </Modal>
  );
}
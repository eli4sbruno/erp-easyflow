import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Modal from './Modal';

export default function ModalNovaReceita({ isOpen, onClose, onSuccess }) {
  const [entidade, setEntidade] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [condicaoPagamento, setCondicaoPagamento] = useState('avista');
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [categoria, setCategoria] = useState('Venda de Produtos');
  const [centroCusto, setCentroCusto] = useState('Administrativo');

  const categoriasReceita = ['Venda de Produtos', 'Prestação de Serviços', 'Rendimentos', 'Investimentos', 'Outras Receitas'];
  const centrosCustoList = ['Administrativo', 'Produção', 'Vendas', 'Marketing', 'Logística', 'Direção'];

  // Limpa o formulário sempre que o modal abre
  useEffect(() => {
    if (isOpen) {
      setEntidade('');
      setValorTotal('');
      setCondicaoPagamento('avista');
      setFormaPagamento('PIX');
      setCategoria('Venda de Produtos');
      setCentroCusto('Administrativo');
    }
  }, [isOpen]);

  const handleSalvarTransacao = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("Sessão expirada. Faça login novamente.");
      return;
    }

    if (!entidade || !valorTotal || !categoria) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const valorFormatado = Number(valorTotal);
    let novasTransacoes = [];
    const hoje = new Date().toISOString().split('T')[0];

    const baseTransacao = {
      user_id: user.id,
      cliente: entidade,
      forma_pagamento: formaPagamento,
      tipo: 'receita',
      categoria: categoria,
      centro_custo: centroCusto
    };

    if (condicaoPagamento === 'avista') {
      novasTransacoes.push({
        ...baseTransacao,
        descricao: 'Pagamento à Vista',
        valor: valorFormatado,
        vencimento: hoje,
        status: 'Pago'
      });
    } else if (condicaoPagamento === 'sinal_entrega') {
      novasTransacoes.push({
        ...baseTransacao,
        descricao: 'Sinal 50% - Início',
        valor: valorFormatado * 0.5,
        vencimento: hoje,
        status: 'Pago'
      });
      novasTransacoes.push({
        ...baseTransacao,
        descricao: 'Restante 50% - Entrega',
        valor: valorFormatado * 0.5,
        vencimento: null, 
        status: 'Pendente'
      });
    }

    const { error } = await supabase.from('transacoes').insert(novasTransacoes);

    if (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao guardar a transação.');
    } else {
      onClose();
      if (onSuccess) onSuccess(); // Atualiza o Dashboard
    }
  };

  return (
    <Modal isOpen={isOpen}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50 border-slate-100">
          <h3 className="text-lg font-bold text-[#0F4C81]">Registar Receita</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cliente / Origem</label>
            <input 
              type="text" 
              value={entidade}
              onChange={(e) => setEntidade(e.target.value)}
              placeholder="Ex: Empresa XPTO" 
              className="w-full border rounded-lg p-2.5 focus:outline-none border-slate-300 focus:border-[#0F4C81]" 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Plano de Contas</label>
              <select 
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81] bg-white text-slate-700 text-sm"
              >
                {categoriasReceita.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Centro de Custo</label>
              <select 
                value={centroCusto}
                onChange={(e) => setCentroCusto(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81] bg-white text-slate-700 text-sm"
              >
                {centrosCustoList.map(centro => (
                  <option key={centro} value={centro}>{centro}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor Total</label>
              <input 
                type="number" 
                value={valorTotal}
                onChange={(e) => setValorTotal(e.target.value)}
                placeholder="0.00" 
                className="w-full border rounded-lg p-2.5 focus:outline-none text-lg font-semibold border-slate-300 focus:border-[#0F4C81]" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Forma de Pagamento</label>
              <select 
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] bg-white text-slate-700"
              >
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
                    ? 'border-[#1B9C85] bg-green-50 text-[#1B9C85]'
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
                <span>50% Sinal +</span>
                <span>50% Restante</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
          <button 
            onClick={handleSalvarTransacao}
            className="px-4 py-2 text-white font-medium rounded-lg shadow-sm transition-colors bg-[#0F4C81] hover:bg-[#0c3e6a]"
          >
            Guardar
          </button>
        </div>
      </div>
    </Modal>
  );
}
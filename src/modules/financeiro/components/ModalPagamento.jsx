import React, { useState, useEffect } from 'react';
import { supabase } from "@/supabaseClient";

// Ícones
const CloseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const PixIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1.88 15.46l-2.83-2.83a1.49 1.49 0 00-2.12 0l-2.83 2.83a1.49 1.49 0 01-2.12-2.12l2.83-2.83c.58.59 1.54.59 2.12 0l2.83-2.83a1.49 1.49 0 012.12 2.12l-2.83 2.83a1.49 1.49 0 000 2.12l2.83 2.83a1.49 1.49 0 01-2.12 2.12z"></path></svg>;
const CardIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>;
const CashIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>;
const CheckIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>;

const formatMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

export default function ModalPagamento({ isOpen, onClose, onSuccess, dadosIniciais }) {
  const [tipoTransacao, setTipoTransacao] = useState('receita');
  const [entidade, setEntidade] = useState('');
  const [valorTotalStr, setValorTotalStr] = useState('');
  const [condicaoPagamento, setCondicaoPagamento] = useState('avista');
  const [categoria, setCategoria] = useState('');
  const [centroCusto, setCentroCusto] = useState('Administrativo');
  
  // Estados para o Carrinho Multi-Pagamentos
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [valorRecebidoStr, setValorRecebidoStr] = useState('');
  const [pagamentosAdicionados, setPagamentosAdicionados] = useState([]);
  
  const [isProcessing, setIsProcessing] = useState(false);

  const categoriasReceita = ['Venda de Produtos', 'Prestação de Serviços', 'Rendimentos', 'Outras Receitas'];
  const categoriasDespesa = ['Fornecedores', 'Impostos e Taxas', 'Folha de Pagamento', 'Manutenção', 'Marketing', 'Outras Despesas'];
  const centrosCustoList = ['Administrativo', 'Produção', 'Vendas', 'Marketing', 'Logística'];

  const isReceita = tipoTransacao === 'receita';
  const categoriasAtuais = isReceita ? categoriasReceita : categoriasDespesa;

  useEffect(() => {
    setCategoria(isReceita ? categoriasReceita[0] : categoriasDespesa[0]);
  }, [tipoTransacao]);

  useEffect(() => {
    if (isOpen) {
      const vlr = Number(dadosIniciais?.valor) || 0;
      const vlrFormatado = vlr.toFixed(2).replace('.', ','); 
      
      setEntidade(dadosIniciais?.cliente || '');
      setValorTotalStr(vlrFormatado);
      
      const condicaoHerdada = dadosIniciais?.condicao_pagamento === '50% Entrada / 50% Entrega' ? 'sinal_entrega' : 'avista';
      setCondicaoPagamento(condicaoHerdada);
      
      const recebidoInicial = condicaoHerdada === 'sinal_entrega' ? (vlr / 2) : vlr;
      setValorRecebidoStr(recebidoInicial.toFixed(2).replace('.', ',')); 
      
      if (dadosIniciais?.venda_id) {
        setTipoTransacao('receita');
        setCategoria('Venda de Produtos');
        setCentroCusto('Vendas');
      } else {
        setTipoTransacao('receita');
        setCentroCusto('Administrativo');
      }
      
      setFormaPagamento('PIX');
      setPagamentosAdicionados([]); // Reseta o carrinho sempre que abrir
      setIsProcessing(false);
    }
  }, [isOpen, dadosIniciais]);

  // Matemáticas Principais
  const valorTotalNum = Number(valorTotalStr.toString().replace(/\./g, '').replace(',', '.')) || 0;
  const valorEsperadoGeral = condicaoPagamento === 'sinal_entrega' ? Number((valorTotalNum / 2).toFixed(2)) : valorTotalNum;
  
  const totalJaAdicionado = pagamentosAdicionados.reduce((acc, p) => acc + p.valor, 0);
  const valorRestante = Number((valorEsperadoGeral - totalJaAdicionado).toFixed(2));
  
  const valorInputNum = Number(valorRecebidoStr.toString().replace(/\./g, '').replace(',', '.')) || 0;
  
  // Troco só é calculado se o usuário usar Dinheiro ou Cheque e der um valor maior que o restante
  const calcularTroco = (formaPagamento === 'Dinheiro' || formaPagamento === 'Cheque');
  const troco = calcularTroco && valorInputNum > valorRestante ? Number((valorInputNum - valorRestante).toFixed(2)) : 0;
  const faltaInput = valorInputNum < valorRestante ? Number((valorRestante - valorInputNum).toFixed(2)) : 0;

  // Atualizações de UI (Mudança de Condição ou Forma de Pagamento)
  const handleMudarCondicao = (condicao) => {
    setCondicaoPagamento(condicao);
    setPagamentosAdicionados([]); // Se mudar a regra do jogo, zera o carrinho
    const novoEsperado = condicao === 'sinal_entrega' ? valorTotalNum / 2 : valorTotalNum;
    setValorRecebidoStr(novoEsperado.toFixed(2).replace('.', ','));
  };

  const handleMudarFormaPagamento = (forma) => {
    setFormaPagamento(forma);
    setValorRecebidoStr(valorRestante.toFixed(2).replace('.', ','));
  };

  const adicionarPagamentoParcial = () => {
    if (valorInputNum <= 0) return;
    
    setPagamentosAdicionados([...pagamentosAdicionados, {
      forma: formaPagamento,
      valor: valorInputNum
    }]);
    
    const novoRestante = valorRestante - valorInputNum;
    setValorRecebidoStr(novoRestante.toFixed(2).replace('.', ','));
  };

  const removerPagamento = (index) => {
    const novaLista = [...pagamentosAdicionados];
    const itemRemovido = novaLista.splice(index, 1)[0];
    setPagamentosAdicionados(novaLista);
    
    const novoRestante = valorRestante + itemRemovido.valor;
    setValorRecebidoStr(novoRestante.toFixed(2).replace('.', ','));
  };

  // Finalização do Faturamento
  const handleFaturar = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return alert("Sessão expirada. Faça login novamente.");
    if (!entidade || !valorTotalNum || !categoria) return alert("Preencha cliente/fornecedor, valor e plano de contas.");
    
    setIsProcessing(true);
    let novasTransacoes = [];
    const hoje = new Date().toISOString().split('T')[0];

    const baseTransacao = {
      user_id: user.id,
      venda_id: dadosIniciais?.venda_id || null, 
      cliente: entidade,
      tipo: tipoTransacao,
      categoria: categoria,
      centro_custo: centroCusto,
      descricao: dadosIniciais?.descricao || (isReceita ? 'Receita Direta' : 'Despesa Direta')
    };

    let pagamentosFinais = [...pagamentosAdicionados];
    
    if (valorRestante > 0) {
      if (valorInputNum >= valorRestante) {
        pagamentosFinais.push({ forma: formaPagamento, valor: valorRestante });
      } else {
        alert("O valor inserido é menor que o saldo restante. Clique em 'Adicionar Pagamento Parcial' ou corrija o valor.");
        setIsProcessing(false);
        return;
      }
    }

    // Grava cada pagamento que foi dado agora
    pagamentosFinais.forEach(pag => {
      let descExtra = '';
      if (condicaoPagamento === 'sinal_entrega') {
        descExtra = ' (Sinal)';
      } else if (pagamentosFinais.length > 1) {
        descExtra = ` (Parte em ${pag.forma})`;
      } else {
        descExtra = ' - À Vista';
      }

      novasTransacoes.push({
        ...baseTransacao,
        forma_pagamento: pag.forma,
        descricao: `${baseTransacao.descricao}${descExtra}`,
        valor: pag.valor,
        data_vencimento: hoje,
        status: 'Pago'
      });
    });

    // Grava a dívida (O restante) se for 50% de sinal
    if (condicaoPagamento === 'sinal_entrega') {
      // Joga a data de vencimento para 15 dias no futuro para não sujar o caixa de hoje
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 15);
      const vencimentoRestante = dataFutura.toISOString().split('T')[0];

      novasTransacoes.push({
        ...baseTransacao,
        forma_pagamento: 'A Definir',
        descricao: `${baseTransacao.descricao} (Restante a Pagar)`,
        valor: Number((valorTotalNum / 2).toFixed(2)),
        data_vencimento: vencimentoRestante, 
        status: 'Pendente'
      });
    }

    const { error } = await supabase.from('transacoes').insert(novasTransacoes);

    if (error) {
      console.error('Erro ao salvar no banco:', error);
      alert(`Erro no banco de dados: ${error.message}`);
      setIsProcessing(false);
      return;
    } 

    if (dadosIniciais?.venda_id) {
      await supabase.from('vendas').update({ status: 'Em Produção' }).eq('id', dadosIniciais.venda_id);
    }

    setIsProcessing(false);
    onClose();
    if (onSuccess) onSuccess();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[10005] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col lg:flex-row overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
        
        {/* LADO ESQUERDO: INFORMAÇÕES BASE */}
        <div className="w-full lg:w-5/12 bg-slate-50 p-6 lg:p-8 flex flex-col justify-between border-r border-slate-200">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${isReceita ? 'text-[#0F4C81]' : 'text-[#E74C3C]'}`}>
                {isReceita ? 'Faturamento' : 'Lançar Despesa'}
              </h3>
            </div>

            {!dadosIniciais?.venda_id && (
              <div className="flex bg-slate-200 p-1 rounded-lg mb-6">
                <button onClick={() => setTipoTransacao('receita')} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${isReceita ? 'bg-white text-[#1B9C85] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Entrada</button>
                <button onClick={() => setTipoTransacao('despesa')} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${!isReceita ? 'bg-white text-[#E74C3C] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Saída</button>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{isReceita ? 'Cliente / Origem' : 'Fornecedor / Destino'}</label>
                <input type="text" value={entidade} onChange={(e) => setEntidade(e.target.value)} placeholder="Nome..." className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] bg-white text-sm font-medium text-slate-800" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoria</label>
                  <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] bg-white text-sm text-slate-700">
                    {categoriasAtuais.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">C. de Custo</label>
                  <select value={centroCusto} onChange={(e) => setCentroCusto(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] bg-white text-sm text-slate-700">
                    {centrosCustoList.map(centro => <option key={centro} value={centro}>{centro}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor Total (R$)</label>
                <input type="text" value={valorTotalStr} onChange={(e) => setValorTotalStr(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none text-lg font-bold bg-white text-slate-800" />
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Condição Acordada</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleMudarCondicao('avista')} className={`p-2.5 border-2 rounded-lg text-xs font-bold transition-all ${condicaoPagamento === 'avista' ? (isReceita ? 'border-[#1B9C85] bg-[#1B9C85]/10 text-[#1B9C85]' : 'border-[#E74C3C] bg-[#E74C3C]/10 text-[#E74C3C]') : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>Pagar Tudo Agora</button>
                  <button onClick={() => handleMudarCondicao('sinal_entrega')} className={`p-2.5 border-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center leading-tight ${condicaoPagamento === 'sinal_entrega' ? 'border-[#0F4C81] bg-[#0F4C81]/10 text-[#0F4C81]' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                    <span>Sinal 50%</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: O CARRINHO DE PAGAMENTOS */}
        <div className="w-full lg:w-7/12 bg-slate-800 text-white p-6 lg:p-8 flex flex-col relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"><CloseIcon /></button>

          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total a Receber Neste Momento</h4>
            <p className="text-4xl font-black text-[#1B9C85]">{formatMoeda(valorEsperadoGeral)}</p>
            {condicaoPagamento === 'sinal_entrega' && <p className="text-xs text-amber-400 mt-1 font-medium">A outra metade ({formatMoeda(valorEsperadoGeral)}) será gerada como dívida pendente (Restante a Pagar).</p>}
          </div>

          {/* LISTA MULTI-PAGAMENTOS */}
          {pagamentosAdicionados.length > 0 && (
            <div className="mb-6 bg-slate-700/50 p-4 rounded-xl border border-slate-600 animate-fade-in">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Pagamentos Inseridos</h5>
              <div className="space-y-2">
                {pagamentosAdicionados.map((pag, index) => (
                  <div key={index} className="flex justify-between items-center bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 text-sm font-semibold">{pag.forma}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white">{formatMoeda(pag.valor)}</span>
                      <button onClick={() => removerPagamento(index)} className="text-red-400 hover:text-red-300" title="Remover"><CloseIcon /></button>
                    </div>
                  </div>
                ))}
              </div>
              {valorRestante > 0 && (
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-600">
                  <span className="text-sm font-bold text-amber-400">Falta Receber:</span>
                  <span className="text-xl font-black text-amber-400">{formatMoeda(valorRestante)}</span>
                </div>
              )}
            </div>
          )}

          {/* ÁREA DE INPUT */}
          {valorRestante > 0 ? (
            <div className="space-y-4 flex-1 animate-fade-in">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Selecione o Método</h4>
              <div className="grid grid-cols-4 gap-2 mb-4">
                <button onClick={() => handleMudarFormaPagamento('PIX')} className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 transition-all ${formaPagamento === 'PIX' ? 'border-[#1B9C85] bg-[#1B9C85]/20 text-white shadow-inner' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500'}`}><PixIcon /><span className="text-[10px] font-bold">PIX</span></button>
                <button onClick={() => handleMudarFormaPagamento('Cartão')} className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 transition-all ${formaPagamento === 'Cartão' ? 'border-[#3498db] bg-[#3498db]/20 text-white shadow-inner' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500'}`}><CardIcon /><span className="text-[10px] font-bold">Cartão</span></button>
                <button onClick={() => handleMudarFormaPagamento('Dinheiro')} className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 transition-all ${formaPagamento === 'Dinheiro' ? 'border-emerald-500 bg-emerald-500/20 text-white shadow-inner' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500'}`}><CashIcon /><span className="text-[10px] font-bold">Dinheiro</span></button>
                <button onClick={() => handleMudarFormaPagamento('Cheque')} className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 transition-all ${formaPagamento === 'Cheque' ? 'border-purple-500 bg-purple-500/20 text-white shadow-inner' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500'}`}><CheckIcon /><span className="text-[10px] font-bold">Cheque</span></button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Valor Entregue pelo Cliente (R$)</label>
                <input type="text" value={valorRecebidoStr} onChange={(e) => setValorRecebidoStr(e.target.value)} className="w-full text-2xl font-bold px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-[#1B9C85] text-white" />
              </div>

              {calcularTroco && troco > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex justify-between items-center animate-fade-in">
                  <span className="text-amber-400 font-bold">Troco a devolver:</span>
                  <span className="text-xl font-black text-amber-500">{formatMoeda(troco)}</span>
                </div>
              )}
              
              {faltaInput > 0 ? (
                <button onClick={adicionarPagamentoParcial} className="mt-4 w-full py-3.5 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-bold shadow-sm transition-colors flex items-center justify-center gap-2">
                  Adicionar Pagamento Parcial de {formatMoeda(valorInputNum)}
                </button>
              ) : (
                <button onClick={handleFaturar} disabled={isProcessing} className={`mt-4 w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-transform active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 ${isReceita ? 'bg-[#1B9C85] hover:bg-[#15806c] text-white' : 'bg-[#E74C3C] hover:bg-[#c0392b] text-white'}`}>
                  {isProcessing ? 'Processando...' : <><CheckIcon /> {isReceita ? 'Confirmar e Finalizar' : 'Registrar Despesa'}</>}
                </button>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center animate-fade-in">
              <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4"><CheckIcon /></div>
              <h3 className="text-xl font-bold text-white mb-2">Pagamento Completo!</h3>
              <p className="text-slate-400 mb-6">Aguardando confirmação para salvar no sistema.</p>
              <button onClick={handleFaturar} disabled={isProcessing} className="w-full py-4 bg-[#1B9C85] hover:bg-[#15806c] text-white rounded-xl font-bold text-lg shadow-lg transition-transform active:scale-95">
                {isProcessing ? 'Processando...' : 'Concluir Lançamento no Banco'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
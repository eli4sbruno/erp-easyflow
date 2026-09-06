import React, { useState, useEffect, useRef } from 'react';
import { supabase } from "@/supabaseClient";
import ModalPagamento from "@/modules/financeiro/components/ModalPagamento";
import ImprimirReciboPDV from "./ImprimirReciboPDV"; // <-- Import da Impressão

// Ícones básicos
const CloseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const SearchIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;

const formatMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

export default function ModalPDV({ isOpen, onClose }) {
  const buscaInputRef = useRef(null);
  const pressTimeoutRef = useRef(null);
  const pressIntervalRef = useRef(null);
  
  const [busca, setBusca] = useState('');
  const [sugestoes, setSugestoes] = useState([]);
  const [showSugestoes, setShowSugestoes] = useState(false);
  
  const [carrinho, setCarrinho] = useState([]);
  const [cliente, setCliente] = useState('Cliente Balcão');
  const [descontoStr, setDescontoStr] = useState('');
  const [observacao, setObservacao] = useState('');
  
  const [showPagamento, setShowPagamento] = useState(false);
  const [reciboData, setReciboData] = useState(null); // <-- Estado do Recibo
  
  // Cálculos do Carrinho
  const subtotal = carrinho.reduce((acc, item) => acc + (item.quantidade * item.preco_venda), 0);
  const desconto = Number(descontoStr.toString().replace(/\./g, '').replace(',', '.')) || 0;
  const total = subtotal - desconto;

  // Limpar os intervalos de clique caso o componente desmonte
  useEffect(() => {
    return () => stopChanging();
  }, []);

  // Foca no input de busca sempre que o modal abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => buscaInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // --- SISTEMA DE ATALHOS POR TECLADO ---
  useEffect(() => {
    if (!isOpen || showPagamento || reciboData) return;

    const handleKeyDown = (e) => {
      switch(e.key) {
        case 'F2':
          e.preventDefault();
          buscaInputRef.current?.focus();
          break;
        case 'F4':
          e.preventDefault();
          document.getElementById('input-desconto')?.focus();
          break;
        case 'F12':
          e.preventDefault();
          if (carrinho.length > 0) setShowPagamento(true);
          break;
        case 'Escape':
          if (carrinho.length > 0) {
            if (window.confirm("Deseja cancelar a venda atual e limpar o carrinho?")) {
              setCarrinho([]);
              setDescontoStr('');
              setBusca('');
              setSugestoes([]);
              setShowSugestoes(false);
              buscaInputRef.current?.focus();
            }
          } else {
            onClose();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showPagamento, carrinho, reciboData]);

  // --- LÓGICA DE BUSCA COM PRÉVIA (Dropdown) ---
  const handleBuscaChange = async (e) => {
    const termo = e.target.value;
    setBusca(termo);

    if (termo.trim().length >= 2) {
      const { data } = await supabase
        .from('produtos')
        .select('*')
        .eq('ativo', true) // <-- Trava de inativos adicionada
        .or(`codigo_barras.eq.${termo.trim()},nome.ilike.%${termo.trim()}%`)
        .limit(10);
      
      setSugestoes(data || []);
      setShowSugestoes(true);
    } else {
      setSugestoes([]);
      setShowSugestoes(false);
    }
  };

  const handleBuscaKeyDown = async (e) => {
    if (e.key === 'Enter' && busca.trim() !== '') {
      e.preventDefault();
      
      const termo = busca.trim();
      const { data } = await supabase
        .from('produtos')
        .select('*')
        .eq('ativo', true) // <-- Trava de inativos adicionada
        .or(`codigo_barras.eq.${termo},nome.ilike.%${termo}%`)
        .limit(1)
        .single();

      if (data) {
        selecionarSugestao(data);
      } else {
        alert("Produto não encontrado ou inativo!");
      }
    }
  };

  const selecionarSugestao = (produto) => {
    adicionarAoCarrinho(produto);
    setBusca('');
    setSugestoes([]);
    setShowSugestoes(false);
    setTimeout(() => buscaInputRef.current?.focus(), 50);
  };

  // --- CARRINHO E QUANTIDADES ---
  const adicionarAoCarrinho = (produto) => {
    setCarrinho(prev => {
      const existe = prev.find(item => item.id === produto.id);
      if (existe) {
        return prev.map(item => item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item);
      }
      return [...prev, { ...produto, quantidade: 1 }];
    });
  };

  const alterarQuantidade = (id, delta) => {
    setCarrinho(prev => prev.map(item => {
      if (item.id === id) {
        const novaQtd = item.quantidade + delta;
        return novaQtd > 0 ? { ...item, quantidade: novaQtd } : item;
      }
      return item;
    }));
  };

  const removerItem = (id) => {
    setCarrinho(prev => prev.filter(item => item.id !== id));
  };

  // --- LÓGICA DO CLIQUE CONTÍNUO (+ / -) ---
  const startChanging = (id, delta) => {
    alterarQuantidade(id, delta); 
    
    pressTimeoutRef.current = setTimeout(() => {
      pressIntervalRef.current = setInterval(() => {
        alterarQuantidade(id, delta);
      }, 70); 
    }, 400); 
  };

  const stopChanging = () => {
    if (pressTimeoutRef.current) clearTimeout(pressTimeoutRef.current);
    if (pressIntervalRef.current) clearInterval(pressIntervalRef.current);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Container Principal do PDV, escondido se a impressão iniciar */}
      <div className={`fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[9900] flex items-center justify-center p-4 ${reciboData ? 'hidden' : ''}`}>
        <div className="bg-slate-100 rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden animate-fade-in" onClick={e => setShowSugestoes(false)}>
          
          {/* HEADER DO PDV */}
          <div className="bg-[#0F4C81] text-white px-6 py-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-black tracking-wide">CAIXA RÁPIDO (PDV)</h2>
              <div className="hidden md:flex gap-3 text-xs font-semibold bg-slate-800/50 px-3 py-1.5 rounded-lg">
                <span>[F2] Buscar</span>
                <span>[F4] Desconto</span>
                <span>[F12] Cobrar</span>
                <span>[ESC] Cancelar</span>
              </div>
            </div>
            <button onClick={onClose} className="hover:text-red-400 transition-colors"><CloseIcon /></button>
          </div>

          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            
            {/* LADO ESQUERDO: BUSCA E TABELA */}
            <div className="flex-1 flex flex-col p-6 overflow-hidden">
              
              {/* BARRA DE BUSCA COM DROPDOWN */}
              <div className="relative mb-4 shrink-0">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#0F4C81]">
                  <SearchIcon />
                </div>
                <input
                  ref={buscaInputRef}
                  type="text"
                  value={busca}
                  onChange={handleBuscaChange}
                  onKeyDown={handleBuscaKeyDown}
                  placeholder="Bipe o código de barras ou digite o nome e aperte Enter..."
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-300 rounded-xl text-lg font-bold text-slate-800 focus:outline-none focus:border-[#1B9C85] focus:ring-4 focus:ring-[#1B9C85]/20 shadow-sm"
                />

                {/* MODAL DE PRÉVIA DE SUGESTÕES */}
                {showSugestoes && sugestoes.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {sugestoes.map(prod => (
                      <div 
                        key={prod.id} 
                        onClick={(e) => { e.stopPropagation(); selecionarSugestao(prod); }}
                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center group transition-colors"
                      >
                        <div>
                          <div className="font-bold text-slate-800 group-hover:text-[#0F4C81]">{prod.nome}</div>
                          <div className="text-xs font-semibold text-slate-500">
                            Estoque: <span className={prod.quantidade_atual <= 0 ? 'text-red-500' : 'text-[#1B9C85]'}>{prod.quantidade_atual} {prod.unidade_medida}</span> 
                            {prod.codigo_barras ? ` | Cód: ${prod.codigo_barras}` : ''}
                          </div>
                        </div>
                        <div className="font-black text-lg text-[#1B9C85]">
                          {formatMoeda(prod.preco_venda)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* TABELA DE ITENS */}
              <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                  <table className="w-full text-left text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 w-12 text-center">#</th>
                        <th className="px-6 py-4">Produto</th>
                        <th className="px-6 py-4 text-center w-32">Estoque</th>
                        <th className="px-6 py-4 text-center w-40">Qtd</th>
                        <th className="px-6 py-4 text-right w-32">Vlr. Unit</th>
                        <th className="px-6 py-4 text-right w-32">Subtotal</th>
                        <th className="px-6 py-4 text-center w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {carrinho.length === 0 ? (
                        <tr><td colSpan="7" className="py-20 text-center text-slate-400 font-medium">O carrinho está vazio. Comece a bipar os produtos.</td></tr>
                      ) : (
                        carrinho.map((item, index) => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4 text-center text-slate-400 font-bold">{index + 1}</td>
                            <td className="px-6 py-4 font-bold text-slate-800 text-sm">{item.nome}</td>
                            <td className="px-6 py-4 text-center text-xs font-semibold text-slate-500">{item.quantidade_atual} {item.unidade_medida}</td>
                            
                            <td className="px-6 py-4 text-center select-none">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onMouseDown={() => startChanging(item.id, -1)}
                                  onMouseUp={stopChanging}
                                  onMouseLeave={stopChanging}
                                  onTouchStart={() => startChanging(item.id, -1)}
                                  onTouchEnd={stopChanging}
                                  className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded font-bold text-slate-600 transition-colors"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center font-bold text-lg">{item.quantidade}</span>
                                <button 
                                  onMouseDown={() => startChanging(item.id, 1)}
                                  onMouseUp={stopChanging}
                                  onMouseLeave={stopChanging}
                                  onTouchStart={() => startChanging(item.id, 1)}
                                  onTouchEnd={stopChanging}
                                  className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded font-bold text-slate-600 transition-colors"
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            <td className="px-6 py-4 text-right font-medium">{formatMoeda(item.preco_venda)}</td>
                            <td className="px-6 py-4 text-right font-bold text-[#0F4C81]">{formatMoeda(item.quantidade * item.preco_venda)}</td>
                            <td className="px-6 py-4 text-center">
                              <button onClick={() => removerItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2"><TrashIcon /></button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* LADO DIREITO: PAINEL DE FECHAMENTO */}
            <div className="w-full lg:w-96 bg-white border-l border-slate-200 p-6 flex flex-col justify-between shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cliente</label>
                  <input type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-[#0F4C81]" placeholder="Cliente Balcão" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Desconto [F4] (R$)</label>
                  <input id="input-desconto" type="number" value={descontoStr} onChange={(e) => setDescontoStr(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-red-500 focus:outline-none focus:border-red-500" placeholder="0,00" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Observações Internas</label>
                  <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0F4C81] resize-none" rows="2" placeholder="Ex: Entregar amanhã cedo..."></textarea>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="flex justify-between items-center text-slate-500 mb-2 font-medium">
                  <span>Subtotal</span>
                  <span>{formatMoeda(subtotal)}</span>
                </div>
                {desconto > 0 && (
                  <div className="flex justify-between items-center text-red-500 mb-2 font-bold">
                    <span>Desconto</span>
                    <span>- {formatMoeda(desconto)}</span>
                  </div>
                )}
                <div className="flex justify-between items-end mt-4">
                  <span className="text-sm font-bold text-slate-800 uppercase">Total Final</span>
                  <span className="text-5xl font-black text-[#1B9C85] tracking-tight">{formatMoeda(total)}</span>
                </div>

                <button 
                  onClick={() => carrinho.length > 0 && setShowPagamento(true)}
                  disabled={carrinho.length === 0}
                  className="w-full mt-8 py-5 bg-[#1B9C85] hover:bg-[#15806c] disabled:bg-slate-300 text-white rounded-xl font-black text-xl tracking-wide shadow-xl shadow-[#1B9C85]/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  COBRAR [F12]
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INTEGRAÇÃO COM O MODAL DE PAGAMENTO */}
      {showPagamento && (
        <ModalPagamento 
          isOpen={showPagamento} 
          dadosIniciais={{ 
            cliente: cliente, 
            valor: total, 
            descricao: `Venda Rápida (PDV) - ${carrinho.reduce((acc, item) => acc + item.quantidade, 0)} Itens`,
            condicao_pagamento: 'avista'
          }} 
          onClose={() => setShowPagamento(false)}
          onSuccess={() => {
            // Em vez de fechar, montamos os dados e ativamos a impressão
            setReciboData({
              cliente: cliente,
              itens: carrinho,
              subtotal: subtotal,
              desconto: desconto,
              total: total,
              operador: 'Caixa'
            });
            setShowPagamento(false);
          }}
        />
      )}

      {/* CHAMA O RECIBO TÉRMICO */}
      {reciboData && (
        <ImprimirReciboPDV 
          dadosRecibo={reciboData} 
          onClose={() => {
            setReciboData(null);
            setCarrinho([]); 
            setDescontoStr('');
            onClose(); // Fecha o PDV inteiro após a impressão
          }} 
        />
      )}
    </>
  );
}
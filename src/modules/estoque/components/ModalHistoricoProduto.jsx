import React, { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";
import Modal from "@/components/modals/Modal";

export default function ModalHistoricoProduto({ isOpen, onClose, produto }) {
  const [historico, setHistorico] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && produto) {
      buscarHistorico();
    } else {
      setHistorico([]);
    }
  }, [isOpen, produto]);

  const buscarHistorico = async () => {
    setIsLoading(true);
    
    // Busca na tabela que criamos, filtrando apenas pelo produto clicado
    const { data, error } = await supabase
      .from('movimentacoes_estoque')
      .select('*')
      .eq('produto_id', produto.id)
      .order('data_movimentacao', { ascending: false }); // Do mais recente para o mais antigo

    if (error) {
      console.error("Erro ao buscar histórico:", error);
    } else {
      setHistorico(data || []);
    }
    
    setIsLoading(false);
  };

  if (!produto) return null;

  // Função simples para formatar a data que vem do banco
  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <Modal isOpen={isOpen}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden animate-fade-in flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-[#0F4C81]">Extrato de Movimentações</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">{produto.nome}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Buscando histórico...</div>
          ) : historico.length === 0 ? (
            <div className="text-center py-12 text-slate-400 flex flex-col items-center">
              <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              <p>Nenhuma movimentação registrada para este item ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historico.map((mov) => {
                const isEntrada = mov.tipo_movimentacao === 'ENTRADA';
                return (
                  <div key={mov.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isEntrada ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-500'}`}>
                        {isEntrada ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isEntrada ? 'text-green-600' : 'text-orange-500'}`}>
                            {isEntrada ? 'Entrada' : 'Saída / Ajuste'}
                          </span>
                          <span className="text-xs text-slate-400">• {formatarData(mov.data_movimentacao)}</span>
                        </div>
                        {mov.observacao && (
                          <p className="text-sm text-slate-600 mt-1">{mov.observacao}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold text-lg ${isEntrada ? 'text-green-600' : 'text-slate-800'}`}>
                        {isEntrada ? '+' : '-'}{mov.quantidade} <span className="text-sm font-normal text-slate-500">{produto.unidade_medida}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end bg-white shrink-0">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
}
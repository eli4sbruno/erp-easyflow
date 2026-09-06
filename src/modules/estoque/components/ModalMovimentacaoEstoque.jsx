import React, { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";
import Modal from "@/components/modals/Modal";

export default function ModalMovimentacaoEstoque({ isOpen, onClose, onSuccess, produto }) {
  const [tipo, setTipo] = useState('ENTRADA');
  const [quantidade, setQuantidade] = useState('');
  const [observacao, setObservacao] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTipo('ENTRADA');
      setQuantidade('');
      setObservacao('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSalvar = async () => {
    const qtdNum = parseFloat(quantidade);

    if (!quantidade || qtdNum <= 0) {
      alert("Informe uma quantidade válida maior que zero.");
      return;
    }

    // Trava de segurança no Frontend (Apenas para UX - User Experience)
    if ((tipo === 'SAIDA' || tipo === 'AJUSTE_SAIDA') && produto.quantidade_atual - qtdNum < 0) {
      alert("Estoque insuficiente para esta saída!");
      return;
    }

    setIsSubmitting(true);

    // 1º e ÚNICO Passo: Registrar a movimentação.
    // A inteligência matemática foi movida para o Supabase (SQL).
    const { error: movError } = await supabase
      .from('movimentacoes_estoque')
      .insert([{
        produto_id: produto.id,
        tipo_movimentacao: tipo,
        quantidade: qtdNum,
        observacao: observacao || null
      }]);

    setIsSubmitting(false);

    if (movError) {
      console.error(movError);
      alert(`Erro ao salvar histórico: ${movError.message}`);
      return;
    }

    if (onSuccess) onSuccess();
    onClose();
  };

  if (!produto) return null;

  return (
    <Modal isOpen={isOpen}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-[#0F4C81]">Nova Movimentação</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">{produto.nome}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select 
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none font-semibold ${
                  tipo === 'ENTRADA' ? 'text-green-600 focus:border-green-500' : 'text-orange-600 focus:border-orange-500'
                }`}
              >
                <option value="ENTRADA">Entrada (+)</option>
                <option value="SAIDA">Saída (-)</option>
                <option value="AJUSTE_SAIDA">Perda/Ajuste (-)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Qtd ({produto.unidade_medida})</label>
              <input 
                type="number" 
                step="0.001"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="0" 
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] font-bold" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Motivo / Observação (Opcional)</label>
            <textarea 
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Compra NF 1234, ou Uso na OS #99" 
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] resize-none h-20" 
            />
          </div>
          
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center text-sm">
            <span className="text-slate-600">Saldo atual:</span>
            <span className="font-bold text-slate-800">{produto.quantidade_atual} {produto.unidade_medida}</span>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSalvar}
            disabled={isSubmitting}
            className={`px-4 py-2 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 ${
              tipo === 'ENTRADA' ? 'bg-[#1B9C85] hover:bg-[#157a68]' : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {isSubmitting ? 'Processando...' : 'Confirmar Movimentação'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
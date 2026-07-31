import React, { useState, useEffect } from 'react';
import Modal from './Modal';

export default function ModalNovoItemEstoque({ isOpen, onClose, onSuccess }) {
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('Matéria-Prima');
  const [quantidade, setQuantidade] = useState('');
  const [estoqueMinimo, setEstoqueMinimo] = useState('');
  const [unidade, setUnidade] = useState('un');
  const [codigoBarras, setCodigoBarras] = useState('');

  // Limpa o formulário sempre que o modal abrir
  useEffect(() => {
    if (isOpen) {
      setNome('');
      setCategoria('Matéria-Prima');
      setQuantidade('');
      setEstoqueMinimo('');
      setUnidade('un');
      setCodigoBarras('');
    }
  }, [isOpen]);

  const handleSalvarItem = () => {
    if (!nome || quantidade === '' || estoqueMinimo === '') {
      alert("Por favor, preencha o nome e as quantidades.");
      return;
    }

    // Cria um objeto fictício para o frontend
    const novoItem = {
      id: Date.now(), // Gera um ID aleatório temporário
      nome,
      categoria,
      quantidade: parseInt(quantidade, 10),
      estoque_minimo: parseInt(estoqueMinimo, 10),
      unidade_medida: unidade,
      codigo_barras: codigoBarras || null
    };

    if (onSuccess) onSuccess(novoItem);
    onClose();
  };

  return (
    <Modal isOpen={isOpen}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-[#0F4C81]">Registar Novo Item</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Item / Produto</label>
            <input 
              type="text" 
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Tinta Eco-Solvente Preto" 
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81]" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Código de Barras (opcional)</label>
            <input 
              type="text" 
              value={codigoBarras}
              onChange={(e) => setCodigoBarras(e.target.value)}
              placeholder="Escaneie ou digite o código..." 
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] font-mono" 
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
              <select 
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] bg-white text-slate-700"
              >
                <option value="Matéria-Prima">Matéria-Prima</option>
                <option value="Produto Acabado">Produto Acabado</option>
                <option value="Embalagem">Embalagem</option>
                <option value="Ferramenta">Ferramenta</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unidade de Medida</label>
              <select 
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] bg-white text-slate-700"
              >
                <option value="un">Unidade (un)</option>
                <option value="kg">Quilograma (kg)</option>
                <option value="g">Grama (g)</option>
                <option value="L">Litro (L)</option>
                <option value="m">Metro (m)</option>
                <option value="cx">Caixa (cx)</option>
                <option value="fls">Folhas (fls)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade Inicial</label>
              <input 
                type="number" 
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="0" 
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] font-semibold" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estoque Mínimo (Alerta)</label>
              <input 
                type="number" 
                value={estoqueMinimo}
                onChange={(e) => setEstoqueMinimo(e.target.value)}
                placeholder="5" 
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#E74C3C] font-semibold text-[#E74C3C]" 
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
          <button 
            onClick={handleSalvarItem}
            className="px-4 py-2 bg-[#0F4C81] text-white font-medium hover:bg-[#0c3e6a] rounded-lg shadow-sm transition-colors"
          >
            Guardar Item
          </button>
        </div>
      </div>
    </Modal>
  );
}
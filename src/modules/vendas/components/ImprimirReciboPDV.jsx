import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';

const formatMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

export default function ImprimirReciboPDV({ dadosRecibo, onClose }) {
  const [empresa, setEmpresa] = useState(null);

  useEffect(() => {
    const fetchEmpresa = async () => {
      const { data } = await supabase.from('configuracoes_empresa').select('*').limit(1).single();
      if (data) setEmpresa(data);
      
      // Delay para garantir a renderização antes de chamar a janela de impressão
      setTimeout(() => {
        window.print();
        onClose(); // Fecha o modal de impressão quando o usuário terminar
      }, 500);
    };

    if (dadosRecibo) fetchEmpresa();
  }, [dadosRecibo, onClose]);

  if (!dadosRecibo || !empresa) return null;

  return (
    // Oculta da tela normal, exibe apenas na impressão
    <div className="fixed inset-0 bg-white z-[99999] flex flex-col items-center print:block hidden text-black font-mono">
      
      {/* Container de 80mm (Aprox 300px) */}
      <div className="w-[80mm] p-2 mx-auto">
        
        {/* CABEÇALHO DA EMPRESA */}
        <div className="text-center mb-3">
          {empresa.logo_url && (
            <img src={empresa.logo_url} alt="Logo" className="max-h-12 mx-auto mb-2 grayscale" />
          )}
          <h1 className="font-bold text-sm uppercase">{empresa.nome_empresa || 'MINHA EMPRESA'}</h1>
          <p className="text-[10px]">CNPJ: {empresa.documento || '00.000.000/0001-00'}</p>
          <p className="text-[10px]">{empresa.logradouro || 'Rua'}, {empresa.numero || 'SN'}</p>
          <p className="text-[10px]">{empresa.telefone || '(00) 0000-0000'}</p>
        </div>
        
        <div className="border-b border-dashed border-black my-2"></div>
        
        <div className="text-center mb-2">
          <h2 className="font-bold text-xs uppercase">CUPOM NÃO FISCAL</h2>
          <p className="text-[10px]">{new Date().toLocaleString('pt-BR')}</p>
        </div>

        <div className="border-b border-dashed border-black my-2"></div>

        {/* LISTA DE ITENS */}
        <div className="mb-2">
          <div className="flex justify-between text-[10px] font-bold mb-1">
            <span>ITEM</span>
            <span>VLR TOTAL</span>
          </div>
          
          {dadosRecibo.itens.map((item, i) => (
            <div key={i} className="text-[10px] mb-2">
              <div className="truncate font-semibold">{item.nome}</div>
              <div className="flex justify-between">
                <span>{item.quantidade}x {formatMoeda(item.preco_venda)}</span>
                <span>{formatMoeda(item.quantidade * item.preco_venda)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-b border-dashed border-black my-2"></div>

        {/* RESUMO FINANCEIRO */}
        <div className="text-[10px] space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatMoeda(dadosRecibo.subtotal)}</span>
          </div>
          {dadosRecibo.desconto > 0 && (
            <div className="flex justify-between">
              <span>Desconto:</span>
              <span>- {formatMoeda(dadosRecibo.desconto)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm mt-2">
            <span>TOTAL:</span>
            <span>{formatMoeda(dadosRecibo.total)}</span>
          </div>
        </div>

        <div className="border-b border-dashed border-black my-2 mt-2"></div>

        {/* DADOS DO CLIENTE / ATENDIMENTO */}
        <div className="text-[10px] mb-2 uppercase">
          <p><span className="font-bold">Cliente:</span> {dadosRecibo.cliente || 'Consumidor Final'}</p>
          <p><span className="font-bold">Atendimento:</span> {dadosRecibo.operador || 'Balcão'}</p>
        </div>

        <div className="border-b border-dashed border-black my-2"></div>

        {/* RODAPÉ */}
        <div className="text-center text-[10px] mt-4 pb-12">
          <p className="font-bold">OBRIGADO PELA PREFERÊNCIA!</p>
          <p className="mt-3 text-[8px] text-gray-500">Software desenvolvido por ERP EasyFlow</p>
        </div>

      </div>
    </div>
  );
}
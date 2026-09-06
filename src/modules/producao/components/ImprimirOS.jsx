import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';

const formatMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

export default function ImprimirOS({ os, onClose }) {
  const [empresa, setEmpresa] = useState(null);

  useEffect(() => {
    const fetchEmpresa = async () => {
      const { data } = await supabase.from('configuracoes_empresa').select('*').limit(1).single();
      if (data) setEmpresa(data);
      
      // Dá um pequeno delay para a logo carregar antes de chamar a janela de impressão
      setTimeout(() => {
        window.print();
        onClose(); // Fecha o modo de impressão logo após o usuário fechar a janela do navegador
      }, 500);
    };

    if (os) fetchEmpresa();
  }, [os, onClose]);

  if (!os || !empresa) return null;

  // Tenta processar os materiais (caso venham como string JSON do banco)
  let materiais = [];
  if (typeof os.materiais_utilizados === 'string') {
    try { materiais = JSON.parse(os.materiais_utilizados); } catch (e) { materiais = []; }
  } else if (Array.isArray(os.materiais_utilizados)) {
    materiais = os.materiais_utilizados;
  }

  const dataAbertura = new Date(os.data_abertura).toLocaleDateString('pt-BR');
  const dataConclusao = os.data_conclusao ? new Date(os.data_conclusao).toLocaleDateString('pt-BR') : 'A Combinar';

  return (
    // Esta div sobrepõe o sistema inteiro com um fundo branco, mas SÓ aparece na hora de imprimir
    <div className="fixed inset-0 bg-white z-[99999] flex flex-col p-8 text-black print:block hidden font-sans">
      
      {/* CABEÇALHO COM LOGO E DADOS DA EMPRESA */}
      <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
        <div className="flex gap-6 items-center">
          {empresa.logo_url && (
            <img src={empresa.logo_url} alt="Logo" className="w-32 object-contain" />
          )}
          <div>
            <h1 className="text-2xl font-black uppercase">{empresa.nome_empresa || 'NOME DA EMPRESA'}</h1>
            <p className="text-sm">CNPJ: {empresa.documento || '---'}</p>
            <p className="text-sm">Tel: {empresa.telefone || '---'} | Email: {empresa.email_contato || '---'}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-black border-2 border-black px-4 py-2 rounded-lg">
            O.S #{os.id.toString().substring(0, 8).toUpperCase()}
          </h2>
          <p className="text-sm font-bold mt-2 uppercase">{os.tipo_op === 'Interna' ? 'Uso Interno' : 'Produção Externa'}</p>
        </div>
      </div>

      {/* DADOS DO CLIENTE E PRAZOS */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="border border-black p-4 rounded-lg">
          <h3 className="text-xs font-bold uppercase mb-2 border-b border-gray-300 pb-1">Dados do Solicitante</h3>
          <p className="text-lg font-bold uppercase">{os.solicitante_nome || 'Cliente Balcão'}</p>
          <p className="text-sm mt-1"><span className="font-bold">Abertura:</span> {dataAbertura}</p>
          <p className="text-sm"><span className="font-bold">Previsão Entrega:</span> {dataConclusao}</p>
        </div>
        <div className="border border-black p-4 rounded-lg">
          <h3 className="text-xs font-bold uppercase mb-2 border-b border-gray-300 pb-1">Informações de Produção</h3>
          <p className="text-sm"><span className="font-bold">Responsável:</span> {os.responsavel || 'Não Atribuído'}</p>
          <p className="text-sm mt-1"><span className="font-bold">Status Atual:</span> {os.status}</p>
        </div>
      </div>

      {/* DESCRITIVO DO SERVIÇO */}
      <div className="border border-black p-4 rounded-lg mb-6 flex-1">
        <h3 className="text-xs font-bold uppercase mb-2 border-b border-gray-300 pb-1">Descritivo do Serviço / Observações</h3>
        <p className="text-base whitespace-pre-wrap">{os.descricao_solicitacao || os.descricao}</p>
        
        {os.observacoes && (
          <div className="mt-4 p-3 bg-gray-100 border-l-4 border-black">
            <h4 className="text-xs font-bold uppercase">Avisos Internos:</h4>
            <p className="text-sm">{os.observacoes}</p>
          </div>
        )}
      </div>

      {/* MATERIAIS UTILIZADOS (Opcional, bom para a prancheta de produção) */}
      {materiais.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase mb-2">Materiais Listados para Saída:</h3>
          <table className="w-full text-left border-collapse border border-black text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2">Item / Descrição</th>
                <th className="border border-black p-2 text-center w-24">Qtd</th>
              </tr>
            </thead>
            <tbody>
              {materiais.map((item, idx) => (
                <tr key={idx}>
                  <td className="border border-black p-2">{item.descricao}</td>
                  <td className="border border-black p-2 text-center font-bold">{item.qtd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ÁREA DE ASSINATURA */}
      <div className="mt-auto grid grid-cols-2 gap-8 pt-12">
        <div className="text-center">
          <div className="border-t border-black w-full pt-2">
            <p className="text-sm font-bold">Assinatura da Produção</p>
            <p className="text-xs">Data: ____/____/________</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-black w-full pt-2">
            <p className="text-sm font-bold">Assinatura do Cliente / Retirada</p>
            <p className="text-xs">Data: ____/____/________</p>
          </div>
        </div>
      </div>

    </div>
  );
}
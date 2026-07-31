import React from 'react';

export default function PainelFiscal() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      {/* Notas Fiscais */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Notas Fiscais (NFe/NFS-e)</h3>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg flex justify-between items-center bg-slate-50">
            <span className="text-sm font-medium text-slate-700">Certificado Digital (A1)</span>
            <span className="text-green-600 text-xs font-bold px-2 py-1 bg-green-50 rounded uppercase">Válido até 12/2026</span>
          </div>
          <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-lg text-sm text-slate-500 hover:border-[#0F4C81] hover:text-[#0F4C81] transition-all">
            + Emitir Nova Nota Fiscal
          </button>
        </div>
      </div>

      {/* Boletos */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Emissão de Boletos</h3>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg flex justify-between items-center bg-slate-50">
            <span className="text-sm font-medium text-slate-700">Banco Inter - Carteira Registrada</span>
            <span className="text-blue-600 text-xs font-bold px-2 py-1 bg-blue-50 rounded uppercase">Ativo</span>
          </div>
          <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-lg text-sm text-slate-500 hover:border-[#0F4C81] hover:text-[#0F4C81] transition-all">
            + Gerar Lote de Boletos
          </button>
        </div>
      </div>
    </div>
  );
}
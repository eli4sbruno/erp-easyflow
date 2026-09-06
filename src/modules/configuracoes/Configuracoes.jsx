"use client";
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from "@/supabaseClient";

// Ícones para o menu lateral
const Icons = {
  Geral: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>,
  Financeiro: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
};

// ==========================================
// FUNÇÕES DE MÁSCARA (FORMATAÇÃO AUTOMÁTICA)
// ==========================================
const formatarDocumento = (value) => {
  if (!value) return '';
  const v = value.replace(/\D/g, ''); // Remove tudo que não é número
  if (v.length <= 11) {
    // Máscara de CPF: 000.000.000-00
    return v
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    // Máscara de CNPJ: 00.000.000/0000-00
    return v
      .substring(0, 14) // Limita a 14 números
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }
};

const formatarTelefone = (value) => {
  if (!value) return '';
  const v = value.replace(/\D/g, ''); // Remove tudo que não é número
  if (v.length <= 10) {
    // Fixo: (00) 0000-0000
    return v
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  } else {
    // Celular: (00) 00000-0000
    return v
      .substring(0, 11) // Limita a 11 números
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  }
};

export default function Configuracoes({ onLogoUpdate }) {
  const [abaAtiva, setAbaAtiva] = useState('Geral');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState(false);

  // Estados - Geral
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [documento, setDocumento] = useState('');
  const [inscricaoEstadual, setInscricaoEstadual] = useState('');
  const [telefone, setTelefone] = useState('');
  const [emailContato, setEmailContato] = useState('');
  const [moeda, setMoeda] = useState('BRL');
  const [fusoHorario, setFusoHorario] = useState('America/Sao_Paulo');
  const [formatoData, setFormatoData] = useState('DD/MM/YYYY');
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Estados - Financeiro
  const [senhaCertificado, setSenhaCertificado] = useState('');
  const [regimeTributario, setRegimeTributario] = useState('Simples Nacional');
  const [gatewayPagamento, setGatewayPagamento] = useState('Mercado Pago');
  const [gatewayToken, setGatewayToken] = useState('');

  useEffect(() => {
    fetchConfiguracoes();
  }, []);

  const fetchConfiguracoes = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data, error } = await supabase
        .from('configuracoes_empresa')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setNomeEmpresa(data.nome_empresa || '');
        // Já traz do banco formatado
        setDocumento(formatarDocumento(data.documento || ''));
        setInscricaoEstadual(data.inscricao_estadual || '');
        // Já traz do banco formatado
        setTelefone(formatarTelefone(data.telefone || ''));
        setEmailContato(data.email_contato || '');
        setMoeda(data.moeda || 'BRL');
        setFusoHorario(data.fuso_horario || 'America/Sao_Paulo');
        setFormatoData(data.formato_data || 'DD/MM/YYYY');
        if (data.logo_url) setLogoPreview(data.logo_url);
        
        setSenhaCertificado(data.certificado_senha || '');
        setRegimeTributario(data.regime_tributario || 'Simples Nacional');
        setGatewayPagamento(data.gateway_pagamento || 'Mercado Pago');
        setGatewayToken(data.gateway_token || '');
      }
    }
    setIsLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { 
        alert("A imagem é muito grande. Escolha uma logo com menos de 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSalvarGeral = async () => {
    setIsSaving(true);
    setMensagemSucesso(false);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("Sessão expirada."); setIsSaving(false); return; }

    const configData = {
      user_id: user.id,
      nome_empresa: nomeEmpresa,
      // Salva no banco apenas os números para manter a integridade dos dados
      documento: documento.replace(/\D/g, ''),
      inscricao_estadual: inscricaoEstadual,
      telefone: telefone.replace(/\D/g, ''),
      email_contato: emailContato,
      moeda: moeda,
      fuso_horario: fusoHorario,
      formato_data: formatoData,
      logo_url: logoPreview, 
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('configuracoes_empresa').upsert(configData, { onConflict: 'user_id' });

    setIsSaving(false);
    if (error) {
      console.error('Erro ao guardar configurações:', error);
      alert(`Erro do banco de dados: ${error.message || error.details}`);
    } else {
      setMensagemSucesso(true);
      if (onLogoUpdate) onLogoUpdate(logoPreview); 
      setTimeout(() => setMensagemSucesso(false), 3000);
    }
  };

  const handleFuncaoInativa = () => {
    alert("Função em desenvolvimento.\n\nA emissão de notas fiscais e a integração bancária automática estarão disponíveis na próxima atualização do sistema.");
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 font-medium">A carregar configurações...</div>;
  }

  const menuConfig = [
    { id: 'Geral', icon: Icons.Geral, label: 'Geral & Empresa' },
    { id: 'Financeiro', icon: Icons.Financeiro, label: 'Financeiro & Fiscal' }
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-[1200px] mx-auto pb-20">
      
      {/* CABEÇALHO */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Configurações do Sistema</h1>
        <p className="text-slate-500 font-medium mt-2 text-sm">Faça a gestão dos dados da sua empresa e preferências de cada módulo.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Menu Lateral de Configurações */}
        <div className="w-full md:w-64 bg-white rounded-3xl p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 shrink-0">
          <nav className="flex flex-col gap-1">
            {menuConfig.map((item) => (
              <button
                key={item.id}
                onClick={() => { setAbaAtiva(item.id); setMensagemSucesso(false); }}
                className={`flex items-center gap-3 px-5 py-3.5 text-sm font-semibold rounded-2xl transition-all ${
                  abaAtiva === item.id 
                    ? 'bg-[#0F4C81]/5 text-[#0F4C81]' 
                    : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <item.icon />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Área de Conteúdo */}
        <div className="flex-1 w-full space-y-6">
          
          {/* ==========================================
              ABA: GERAL & EMPRESA
              ========================================== */}
          {abaAtiva === 'Geral' && (
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 overflow-hidden animate-fade-in">
              <div className="p-8 pb-4">
                <h3 className="text-xl font-bold text-slate-800">Dados da Empresa e Preferências</h3>
                <p className="text-sm text-slate-500 mt-1 font-medium">Estas informações aparecerão em relatórios, O.S e faturamentos.</p>
              </div>

              <div className="p-8 space-y-8">
                
                {/* Upload de Logotipo */}
                <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm font-semibold overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                    ) : (
                      "Logo"
                    )}
                  </div>
                  <div>
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                    >
                      Fazer Upload da Logomarca
                    </button>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Recomendado: PNG ou JPG até 1MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Nome da Empresa / Razão Social</label>
                    <input 
                      type="text" 
                      value={nomeEmpresa}
                      onChange={(e) => setNomeEmpresa(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] transition-colors text-slate-700 font-medium" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">CNPJ / CPF</label>
                      <input 
                        type="text" 
                        value={documento}
                        // Aplica a máscara no evento de mudança
                        onChange={(e) => setDocumento(formatarDocumento(e.target.value))}
                        maxLength="18" // Limite visual
                        placeholder="00.000.000/0001-00" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] transition-colors text-slate-700 font-medium" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Inscrição Estadual</label>
                      <input 
                        type="text" 
                        value={inscricaoEstadual}
                        onChange={(e) => setInscricaoEstadual(e.target.value)}
                        placeholder="Opcional" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] transition-colors text-slate-700 font-medium" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">E-mail de Contato</label>
                    <input 
                      type="email" 
                      value={emailContato}
                      onChange={(e) => setEmailContato(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] transition-colors text-slate-700 font-medium" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Telefone / WhatsApp</label>
                    <input 
                      type="text" 
                      value={telefone}
                      // Aplica a máscara no evento de mudança
                      onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                      maxLength="15" // Limite visual
                      placeholder="(00) 00000-0000"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] transition-colors text-slate-700 font-medium" 
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <h4 className="text-sm font-bold text-slate-800 mb-4">Localização e Formatos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Moeda Principal</label>
                      <select 
                        value={moeda}
                        onChange={(e) => setMoeda(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F4C81] transition-colors text-slate-700 font-medium cursor-pointer"
                      >
                        <option value="BRL">Real Brasileiro (R$)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="USD">Dólar Americano ($)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Fuso Horário</label>
                      <select 
                        value={fusoHorario}
                        onChange={(e) => setFusoHorario(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F4C81] transition-colors text-slate-700 font-medium cursor-pointer"
                      >
                        <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                        <option value="America/Manaus">Manaus (GMT-4)</option>
                        <option value="Europe/Lisbon">Lisboa (GMT+0)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Formato de Data</label>
                      <select 
                        value={formatoData}
                        onChange={(e) => setFormatoData(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F4C81] transition-colors text-slate-700 font-medium cursor-pointer"
                      >
                        <option value="DD/MM/YYYY">DD/MM/AAAA</option>
                        <option value="MM/DD/YYYY">MM/DD/AAAA</option>
                        <option value="YYYY-MM-DD">AAAA-MM-DD</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão Salvar (Geral) */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  {mensagemSucesso && (
                    <span className="text-[#1B9C85] font-bold flex items-center gap-2 animate-fade-in text-sm bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                      Configurações guardadas!
                    </span>
                  )}
                </div>
                <button 
                  onClick={handleSalvarGeral}
                  disabled={isSaving}
                  className="px-8 py-3 bg-[#0F4C81] text-white font-bold hover:bg-[#0a3863] rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-70 flex items-center gap-2"
                >
                  {isSaving ? 'A guardar...' : 'Guardar Alterações'}
                </button>
              </div>
            </div>
          )}

          {/* ==========================================
              ABA: FINANCEIRO & FISCAL
              ========================================== */}
          {abaAtiva === 'Financeiro' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* 1. Configurações Fiscais */}
              <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 overflow-hidden relative">
                <div className="p-8 pb-4">
                  <h3 className="text-xl font-bold text-slate-800">Configurações Fiscais (NFe/NFS-e)</h3>
                </div>
                <div className="p-8 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60 pointer-events-none">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Certificado Digital (A1)</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Nenhum arquivo selecionado" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed" readOnly />
                      <button className="px-5 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">Upload</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Senha do Certificado</label>
                    <input type="password" value="******" readOnly className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium cursor-not-allowed" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Regime Tributário</label>
                    <select disabled className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium cursor-not-allowed">
                      <option>Simples Nacional</option>
                    </select>
                  </div>
                </div>
                
                {/* Sobreposição Transparente para Capturar o Clique */}
                <div className="absolute inset-0 z-10 cursor-pointer" onClick={handleFuncaoInativa} title="Função em breve"></div>
              </div>

              {/* 2. Configurações Bancárias */}
              <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 overflow-hidden relative">
                <div className="p-8 pb-4">
                  <h3 className="text-xl font-bold text-slate-800">Integração Bancária (PIX/Boletos)</h3>
                </div>
                <div className="p-8 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60 pointer-events-none">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Gateway de Pagamento</label>
                    <select disabled className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium cursor-not-allowed">
                      <option>Mercado Pago</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Token de Acesso (API Key)</label>
                    <input type="text" placeholder="Insira o seu token de integração" readOnly className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium cursor-not-allowed" />
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end opacity-60 pointer-events-none">
                  <button className="px-8 py-3 bg-slate-300 text-white font-bold rounded-xl shadow-md">
                    Guardar Configurações Financeiras
                  </button>
                </div>
                
                {/* Sobreposição Transparente para Capturar o Clique */}
                <div className="absolute inset-0 z-10 cursor-pointer" onClick={handleFuncaoInativa} title="Função em breve"></div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
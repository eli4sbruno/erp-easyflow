import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Ícones para o menu lateral
const Icons = {
  Geral: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>,
  Financeiro: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
  Vendas: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>,
  Estoque: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>,
  Usuarios: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>,
  Integracoes: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>,
};

export default function Configuracoes() {
  const [abaAtiva, setAbaAtiva] = useState('Geral');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState(false);

  // Estados do Formulário - Geral / Dados da Empresa
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [documento, setDocumento] = useState('');
  const [inscricaoEstadual, setInscricaoEstadual] = useState('');
  const [telefone, setTelefone] = useState('');
  const [emailContato, setEmailContato] = useState('');
  const [moeda, setMoeda] = useState('BRL');
  const [fusoHorario, setFusoHorario] = useState('America/Sao_Paulo');
  const [formatoData, setFormatoData] = useState('DD/MM/YYYY');

  // Buscar dados ao carregar
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
        .single();

      if (data) {
        setNomeEmpresa(data.nome_empresa || '');
        setDocumento(data.documento || '');
        setInscricaoEstadual(data.inscricao_estadual || '');
        setTelefone(data.telefone || '');
        setEmailContato(data.email_contato || '');
        setMoeda(data.moeda || 'BRL');
        setFusoHorario(data.fuso_horario || 'America/Sao_Paulo');
        setFormatoData(data.formato_data || 'DD/MM/YYYY');
      }
    }
    setIsLoading(false);
  };

  const handleSalvarGeral = async () => {
    setIsSaving(true);
    setMensagemSucesso(false);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("Sessão expirada. Faça login novamente.");
      setIsSaving(false);
      return;
    }

    const configData = {
      user_id: user.id,
      nome_empresa: nomeEmpresa,
      documento: documento,
      inscricao_estadual: inscricaoEstadual,
      telefone: telefone,
      email_contato: emailContato,
      moeda: moeda,
      fuso_horario: fusoHorario,
      formato_data: formatoData,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('configuracoes_empresa')
      .upsert(configData, { onConflict: 'user_id' });

    setIsSaving(false);

    if (error) {
      console.error('Erro ao guardar configurações:', error);
      alert('Erro ao guardar as configurações. Verificou se adicionou as novas colunas no Supabase?');
    } else {
      setMensagemSucesso(true);
      setTimeout(() => setMensagemSucesso(false), 3000);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">A carregar configurações...</div>;
  }

  const menuConfig = [
    { id: 'Geral', icon: Icons.Geral, label: 'Geral & Empresa' },
    { id: 'Financeiro', icon: Icons.Financeiro, label: 'Financeiro & Fiscal' },
    { id: 'Vendas', icon: Icons.Vendas, label: 'Vendas & CRM' },
    { id: 'Estoque', icon: Icons.Estoque, label: 'Estoque & Logística' },
    { id: 'Usuarios', icon: Icons.Usuarios, label: 'Usuários & Segurança' },
    { id: 'Integracoes', icon: Icons.Integracoes, label: 'Integrações (APIs)' },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto z-0 relative">
      <div>
        <h2 className="text-2xl font-bold text-[#0F4C81]">Configurações do Sistema</h2>
        <p className="text-slate-500 text-sm">Faça a gestão dos dados da sua empresa e preferências de cada módulo.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        
        {/* Menu Lateral de Configurações */}
        <div className="w-full md:w-64 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden shrink-0">
          <nav className="flex flex-col">
            {menuConfig.map((item) => (
              <button
                key={item.id}
                onClick={() => setAbaAtiva(item.id)}
                className={`flex items-center gap-3 px-5 py-4 text-sm font-medium transition-colors border-l-4 ${
                  abaAtiva === item.id 
                    ? 'border-l-[#1B9C85] bg-slate-50 text-[#0F4C81]' 
                    : 'border-l-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Área de Conteúdo da Configuração */}
        <div className="flex-1 w-full">
          
          {/* ==========================================
              ABA: GERAL & EMPRESA
              ========================================== */}
          {abaAtiva === 'Geral' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                <h3 className="text-lg font-semibold text-slate-800">Dados da Empresa e Preferências</h3>
                <p className="text-sm text-slate-500 mt-1">Estas informações aparecerão em relatórios, O.S e faturamentos.</p>
              </div>

              <div className="p-6 space-y-6">
                
                {/* Upload de Logotipo Fictício */}
                <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                  <div className="w-20 h-20 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                    Logo
                  </div>
                  <div>
                    <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                      Fazer Upload da Logomarca
                    </button>
                    <p className="text-xs text-slate-400 mt-2">Recomendado: PNG ou JPG em alta resolução.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nome da Empresa / Razão Social</label>
                    <input 
                      type="text" 
                      value={nomeEmpresa}
                      onChange={(e) => setNomeEmpresa(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] text-sm" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">CNPJ / CPF</label>
                      <input 
                        type="text" 
                        value={documento}
                        onChange={(e) => setDocumento(e.target.value)}
                        placeholder="00.000.000/0001-00" 
                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Inscrição Estadual</label>
                      <input 
                        type="text" 
                        value={inscricaoEstadual}
                        onChange={(e) => setInscricaoEstadual(e.target.value)}
                        placeholder="Opcional" 
                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] text-sm" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">E-mail de Contato</label>
                    <input 
                      type="email" 
                      value={emailContato}
                      onChange={(e) => setEmailContato(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Telefone Comercial / WhatsApp</label>
                    <input 
                      type="text" 
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] text-sm" 
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 mt-6">
                  <h4 className="text-sm font-bold text-slate-800 mb-4">Localização e Formatos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Moeda Principal</label>
                      <select 
                        value={moeda}
                        onChange={(e) => setMoeda(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] bg-white text-slate-700 text-sm"
                      >
                        <option value="BRL">Real Brasileiro (R$)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="USD">Dólar Americano ($)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Fuso Horário</label>
                      <select 
                        value={fusoHorario}
                        onChange={(e) => setFusoHorario(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] bg-white text-slate-700 text-sm"
                      >
                        <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                        <option value="America/Manaus">Manaus (GMT-4)</option>
                        <option value="Europe/Lisbon">Lisboa (GMT+0)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Formato de Data</label>
                      <select 
                        value={formatoData}
                        onChange={(e) => setFormatoData(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] bg-white text-slate-700 text-sm"
                      >
                        <option value="DD/MM/YYYY">DD/MM/AAAA</option>
                        <option value="MM/DD/YYYY">MM/DD/AAAA</option>
                        <option value="YYYY-MM-DD">AAAA-MM-DD</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  {mensagemSucesso && (
                    <span className="text-[#1B9C85] font-medium flex items-center gap-2 animate-fade-in text-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      Configurações guardadas!
                    </span>
                  )}
                </div>
                <button 
                  onClick={handleSalvarGeral}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#0F4C81] text-white text-sm font-medium hover:bg-[#0c3e6a] rounded-lg shadow-sm transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isSaving ? 'A guardar...' : 'Guardar Alterações'}
                </button>
              </div>
            </div>
          )}

          {/* ==========================================
              ABAS PLACEHOLDERS (Prontas para integrar)
              ========================================== */}

          {abaAtiva === 'Financeiro' && (
            <div className="space-y-6 animate-fade-in">
    
            {/* 1. Configurações Fiscais */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                <h3 className="text-md font-bold text-slate-800">Configurações Fiscais (NFe/NFS-e)</h3>
              </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Certificado Digital (A1)</label>
            < div className="flex gap-2">
              <input type="text" placeholder="Nenhum arquivo selecionado" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50" readOnly />
              <button className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200">Upload</button>
            </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Senha do Certificado</label>
              <input type="password" placeholder="******" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Regime Tributário</label>
            <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white">
            <option>Simples Nacional</option>
            <option>Lucro Presumido</option>
            <option>Lucro Real</option>
            </select>
          </div>
      </div>
    </div>

    {/* 2. Configurações Bancárias */}
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <h3 className="text-md font-bold text-slate-800">Integração Bancária (PIX/Boletos)</h3>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Gateway de Pagamento</label>
          <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white">
            <option>Mercado Pago</option>
            <option>Asaas</option>
            <option>Inter Bank API</option>
                  </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Token de Acesso (API Key)</label>
                    <input type="text" placeholder="Insira o seu token de integração" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" />
                  </div>
                </div>
              </div>

              {/* 3. Botão de Salvar */}
              <div className="flex justify-end">
                <button className="px-6 py-2.5 bg-[#0F4C81] text-white font-medium rounded-lg shadow-sm hover:bg-[#0c3e6a]">
                  Guardar Configurações Financeiras
                </button>
              </div>

            </div>
          )}

          {abaAtiva === 'Vendas' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center animate-fade-in">
              <div className="w-16 h-16 bg-blue-50 text-[#0F4C81] rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.Vendas />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Configurações de Vendas e CRM</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                Defina tabelas de preços, regras de comissão para a equipe comercial e crie templates automáticos de e-mail para envio de orçamentos.
              </p>
              <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Gerir Regras de Vendas (Em breve)</button>
            </div>
          )}

          {abaAtiva === 'Estoque' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center animate-fade-in">
              <div className="w-16 h-16 bg-blue-50 text-[#0F4C81] rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.Estoque />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Configurações de Estoque e Logística</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                Cadastre múltiplas filiais de armazenagem, personalize as unidades de medida padrão e ative a exigência de código de barras para movimentações.
              </p>
              <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Configurar Locais (Em breve)</button>
            </div>
          )}

          {abaAtiva === 'Usuarios' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center animate-fade-in">
              <div className="w-16 h-16 bg-blue-50 text-[#0F4C81] rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.Usuarios />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Gestão de Utilizadores e Permissões</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                Adicione funcionários ao sistema e defina níveis de acesso rigorosos (ex: Vendedor não pode aceder ao Financeiro). Acesso aos registos de auditoria.
              </p>
              <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Gerir Permissões (Em breve)</button>
            </div>
          )}

          {abaAtiva === 'Integracoes' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center animate-fade-in">
              <div className="w-16 h-16 bg-blue-50 text-[#0F4C81] rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.Integracoes />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">APIs e Integrações Externas</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                Conecte o seu ERP a ferramentas como WhatsApp Business API, WooCommerce, Shopify, ou sistemas de marketing para automatizar os fluxos da gráfica.
              </p>
              <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Adicionar Integração (Em breve)</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
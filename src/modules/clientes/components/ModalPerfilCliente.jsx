import React, { useState, useEffect } from 'react';
import { supabase } from "@/supabaseClient";

// Importações dos modais existentes
import ModalNovaOS from "@/modules/producao/components/ModalNovaOS"; 
import ModalPedidoVenda from "@/modules/vendas/components/ModalPedidoVenda";

// Ícones
const CloseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const CheckCircleIcon = () => <svg className="w-5 h-5 text-green-500 bg-white rounded-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const ClockIcon = () => <svg className="w-5 h-5 text-blue-500 bg-white rounded-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;

const EditIcon = () => <svg className="w-4 h-4 text-slate-400 hover:text-[#0F4C81] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>;
const SaveIcon = () => <svg className="w-4 h-4 text-green-600 hover:text-green-700 animate-pulse transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>;

export default function ModalPerfilCliente({ isOpen, cliente, onClose }) {
  const [abaAtiva, setAbaAtiva] = useState('Histórico');
  const [anotacoes, setAnotacoes] = useState('');
  
  const [isEditandoNota, setIsEditandoNota] = useState(false);
  const [statusSalvo, setStatusSalvo] = useState(false);

  // Estados para controlar o Pop-up de Escolha e os Modais específicos
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOSOpen, setIsOSOpen] = useState(false);
  const [isVendaOpen, setIsVendaOpen] = useState(false);

  const [historico, setHistorico] = useState([]);
  const [isAddingInteracao, setIsAddingInteracao] = useState(false);
  const [novaInteracao, setNovaInteracao] = useState({ tipo: 'Diagnóstico', titulo: '', descricao: '' });

  useEffect(() => {
    if (isOpen && cliente) {
      setAbaAtiva('Histórico');
      setAnotacoes(cliente.anotacoes || '');
      setIsEditandoNota(false);
      setIsMenuOpen(false);
      fetchHistorico();
      setIsAddingInteracao(false);
    }
  }, [isOpen, cliente]);

  const fetchHistorico = async () => {
    if (!cliente) return;
    const { data, error } = await supabase
      .from('interacoes_cliente')
      .select('*')
      .eq('cliente_id', cliente.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const unicos = Array.from(new Map(data.map(item => [item.id, item])).values());
      setHistorico(unicos);
    }
  };

  const handleAcaoNota = async () => {
    if (!isEditandoNota) {
      setIsEditandoNota(true);
    } else {
      const { error } = await supabase.from('clientes').update({ anotacoes }).eq('id', cliente.id);
      if (!error) {
        setIsEditandoNota(false);
        setStatusSalvo(true);
        setTimeout(() => setStatusSalvo(false), 2000);
      } else {
        alert("Erro ao salvar anotação.");
      }
    }
  };

  const handleSalvarInteracao = async () => {
    if (!novaInteracao.titulo) return alert("Dê um título para a interação.");
    const { data: { user } } = await supabase.auth.getUser();
    
    const interacao = {
      cliente_id: cliente.id,
      user_id: user?.id,
      ...novaInteracao
    };

    const { error } = await supabase.from('interacoes_cliente').insert([interacao]);
    if (!error) {
      setNovaInteracao({ tipo: 'Diagnóstico', titulo: '', descricao: '' });
      setIsAddingInteracao(false);
      fetchHistorico();
    } else {
      alert("Erro ao salvar interação.");
    }
  };

  if (!isOpen || !cliente) return null;

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
        <div className="bg-white w-full max-w-5xl h-full shadow-2xl animate-fade-in flex flex-col sm:flex-row overflow-hidden relative">
          
          {/* COLUNA ESQUERDA - RESUMO */}
          <div className="w-full sm:w-1/3 bg-slate-50 border-r border-slate-200 flex flex-col h-full overflow-y-auto custom-scrollbar">
            <div className="p-8 flex flex-col items-center text-center border-b border-slate-200 relative">
              <div className="w-24 h-24 rounded-full bg-[#0F4C81] text-white flex items-center justify-center text-3xl font-bold shadow-md mb-4 ring-4 ring-white">
                {cliente.nome.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="font-bold text-xl text-slate-800">{cliente.nome}</h3>
              <div className="flex items-center gap-2 mt-2 mb-4">
                <span className={`w-2 h-2 rounded-full ${cliente.status_temperatura === 'Quente' ? 'bg-green-500' : cliente.status_temperatura === 'Morno' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{cliente.status_temperatura}</span>
              </div>
              
              {/* BOTÃO NOVA SOLICITAÇÃO COM POP-UP DE ESCOLHA */}
              <div className="w-full relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="w-full bg-[#1B9C85] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#15806c] transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  Nova Solicitação 
                  <svg className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>

                {/* POP-UP FLUTUANTE DE ESCOLHA */}
                {isMenuOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in p-1 space-y-1">
                    <button 
                      onClick={() => { setIsMenuOpen(false); setIsOSOpen(true); }}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between group transition-colors"
                    >
                      <span>Ordem de Serviço (O.S)</span>
                      <span className="text-xs bg-blue-50 text-[#0F4C81] px-2 py-0.5 rounded font-bold">Produção</span>
                    </button>
                    <button 
                      onClick={() => { setIsMenuOpen(false); setIsVendaOpen(true); }}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between group transition-colors"
                    >
                      <span>Novo Pedido de Venda</span>
                      <span className="text-xs bg-green-50 text-[#1B9C85] px-2 py-0.5 rounded font-bold">Comercial</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 flex-1 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Detalhes</h4>
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estágio:</span>
                    <span className="font-medium text-[#0F4C81]">{cliente.estagio_funil}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Etiquetas (Tags)</h4>
                <div className="flex flex-wrap gap-2">
                  {cliente.tags && cliente.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-[11px] font-bold">{tag}</span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Anotações Fixas</h4>
                  <div className="flex items-center gap-2">
                    {statusSalvo && <span className="text-[10px] text-green-600 font-bold animate-fade-in">Salvo!</span>}
                    <button 
                      onClick={handleAcaoNota} 
                      className="p-1 hover:bg-slate-200 rounded transition-colors"
                      title={isEditandoNota ? "Clique para Salvar" : "Clique para Editar"}
                    >
                      {isEditandoNota ? <SaveIcon /> : <EditIcon />}
                    </button>
                  </div>
                </div>
                <textarea 
                  value={anotacoes}
                  onChange={(e) => setAnotacoes(e.target.value)}
                  readOnly={!isEditandoNota}
                  className={`w-full h-32 p-3 rounded-lg text-sm transition-colors resize-none focus:outline-none ${
                    isEditandoNota 
                      ? 'bg-white border border-yellow-400 ring-1 ring-yellow-400 text-slate-800 shadow-sm' 
                      : 'bg-yellow-50/60 border border-yellow-200/80 text-slate-600 cursor-default'
                  }`}
                  placeholder="Clique no ícone de lápis acima para adicionar anotações..."
                />
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA - ABAS */}
          <div className="w-full sm:w-2/3 flex flex-col bg-white h-full">
            <div className="px-6 py-4 flex justify-between items-center bg-white border-b border-slate-100 shadow-sm">
              <h3 className="font-bold text-xl text-[#0F4C81]">Dossiê do Cliente</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                <CloseIcon />
              </button>
            </div>
            
            <div className="flex border-b border-slate-100 px-4 bg-slate-50 shrink-0">
              {['Histórico', 'Dados', 'Financeiro'].map((aba) => (
                <button 
                  key={aba} 
                  onClick={() => setAbaAtiva(aba)} 
                  className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${abaAtiva === aba ? 'border-[#0F4C81] text-[#0F4C81]' : 'border-transparent text-slate-500'}`}
                >
                  {aba}
                </button>
              ))}
            </div>
            
            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar bg-white">
              
              {abaAtiva === 'Histórico' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold text-slate-800">Linha do Tempo</h4>
                    {!isAddingInteracao && (
                      <button onClick={() => setIsAddingInteracao(true)} className="text-xs font-semibold text-[#1B9C85] border border-[#1B9C85] px-3 py-1.5 rounded hover:bg-[#1B9C85] hover:text-white transition-colors">
                        + Registrar Interação
                      </button>
                    )}
                  </div>

                  {isAddingInteracao && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 animate-fade-in">
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <select value={novaInteracao.tipo} onChange={e => setNovaInteracao({...novaInteracao, tipo: e.target.value})} className="p-2 border rounded-lg text-sm">
                          <option>Qualificação</option>
                          <option>Diagnóstico</option>
                          <option>Proposta</option>
                          <option>Apresentação</option>
                          <option>Fechamento</option>
                          <option>Geral</option>
                        </select>
                        <input type="text" placeholder="Título (Ex: Reunião de Briefing)" value={novaInteracao.titulo} onChange={e => setNovaInteracao({...novaInteracao, titulo: e.target.value})} className="p-2 border rounded-lg text-sm" />
                      </div>
                      <textarea placeholder="Resumo do que foi conversado..." value={novaInteracao.descricao} onChange={e => setNovaInteracao({...novaInteracao, descricao: e.target.value})} className="w-full p-2 border rounded-lg text-sm mb-3 h-20 resize-none" />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setIsAddingInteracao(false)} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-200 rounded-lg">Cancelar</button>
                        <button onClick={handleSalvarInteracao} className="px-4 py-2 text-sm bg-[#0F4C81] text-white rounded-lg">Salvar</button>
                      </div>
                    </div>
                  )}
                  
                  <div className="relative border-l-2 border-slate-100 ml-3 space-y-8">
                    {historico.length === 0 && !isAddingInteracao && <p className="text-sm text-slate-400 pl-4">Nenhuma interação registrada ainda.</p>}
                    {historico.map((item) => (
                      <div key={item.id} className="relative pl-8">
                        <div className="absolute -left-3 top-0">
                          {item.tipo === 'Fechamento' ? <CheckCircleIcon /> : <ClockIcon />}
                        </div>
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-bold text-sm text-slate-800">{item.titulo}</h5>
                            <span className="text-xs font-medium text-slate-400">
                              {new Date(item.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase mb-2">{item.tipo}</span>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap">{item.descricao}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {abaAtiva === 'Dados' && (
                <div className="space-y-8 animate-fade-in"> 
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Informações de Contato</h4> 
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase mb-1">E-mail Principal</span>
                        <span className="text-sm text-slate-700">{cliente.email || 'Não informado'}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase mb-1">WhatsApp / Telefone</span>
                        <span className="text-sm text-slate-700">{cliente.tel || 'Não informado'}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase mb-1">CPF / CNPJ</span>
                        <span className="text-sm text-slate-700">{cliente.documento || 'Não informado'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Endereço (Faturamento / Entrega)</h4> 
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700 space-y-1">
                      <p><span className="font-medium text-slate-500">Rua:</span> {cliente.logradouro || '-'}, {cliente.numero || '-'}</p>
                      <p><span className="font-medium text-slate-500">Bairro:</span> {cliente.bairro || '-'}</p>
                      <p><span className="font-medium text-slate-500">Cidade/UF:</span> {cliente.cidade_uf || '-'}</p>
                      <p><span className="font-medium text-slate-500">CEP:</span> {cliente.cep || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {abaAtiva === 'Financeiro' && (
                <div className="text-center py-10 animate-fade-in">
                  <p className="text-slate-500 text-sm">Integração com o módulo financeiro será listada aqui.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* MODAL DE ORDEM DE SERVIÇO */}
      <ModalNovaOS 
        isOpen={isOSOpen} 
        onClose={() => setIsOSOpen(false)} 
        clientePreSelecionado={cliente.nome}
      />

      {/* MODAL DE PEDIDO DE VENDA */}
      <ModalPedidoVenda 
        isOpen={isVendaOpen} 
        onClose={() => setIsVendaOpen(false)} 
        pedidoSelecionado={{
          cliente: cliente.nome,
        }}
      />
    </>
  );
}
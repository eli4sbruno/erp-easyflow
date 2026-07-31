import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';


export default function Marketing() {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [campanhaParaExcluir, setCampanhaParaExcluir] = useState(null);
  
  // Estados para listar os dados
  const [campanhas, setCampanhas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados do Formulário
  const [nomeCampanha, setNomeCampanha] = useState('');
  const [plataforma, setPlataforma] = useState('Meta (Instagram/Facebook)');
  const [orcamento, setOrcamento] = useState('');
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [dataFim, setDataFim] = useState('');
  const [status, setStatus] = useState('Planeamento');

  // Buscar dados ao carregar
  useEffect(() => {
    fetchCampanhas();
  }, []);

  const fetchCampanhas = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('marketing')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar campanhas:', error);
    } else {
      setCampanhas(data || []);
    }
    setIsLoading(false);
  };

  const handleSalvarCampanha = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("Sessão expirada. Faça login novamente.");
      return;
    }

    if (!nomeCampanha || !orcamento) {
      alert("Por favor, preencha o nome da campanha e o orçamento.");
      return;
    }

    const novaCampanha = {
      user_id: user.id,
      campanha: nomeCampanha,
      plataforma,
      orcamento: Number(orcamento),
      data_inicio: dataInicio || null,
      data_fim: dataFim || null,
      status
    };

    const { error } = await supabase.from('marketing').insert([novaCampanha]);

    if (error) {
      console.error('Erro ao guardar campanha:', error);
      alert('Erro ao registar a campanha.');
    } else {
      fecharModal();
      fetchCampanhas();
    }
  };

  const atualizarStatus = async (id, novoStatus) => {
    const { error } = await supabase
      .from('marketing')
      .update({ status: novoStatus })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar o status.');
    } else {
      fetchCampanhas(); // Recarrega para mostrar a alteração
    }
  };

  const fecharModal = () => {
    setShowModal(false);
    setNomeCampanha('');
    setPlataforma('Meta (Instagram/Facebook)');
    setOrcamento('');
    setDataInicio(new Date().toISOString().split('T')[0]);
    setDataFim('');
    setStatus('Planeamento');
  };

  const handleExcluir = (id) => {
    setCampanhaParaExcluir(id);
    setShowDeleteModal(true);
  };

  const confirmarExclusao = async () => {
    if (campanhaParaExcluir) {
      const { error } = await supabase
        .from('marketing')
        .delete()
        .eq('id', campanhaParaExcluir);

      if (error) {
        console.error('Erro ao apagar:', error);
      } else {
        setCampanhas(campanhas.filter(c => c.id !== campanhaParaExcluir));
      }
    }
    setShowDeleteModal(false);
    setCampanhaParaExcluir(null);
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return 'Contínua';
    const data = new Date(dataStr);
    data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
    return data.toLocaleDateString('pt-BR');
  };

  const getStatusStyle = (statusName) => {
    switch (statusName) {
      case 'Ativa': return 'bg-green-100 text-green-800 border-green-200';
      case 'Planeamento': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Concluída': return 'bg-slate-200 text-slate-800 border-slate-300';
      case 'Pausada': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Cálculos para Resumo
  const campanhasAtivas = campanhas.filter(c => c.status === 'Ativa').length;
  const orcamentoTotal = campanhas
    .filter(c => c.status === 'Ativa' || c.status === 'Planeamento')
    .reduce((acc, curr) => acc + Number(curr.orcamento), 0);
  const emPlaneamento = campanhas.filter(c => c.status === 'Planeamento').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabeçalho do Módulo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F4C81]">Marketing & Campanhas</h2>
          <p className="text-slate-500 text-sm">Gestão de investimentos em publicidade e ações promocionais.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#0F4C81] hover:bg-[#0c3e6a] text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-colors flex items-center gap-2"
        >
          <span>+</span> Nova Campanha
        </button>
      </div>

      {/* Cards de Resumo Rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-[#1B9C85]">
          <h3 className="text-sm font-medium text-slate-500 uppercase">Campanhas Ativas</h3>
          <p className="text-3xl font-bold text-[#1B9C85] mt-2">{campanhasAtivas}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-[#0F4C81]">
          <h3 className="text-sm font-medium text-slate-500 uppercase">Orçamento Empenhado</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">{formatarMoeda(orcamentoTotal)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-blue-400">
          <h3 className="text-sm font-medium text-slate-500 uppercase">Em Planeamento</h3>
          <p className="text-3xl font-bold text-blue-500 mt-2">{emPlaneamento}</p>
        </div>
      </div>

      {/* Tabela de Campanhas */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Quadro de Ações</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nome da Campanha</th>
                <th className="px-6 py-4">Plataforma</th>
                <th className="px-6 py-4 text-right">Orçamento</th>
                <th className="px-6 py-4">Período</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">A carregar dados do Supabase...</td></tr>
              ) : campanhas.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">Nenhuma campanha registada.</td></tr>
              ) : (
                campanhas.map((camp) => (
                  <tr key={camp.id} className={`hover:bg-slate-50 ${camp.status === 'Concluída' ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4 font-semibold text-slate-800">{camp.campanha}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                        {camp.plataforma}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-[#1B9C85]">
                      {formatarMoeda(camp.orcamento)}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <div className="text-xs">
                        <span className="block">Início: {formatarData(camp.data_inicio)}</span>
                        <span className="block">Fim: {formatarData(camp.data_fim)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select 
                        value={camp.status}
                        onChange={(e) => atualizarStatus(camp.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold focus:outline-none cursor-pointer border hover:shadow-sm transition-all ${getStatusStyle(camp.status)}`}
                      >
                        <option value="Planeamento">Planeamento</option>
                        <option value="Ativa">Ativa</option>
                        <option value="Pausada">Pausada</option>
                        <option value="Concluída">Concluída</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center flex justify-center gap-2">
                      <button 
                        onClick={() => handleExcluir(camp.id)}
                        className="p-1.5 text-slate-400 hover:text-[#E74C3C] hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir Campanha"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Campanha */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-[#0F4C81]">Nova Campanha</h3>
              <button onClick={fecharModal} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Campanha</label>
                <input 
                  type="text" 
                  value={nomeCampanha}
                  onChange={(e) => setNomeCampanha(e.target.value)}
                  placeholder="Ex: Promoção Black Friday" 
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81]" 
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Plataforma</label>
                  <select 
                    value={plataforma}
                    onChange={(e) => setPlataforma(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] bg-white text-slate-700"
                  >
                    <option value="Meta (Instagram/Facebook)">Meta (Insta/FB)</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="LinkedIn Ads">LinkedIn Ads</option>
                    <option value="E-mail Marketing">E-mail Marketing</option>
                    <option value="Físico (Panfletos/Outdoors)">Físico (Outdoor/Panfleto)</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Orçamento (R$)</label>
                  <input 
                    type="number" 
                    value={orcamento}
                    onChange={(e) => setOrcamento(e.target.value)}
                    placeholder="0.00" 
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] font-semibold text-[#1B9C85]" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data de Início</label>
                  <input 
                    type="date" 
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] text-slate-700" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data de Fim (Opcional)</label>
                  <input 
                    type="date" 
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] text-slate-700" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status Inicial</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] bg-white text-slate-700"
                >
                  <option value="Planeamento">Planeamento</option>
                  <option value="Ativa">Ativa</option>
                  <option value="Pausada">Pausada</option>
                </select>
              </div>

            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button onClick={fecharModal} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
              <button 
                onClick={handleSalvarCampanha}
                className="px-4 py-2 bg-[#0F4C81] text-white font-medium hover:bg-[#0c3e6a] rounded-lg shadow-sm transition-colors"
              >
                Guardar Campanha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir Campanha?</h3>
              <p className="text-slate-500 text-sm">Tem certeza que deseja apagar este registo? A ação não pode ser desfeita.</p>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-center gap-3 bg-slate-50">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Cancelar</button>
              <button onClick={confirmarExclusao} className="px-4 py-2 bg-[#E74C3C] text-white font-medium hover:bg-red-700 rounded-lg shadow-sm">Sim, apagar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
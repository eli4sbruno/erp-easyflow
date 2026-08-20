import React, { useState, useEffect } from 'react';
import { supabase } from "@/supabaseClient";


export default function RH() {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [funcionarioParaExcluir, setFuncionarioParaExcluir] = useState(null);
  
  // Estados para listar os dados
  const [funcionarios, setFuncionarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados do Formulário
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [departamento, setDepartamento] = useState('Produção');
  const [salario, setSalario] = useState('');
  const [dataAdmissao, setDataAdmissao] = useState('');
  const [status, setStatus] = useState('Ativo');

  // Buscar dados ao carregar
  useEffect(() => {
    fetchFuncionarios();
  }, []);

  const fetchFuncionarios = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('funcionarios')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar funcionários:', error);
    } else {
      setFuncionarios(data || []);
    }
    setIsLoading(false);
  };

  const handleSalvarFuncionario = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("Sessão expirada. Faça login novamente.");
      return;
    }

    if (!nome || !cargo || !salario) {
      alert("Por favor, preencha o nome, cargo e salário.");
      return;
    }

    const novoFuncionario = {
      user_id: user.id,
      nome,
      cargo,
      departamento,
      salario: Number(salario),
      data_admissao: dataAdmissao || new Date().toISOString().split('T')[0],
      status
    };

    const { error } = await supabase.from('funcionarios').insert([novoFuncionario]);

    if (error) {
      console.error('Erro ao guardar funcionário:', error);
      alert('Erro ao registar o colaborador.');
    } else {
      fecharModal();
      fetchFuncionarios();
    }
  };

  const atualizarStatus = async (id, novoStatus) => {
    const { error } = await supabase
      .from('funcionarios')
      .update({ status: novoStatus })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar o status.');
    } else {
      fetchFuncionarios(); // Recarrega para mostrar a alteração
    }
  };

  const fecharModal = () => {
    setShowModal(false);
    setNome('');
    setCargo('');
    setDepartamento('Produção');
    setSalario('');
    setDataAdmissao('');
    setStatus('Ativo');
  };

  const handleExcluir = (id) => {
    setFuncionarioParaExcluir(id);
    setShowDeleteModal(true);
  };

  const confirmarExclusao = async () => {
    if (funcionarioParaExcluir) {
      const { error } = await supabase
        .from('funcionarios')
        .delete()
        .eq('id', funcionarioParaExcluir);

      if (error) {
        console.error('Erro ao apagar:', error);
      } else {
        setFuncionarios(funcionarios.filter(f => f.id !== funcionarioParaExcluir));
      }
    }
    setShowDeleteModal(false);
    setFuncionarioParaExcluir(null);
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return 'N/A';
    const data = new Date(dataStr);
    data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
    return data.toLocaleDateString('pt-BR');
  };

  const getStatusStyle = (statusName) => {
    switch (statusName) {
      case 'Ativo': return 'bg-green-100 text-green-800 border-green-200';
      case 'Férias': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Afastado': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Desligado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Cálculos para Resumo
  const totalAtivos = funcionarios.filter(f => f.status === 'Ativo').length;
  const totalFerias = funcionarios.filter(f => f.status === 'Férias').length;
  const folhaSalarial = funcionarios
    .filter(f => f.status !== 'Desligado')
    .reduce((acc, curr) => acc + Number(curr.salario), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabeçalho do Módulo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F4C81]">Recursos Humanos</h2>
          <p className="text-slate-500 text-sm">Gestão de equipa, folha salarial e status de colaboradores.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#0F4C81] hover:bg-[#0c3e6a] text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-colors flex items-center gap-2"
        >
          <span>+</span> Novo Colaborador
        </button>
      </div>

      {/* Cards de Resumo Rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-[#0F4C81]">
          <h3 className="text-sm font-medium text-slate-500 uppercase">Equipa Ativa</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">{totalAtivos} <span className="text-sm font-normal text-slate-400">pessoas</span></p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-[#E74C3C]">
          <h3 className="text-sm font-medium text-slate-500 uppercase">Folha Salarial (Mensal)</h3>
          <p className="text-3xl font-bold text-[#E74C3C] mt-2">{formatarMoeda(folhaSalarial)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-[#1B9C85]">
          <h3 className="text-sm font-medium text-slate-500 uppercase">Em Férias / Afastados</h3>
          <p className="text-3xl font-bold text-[#1B9C85] mt-2">{totalFerias}</p>
        </div>
      </div>

      {/* Tabela de Colaboradores */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Quadro de Funcionários</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Cargo / Depto</th>
                <th className="px-6 py-4">Admissão</th>
                <th className="px-6 py-4 text-right">Salário Base</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">A carregar dados do Supabase...</td></tr>
              ) : funcionarios.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">Nenhum colaborador registado.</td></tr>
              ) : (
                funcionarios.map((func) => (
                  <tr key={func.id} className={`hover:bg-slate-50 ${func.status === 'Desligado' ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                          {func.nome.substring(0, 2).toUpperCase()}
                        </div>
                        {func.nome}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{func.cargo}</div>
                      <div className="text-xs text-slate-400">{func.departamento}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{formatarData(func.data_admissao)}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-700">
                      {formatarMoeda(func.salario)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select 
                        value={func.status}
                        onChange={(e) => atualizarStatus(func.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold focus:outline-none cursor-pointer border hover:shadow-sm transition-all ${getStatusStyle(func.status)}`}
                      >
                        <option value="Ativo">Ativo</option>
                        <option value="Férias">Férias</option>
                        <option value="Afastado">Afastado</option>
                        <option value="Desligado">Desligado</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center flex justify-center gap-2">
                      <button 
                        onClick={() => handleExcluir(func.id)}
                        className="p-1.5 text-slate-400 hover:text-[#E74C3C] hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir Registo"
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

      {/* Modal Novo Colaborador */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-[#0F4C81]">Registar Novo Colaborador</h3>
              <button onClick={fecharModal} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: João da Silva" 
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81]" 
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cargo</label>
                  <input 
                    type="text" 
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    placeholder="Ex: Operador de Máquina" 
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Departamento</label>
                  <select 
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] bg-white text-slate-700"
                  >
                    <option value="Produção">Produção</option>
                    <option value="Administrativo">Administrativo</option>
                    <option value="Vendas">Vendas</option>
                    <option value="Logística/Estoque">Logística/Estoque</option>
                    <option value="Direção">Direção</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Salário Base (R$)</label>
                  <input 
                    type="number" 
                    value={salario}
                    onChange={(e) => setSalario(e.target.value)}
                    placeholder="0.00" 
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0F4C81] font-semibold" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data de Admissão</label>
                  <input 
                    type="date" 
                    value={dataAdmissao}
                    onChange={(e) => setDataAdmissao(e.target.value)}
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
                  <option value="Ativo">Ativo</option>
                  <option value="Férias">Férias</option>
                  <option value="Afastado">Afastado</option>
                </select>
              </div>

            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button onClick={fecharModal} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
              <button 
                onClick={handleSalvarFuncionario}
                className="px-4 py-2 bg-[#0F4C81] text-white font-medium hover:bg-[#0c3e6a] rounded-lg shadow-sm transition-colors"
              >
                Guardar Colaborador
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
              <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir Registo?</h3>
              <p className="text-slate-500 text-sm">Tem certeza que deseja apagar o registo deste colaborador? A ação não pode ser desfeita.</p>
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
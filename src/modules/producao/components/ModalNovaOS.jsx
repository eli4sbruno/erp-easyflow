import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import Modal from '@/components/modals/Modal';

export default function ModalNovaOS({ isOpen, onClose, onSuccess, clientePreSelecionado }) {
  // 1. Identificação
  const [tipoOP, setTipoOP] = useState('Cliente');
  const [dataAbertura, setDataAbertura] = useState('');
  const [dataConclusao, setDataConclusao] = useState('');
  
  // 2. Solicitante
  const [solicitanteNome, setSolicitanteNome] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [contato, setContato] = useState('');
  const [endereco, setEndereco] = useState('');

  // 3. Serviço / Produção
  const [categoriaServico, setCategoriaServico] = useState('');
  const [descricaoSolicitacao, setDescricaoSolicitacao] = useState('');
  const [produtoEquipamento, setProdutoEquipamento] = useState('');
  const [servicosExecutados, setServicosExecutados] = useState('');
  const [responsavel, setResponsavel] = useState('');

  // 4. Materiais e Custos
  const [materiaisUtilizados, setMateriaisUtilizados] = useState('');
  const [horasTrabalho, setHorasTrabalho] = useState('');
  const [valorMaoDeObra, setValorMaoDeObra] = useState(0);
  const [valorMateriais, setValorMateriais] = useState(0);
  const [descontos, setDescontos] = useState(0);
  const [semCobranca, setSemCobranca] = useState(true);
  const [centroCusto, setCentroCusto] = useState('');
  const [projetoSetor, setProjetoSetor] = useState('');

  // 5. Encerramento
  const [status, setStatus] = useState('Pendente');
  const [observacoes, setObservacoes] = useState('');
  
  // NOVO: Estado para a assinatura
  const [tipoAssinatura, setTipoAssinatura] = useState('manual'); 

  useEffect(() => {
    if (isOpen) {
      resetarCampos();
      
      // Se recebeu um cliente vindo do CRM, define o nome. Caso contrário, busca o usuário logado.
      if (clientePreSelecionado) {
        setSolicitanteNome(clientePreSelecionado);
      } else {
        fetchUserLogado();
      }
    }
  }, [isOpen, clientePreSelecionado]);

  const resetarCampos = () => {
    setTipoOP('Cliente');
    setDataAbertura(new Date().toISOString().split('T')[0]);
    setDataConclusao('');
    setDepartamento('');
    setCpfCnpj('');
    setContato('');
    setEndereco('');
    setCategoriaServico('');
    setDescricaoSolicitacao('');
    setProdutoEquipamento('');
    setServicosExecutados('');
    setMateriaisUtilizados('');
    setHorasTrabalho('');
    setValorMaoDeObra(0);
    setValorMateriais(0);
    setDescontos(0);
    setSemCobranca(true);
    setCentroCusto('');
    setProjetoSetor('');
    setStatus('Pendente');
    setObservacoes('');
    setTipoAssinatura('manual');
  };

  const fetchUserLogado = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const nomeOuEmail = user.user_metadata?.name || user.user_metadata?.full_name || user.email;
      setSolicitanteNome(nomeOuEmail);
      setResponsavel(nomeOuEmail);
    }
  };

  const handleSalvarOS = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("Sessão expirada. Faça login novamente.");
      return;
    }

    if (!solicitanteNome || !descricaoSolicitacao) {
      alert("Por favor, preencha o Nome do Solicitante e a Descrição da Solicitação.");
      return;
    }

    const valorTotal = tipoOP === 'Cliente' 
      ? (Number(valorMaoDeObra) + Number(valorMateriais) - Number(descontos))
      : 0;

    const novaOS = {
      user_id: user.id,
      tipo_op: tipoOP,
      data_abertura: dataAbertura || null,
      data_conclusao: dataConclusao || null,
      solicitante_nome: solicitanteNome,
      departamento: tipoOP === 'Interna' ? departamento : null,
      cpf_cnpj: tipoOP === 'Cliente' ? cpfCnpj : null,
      contato,
      endereco,
      categoria_servico: categoriaServico,
      descricao_solicitacao: descricaoSolicitacao,
      produto_equipamento: produtoEquipamento,
      servicos_executados: servicosExecutados,
      responsavel: responsavel || 'Não atribuído',
      materiais_utilizados: materiaisUtilizados,
      horas_trabalho: horasTrabalho,
      valor_mao_de_obra: tipoOP === 'Cliente' ? valorMaoDeObra : 0,
      valor_materiais: tipoOP === 'Cliente' ? valorMateriais : 0,
      descontos: tipoOP === 'Cliente' ? descontos : 0,
      valor_total: valorTotal,
      sem_cobranca: tipoOP === 'Interna' ? semCobranca : false,
      centro_custo: tipoOP === 'Interna' ? centroCusto : null,
      projeto_setor: tipoOP === 'Interna' ? projetoSetor : null,
      status,
      observacoes,
      tipo_assinatura: tipoAssinatura
    };

    const { data, error } = await supabase.from('producao').insert([novaOS]).select();

    if (error) {
      console.error('Erro ao guardar O.S:', error);
      alert('Erro ao registar a Ordem de Serviço.');
    } else {
      onClose();
      
      const referenciaOS = data && data.length > 0 ? `OS-${data[0].id.substring(0,6).toUpperCase()}` : 'Nova OS';

      if (onSuccess) {
        onSuccess({ 
          cliente: solicitanteNome, 
          valor: valorTotal, 
          origem: 'OS', 
          ref: referenciaOS,
          tipoAssinatura: tipoAssinatura
        });
      }
    }
  };

  return (
    <Modal isOpen={isOpen}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        
        {/* Header Modal */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <h3 className="text-xl font-bold text-[#0F4C81]">Nova O.S</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-2xl">&times;</button>
        </div>
        
        {/* Corpo do Modal com Scroll */}
        <div className="p-6 overflow-y-auto space-y-8 bg-slate-50/50 custom-scrollbar flex-1">
          
          {/* 1. Identificação */}
          <section className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h4 className="text-md font-bold text-slate-800 mb-4 border-b pb-2">1. Identificação</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo da O.S</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="Interna" checked={tipoOP === 'Interna'} onChange={(e) => setTipoOP(e.target.value)} className="text-[#0F4C81]" />
                    <span className="text-sm">Interna</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="Cliente" checked={tipoOP === 'Cliente'} onChange={(e) => setTipoOP(e.target.value)} className="text-[#0F4C81]" />
                    <span className="text-sm">Para Cliente</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data de Abertura</label>
                <input type="date" value={dataAbertura} onChange={(e) => setDataAbertura(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data de Conclusão (Opcional)</label>
                <input type="date" value={dataConclusao} onChange={(e) => setDataConclusao(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81]" />
              </div>
            </div>
          </section>

          {/* 2. Solicitante */}
          <section className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h4 className="text-md font-bold text-slate-800 mb-4 border-b pb-2">2. Solicitante / Cliente</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome ou Razão Social *</label>
                <input type="text" value={solicitanteNome} onChange={(e) => setSolicitanteNome(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81]" placeholder="Ex: João Silva ou Empresa XYZ" />
              </div>
              
              {tipoOP === 'Interna' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Departamento</label>
                  <input type="text" value={departamento} onChange={(e) => setDepartamento(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81]" placeholder="Ex: TI, Manutenção, Linha 1" />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CPF / CNPJ</label>
                  <input type="text" value={cpfCnpj} onChange={(e) => setCpfCnpj(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81]" placeholder="000.000.000-00" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefone e E-mail</label>
                <input type="text" value={contato} onChange={(e) => setContato(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81]" placeholder="Contato do solicitante" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Endereço (Opcional)</label>
                <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81]" placeholder="Rua, Número, Cidade" />
              </div>
            </div>
          </section>

          {/* 3. Serviço / Produção */}
          <section className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h4 className="text-md font-bold text-slate-800 mb-4 border-b pb-2">3. Serviço / Produção</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria da Produção</label>
                <input type="text" value={categoriaServico} onChange={(e) => setCategoriaServico(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81]" placeholder="Ex: Impressão Digital, Offset, Comunicação Visual" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Produto, Equipamento ou Item</label>
                <input type="text" value={produtoEquipamento} onChange={(e) => setProdutoEquipamento(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81]" placeholder="Ex: Banner Lona Brilho, Cartão Couchê" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição da Solicitação *</label>
                <textarea value={descricaoSolicitacao} onChange={(e) => setDescricaoSolicitacao(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81] custom-scrollbar" rows="3" placeholder="Detalhe os acabamentos, medidas e exigências..."></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Serviços / Passos Executados</label>
                <textarea value={servicosExecutados} onChange={(e) => setServicosExecutados(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81] custom-scrollbar" rows="2" placeholder="Descreva o que foi feito (preencher durante ou após a execução)"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Responsável pela Execução</label>
                <input type="text" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81]" placeholder="Nome do técnico ou equipe" />
              </div>
            </div>
          </section>

          {/* 4. Materiais e Custos */}
          <section className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h4 className="text-md font-bold text-slate-800 mb-4 border-b pb-2">4. Materiais e Custos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Materiais, Peças ou Produtos Utilizados</label>
                <textarea value={materiaisUtilizados} onChange={(e) => setMateriaisUtilizados(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81] custom-scrollbar" rows="2" placeholder="Ex: 5 metros de Lona 440g, 20 ilhós N/0..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Horas de Trabalho</label>
                <input type="text" value={horasTrabalho} onChange={(e) => setHorasTrabalho(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81]" placeholder="Ex: 2 horas" />
              </div>
            </div>

            {tipoOP === 'Cliente' ? (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Mão de Obra (R$)</label>
                  <input type="number" value={valorMaoDeObra} onChange={(e) => setValorMaoDeObra(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Materiais (R$)</label>
                  <input type="number" value={valorMateriais} onChange={(e) => setValorMateriais(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descontos (R$)</label>
                  <input type="number" value={descontos} onChange={(e) => setDescontos(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81]" />
                </div>
                <div className="md:col-span-3 flex items-end mt-2">
                  <div className="w-full bg-[#0F4C81] text-white p-3 rounded-lg flex justify-between items-center shadow-inner">
                    <span className="font-semibold">Valor Total (Ir para o Faturamento):</span>
                    <span className="text-xl font-bold">R$ {(Number(valorMaoDeObra) + Number(valorMateriais) - Number(descontos)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="semCobranca" checked={semCobranca} onChange={(e) => setSemCobranca(e.target.checked)} className="w-4 h-4 text-[#0F4C81]" />
                  <label htmlFor="semCobranca" className="text-sm font-medium text-slate-700">Sem cobrança (O.S Interna)</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Centro de Custo</label>
                  <input type="text" value={centroCusto} onChange={(e) => setCentroCusto(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81]" placeholder="Ex: CC-Produção" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Projeto ou Setor</label>
                  <input type="text" value={projetoSetor} onChange={(e) => setProjetoSetor(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81]" placeholder="Ex: Projeto Expansão" />
                </div>
              </div>
            )}
          </section>

          {/* 5. Encerramento */}
          <section className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h4 className="text-md font-bold text-slate-800 mb-4 border-b pb-2">5. Encerramento</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81] bg-white">
                  <option value="Pendente">Pendente</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluída">Concluída</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0F4C81] custom-scrollbar" rows="3" placeholder="Anotações finais, avisos, etc."></textarea>
              </div>
              
              {/* NOVA OPÇÃO DE ASSINATURA */}
              <div className="md:col-span-2 mt-2 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="block text-sm font-medium text-slate-700 mb-3">Método de Assinatura da O.S</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className={`flex-1 flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${tipoAssinatura === 'manual' ? 'border-[#0F4C81] bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                    <input type="radio" value="manual" checked={tipoAssinatura === 'manual'} onChange={(e) => setTipoAssinatura(e.target.value)} className="mt-1" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">Assinatura Manual</span>
                      <span className="text-xs text-slate-500">Imprimir a via física em papel para assinar com caneta.</span>
                    </div>
                  </label>
                  
                  <label className={`flex-1 flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${tipoAssinatura === 'govbr' ? 'border-[#1B9C85] bg-green-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                    <input type="radio" value="govbr" checked={tipoAssinatura === 'govbr'} onChange={(e) => setTipoAssinatura(e.target.value)} className="mt-1" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        Assinatura Digital 
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] rounded uppercase">gov.br</span>
                      </span>
                      <span className="text-xs text-slate-500">Validade legal através da API oficial do governo.</span>
                    </div>
                  </label>
                </div>
              </div>

            </div>
          </section>

        </div>

        {/* Footer / Ações */}
        <div className="p-5 border-t border-slate-200 flex justify-end gap-3 bg-white shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
          <button 
            onClick={handleSalvarOS}
            className="px-5 py-2.5 bg-[#0F4C81] text-white font-medium hover:bg-[#0c3e6a] rounded-lg shadow-sm transition-colors"
          >
            Salvar O.S
          </button>
        </div>
      </div>
    </Modal>
  );
}
import React, { useState } from 'react';
import { supabase } from "@/supabaseClient";
import Modal from "@/components/modals/Modal";

const CloseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const UserAddIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>;

export default function ModalNovoCliente({ isOpen, onClose, onSuccess }) {
  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidadeUf, setCidadeUf] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);

  // Limpa o formulário quando o modal é fechado
  const limparFormulario = () => {
    setNome(''); setDocumento(''); setTelefone(''); setEmail('');
    setCep(''); setLogradouro(''); setNumero(''); setBairro(''); setCidadeUf('');
  };

  const handleFechar = () => {
    limparFormulario();
    onClose();
  };

  const handleSalvar = async () => {
    if (!nome || !telefone) {
      alert("Por favor, preencha pelo menos o Nome e o WhatsApp do cliente.");
      return;
    }

    setIsSaving(true);
    
    // Pega o usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("Sessão expirada. Faça login novamente.");
      setIsSaving(false);
      return;
    }

 const novoCliente = {
      user_id: user.id,
      nome_razao: nome, // <--- A MUDANÇA ESTÁ SÓ AQUI
      documento,
      telefone,
      email,
      cep,
      logradouro,
      numero,
      bairro,
      cidade_uf: cidadeUf,
      estagio_funil: 'Prospecção', 
      status_temperatura: 'Frio'
    };

    const { error } = await supabase.from('clientes').insert([novoCliente]);

    setIsSaving(false);

    if (error) {
      console.error("Erro ao salvar cliente:", error);
      alert("Ocorreu um erro ao salvar o cliente.");
    } else {
      // Sucesso!
      if (onSuccess) onSuccess(); // Recarrega a tabela de clientes por trás
      handleFechar();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen}>
      <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <UserAddIcon /> Cadastrar Cliente
          </h3>
          <button onClick={handleFechar} className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50">
            <CloseIcon />
          </button>
        </div>

        {/* Corpo do Formulário */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Dados Principais</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nome Completo / Razão Social *</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81]" placeholder="Ex: Gráfica Expressa Ltda" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">CPF / CNPJ</label>
                  <input type="text" value={documento} onChange={(e) => setDocumento(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81]" placeholder="000.000.000-00" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">WhatsApp *</label>
                  <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81]" placeholder="(00) 90000-0000" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">E-mail</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81]" placeholder="contato@cliente.com" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Endereço</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">CEP</label>
                <input type="text" value={cep} onChange={(e) => setCep(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81]" placeholder="00000-000" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">Rua / Avenida</label>
                <input type="text" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81]" placeholder="Ex: Av. 17..." />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Número</label>
                <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81]" placeholder="123" />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">Bairro</label>
                <input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81]" placeholder="Centro" />
              </div>
              <div className="col-span-2 sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">Cidade / UF</label>
                <input type="text" value={cidadeUf} onChange={(e) => setCidadeUf(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81]" placeholder="Sua Cidade - UF" />
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
          <button onClick={handleFechar} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-white transition-colors">
            Cancelar
          </button>
          <button onClick={handleSalvar} disabled={isSaving} className="px-6 py-2 bg-[#0F4C81] hover:bg-[#0a3863] text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2">
            {isSaving ? 'Salvando...' : 'Salvar Cliente'}
          </button>
        </div>

      </div>
    </Modal>
  );
}
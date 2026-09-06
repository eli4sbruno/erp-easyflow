"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";

// --- Ícones ---
const ChevronLeft = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>;
const ChevronRight = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>;
const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>;
const CloseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const CalendarIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>;

export default function Agenda() {
  const dataAtual = new Date();
  const [currentMonth, setCurrentMonth] = useState(dataAtual.getMonth());
  const [currentYear, setCurrentYear] = useState(dataAtual.getFullYear());
  
  const [eventos, setEventos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados do Modal de Novo Evento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novaData, setNovaData] = useState('');
  const [novaHora, setNovaHora] = useState('');
  const [novoTipo, setNovoTipo] = useState('Reunião');
  const [novaDescricao, setNovaDescricao] = useState('');

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  useEffect(() => {
    fetchDadosAgenda();
  }, [currentMonth, currentYear]);

  const fetchDadosAgenda = async () => {
    setIsLoading(true);
    
    // Calcula o primeiro e último dia do mês atual para otimizar a busca
    const primeiroDia = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
    const ultimoDia = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];

    // 1. Busca Ordens de Serviço (O.S) que têm prazo de entrega
    const { data: ordensData } = await supabase
      .from('producao')
      .select('id, solicitante_nome, data_conclusao, status')
      .gte('data_conclusao', primeiroDia)
      .lte('data_conclusao', ultimoDia);

    // 2. Busca Eventos Manuais da Agenda
    const { data: eventosData } = await supabase
      .from('agenda_eventos')
      .select('*')
      .gte('data_evento', primeiroDia)
      .lte('data_evento', ultimoDia);

    // 3. Formata e junta tudo em uma lista só
    let listaUnificada = [];

    if (ordensData) {
      const osFormatadas = ordensData.map(os => ({
        id: `os-${os.id}`,
        origem: 'OS',
        titulo: `Entrega: ${os.solicitante_nome || 'O.S'}`,
        data: os.data_conclusao,
        status: os.status,
        cor: os.status === 'Concluída' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-orange-100 text-orange-700 border-orange-200'
      }));
      listaUnificada = [...listaUnificada, ...osFormatadas];
    }

    if (eventosData) {
      const eventosFormatados = eventosData.map(ev => ({
        id: `ev-${ev.id}`,
        origem: 'Evento',
        titulo: ev.titulo,
        data: ev.data_evento,
        hora: ev.hora_evento,
        tipo: ev.tipo,
        cor: ev.tipo === 'Reunião' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-700 border-slate-200'
      }));
      listaUnificada = [...listaUnificada, ...eventosFormatados];
    }

    setEventos(listaUnificada);
    setIsLoading(false);
  };

  // --- NAVEGAÇÃO DO CALENDÁRIO ---
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); } 
    else { setCurrentMonth(currentMonth + 1); }
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); } 
    else { setCurrentMonth(currentMonth - 1); }
  };

  const irParaHoje = () => {
    setCurrentMonth(dataAtual.getMonth());
    setCurrentYear(dataAtual.getFullYear());
  };

  // --- LÓGICA DE MONTAGEM DOS DIAS ---
  const diasNoMes = new Date(currentYear, currentMonth + 1, 0).getDate();
  const primeiroDiaDoMes = new Date(currentYear, currentMonth, 1).getDay(); // 0 a 6
  
  const diasGrid = [];
  // Adiciona os espaços vazios antes do dia 1
  for (let i = 0; i < primeiroDiaDoMes; i++) { diasGrid.push(null); }
  // Adiciona os dias do mês
  for (let i = 1; i <= diasNoMes; i++) { diasGrid.push(i); }

  // --- NOVO EVENTO MANUAL ---
  const salvarEvento = async () => {
    if (!novoTitulo || !novaData) return alert("Título e data são obrigatórios.");

    const { data: { user } } = await supabase.auth.getUser();
    
    const novo = {
      user_id: user.id,
      titulo: novoTitulo,
      data_evento: novaData,
      hora_evento: novaHora || null,
      tipo: novoTipo,
      descricao: novaDescricao
    };

    const { error } = await supabase.from('agenda_eventos').insert([novo]);
    
    if (error) {
      alert("Erro ao salvar o evento.");
    } else {
      setIsModalOpen(false);
      setNovoTitulo(''); setNovaData(''); setNovaHora(''); setNovaDescricao('');
      
      // Se o evento foi no mês que estamos olhando, recarrega a tela
      const dataEventoDate = new Date(novaData);
      if (dataEventoDate.getMonth() === currentMonth && dataEventoDate.getFullYear() === currentYear) {
        fetchDadosAgenda();
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative z-0 h-full flex flex-col pb-6">
      
      {/* HEADER DA AGENDA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-[#0F4C81]">Agenda e Entregas</h2>
          <p className="text-sm text-slate-500">Acompanhe prazos de produção, reuniões e lembretes.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={irParaHoje}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors"
          >
            Ir para Hoje
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#0F4C81] hover:bg-[#0a3863] text-white rounded-lg text-sm font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-2"
          >
            <PlusIcon /> Novo Evento
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* O CALENDÁRIO (ESQUERDA) */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          
          {/* Controles de Mês */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-wide">
              {meses[currentMonth]} <span className="font-medium text-[#1B9C85]">{currentYear}</span>
            </h3>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"><ChevronLeft /></button>
              <button onClick={nextMonth} className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"><ChevronRight /></button>
            </div>
          </div>

          {/* Grid Semanal (Cabeçalho) */}
          <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-t-lg overflow-hidden">
            {diasSemana.map(dia => (
              <div key={dia} className="bg-slate-50 py-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                {dia}
              </div>
            ))}
          </div>

          {/* Grid dos Dias */}
          <div className="grid grid-cols-7 gap-px bg-slate-200 border-x border-b border-slate-200 rounded-b-lg">
            {diasGrid.map((dia, index) => {
              if (dia === null) {
                return <div key={`empty-${index}`} className="bg-white min-h-[120px] p-2 opacity-50"></div>;
              }

              // Formata a data atual do loop para "YYYY-MM-DD"
              const dataString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
              
              // Verifica se é "Hoje"
              const hojeFormatado = dataAtual.toISOString().split('T')[0];
              const isHoje = dataString === hojeFormatado;

              // Puxa os eventos que caem nesse dia específico
              const eventosDoDia = eventos.filter(ev => ev.data === dataString);

              return (
                <div key={dia} className={`bg-white min-h-[120px] p-2 flex flex-col gap-1 transition-colors hover:bg-slate-50 ${isHoje ? 'bg-blue-50/30' : ''}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${isHoje ? 'bg-[#0F4C81] text-white shadow-md' : 'text-slate-700'}`}>
                      {dia}
                    </span>
                  </div>
                  
                  {/* Lista de Eventos no Dia */}
                  <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar max-h-24">
                    {eventosDoDia.map(ev => (
                      <div key={ev.id} className={`px-2 py-1 rounded text-[10px] font-semibold border leading-tight truncate cursor-pointer ${ev.cor}`} title={`${ev.hora ? ev.hora.substring(0,5) + ' - ' : ''}${ev.titulo}`}>
                        {ev.hora && <span className="opacity-70 mr-1">{ev.hora.substring(0,5)}</span>}
                        {ev.titulo}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PRÓXIMOS COMPROMISSOS (DIREITA) */}
        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
          <div className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700 text-white">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CalendarIcon /> Próximos 7 Dias
            </h3>
            
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-sm text-slate-500">Carregando...</p>
              ) : (
                eventos
                  .filter(ev => {
                    const dataEv = new Date(ev.data + 'T00:00:00'); // Evita bug de fuso horário
                    const hoje = new Date();
                    hoje.setHours(0,0,0,0);
                    const limite = new Date();
                    limite.setDate(hoje.getDate() + 7);
                    return dataEv >= hoje && dataEv <= limite;
                  })
                  .sort((a, b) => new Date(a.data) - new Date(b.data))
                  .slice(0, 5)
                  .map(ev => {
                    const [ano, mes, dia] = ev.data.split('-');
                    return (
                      <div key={`sidebar-${ev.id}`} className="bg-slate-700/50 border border-slate-600 p-3 rounded-lg flex gap-3 items-center">
                        <div className="bg-slate-900 rounded-lg p-2 text-center min-w-[50px] border border-slate-700">
                          <div className="text-xs text-slate-400 uppercase font-bold">{meses[Number(mes)-1].substring(0,3)}</div>
                          <div className="text-xl font-black text-white">{dia}</div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${ev.origem === 'OS' ? 'text-orange-400' : 'text-purple-400'}`}>
                            {ev.tipo || 'Produção'}
                          </div>
                          <div className="text-sm font-semibold truncate" title={ev.titulo}>{ev.titulo}</div>
                        </div>
                      </div>
                    );
                  })
              )}
              
              {!isLoading && eventos.filter(ev => new Date(ev.data + 'T00:00:00') >= new Date(new Date().setHours(0,0,0,0))).length === 0 && (
                <div className="text-sm text-slate-400 border border-dashed border-slate-600 p-4 rounded-lg text-center">
                  Sua agenda está livre nesta semana!
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* MODAL NOVO EVENTO MANUAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9990] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0F4C81]">Agendar Compromisso</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><CloseIcon /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Título do Evento *</label>
                <input type="text" value={novoTitulo} onChange={(e) => setNovoTitulo(e.target.value)} placeholder="Ex: Reunião Identidade Visual" className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F4C81] text-sm font-medium" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data *</label>
                  <input type="date" value={novaData} onChange={(e) => setNovaData(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F4C81] text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Horário</label>
                  <input type="time" value={novaHora} onChange={(e) => setNovaHora(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F4C81] text-sm font-medium" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Evento</label>
                <select value={novoTipo} onChange={(e) => setNovoTipo(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F4C81] text-sm font-medium">
                  <option value="Reunião">Reunião</option>
                  <option value="Lembrete">Lembrete / Tarefa</option>
                  <option value="Manutenção">Manutenção de Equipamento</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Detalhes (Opcional)</label>
                <textarea value={novaDescricao} onChange={(e) => setNovaDescricao(e.target.value)} rows="2" placeholder="Link do meet, endereço, pauta..." className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F4C81] text-sm custom-scrollbar"></textarea>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
              <button onClick={salvarEvento} className="flex-1 px-4 py-2.5 bg-[#1B9C85] text-white font-bold hover:bg-[#15806c] rounded-lg transition-colors shadow-md active:scale-95">Salvar na Agenda</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
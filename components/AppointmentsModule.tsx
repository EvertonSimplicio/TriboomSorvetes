
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Sun, 
  Coffee, 
  LogOut, 
  LogIn, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  Moon,
  ShieldCheck,
  UserX,
  Users,
  Search
} from 'lucide-react';
import { User, Appointment, Employee } from '../types';

interface AppointmentsModuleProps {
  user: User | null;
}

// Simulando banco de dados de funcionários para o Admin filtrar
const MOCK_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Ricardo Silva', role: 'Mestre Sorveteiro', department: 'Produção', status: 'Ativo', hireDate: '2022-01-15' },
  { id: '2', name: 'Juliana Costa', role: 'Operadora de Máquina', department: 'Embalagem', status: 'Ativo', hireDate: '2022-06-10' },
  { id: '3', name: 'Carlos Operador', role: 'Auxiliar', department: 'Produção', status: 'Ativo', hireDate: '2023-01-10' },
];

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    employeeId: '1',
    date: '2023-11-20',
    isDayOff: false,
    entryTime: '08:00',
    intervalStart: '12:00',
    intervalEnd: '13:00',
    exitTime: '17:00',
    notes: 'Trabalho normal.',
    submittedAt: '2023-11-20T17:05:00Z'
  },
  {
    id: 'a2',
    employeeId: '2',
    date: '2023-11-20',
    isDayOff: true,
    notes: 'Folga compensatória.',
    submittedAt: '2023-11-19T10:00:00Z'
  }
];

const AppointmentsModule: React.FC<AppointmentsModuleProps> = ({ user }) => {
  const isAdmin = user?.role === 'Admin';
  const isAuthorized = !!user && (user.role === 'Admin' || user.role === 'Gerente' || user.role === 'Operador');

  // Estado para o funcionário selecionado (Admin seleciona, Operador é fixo)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(user?.id || '1');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  
  // Encontrar apontamento para o funcionário E data selecionados
  const currentAppointment = useMemo(() => {
    return appointments.find(a => a.date === selectedDate && a.employeeId === selectedEmployeeId);
  }, [appointments, selectedDate, selectedEmployeeId]);

  const [isFolga, setIsFolga] = useState(false);
  const [entryTime, setEntryTime] = useState('');
  const [intervalStart, setIntervalStart] = useState('');
  const [intervalEnd, setIntervalEnd] = useState('');
  const [exitTime, setExitTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Sincronizar ID se o usuário mudar (login/logout)
  useEffect(() => {
    if (user && !isAdmin) {
      setSelectedEmployeeId(user.id);
    }
  }, [user, isAdmin]);

  // Atualizar form quando a data, o funcionário ou o registro atual muda
  useEffect(() => {
    if (currentAppointment) {
      setIsFolga(currentAppointment.isDayOff);
      setEntryTime(currentAppointment.entryTime || '');
      setIntervalStart(currentAppointment.intervalStart || '');
      setIntervalEnd(currentAppointment.intervalEnd || '');
      setExitTime(currentAppointment.exitTime || '');
      setNotes(currentAppointment.notes || '');
    } else {
      setIsFolga(false);
      setEntryTime('');
      setIntervalStart('');
      setIntervalEnd('');
      setExitTime('');
      setNotes('');
    }
    setIsSaved(false);
  }, [currentAppointment, selectedDate, selectedEmployeeId]);

  // Se já existe e não é admin, bloqueia edição
  const isLocked = !!currentAppointment && !isAdmin;

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="bg-rose-50 p-6 rounded-[40px] text-rose-500 shadow-inner">
          <UserX className="w-16 h-16" />
        </div>
        <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Acesso Restrito</h3>
        <p className="text-slate-500 max-w-sm font-medium">Contate o administrador para obter permissão de apontamento.</p>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    const appointmentData: Appointment = {
      id: currentAppointment?.id || Math.random().toString(36).substr(2, 9),
      employeeId: selectedEmployeeId,
      date: selectedDate,
      isDayOff: isFolga,
      entryTime: isFolga ? undefined : entryTime,
      intervalStart: isFolga ? undefined : intervalStart,
      intervalEnd: isFolga ? undefined : intervalEnd,
      exitTime: isFolga ? undefined : exitTime,
      notes: notes,
      submittedAt: new Date().toISOString()
    };

    if (currentAppointment) {
      setAppointments(prev => prev.map(a => a.id === currentAppointment.id ? appointmentData : a));
    } else {
      setAppointments(prev => [...prev, appointmentData]);
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tighter">
            <Clock className="w-8 h-8 text-red-600" />
            Apontamento de Jornada
          </h2>
          <p className="text-slate-500 font-medium">Controle de entrada, intervalo e saída da <span className="text-red-600 font-black">Triboom</span>.</p>
        </div>
      </div>

      {/* FILTRO DE FUNCIONÁRIO - EXCLUSIVO ADMIN */}
      {isAdmin && (
        <div className="bg-indigo-900 rounded-[32px] p-6 text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-2xl">
              <Users className="w-6 h-6 text-indigo-200" />
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Painel Administrativo</p>
              <h4 className="font-black text-lg tracking-tight">Selecionar Funcionário para Gestão</h4>
            </div>
          </div>
          
          <div className="w-full md:w-72 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
            <select 
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-4 focus:ring-white/10 font-black text-sm cursor-pointer transition-all"
            >
              {MOCK_EMPLOYEES.map(emp => (
                <option key={emp.id} value={emp.id} className="text-slate-900">{emp.name} ({emp.role})</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Calendário de Topo */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center justify-between">
        <button 
          onClick={() => changeDate(-1)}
          className="p-3 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-2xl transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Data do Registro</span>
          </div>
          <p className="text-xl font-black text-slate-800 tracking-tighter capitalize">
            {new Date(selectedDate).toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long'
            })}
          </p>
        </div>

        <button 
          onClick={() => changeDate(1)}
          className="p-3 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-2xl transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Alerta de Status */}
      {currentAppointment && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border animate-in fade-in ${
          isLocked ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
        }`}>
          {isLocked ? (
            <>
              <Lock className="w-5 h-5 shrink-0" />
              <p className="text-xs font-bold uppercase tracking-wider">Este apontamento já foi enviado. Somente o Administrador pode realizar correções.</p>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <p className="text-xs font-bold uppercase tracking-wider">
                {isAdmin ? 'Modo de Edição Administrador: Alterações permitidas neste registro.' : 'Apontamento já realizado. Você pode visualizar os horários abaixo.'}
              </p>
            </>
          )}
        </div>
      )}

      {/* Formulário */}
      <div className={`bg-white rounded-[40px] border border-slate-200 p-10 shadow-sm relative overflow-hidden transition-opacity duration-300 ${isLocked ? 'opacity-75' : 'opacity-100'}`}>
        {isLocked && <div className="absolute inset-0 z-10 cursor-not-allowed"></div>}
        
        <form onSubmit={handleSave} className="space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl transition-colors ${isFolga ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-400'}`}>
                {isFolga ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-black text-slate-800 tracking-tight">Status da Jornada</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {isFolga ? 'O colaborador está em descanso' : 'Horários de trabalho regular'}
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer group">
              <input 
                type="checkbox" 
                checked={isFolga} 
                onChange={(e) => setIsFolga(e.target.checked)} 
                className="sr-only peer"
                disabled={isLocked}
              />
              <div className="w-16 h-8 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
              <span className="ml-3 text-xs font-black text-slate-800 uppercase tracking-widest">Folga</span>
            </label>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500 ${isFolga ? 'opacity-20 pointer-events-none scale-95 blur-sm' : 'opacity-100 scale-100'}`}>
            {/* Entrada */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-400">
                <LogIn className="w-4 h-4" />
                <label className="text-[10px] font-black uppercase tracking-widest">Entrada</label>
              </div>
              <input 
                type="time" 
                value={entryTime}
                onChange={(e) => setEntryTime(e.target.value)}
                disabled={isLocked || isFolga}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xl font-black text-slate-800 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-400 transition-all text-center"
              />
            </div>

            {/* Início Intervalo */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-400">
                <Coffee className="w-4 h-4" />
                <label className="text-[10px] font-black uppercase tracking-widest">Início Intervalo</label>
              </div>
              <input 
                type="time" 
                value={intervalStart}
                onChange={(e) => setIntervalStart(e.target.value)}
                disabled={isLocked || isFolga}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xl font-black text-slate-800 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-400 transition-all text-center"
              />
            </div>

            {/* Fim Intervalo */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-400">
                <Sun className="w-4 h-4" />
                <label className="text-[10px] font-black uppercase tracking-widest">Fim Intervalo</label>
              </div>
              <input 
                type="time" 
                value={intervalEnd}
                onChange={(e) => setIntervalEnd(e.target.value)}
                disabled={isLocked || isFolga}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xl font-black text-slate-800 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-400 transition-all text-center"
              />
            </div>

            {/* Saída */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-400">
                <LogOut className="w-4 h-4" />
                <label className="text-[10px] font-black uppercase tracking-widest">Saída</label>
              </div>
              <input 
                type="time" 
                value={exitTime}
                onChange={(e) => setExitTime(e.target.value)}
                disabled={isLocked || isFolga}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xl font-black text-slate-800 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-400 transition-all text-center"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Info className="w-4 h-4" />
              <label className="text-[10px] font-black uppercase tracking-widest">Notas e Observações</label>
            </div>
            <textarea 
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isLocked}
              placeholder="Justifique atrasos, folgas ou ocorrências especiais..."
              className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-400 transition-all resize-none"
            />
          </div>

          {!isLocked && (
            <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3 text-slate-400 text-center md:text-left">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                  Confirme os horários. <br />Após salvar, os dados são auditados pela gerência.
                </p>
              </div>
              
              <button 
                type="submit"
                className={`w-full md:w-auto px-10 py-5 rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl ${
                  isSaved ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-red-600 text-white shadow-red-200 hover:bg-red-700'
                }`}
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 animate-bounce" />
                    Salvo com Sucesso!
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6" />
                    Confirmar Apontamento
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Informativo de Rodapé */}
      <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 p-8 opacity-5">
            <Clock className="w-32 h-32" />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="bg-red-600 p-4 rounded-3xl shadow-xl shadow-red-500/20">
               <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
               <h4 className="text-xl font-black tracking-tighter">Política de Conformidade Triboom</h4>
               <p className="text-slate-400 text-xs font-medium mt-1 leading-relaxed">
                  Este sistema segue as diretrizes internas de gestão de jornada. <br />
                  Registros inconsistentes estão sujeitos a revisão administrativa.
               </p>
            </div>
            <button 
              className="md:ml-auto px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
            >
              Relatório Completo
            </button>
         </div>
      </div>
    </div>
  );
};

export default AppointmentsModule;

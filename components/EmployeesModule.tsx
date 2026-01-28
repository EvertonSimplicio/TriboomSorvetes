
import React, { useState, useMemo } from 'react';
import { 
  Contact, 
  Plus, 
  Search, 
  X, 
  Save, 
  Briefcase, 
  Map, 
  CheckCircle2, 
  AlertCircle,
  XCircle,
  MoreVertical,
  Trash2,
  Edit3,
  Calendar
} from 'lucide-react';
import { Employee } from '../types';

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'Ricardo Silva', role: 'Mestre Sorveteiro', department: 'Produção', status: 'Ativo', hireDate: '2022-01-15' },
  { id: 'e2', name: 'Juliana Costa', role: 'Operadora de Máquina', department: 'Embalagem', status: 'Ativo', hireDate: '2022-06-10' },
  { id: 'e3', name: 'Marcos Santos', role: 'Auxiliar de Cozinha', department: 'Produção', status: 'Inativo', hireDate: '2023-03-22' },
];

const EmployeesModule: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const handleSaveEmployee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const employeeData: Employee = {
      id: editingEmployee?.id || Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      department: formData.get('department') as string,
      status: formData.get('status') as any,
      hireDate: formData.get('hireDate') as string
    };

    if (editingEmployee) {
      setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? employeeData : emp));
    } else {
      setEmployees([employeeData, ...employees]);
    }
    
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const toggleStatus = (id: string) => {
    setEmployees(prev => prev.map(e => {
      if (e.id === id) {
        return { ...e, status: e.status === 'Ativo' ? 'Inativo' : 'Ativo' };
      }
      return e;
    }));
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja remover este funcionário dos registros?')) {
      setEmployees(prev => prev.filter(e => e.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Contact className="w-7 h-7 text-red-600" />
            Funcionários
          </h2>
          <p className="text-slate-500 font-medium tracking-tight">Gestão de talentos e histórico da <span className="text-red-600 font-black">Triboom</span>.</p>
        </div>
        
        <button 
          onClick={() => { setEditingEmployee(null); setIsModalOpen(true); }}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 transition-all shadow-lg shadow-red-100 active:scale-95"
        >
          <Plus className="w-5 h-5" /> Admitir Funcionário
        </button>
      </div>

      <div className="bg-white p-5 rounded-[32px] border border-slate-200 shadow-sm">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por nome, cargo ou setor..." 
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-red-500/10 transition-all focus:bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Colaborador</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargo / Setor</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Data Admissão</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((e) => (
                <tr key={e.id} className={`hover:bg-slate-50/50 transition-all group ${e.status === 'Inativo' ? 'opacity-60' : ''}`}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm uppercase shadow-sm ${e.status === 'Ativo' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                        {e.name.charAt(0)}
                      </div>
                      <span className={`text-sm font-black tracking-tight ${e.status === 'Ativo' ? 'text-slate-800' : 'text-slate-400'}`}>{e.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-700 uppercase">
                        <Briefcase className="w-3.5 h-3.5 text-amber-500" /> {e.role}
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                        <Map className="w-3 h-3" /> {e.department}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-xs font-bold text-slate-500">
                      {new Date(e.hireDate).toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button 
                      onClick={() => toggleStatus(e.id)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${
                        e.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {e.status === 'Ativo' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {e.status}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => { setEditingEmployee(e); setIsModalOpen(true); }} className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                         <Edit3 className="w-5 h-5" />
                       </button>
                       <button onClick={() => handleDelete(e.id)} className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                         <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg p-0 overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-50 px-10 py-8 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tighter">
                  {editingEmployee ? 'Atualizar Dados' : 'Admissão'}
                </h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Colaborador Operacional</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white p-3 rounded-2xl text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSaveEmployee} className="p-10 space-y-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nome Completo</label>
                  <input name="name" required defaultValue={editingEmployee?.name} placeholder="Nome do colaborador..." className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-400 outline-none font-bold" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Cargo</label>
                    <input name="role" required defaultValue={editingEmployee?.role} placeholder="Ex: Operador" className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-400 outline-none font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Setor</label>
                    <input name="department" required defaultValue={editingEmployee?.department} placeholder="Ex: Produção" className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-400 outline-none font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Data Admissão</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input name="hireDate" type="date" required defaultValue={editingEmployee?.hireDate || new Date().toISOString().split('T')[0]} className="w-full pl-12 pr-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-400 outline-none font-black" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Status</label>
                    <select 
                      name="status" 
                      defaultValue={editingEmployee?.status || 'Ativo'} 
                      className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-400 outline-none bg-white font-black"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                      <option value="Afastado">Afastado</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase hover:bg-slate-50 transition-all">Cancelar</button>
                <button type="submit" className="flex-[2] px-6 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-red-700 shadow-xl shadow-red-200 flex items-center justify-center gap-2 transition-all">
                  <Save className="w-5 h-5" /> Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesModule;

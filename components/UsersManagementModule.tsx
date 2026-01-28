
import React, { useState, useMemo } from 'react';
import { 
  UserCog, 
  Plus, 
  Search, 
  X, 
  Save, 
  ShieldCheck, 
  Shield, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle,
  MoreVertical,
  Trash2,
  Edit3
} from 'lucide-react';
import { SystemUser } from '../types';

const INITIAL_USERS: SystemUser[] = [
  { id: '1', name: 'Usuário Administrativo', email: 'admin@triboom.com', role: 'Admin', status: 'Ativo', lastAccess: '2023-11-21T10:00:00Z' },
  { id: '2', name: 'Maria Gerência', email: 'maria@triboom.com', role: 'Gerente', status: 'Ativo', lastAccess: '2023-11-20T16:45:00Z' },
  { id: '3', name: 'Carlos Operador', email: 'carlos@triboom.com', role: 'Operador', status: 'Inativo' },
];

const UsersManagementModule: React.FC = () => {
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleSaveUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const userData: SystemUser = {
      id: editingUser?.id || Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as any,
      status: editingUser?.status || 'Ativo',
      lastAccess: editingUser?.lastAccess
    };

    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? userData : u));
    } else {
      setUsers([userData, ...users]);
    }
    
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'Ativo' ? 'Inativo' : 'Ativo' };
      }
      return u;
    }));
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja remover o acesso deste usuário permanentemente?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <UserCog className="w-7 h-7 text-red-600" />
            Acessos ao Sistema
          </h2>
          <p className="text-slate-500 font-medium tracking-tight">Gestão de permissões do ERP <span className="text-red-600 font-black">Triboom</span>.</p>
        </div>
        
        <button 
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 transition-all shadow-lg shadow-red-100 active:scale-95"
        >
          <Plus className="w-5 h-5" /> Novo Acesso
        </button>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Filtrar usuários..." 
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-red-500/10 transition-all focus:bg-white focus:border-red-400"
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
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Permissão</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Login Recente</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 font-black text-sm">
                        {u.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800 tracking-tight">{u.name}</span>
                        <span className="text-xs text-slate-400 font-bold">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      {u.role === 'Admin' ? <ShieldCheck className="w-4 h-4 text-amber-500" /> : u.role === 'Gerente' ? <ShieldAlert className="w-4 h-4 text-amber-600" /> : <Shield className="w-4 h-4 text-slate-400" />}
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{u.role}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-xs font-bold text-slate-500">
                      {u.lastAccess ? new Date(u.lastAccess).toLocaleString('pt-BR') : 'Sem registro'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button 
                      onClick={() => toggleUserStatus(u.id)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${
                        u.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                      }`}
                    >
                      {u.status === 'Ativo' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {u.status}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => { setEditingUser(u); setIsModalOpen(true); }}
                        className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                       >
                         <Edit3 className="w-5 h-5" />
                       </button>
                       <button 
                        onClick={() => handleDelete(u.id)}
                        className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                       >
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
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest tracking-tight">Acesso ao Painel Triboom</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white p-3 rounded-2xl text-slate-400 hover:text-slate-600 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSaveUser} className="p-10 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nome Completo</label>
                  <input name="name" required defaultValue={editingUser?.name} placeholder="Nome do usuário..." className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-400 outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">E-mail de Acesso</label>
                  <input name="email" type="email" required defaultValue={editingUser?.email} placeholder="email@triboom.com" className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-400 outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nível de Permissão</label>
                  <select name="role" defaultValue={editingUser?.role || 'Operador'} className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-400 outline-none bg-white font-black">
                    <option value="Admin">Administrador (Total)</option>
                    <option value="Gerente">Gerente (Parcial)</option>
                    <option value="Operador">Operador (Básico)</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase hover:bg-slate-50 transition-all">Cancelar</button>
                <button type="submit" className="flex-[2] px-6 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-red-700 shadow-xl shadow-red-100 flex items-center justify-center gap-2 transition-all">
                  <Save className="w-5 h-5" /> Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagementModule;

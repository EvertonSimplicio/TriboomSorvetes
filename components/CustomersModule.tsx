
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  CheckCircle, 
  XCircle,
  Mail,
  Phone,
  MapPin,
  Building2,
  Download
} from 'lucide-react';
import { Customer } from '../types';

const INITIAL_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Tecnologia Avançada Ltda', type: 'Fornecedor', document: '12.345.678/0001-90', email: 'vendas@tecavancada.com', phone: '(11) 99999-0000', city: 'São Paulo', state: 'SP', active: true },
  { id: '2', name: 'João Silva Oliveira', type: 'Cliente', document: '123.456.789-00', email: 'joao.silva@email.com', phone: '(21) 98888-1111', city: 'Rio de Janeiro', state: 'RJ', active: true },
  { id: '3', name: 'Distribuidora Norte-Sul', type: 'Fornecedor', document: '98.765.432/0001-21', email: 'contato@nortesul.com', phone: '(41) 3333-4444', city: 'Curitiba', state: 'PR', active: false },
  { id: '4', name: 'Maria Ferreira Santos', type: 'Cliente', document: '456.123.789-11', email: 'maria.santos@email.com', phone: '(31) 97777-2222', city: 'Belo Horizonte', state: 'MG', active: true },
];

const CustomersModule: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'Todos' | 'Cliente' | 'Fornecedor'>('Todos');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           c.document.includes(searchTerm) || 
                           c.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'Todos' ? true : (c.type === filterType || c.type === 'Ambos');
      return matchesSearch && matchesType;
    });
  }, [customers, searchTerm, filterType]);

  const stats = useMemo(() => ({
    total: customers.length,
    clients: customers.filter(c => c.type === 'Cliente' || c.type === 'Ambos').length,
    suppliers: customers.filter(c => c.type === 'Fornecedor' || c.type === 'Ambos').length,
    active: customers.filter(c => c.active).length
  }), [customers]);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = formData.get('id') as string;
    
    const customerData: Customer = {
      id: id || Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      type: formData.get('type') as any,
      document: formData.get('document') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      active: true,
    };

    if (id) {
      setCustomers(prev => prev.map(c => c.id === id ? { ...customerData, active: c.active } : c));
    } else {
      setCustomers(prev => [customerData, ...prev]);
    }
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleDelete = (id: string) => {
    setActiveDropdownId(null);
    setTimeout(() => {
      if (confirm('Deseja excluir este registro permanentemente?')) {
        setCustomers(prev => prev.filter(c => c.id !== id));
      }
    }, 10);
  };

  const toggleStatus = (id: string) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
    setActiveDropdownId(null);
  };

  const exportCSV = () => {
    const headers = ['Nome', 'Tipo', 'Documento', 'E-mail', 'Telefone', 'Cidade', 'Estado', 'Status'];
    const rows = filteredCustomers.map(c => [
      c.name, c.type, c.document, c.email, c.phone, c.city, c.state, c.active ? 'Ativo' : 'Inativo'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "parceiros_comerciais.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            Parceiros Comerciais
          </h2>
          <p className="text-slate-500">Gestão centralizada de clientes e fornecedores.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setSelectedCustomer(null); setIsModalOpen(true); }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Novo Parceiro
          </button>
          <button onClick={exportCSV} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" /> Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Cadastrado</p>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase">Clientes</p>
          <p className="text-2xl font-bold text-blue-600">{stats.clients}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase">Fornecedores</p>
          <p className="text-2xl font-bold text-purple-600">{stats.suppliers}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase">Ativos</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome, documento ou e-mail..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-500">Filtrar:</span>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {['Todos', 'Cliente', 'Fornecedor'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type as any)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${filterType === type ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome / Documento</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contato</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Localização</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-700">{c.name}</span>
                      <span className="text-xs text-slate-400 font-mono">{c.document}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      c.type === 'Cliente' ? 'bg-blue-50 text-blue-600' : 
                      c.type === 'Fornecedor' ? 'bg-purple-50 text-purple-600' : 
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {c.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {c.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {c.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {c.city} - {c.state}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {c.active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">
                        <CheckCircle className="w-3 h-3" /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">
                        <XCircle className="w-3 h-3" /> Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setSelectedCustomer(c); setIsModalOpen(true); }}
                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownId(activeDropdownId === c.id ? null : c.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {activeDropdownId === c.id && (
                          <div 
                            ref={dropdownRef}
                            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button 
                              onClick={() => toggleStatus(c.id)}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              {c.active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                              {c.active ? 'Inativar' : 'Ativar'}
                            </button>
                            <div className="h-px bg-slate-100 my-1"></div>
                            <button 
                              onClick={() => handleDelete(c.id)}
                              className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                            >
                              <Trash2 className="w-4 h-4" /> Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-0 overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                {selectedCustomer ? 'Editar Parceiro' : 'Novo Parceiro Comercial'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <input type="hidden" name="id" defaultValue={selectedCustomer?.id} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nome / Razão Social</label>
                  <input name="name" required defaultValue={selectedCustomer?.name} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo de Vínculo</label>
                  <select name="type" defaultValue={selectedCustomer?.type || 'Cliente'} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white">
                    <option value="Cliente">Cliente</option>
                    <option value="Fornecedor">Fornecedor</option>
                    <option value="Ambos">Ambos</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">CPF / CNPJ</label>
                  <input name="document" required defaultValue={selectedCustomer?.document} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">E-mail</label>
                  <input name="email" type="email" required defaultValue={selectedCustomer?.email} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Telefone</label>
                  <input name="phone" required defaultValue={selectedCustomer?.phone} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Cidade</label>
                  <input name="city" required defaultValue={selectedCustomer?.city} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Estado (UF)</label>
                  <input name="state" maxLength={2} required defaultValue={selectedCustomer?.state} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none uppercase" />
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-200 flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" /> Salvar Parceiro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersModule;

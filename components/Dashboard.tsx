
import React, { useState, useMemo, useEffect } from 'react';
import { User, NavItem, Employee, Product, FinanceEntry } from '../types';
import { 
  Package, 
  Users, 
  FileText, 
  DollarSign, 
  Calculator,
  UserCog,
  Contact,
  AlertOctagon,
  CalendarCheck,
  TrendingUp,
  Settings2,
  FileBarChart,
  Clock,
  Home,
  ChevronRight,
  Menu,
  LogOut,
  Bell,
  Search,
  Truck
} from 'lucide-react';
import ProductsModule from './ProductsModule';
import CustomersModule from './CustomersModule';
import InvoicesModule from './InvoicesModule';
import FinanceModule from './FinanceModule';
import CashierModule from './CashierModule';
import UsersManagementModule from './UsersManagementModule';
import EmployeesModule from './EmployeesModule';
import ProfileModal from './ProfileModal';
import ReportsModule from './ReportsModule';
import AppointmentsModule from './AppointmentsModule';

const MOCK_EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'Ricardo Silva', role: 'Mestre', department: 'Produção', status: 'Ativo', hireDate: '2022-01-15' },
  { id: 'e2', name: 'Juliana Costa', role: 'Operadora', department: 'Embalagem', status: 'Ativo', hireDate: '2022-06-10' },
  { id: 'e3', name: 'Marcos Santos', role: 'Auxiliar', department: 'Produção', status: 'Inativo', hireDate: '2023-03-22' },
];

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Picolé Morango', groupId: 'g1', groupName: 'Frutas', price: 2.5, stock: 15, minStock: 5, active: true, createdAt: '2023-10-01' },
  { id: '2', name: 'Pote Chocolate 2L', groupId: 'g2', groupName: 'Massa', price: 25, stock: 3, minStock: 10, active: true, createdAt: '2023-10-05' },
  { id: '3', name: 'Cobertura Caramelo', groupId: 'g3', groupName: 'Insumos', price: 15, stock: 2, minStock: 5, active: true, createdAt: '2023-11-12' },
];

const MOCK_FINANCE: FinanceEntry[] = [
  { id: 'f1', description: 'Energia Elétrica', type: 'Despesa', category: 'Fixo', value: 1200, dueDate: new Date().toISOString().split('T')[0], status: 'Pendente', entityName: 'Enel' },
  { id: 'f2', description: 'Fornecedor de Leite', type: 'Despesa', category: 'Insumos', value: 850, dueDate: new Date().toISOString().split('T')[0], status: 'Pendente', entityName: 'Laticínios Sul' },
  { id: 'f3', description: 'Venda Balcão', type: 'Receita', category: 'Vendas', value: 500, dueDate: new Date().toISOString().split('T')[0], status: 'Pago', entityName: 'Diversos' },
];

interface DashboardProps {
  user: User | null;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onUpdateUser }) => {
  const userRole = user?.role || 'Operador';
  
  // Define a visualização inicial baseada no cargo
  const getInitialView = () => {
    if (userRole === 'Gerente') return 'reports';
    if (userRole === 'Operador') return 'appointments';
    return 'home';
  };

  const [activeView, setActiveView] = useState(getInitialView());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [stockThreshold, setStockThreshold] = useState(5);

  const allMenuItems: NavItem[] = [
    { id: 'products', label: 'Meus Produtos', icon: <Package className="w-5 h-5" />, color: 'bg-red-600', description: 'Gestão de estoque' },
    { id: 'customers', label: 'Cliente/Fornecedor', icon: <Users className="w-5 h-5" />, color: 'bg-amber-500', description: 'Cadastro de parceiros' },
    { id: 'invoices', label: 'Notas Fiscais', icon: <FileText className="w-5 h-5" />, color: 'bg-emerald-600', description: 'Entrada de NF-e' },
    { id: 'finance', label: 'Financeiro', icon: <DollarSign className="w-5 h-5" />, color: 'bg-amber-600', description: 'Contas a pagar/receber' },
    { id: 'cashier', label: 'Caixa', icon: <Calculator className="w-5 h-5" />, color: 'bg-red-700', description: 'Lançamentos diários' },
    { id: 'reports', label: 'Relatórios', icon: <FileBarChart className="w-5 h-5" />, color: 'bg-slate-700', description: 'Inteligência de dados' },
    { id: 'appointments', label: 'Apontamento', icon: <Clock className="w-5 h-5" />, color: 'bg-red-500', description: 'Controle de ponto' },
    { id: 'delivery', label: 'Entrega', icon: <Truck className="w-5 h-5" />, color: 'bg-red-600', description: 'Logística' },
    { id: 'users', label: 'Usuários', icon: <UserCog className="w-5 h-5" />, color: 'bg-slate-800', description: 'Gestão de acessos' },
    { id: 'employees', label: 'Funcionários', icon: <Contact className="w-5 h-5" />, color: 'bg-red-500', description: 'RH operacional' },
  ];

  // Filtragem de itens do menu baseada em permissão
  const visibleMenuItems = useMemo(() => {
    if (userRole === 'Admin') return allMenuItems;
    if (userRole === 'Gerente') return allMenuItems.filter(item => item.id === 'reports');
    if (userRole === 'Operador') return allMenuItems.filter(item => item.id === 'appointments');
    return [];
  }, [userRole]);

  const overviewData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      totalEmployees: MOCK_EMPLOYEES.filter(e => e.status === 'Ativo').length,
      lowStockCount: MOCK_PRODUCTS.filter(p => p.stock < stockThreshold).length,
      billsToday: MOCK_FINANCE
        .filter(f => f.type === 'Despesa' && f.dueDate === today && f.status !== 'Pago')
        .reduce((acc, curr) => acc + curr.value, 0)
    };
  }, [stockThreshold]);

  const handleNavigate = (id: string) => {
    setIsMobileMenuOpen(false);
    setActiveView(id as any);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'products': return <ProductsModule />;
      case 'customers': return <CustomersModule />;
      case 'invoices': return <InvoicesModule />;
      case 'finance': return <FinanceModule />;
      case 'cashier': return <CashierModule />;
      case 'users': return <UsersManagementModule />;
      case 'employees': return <EmployeesModule />;
      case 'reports': return <ReportsModule />;
      case 'appointments': return <AppointmentsModule user={user} />;
      case 'home':
        if (userRole !== 'Admin') return <div className="p-10 text-center font-black text-slate-300">ACESSO NÃO AUTORIZADO À VISÃO GERAL</div>;
        return (
          <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black text-slate-800 tracking-tighter">
                  Triboom <span className="text-red-600">Command</span>
                </h1>
                <p className="text-slate-500 font-medium mt-1">Olá, <span className="text-red-600 font-bold">{user?.name}</span>. Resumo administrativo.</p>
              </div>
              <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100">
                <CalendarCheck className="w-5 h-5 text-amber-600" />
                <span className="text-xs font-black text-amber-700 uppercase tracking-widest">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Equipe Ativa</p>
                <div className="flex items-end gap-3">
                  <span className="text-6xl font-black text-slate-800 tracking-tighter">{overviewData.totalEmployees}</span>
                  <span className="text-slate-400 font-bold mb-2">Colaboradores</span>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[40px] border border-red-100 shadow-sm relative overflow-hidden">
                <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-4">Estoque Crítico</p>
                <div className="flex items-end gap-3">
                  <span className={`text-6xl font-black tracking-tighter ${overviewData.lowStockCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                    {overviewData.lowStockCount}
                  </span>
                  <span className="text-slate-400 font-bold mb-2">Itens em Alerta</span>
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl text-white">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Contas de Hoje</p>
                <span className="text-4xl font-black text-amber-400 tracking-tighter">
                  R$ {overviewData.billsToday.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar - Agora filtrada por cargo */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} 
        md:translate-x-0 md:w-20 md:hover:w-64 group
      `}>
        <div className="p-6 flex items-center gap-3 overflow-hidden h-20">
          <div className="bg-red-600 p-2.5 rounded-2xl text-white shadow-lg shadow-red-200 ring-4 ring-white shrink-0">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
          </div>
          <span className="text-2xl font-black text-slate-800 tracking-tighter whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity md:hidden md:group-hover:block">
            Triboom <span className="text-red-600">ERP</span>
          </span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {userRole === 'Admin' && (
            <>
              <button 
                onClick={() => { setActiveView('home'); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-4 w-full p-3.5 rounded-2xl transition-all ${activeView === 'home' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-red-600'}`}
              >
                <Home className="w-5 h-5 shrink-0" />
                <span className="text-xs font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity md:hidden md:group-hover:block uppercase tracking-widest">Início</span>
              </button>
              <div className="h-px bg-slate-100 my-4 mx-2"></div>
            </>
          )}
          
          {visibleMenuItems.map(item => (
            <button key={item.id} onClick={() => handleNavigate(item.id)}
              className={`flex items-center gap-4 w-full p-3.5 rounded-2xl transition-all ${activeView === item.id ? 'bg-red-50 text-red-600 font-black shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-red-600'}`}
            >
              <div className="shrink-0">{item.icon}</div>
              <span className="text-xs font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity md:hidden md:group-hover:block uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 mb-4 overflow-hidden">
          <button onClick={onLogout} className="flex items-center gap-4 w-full p-3.5 text-rose-500 hover:bg-rose-50 rounded-2xl transition-colors font-black">
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="text-xs font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity md:hidden md:group-hover:block uppercase tracking-widest">Sair</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 md:ml-20">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
             <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg" onClick={() => setIsMobileMenuOpen(true)}>
               <Menu className="w-6 h-6" />
             </button>
             <div className="flex items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-400 hover:text-red-600 cursor-pointer" onClick={() => setActiveView(getInitialView())}>Triboom</span>
                <ChevronRight className="w-3 h-3 mx-2 text-slate-300" />
                <span className="text-red-600">{allMenuItems.find(m => m.id === activeView)?.label || 'Painel'}</span>
             </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 ml-2 border-l pl-4 border-slate-200 cursor-pointer group" onClick={() => setIsProfileModalOpen(true)}>
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black text-slate-800 uppercase">{user?.name}</p>
                <p className="text-[9px] text-red-600 font-bold uppercase mt-0.5">{userRole}</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-red-400 flex items-center justify-center text-white font-black shadow-lg ring-2 ring-white">
                {user?.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8 max-w-[1440px] mx-auto w-full flex-1 overflow-x-hidden">
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 h-full">
            {renderContent()}
          </div>
        </main>
      </div>

      {isProfileModalOpen && user && (
        <ProfileModal user={user} onClose={() => setIsProfileModalOpen(false)} onUpdate={onUpdateUser} />
      )}
    </div>
  );
};

export default Dashboard;

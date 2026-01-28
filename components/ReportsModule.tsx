
import React, { useState } from 'react';
import { 
  FileBarChart, 
  Download, 
  Calendar,
  Search,
  Filter,
  Package,
  DollarSign,
  Users,
  FileText,
  ChevronRight,
  Printer,
  Table as TableIcon,
  LayoutGrid,
  Clock,
  UserCheck,
  AlertCircle
} from 'lucide-react';

type ReportType = 'inventory' | 'finance' | 'sales' | 'staff' | 'invoices' | 'appointments';

const ReportsModule: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('inventory');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtros dinâmicos adicionais
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const reportTypes = [
    { id: 'inventory', label: 'Estoque e Insumos', icon: <Package className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-50' },
    { id: 'finance', label: 'Fluxo Financeiro', icon: <DollarSign className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'sales', label: 'Desempenho de Vendas', icon: <FileBarChart className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'staff', label: 'Produtividade e RH', icon: <Users className="w-5 h-5" />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'appointments', label: 'Jornada e Frequência', icon: <Clock className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-50' },
    { id: 'invoices', label: 'Notas Fiscais', icon: <FileText className="w-5 h-5" />, color: 'text-slate-600', bg: 'bg-slate-50' },
  ] as const;

  // Função para Impressão
  const handlePrint = () => {
    window.print();
  };

  // Função para Exportação (Geração de CSV mockado baseado no tipo)
  const handleExport = () => {
    let headers: string[] = [];
    let rows: any[][] = [];
    const filename = `relatorio_${selectedReport}_${startDate}_a_${endDate}.csv`;

    switch (selectedReport) {
      case 'inventory':
        headers = ['ID', 'Produto', 'Categoria', 'Estoque', 'Preço', 'Valor Total'];
        rows = [['101', 'Picolé Morango', 'Sorvetes', '150', '2.50', '375.00'], ['102', 'Pote Chocolate 2L', 'Massa', '45', '22.00', '990.00']];
        break;
      case 'finance':
        headers = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor', 'Status'];
        rows = [['2023-11-01', 'Venda Balcão', 'Receita', 'Vendas', '1250.00', 'Pago']];
        break;
      case 'appointments':
        headers = ['Data', 'Funcionário', 'Entrada', 'Saída', 'Almoço', 'Status', 'Horas Extra'];
        rows = [
          ['2023-11-20', 'Ricardo Silva', '08:00', '17:00', '01:00', 'Trabalhado', '00:00'],
          ['2023-11-20', 'Juliana Costa', '-', '-', '-', 'Folga', '00:00'],
          ['2023-11-21', 'Ricardo Silva', '08:15', '17:00', '01:00', 'Atraso', '00:00']
        ];
        break;
      case 'staff':
        headers = ['ID', 'Nome', 'Cargo', 'Setor', 'Admissão', 'Status'];
        rows = [['E01', 'Ricardo Silva', 'Mestre', 'Produção', '2022-01-15', 'Ativo']];
        break;
      case 'invoices':
        headers = ['Número', 'Série', 'Fornecedor', 'Emissão', 'Valor Total', 'Status'];
        rows = [['000123', '1', 'Laticínios Sul', '2023-11-10', '4500.00', 'Lançada']];
        break;
    }

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderFilters = () => {
    switch (selectedReport) {
      case 'inventory':
        return (
          <>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-red-500/20">
                <option value="all">Todas as Categorias</option>
                <option value="sorvetes">Sorvetes</option>
                <option value="insumos">Insumos</option>
              </select>
            </div>
          </>
        );
      case 'appointments':
        return (
          <>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status de Frequência</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-red-500/20">
                <option value="all">Todos os Status</option>
                <option value="worked">Trabalhado</option>
                <option value="off">Folga / Descanso</option>
                <option value="late">Atraso</option>
                <option value="absent">Falta</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Funcionário</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-red-500/20">
                <option value="all">Todos os Colaboradores</option>
                <option value="e1">Ricardo Silva</option>
                <option value="e2">Juliana Costa</option>
                <option value="e3">Carlos Operador</option>
              </select>
            </div>
          </>
        );
      default:
        return (
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-red-500/20">
              <option value="all">Todos os Status</option>
              <option value="active">Ativo / Concluído</option>
              <option value="pending">Pendente</option>
            </select>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tighter">
            <FileBarChart className="w-8 h-8 text-red-600" />
            Central de Inteligência
          </h2>
          <p className="text-slate-500 font-medium">Configure e gere relatórios detalhados da <span className="text-red-600 font-black">Triboom</span>.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="bg-white border border-slate-200 p-3 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm text-slate-600 active:scale-95">
            <Printer className="w-5 h-5" />
          </button>
          <button onClick={handleExport} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-red-100 active:scale-95">
            <Download className="w-5 h-5" /> Exportar Dados (CSV)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
        <div className="lg:col-span-4 space-y-6 print:hidden">
          <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-red-600 uppercase tracking-[0.2em]">
                <LayoutGrid className="w-3 h-3" /> Tipo de Relatório
              </div>
              <div className="space-y-2">
                {reportTypes.map((type) => (
                  <button key={type.id} onClick={() => setSelectedReport(type.id)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${selectedReport === type.id ? `${type.bg} border-red-200 shadow-sm translate-x-1` : 'bg-white border-transparent hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${selectedReport === type.id ? 'bg-white text-red-600 shadow-sm' : 'bg-slate-100 text-slate-400'}`}>
                        {type.icon}
                      </div>
                      <span className={`text-sm font-black tracking-tight ${selectedReport === type.id ? 'text-slate-800' : 'text-slate-500'}`}>
                        {type.label}
                      </span>
                    </div>
                    {selectedReport === type.id && <ChevronRight className="w-4 h-4 text-red-600" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100"></div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[10px] font-black text-red-600 uppercase tracking-[0.2em]">
                <Calendar className="w-3 h-3" /> Período de Análise
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Início</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-red-500/20" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fim</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-red-500/20" />
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100"></div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[10px] font-black text-red-600 uppercase tracking-[0.2em]">
                <Filter className="w-3 h-3" /> Filtros Dinâmicos
              </div>
              <div className="space-y-4">{renderFilters()}</div>
            </div>

            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-2 active:scale-95">
              <Search className="w-4 h-4" /> Atualizar Visualização
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6 print:block">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
            {selectedReport === 'appointments' ? (
              <>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Horas Totais</p>
                  <p className="text-2xl font-black text-slate-800">1.240h</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pontualidade</p>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-black text-emerald-600">94.5%</span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ocorrências</p>
                  <div className="flex items-center gap-2 text-rose-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-black">12</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registros no Período</p>
                  <p className="text-2xl font-black text-slate-800">142</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status da Amostra</p>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-sm font-black text-emerald-600 uppercase tracking-tight">Consistente</span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Última Atualização</p>
                  <p className="text-sm font-black text-slate-800">Agora mesmo</p>
                </div>
              </>
            )}
          </div>

          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm min-h-[600px] flex flex-col overflow-hidden print:border-none print:shadow-none">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between print:border-b-2">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${reportTypes.find(t => t.id === selectedReport)?.bg} print:bg-slate-100`}>
                  {reportTypes.find(t => t.id === selectedReport)?.icon}
                </div>
                <div className="flex flex-col">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">
                    Relatório de {reportTypes.find(t => t.id === selectedReport)?.label}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase print:block hidden">
                        Triboom Sorvetes - Período: {new Date(startDate).toLocaleDateString()} a {new Date(endDate).toLocaleDateString()}
                    </p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-8 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  {selectedReport === 'appointments' ? (
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Funcionário</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Data</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Entrada</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Saída</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Descrição</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Categoria</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Valor Líquido</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedReport === 'appointments' ? (
                    <>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 text-sm font-bold text-slate-700">Ricardo Silva</td>
                        <td className="px-6 py-4 text-sm text-slate-500">20/11/2023</td>
                        <td className="px-6 py-4 text-sm text-center font-black">08:00</td>
                        <td className="px-6 py-4 text-sm text-center font-black">17:00</td>
                        <td className="px-6 py-4 text-center"><span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase">Trabalhado</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 text-sm font-bold text-slate-700">Juliana Costa</td>
                        <td className="px-6 py-4 text-sm text-slate-500">20/11/2023</td>
                        <td className="px-6 py-4 text-sm text-center font-black">-</td>
                        <td className="px-6 py-4 text-sm text-center font-black">-</td>
                        <td className="px-6 py-4 text-center"><span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase">Folga</span></td>
                      </tr>
                    </>
                  ) : (
                    [1,2,3,4,5,6].map((i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 text-sm font-bold text-slate-700">Item Relatório #{i}</td>
                        <td className="px-6 py-4 text-sm text-slate-500 uppercase font-black tracking-tighter">Categoria Exemplo</td>
                        <td className="px-6 py-4 text-sm text-right font-black text-slate-800">R$ 2.450,00</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              
              <div className="mt-10 p-6 bg-slate-900 rounded-3xl text-white flex justify-between items-center shadow-xl">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Total do Período</span>
                <span className="text-2xl font-black tracking-tighter">
                  {selectedReport === 'appointments' ? '14 Dias Úteis' : 'R$ 15.420,00'}
                </span>
              </div>
            </div>

            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between print:hidden">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Página 1 de 1</span>
              <div className="flex gap-2">
                 <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-400 cursor-not-allowed">Anterior</button>
                 <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-400 cursor-not-allowed">Próxima</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsModule;

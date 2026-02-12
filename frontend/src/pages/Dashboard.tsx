import { useEffect, useState } from 'react';
import api from '../lib/axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        revenue: 0,
        activeProductions: 0,
        lowStockCount: 0,
        systemUptime: 0,
        salesTrend: [] as { date: string, total: number }[]
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/stats');
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            }
        };

        fetchStats();
    }, []);

    const [showProductionModal, setShowProductionModal] = useState(false);
    const [newProduction, setNewProduction] = useState({ date_production: '', quantite_produite: 0, id_gadget: 0 });
    const [gadgets, setGadgets] = useState<{ id_gadget: number, nom_gadget: string }[]>([]);

    useEffect(() => {
        const fetchGadgets = async () => {
            try {
                const response = await api.get('/stocks'); // Reusing stocks endpoint to get gadgets
                setGadgets(response.data.map((s: any) => ({ id_gadget: s.id_gadget, nom_gadget: s.nom_gadget })));
            } catch (e) { console.error(e); }
        };
        if (showProductionModal) fetchGadgets();
    }, [showProductionModal]);

    const handleCreateProduction = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/productions', newProduction);
            setShowProductionModal(false);
            alert('Production créée avec succès !');
            // Refresh stats if needed, or just close
        } catch (error) {
            console.error('Error creating production:', error);
            alert('Erreur lors de la création de la production');
        }
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.03)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        },
        elements: {
            line: {
                tension: 0.4
            }
        }
    };

    // Format dates for labels (e.g., "Feb 10")
    const labels = stats.salesTrend?.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }) || [];

    const data = {
        labels,
        datasets: [
            {
                fill: true,
                label: 'Ventes',
                data: stats.salesTrend?.map(item => item.total) || [],
                borderColor: '#3b19e6',
                backgroundColor: 'rgba(59, 25, 230, 0.15)',
            },
        ],
    };


    return (
        <>
            <div className="flex flex-col md:flex-row md:items-end justify-between">
                <div>
                    <h2 className="text-4xl font-display font-bold text-slate-900 tracking-tight mb-2">Centre de Contrôle</h2>
                    <p className="text-slate-500 text-base">Surveillance de votre écosystème global.</p>
                </div>
                <div className="mt-6 md:mt-0 flex space-x-3">
                    <button className="bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold px-5 py-2.5 rounded-xl border border-gray-200 transition-all flex items-center shadow-sm">
                        <span className="material-icons text-base mr-2">file_download</span> Exporter
                    </button>
                    <button onClick={() => setShowProductionModal(true)} className="bg-primary hover:bg-primary-light text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center">
                        <span className="material-icons text-base mr-2">add</span> Nouvelle Production
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="elevated-card rounded-2xl p-6 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <span className="material-icons">attach_money</span>
                        </div>
                        <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                            <span className="material-icons text-[14px] mr-1">trending_up</span> +12%
                        </span>
                    </div>
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Revenu Total</h3>
                    <p className="text-3xl font-bold text-slate-900 neon-text-glow">${Number(stats.revenue).toLocaleString()}</p>
                </div>

                <div className="elevated-card rounded-2xl p-6 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-fuchsia-100 rounded-xl text-fuchsia-600">
                            <span className="material-icons">precision_manufacturing</span>
                        </div>
                        <span className="flex items-center text-xs font-bold text-fuchsia-600 bg-fuchsia-50 px-2.5 py-1 rounded-lg border border-fuchsia-100">
                            Actif
                        </span>
                    </div>
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Productions en cours</h3>
                    <p className="text-3xl font-bold text-slate-900">{stats.activeProductions} <span className="text-sm text-slate-400 font-medium tracking-normal">Unités</span></p>
                </div>

                {/* LOW STOCK ALERT CARD */}
                <div className={`elevated-card rounded-2xl p-6 relative overflow-hidden transition-all duration-500 ${stats.lowStockCount > 0 ? 'ring-2 ring-red-500 shadow-red-200' : ''}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${stats.lowStockCount > 0 ? 'bg-red-100 text-red-600' : 'bg-cyan-100 text-cyan-600'}`}>
                            <span className="material-icons">{stats.lowStockCount > 0 ? 'warning' : 'inventory_2'}</span>
                        </div>
                        {stats.lowStockCount > 0 && (
                            <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg animate-pulse">
                                <span className="material-icons text-[14px] mr-1">priority_high</span> CRITIQUE
                            </span>
                        )}
                    </div>
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Articles en stock faible</h3>
                    <p className={`text-3xl font-bold ${stats.lowStockCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>{stats.lowStockCount}</p>
                </div>

                <div className="elevated-card rounded-2xl p-6 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-teal-100 rounded-xl text-teal-600">
                            <span className="material-icons">dns</span>
                        </div>
                        <span className="flex items-center text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">
                            Stable
                        </span>
                    </div>
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Temps de disponibilité</h3>
                    <p className="text-3xl font-bold text-slate-900">{stats.systemUptime}%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="elevated-card rounded-2xl p-8 lg:col-span-2 flex flex-col h-[450px]">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Tendances des ventes</h3>
                            <p className="text-sm text-slate-400 mt-1 font-medium">Aperçu analytique des revenus</p>
                        </div>
                        <select className="bg-slate-50 border border-gray-100 text-slate-600 text-xs font-semibold rounded-xl px-4 py-2 focus:ring-primary focus:border-primary outline-none transition-all">
                            <option>12 derniers mois</option>
                            <option>6 derniers mois</option>
                            <option>30 derniers jours</option>
                        </select>
                    </div>
                    <div className="flex-1 w-full relative">
                        <Line options={options} data={data} />
                    </div>
                </div>

                <div className="elevated-card rounded-2xl p-8 flex flex-col relative overflow-hidden">
                    <h3 className="text-xl font-bold text-slate-900 mb-8">Répartition des stocks</h3>
                    <div className="flex-1 flex items-center justify-center relative">
                        <div className="absolute w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
                        <div className="w-52 h-52 rounded-full relative flex items-center justify-center" style={{ background: 'conic-gradient(#3b19e6 0% 45%, #00f0ff 45% 70%, #c026d3 70% 85%, #e2e8f0 85% 100%)' }}>
                            <div className="w-40 h-40 bg-white rounded-full shadow-inner flex flex-col items-center justify-center z-10">
                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Articles globaux</span>
                                <span className="text-3xl font-black text-slate-900 mt-1">14,230</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center font-bold text-slate-700">
                                <span className="w-3 h-3 rounded-full bg-primary mr-3 shadow-sm shadow-primary/40"></span> Processeurs
                            </div>
                            <span className="font-mono text-slate-400 font-bold">45%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center font-bold text-slate-700">
                                <span className="w-3 h-3 rounded-full bg-cyan-400 mr-3 shadow-sm shadow-cyan-400/40"></span> Écrans
                            </div>
                            <span className="font-mono text-slate-400 font-bold">25%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center font-bold text-slate-700">
                                <span className="w-3 h-3 rounded-full bg-fuchsia-600 mr-3 shadow-sm shadow-fuchsia-600/40"></span> Batteries
                            </div>
                            <span className="font-mono text-slate-400 font-bold">15%</span>
                        </div>
                    </div>
                </div>
            </div>
            {showProductionModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Nouvelle Production</h3>
                        <form onSubmit={handleCreateProduction} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                                <input type="date" required className="w-full border border-gray-200 rounded-xl px-4 py-2"
                                    value={newProduction.date_production} onChange={e => setNewProduction({ ...newProduction, date_production: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Gadget</label>
                                <select required className="w-full border border-gray-200 rounded-xl px-4 py-2"
                                    value={newProduction.id_gadget} onChange={e => setNewProduction({ ...newProduction, id_gadget: Number(e.target.value) })}>
                                    <option value="">Sélectionner un gadget</option>
                                    {gadgets.map(g => <option key={g.id_gadget} value={g.id_gadget}>{g.nom_gadget}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Quantité</label>
                                <input type="number" required min="1" className="w-full border border-gray-200 rounded-xl px-4 py-2"
                                    value={newProduction.quantite_produite} onChange={e => setNewProduction({ ...newProduction, quantite_produite: Number(e.target.value) })} />
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button type="button" onClick={() => setShowProductionModal(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 rounded-xl">Annuler</button>
                                <button type="submit" className="flex-1 bg-primary text-white font-bold py-2 rounded-xl">Créer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Dashboard;

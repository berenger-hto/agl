import { useEffect, useState } from 'react';
import api from '../lib/axios';

interface StockItem {
    id_stock: number;
    quantite_disponible: number;
    nom_gadget: string;
    type_gadget: string;
    prix_vente_gadget: number;
}

const StockPage = () => {
    const [stocks, setStocks] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        try {
            const response = await api.get('/stocks');
            setStocks(response.data);
        } catch (error) {
            console.error('Error fetching stocks:', error);
        } finally {
            setLoading(false);
        }
    };

    // Group stocks by type for the chart
    const distribution = stocks.reduce((acc, stock) => {
        const existing = acc.find(d => d.type === stock.type_gadget);
        if (existing) {
            existing.count += stock.quantite_disponible;
        } else {
            acc.push({ type: stock.type_gadget, count: stock.quantite_disponible });
        }
        return acc;
    }, [] as { type: string, count: number }[]);

    // Sort by count desc
    distribution.sort((a, b) => b.count - a.count);

    // Chart Colors
    const COLORS = ['#3b19e6', '#00f0ff', '#c026d3', '#e2e8f0', '#f59e0b', '#10b981'];

    const calculatePercentage = (count: number) => {
        const total = distribution.reduce((acc, item) => acc + item.count, 0) || 0;
        return total === 0 ? 0 : Math.round((count / total) * 100);
    };

    let cumulativePercent = 0;
    const gradientParts = distribution.map((item, index) => {
        const percent = calculatePercentage(item.count);
        const start = cumulativePercent;
        const end = cumulativePercent + percent;
        cumulativePercent = end;
        return `${COLORS[index % COLORS.length]} ${start}% ${end}%`;
    });

    if (cumulativePercent < 100 && gradientParts.length > 0) {
        gradientParts.push(`${COLORS[COLORS.length - 1]} ${cumulativePercent}% 100%`);
    } else if (gradientParts.length === 0) {
        gradientParts.push('#e2e8f0 0% 100%');
    }

    const conicGradient = `conic-gradient(${gradientParts.join(', ')})`;
    const totalItems = stocks.reduce((acc, curr) => acc + curr.quantite_disponible, 0);

    return (
        <div className="space-y-8 flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-display font-bold text-slate-900 tracking-tight mb-2">Gestion des Stocks</h2>
                    <p className="text-slate-500 text-base">Suivi et valorisation des stocks en temps réel.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Table Section - Takes 2/3 width */}
                <div className="elevated-card rounded-2xl p-0 lg:col-span-2 overflow-hidden flex flex-col h-[600px]">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Détails du stock</h3>
                            <p className="text-sm text-slate-400 mt-1 font-medium">Liste complète des articles.</p>
                        </div>
                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-lg">
                            {stocks.length} Références
                        </span>
                    </div>
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4">Nom du Gadget</th>
                                    <th className="px-6 py-4">Catégorie</th>
                                    <th className="px-6 py-4">Prix</th>
                                    <th className="px-6 py-4">Disponible</th>
                                    <th className="px-6 py-4">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Chargement...</td></tr>
                                ) : stocks.map((stock) => (
                                    <tr key={stock.id_stock} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800">{stock.nom_gadget}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-medium">
                                                {stock.type_gadget}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm text-slate-600 font-bold">{stock.prix_vente_gadget.toLocaleString()} FCFA</td>
                                        <td className="px-6 py-4 font-bold text-slate-900 text-lg">{stock.quantite_disponible}</td>
                                        <td className="px-6 py-4">
                                            {stock.quantite_disponible < 10 ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-600 border border-red-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                                                    Critique
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                                                    En Stock
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Chart Section - Takes 1/3 width */}
                <div className="elevated-card rounded-2xl p-8 flex flex-col relative overflow-hidden h-[600px]">
                    <h3 className="text-xl font-bold text-slate-900 mb-8">Répartition</h3>
                    <div className="flex-1 flex items-center justify-center relative min-h-[300px]">
                        <div className="absolute w-60 h-60 bg-primary/5 rounded-full blur-3xl"></div>
                        <div className="w-72 h-72 rounded-full relative flex items-center justify-center shadow-xl shadow-slate-200/50" style={{ background: conicGradient }}>
                            <div className="w-52 h-52 bg-white rounded-full shadow-inner flex flex-col items-center justify-center z-10 p-4 text-center">
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">Total<br />Articles</span>
                                <span className="text-4xl font-black text-slate-900 mt-1">{totalItems.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[150px]">
                        {distribution.map((item, index) => (
                            <div key={item.type} className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <div className="flex items-center font-bold text-slate-700">
                                    <span className="w-3 h-3 rounded-full mr-3 shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                    {item.type}
                                </div>
                                <span className="font-mono text-slate-500 font-bold bg-slate-100 px-2 py-1 rounded-md text-xs">{calculatePercentage(item.count)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockPage;


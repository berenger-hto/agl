import { useEffect, useState } from 'react';
import api from '../lib/axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

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

    const chartData = {
        labels: stocks.map(s => s.nom_gadget),
        datasets: [
            {
                data: stocks.map(s => s.quantite_disponible),
                backgroundColor: [
                    '#3b19e6',
                    '#00f0ff',
                    '#c026d3',
                    '#f59e0b',
                    '#10b981',
                    '#6366f1',
                ],
                borderWidth: 0,
            },
        ],
    };

    const chartOptions = {
        cutout: '75%',
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20,
                }
            }
        }
    };

    return (
        <div className="space-y-8 flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-display font-bold text-slate-900">Gestion des Stocks</h2>
                    <p className="text-slate-500">Suivi et valorisation des stocks en temps réel.</p>
                </div>
            </div>

            <div className="flex flex-row gap-8 w-full">
                <div className="elevated-card rounded-2xl p-8 lg:col-span-1 flex flex-col justify-center items-center">
                    <div className="relative w-full aspect-square max-w-[300px]">
                        {loading ? (
                            <div className="flex items-center justify-center h-full text-slate-400">Chargement du graphique...</div>
                        ) : (
                            <div className="relative w-full h-full flex flex-col items-center justify-center gap-4">
                                <div className="text-center relative top-20">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total des articles</p>
                                    <p className="text-3xl font-black text-slate-900">{stocks.reduce((acc, curr) => acc + curr.quantite_disponible, 0)}</p>
                                </div>
                                <Doughnut data={chartData} options={chartOptions} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="elevated-card rounded-2xl p-0 lg:col-span-2 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Détails du stock</h3>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">Nom du Gadget</th>
                                    <th className="px-6 py-3">Catégorie</th>
                                    <th className="px-6 py-3">Prix</th>
                                    <th className="px-6 py-3">Disponible</th>
                                    <th className="px-6 py-3">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Chargement...</td></tr>
                                ) : stocks.map((stock) => (
                                    <tr key={stock.id_stock} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-800">{stock.nom_gadget}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{stock.type_gadget}</td>
                                        <td className="px-6 py-4 font-mono text-sm text-slate-600">${stock.prix_vente_gadget}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800">{stock.quantite_disponible}</td>
                                        <td className="px-6 py-4">
                                            {stock.quantite_disponible < 10 ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                                                    Stock Faible
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
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
            </div>
        </div>
    );
};

export default StockPage;

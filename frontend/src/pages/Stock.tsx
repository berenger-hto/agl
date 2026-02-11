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
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-display font-bold text-slate-900">Inventory Management</h2>
                    <p className="text-slate-500">Real-time stock tracking and valuation.</p>
                </div>
                <button className="bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold px-5 py-2.5 rounded-xl border border-gray-200 transition-all flex items-center shadow-sm">
                    <span className="material-icons text-base mr-2">inventory</span> Audit Stock
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="elevated-card rounded-2xl p-8 lg:col-span-1 flex flex-col justify-center items-center">
                    <div className="relative w-full aspect-square max-w-[300px]">
                        {loading ? (
                            <div className="flex items-center justify-center h-full text-slate-400">Loading Chart...</div>
                        ) : (
                            <div className="relative w-full h-full">
                                <Doughnut data={chartData} options={chartOptions} />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total Items</p>
                                        <p className="text-3xl font-black text-slate-900">{stocks.reduce((acc, curr) => acc + curr.quantite_disponible, 0)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="elevated-card rounded-2xl p-0 lg:col-span-2 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Stock Details</h3>
                        <input type="text" placeholder="Search item..." className="bg-slate-50 border border-gray-100 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary/50" />
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">Gadget Name</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Price</th>
                                    <th className="px-6 py-3">Available</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
                                ) : stocks.map((stock) => (
                                    <tr key={stock.id_stock} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-800">{stock.nom_gadget}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{stock.type_gadget}</td>
                                        <td className="px-6 py-4 font-mono text-sm text-slate-600">${stock.prix_vente_gadget}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800">{stock.quantite_disponible}</td>
                                        <td className="px-6 py-4">
                                            {stock.quantite_disponible < 10 ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                                                    Low Stock
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                                    In Stock
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

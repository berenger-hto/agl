import { useEffect, useState } from 'react';
import api from '../lib/axios';

interface Production {
    id_production: number;
    date_production: string;
    quantite_produite: number;
    id_gadget: number;
    // Join fields
    nom_gadget?: string;
}

const ProductionPage = () => {
    const [productions, setProductions] = useState<Production[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProductions();
    }, []);

    const fetchProductions = async () => {
        try {
            const response = await api.get('/productions');
            setProductions(response.data);
        } catch (error) {
            console.error('Error fetching productions:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-display font-bold text-slate-900">Productions</h2>
                    <p className="text-slate-500">Manage your manufacturing sessions.</p>
                </div>
                <button className="bg-primary hover:bg-primary-light text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-primary/20">
                    <span className="material-icons align-middle mr-1">add</span> New Session
                </button>
            </div>

            <div className="elevated-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-gray-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Gadget</th>
                                <th className="px-6 py-4">Quantity</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
                            ) : productions.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No productions found.</td></tr>
                            ) : (
                                productions.map((prod) => (
                                    <tr key={prod.id_production} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400">#{prod.id_production}</td>
                                        <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                                            {new Date(prod.date_production).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-900 font-bold">{prod.nom_gadget || `Gadget #${prod.id_gadget}`}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-xs font-bold">
                                                {prod.quantite_produite} Units
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center text-xs font-bold text-green-600">
                                                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> Completed
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductionPage;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';

const InvoicesListPage = () => {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const response = await api.get('/sales'); // This endpoint returns the history
            setInvoices(response.data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-display font-bold text-slate-900">Factures</h2>
                    <p className="text-slate-500">Historique des ventes et factures.</p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10 text-slate-400">Chargement des factures...</div>
            ) : invoices.length === 0 ? (
                <div className="text-center py-10 text-slate-400">Aucune facture trouvée.</div>
            ) : (
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">N° Facture</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vendeur</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Montant</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {invoices.map((inv) => (
                                <tr key={inv.numero_facture} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900">{inv.numero_facture}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {new Date(inv.date_facture).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                        {inv.nom_client} {inv.prenom_client}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {inv.vendeur}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                                        {Number(inv.montant_total).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => navigate(`/sales/${inv.numero_facture}`)}
                                            className="text-primary hover:text-primary-light hover:bg-primary/10 p-2 rounded-lg transition-all"
                                            title="Voir la facture"
                                        >
                                            <span className="material-icons text-lg">visibility</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default InvoicesListPage;

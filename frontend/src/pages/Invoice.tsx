import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/axios';

const InvoicePage = () => {
    const { id } = useParams();
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const response = await api.get(`/sales/${id}`);
                setInvoice(response.data);
            } catch (err) {
                console.error('Error fetching invoice:', err);
                setError('Impossible de charger la facture.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchInvoice();
    }, [id]);

    if (loading) return <div className="flex h-screen items-center justify-center text-slate-500">Chargement de la facture...</div>;
    if (error) return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;
    if (!invoice) return <div className="flex h-screen items-center justify-center text-slate-500">Facture introuvable.</div>;

    const subtotal = invoice.montant_total / 1.18; // Assuming 18% tax from Sales.tsx logic (total = subtotal * 1.18)
    const tax = invoice.montant_total - subtotal;

    return (
        <div className="min-h-screen bg-[#fcfcfc] text-[#1e1e24] font-sans selection:bg-[#3b19e6] selection:text-white flex flex-col">
            <header className="w-full h-16 border-b border-slate-200 flex items-center justify-between px-6 lg:px-12 bg-white sticky top-0 z-50 print:hidden">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded bg-[#3b19e6] flex items-center justify-center text-white font-bold">G</div>
                    <nav className="hidden md:flex items-center text-sm font-medium text-slate-500">
                        <span className="hover:text-[#3b19e6] transition-colors cursor-pointer" onClick={() => window.history.back()}>Ventes</span>
                        <span className="mx-2 text-slate-300">/</span>
                        <span className="text-[#1e1e24]">{invoice.numero_facture}</span>
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => window.print()} className="p-2 text-slate-500 hover:text-[#3b19e6] hover:bg-slate-100 rounded-lg transition-colors" title="Imprimer">
                        <span className="material-icons text-xl">print</span>
                    </button>
                    {/* <button className="p-2 text-slate-500 hover:text-[#3b19e6] hover:bg-slate-100 rounded-lg transition-colors" title="Télécharger">
                        <span className="material-icons text-xl">download</span>
                    </button> */}
                </div>
            </header>

            <main className="flex-grow p-4 md:p-8 lg:p-12 relative">
                <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm relative print:shadow-none print:border-none">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#3b19e6]/50 to-transparent print:hidden"></div>

                    <div className="p-8 md:p-12 border-b border-slate-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[#3b19e6] font-bold text-2xl tracking-tighter">GadgetAn</span>
                                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                                </div>
                                <p className="text-slate-500 uppercase tracking-widest text-[10px] font-semibold">Systèmes de Gestion Futuristes</p>
                            </div>
                            <div className="text-right">
                                <h1 className="text-4xl font-light text-[#1e1e24] mb-1 tracking-tight">FACTURE</h1>
                                <p className="font-mono text-[#3b19e6] font-semibold">#{invoice.numero_facture}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                            <div>
                                <h3 className="text-xs uppercase tracking-widest text-slate-400 mb-4 font-bold">Facturé à</h3>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                        <span className="material-icons text-slate-400">business</span>
                                    </div>
                                    <div>
                                        <h4 className="text-[#1e1e24] font-bold text-lg">{invoice.nom_client} {invoice.prenom_client}</h4>
                                        <p className="text-slate-500 text-sm mt-1">{invoice.email_client}</p>
                                        {/* Address could be added here if available */}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col md:items-end">
                                <h3 className="text-xs uppercase tracking-widest text-slate-400 mb-4 font-bold text-left md:text-right">Détails de la Facture</h3>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm w-full md:w-auto">
                                    <div className="text-slate-500 text-left md:text-right">Date d'émission</div>
                                    <div className="text-[#1e1e24] font-mono font-medium text-right">
                                        {new Date(invoice.date_facture).toLocaleDateString('fr-FR', {
                                            year: 'numeric', month: 'short', day: 'numeric'
                                        })}
                                    </div>
                                    {/* Due date logic could be added here */}
                                    <div className="text-slate-500 text-left md:text-right mt-1">Statut</div>
                                    <div className="text-right mt-1">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                                            PAYÉ
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-200">
                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Qté</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Prix Unitaire</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {invoice.items?.map((item: any, index: number) => (
                                    <tr key={index} className="group hover:bg-slate-50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-300">
                                                    <span className="material-icons text-sm">inventory_2</span>
                                                </div>
                                                <div>
                                                    <p className="text-[#1e1e24] font-semibold">{item.nom_gadget}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.type_gadget}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right font-mono text-slate-600">
                                            {item.quantite_vendue.toString().padStart(2, '0')}
                                        </td>
                                        <td className="px-8 py-6 text-right font-mono text-slate-600">
                                            {Number(item.prix_unitaire_appliquer).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                                        </td>
                                        <td className="px-8 py-6 text-right font-mono text-[#1e1e24] font-bold">
                                            {Number(item.total_ligne).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-8 md:px-12 py-10 border-t border-slate-200 bg-white">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
                            <div className="w-full md:w-1/2 text-sm">
                                <h4 className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-3">Informations de Paiement</h4>
                                <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-slate-500">Vendeur</span>
                                        <span className="text-[#1e1e24] font-medium">{invoice.prenom_vendeur} {invoice.nom_vendeur}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-slate-500">Date de Vente</span>
                                        <span className="text-[#1e1e24] font-mono font-medium">
                                            {new Date(invoice.date_vente).toLocaleDateString('fr-FR')} {new Date(invoice.date_vente).toLocaleTimeString('fr-FR')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-1/3 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Sous-total</span>
                                    <span className="text-[#1e1e24] font-mono font-medium">
                                        {Number(subtotal).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">TVA (18%)</span>
                                    <span className="text-[#1e1e24] font-mono font-medium">
                                        {Number(tax).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                                    </span>
                                </div>
                                <div className="h-px bg-slate-200 my-4"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Total à Payer</span>
                                    <span className="text-3xl font-bold text-[#3b19e6] font-mono drop-shadow-[0_2px_4px_rgba(59,25,230,0.1)]">
                                        {Number(invoice.montant_total).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-8 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
                        <p className="text-[10px] text-slate-400 text-center sm:text-left font-medium">
                            MERCI DE VOTRE CONFIANCE.<br />
                            GÉNÉRÉ PAR LE SYSTÈME GADGETAN V4.2.
                        </p>
                    </div>
                </div>
                <div className="mt-12 text-center print:hidden">
                    <p className="text-xs text-slate-400 font-medium">© 2049 GadgetAn Inc. Tous droits réservés.</p>
                </div>
            </main>

            <div className="hidden print:block text-center py-10 text-slate-300 text-[10px]">
                Généré numériquement via GadgetAn Futuristic Management Systems.
            </div>
        </div>
    );
};

export default InvoicePage;

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
    const [showProdModal, setShowProdModal] = useState(false);
    const [showGadgetModal, setShowGadgetModal] = useState(false);
    const [newProd, setNewProd] = useState({ date_production: '', quantite_produite: 0, id_gadget: 0 });
    const [newGadget, setNewGadget] = useState({ nom_gadget: '', type_gadget: '', prix_vente_gadget: 0, description_gadget: '' });
    const [gadgets, setGadgets] = useState<{ id_gadget: number, nom_gadget: string }[]>([]);

    useEffect(() => {
        const fetchGadgets = async () => {
            try {
                const response = await api.get('/stocks');
                setGadgets(response.data.map((s: any) => ({ id_gadget: s.id_gadget, nom_gadget: s.nom_gadget })));
            } catch (e) { console.error(e); }
        };
        if (showProdModal) fetchGadgets();
    }, [showProdModal]);

    const handleCreateProd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/productions', newProd);
            setShowProdModal(false);
            fetchProductions();
            alert('Production créée !');
        } catch (e) { alert('Erreur création production'); }
    };

    const handleCreateGadget = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/gadgets', newGadget);
            setShowGadgetModal(false);
            alert('Gadget créé !');
        } catch (e) { alert('Erreur création gadget'); }
    };

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
                    <p className="text-slate-500">Gérez vos sessions de fabrication.</p>
                </div>
                <div className="flex space-x-3">
                    <button onClick={() => setShowGadgetModal(true)} className="bg-white text-slate-700 border border-gray-200 font-semibold px-4 py-2 rounded-xl transition-all shadow-sm">
                        <span className="material-icons align-middle mr-1">extension</span> Nouveau Gadget
                    </button>
                    <button onClick={() => setShowProdModal(true)} className="bg-primary hover:bg-primary-light text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-primary/20">
                        <span className="material-icons align-middle mr-1">add</span> Ajouter une production
                    </button>
                </div>
            </div>

            <div className="elevated-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-gray-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Gadget</th>
                                <th className="px-6 py-4">Quantité</th>
                                <th className="px-6 py-4">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Chargement...</td></tr>
                            ) : productions.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Aucune production trouvée.</td></tr>
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
                                                {prod.quantite_produite} Unités
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center text-xs font-bold text-green-600">
                                                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> Terminé
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showProdModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Ajouter une production</h3>
                        <form onSubmit={handleCreateProd} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                                <input type="date" required className="w-full border border-gray-200 rounded-xl px-4 py-2"
                                    value={newProd.date_production} onChange={e => setNewProd({ ...newProd, date_production: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Gadget</label>
                                <select required className="w-full border border-gray-200 rounded-xl px-4 py-2"
                                    value={newProd.id_gadget} onChange={e => setNewProd({ ...newProd, id_gadget: Number(e.target.value) })}>
                                    <option value="">Sélectionner un gadget</option>
                                    {gadgets.map(g => <option key={g.id_gadget} value={g.id_gadget}>{g.nom_gadget}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Quantité</label>
                                <input type="number" required min="1" className="w-full border border-gray-200 rounded-xl px-4 py-2"
                                    value={newProd.quantite_produite} onChange={e => setNewProd({ ...newProd, quantite_produite: Number(e.target.value) })} />
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button type="button" onClick={() => setShowProdModal(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 rounded-xl">Annuler</button>
                                <button type="submit" className="flex-1 bg-primary text-white font-bold py-2 rounded-xl">Créer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showGadgetModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Nouveau Gadget</h3>
                        <form onSubmit={handleCreateGadget} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Nom</label>
                                <input type="text" required className="w-full border border-gray-200 rounded-xl px-4 py-2"
                                    value={newGadget.nom_gadget} onChange={e => setNewGadget({ ...newGadget, nom_gadget: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Type</label>
                                <input type="text" required className="w-full border border-gray-200 rounded-xl px-4 py-2"
                                    value={newGadget.type_gadget} onChange={e => setNewGadget({ ...newGadget, type_gadget: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Prix de vente</label>
                                <input type="number" required min="0" step="0.01" className="w-full border border-gray-200 rounded-xl px-4 py-2"
                                    value={newGadget.prix_vente_gadget} onChange={e => setNewGadget({ ...newGadget, prix_vente_gadget: Number(e.target.value) })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                                <textarea className="w-full border border-gray-200 rounded-xl px-4 py-2"
                                    value={newGadget.description_gadget} onChange={e => setNewGadget({ ...newGadget, description_gadget: e.target.value })}></textarea>
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button type="button" onClick={() => setShowGadgetModal(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 rounded-xl">Annuler</button>
                                <button type="submit" className="flex-1 bg-primary text-white font-bold py-2 rounded-xl">Créer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductionPage;

import { useEffect, useState } from 'react';
import api from '../lib/axios';

interface Gadget {
    id_gadget: number;
    nom_gadget: string;
    prix_vente_gadget: number;
    quantite_disponible: number; // Derived from stock
}

interface CartItem extends Gadget {
    quantity: number;
}

const SalesPage = () => {
    const [gadgets, setGadgets] = useState<Gadget[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchGadgets();
    }, []);

    const fetchGadgets = async () => {
        try {
            // Re-using stock endpoint which returns gadgets with quantities
            const response = await api.get('/stocks');
            // Adaptation: map stock items to gadget structure
            const availableGadgets = response.data.map((item: any) => ({
                id_gadget: item.id_gadget,
                nom_gadget: item.nom_gadget,
                prix_vente_gadget: item.prix_vente_gadget,
                quantite_disponible: item.quantite_disponible
            }));
            setGadgets(availableGadgets);
        } catch (error) {
            console.error('Error fetching gadgets:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (gadget: Gadget) => {
        setCart(prev => {
            const existing = prev.find(item => item.id_gadget === gadget.id_gadget);
            if (existing) {
                return prev.map(item =>
                    item.id_gadget === gadget.id_gadget
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...gadget, quantity: 1 }];
        });
    };

    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(item => item.id_gadget !== id));
    };

    const updateQuantity = (id: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id_gadget === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const total = cart.reduce((acc, item) => acc + (item.prix_vente_gadget * item.quantity), 0);

    const handleCheckout = async () => {
        setProcessing(true);
        try {
            await api.post('/sales', {
                items: cart.map(item => ({
                    id_gadget: item.id_gadget,
                    quantity: item.quantity
                }))
            });
            alert('Vente terminée avec succès !');
            setCart([]);
            fetchGadgets(); // Refresh stock
        } catch (error) {
            console.error('Checkout failed:', error);
            alert('Échec du paiement. Veuillez réessayer.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6">
            <div className="flex-1 flex flex-col min-h-0">
                <div className="mb-6">
                    <h2 className="text-3xl font-display font-bold text-slate-900">Point de Vente</h2>
                    <p className="text-slate-500">Traiter les nouvelles commandes.</p>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                    {loading ? (
                        <div className="col-span-full text-center text-slate-500">Chargement du catalogue...</div>
                    ) : gadgets.map(gadget => (
                        <div key={gadget.id_gadget}
                            onClick={() => addToCart(gadget)}
                            className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer group flex flex-col h-40 justify-between">
                            <div>
                                <h4 className="font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-2">{gadget.nom_gadget}</h4>
                                <span className="text-xs font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mt-2 inline-block">Stock: {gadget.quantite_disponible}</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-lg font-black text-slate-900">${gadget.prix_vente_gadget}</span>
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span className="material-icons text-sm">add</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full md:w-96 bg-white border-l border-gray-100 flex flex-col shadow-2xl z-30 md:rounded-l-3xl">
                <div className="p-6 border-b border-gray-50">
                    <h3 className="font-bold text-xl text-slate-800">Commande Actuelle</h3>
                    <p className="text-sm text-slate-500">{cart.length} articles sélectionnés</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                            <span className="material-icons text-4xl mb-2">shopping_basket</span>
                            <p className="text-sm">Le panier est vide</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id_gadget} className="flex items-center justify-between group">
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-slate-700 truncate">{item.nom_gadget}</h4>
                                    <p className="text-xs text-slate-400">${item.prix_vente_gadget} x {item.quantity}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => updateQuantity(item.id_gadget, -1)} className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">
                                        <span className="material-icons text-[14px]">remove</span>
                                    </button>
                                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id_gadget, 1)} className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">
                                        <span className="material-icons text-[14px]">add</span>
                                    </button>
                                    <button onClick={() => removeFromCart(item.id_gadget)} className="ml-2 text-slate-300 hover:text-red-500 transition-colors">
                                        <span className="material-icons text-[18px]">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 bg-slate-50 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-slate-500">Total</span>
                        <span className="text-2xl font-black text-slate-900">${total.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || processing}
                        className="w-full bg-primary hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center">
                        {processing ? (
                            <span className="material-icons animate-spin mr-2">refresh</span>
                        ) : (
                            <span className="material-icons mr-2">check_circle</span>
                        )}
                        {processing ? 'Traitement...' : 'Terminer la Vente'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalesPage;

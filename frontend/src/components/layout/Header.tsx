const Header = () => {
    return (
        <header className="h-20 glass-panel border-b border-gray-100 flex items-center justify-between px-8 z-10 shrink-0">
            <div className="flex items-center w-96">
                <div className="relative w-full group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                    <input
                        className="w-full bg-white/50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder-slate-400 transition-all"
                        placeholder="Rechercher..."
                        type="text"
                    />
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <button className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-primary transition-all border border-gray-100 shadow-sm relative">
                    <span className="material-icons text-[20px]">notifications</span>
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                </button>
                <div className="h-8 w-px bg-gray-100 mx-2"></div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest px-3 py-1.5 rounded-lg border border-primary/10 bg-primary/5">Système: En ligne</span>
            </div>
        </header>
    );
};

export default Header;

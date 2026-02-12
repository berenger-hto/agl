import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const { user } = useAuth();

    const navItems = [
        { name: 'Tableau de bord', icon: 'dashboard', path: '/' },
        { name: 'Production', icon: 'inventory_2', path: '/production' },
        { name: 'Stocks', icon: 'analytics', path: '/stocks' },
        { name: 'Ventes', icon: 'point_of_sale', path: '/sales' },
        { name: 'Personnel', icon: 'people', path: '/hr' },
    ];

    return (
        <aside className="w-20 lg:w-64 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col justify-between z-20 h-full relative">
            <div>
                <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-50">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="material-icons text-white text-xl">dataset</span>
                    </div>
                    <h1 className="hidden lg:block ml-3 font-bold text-xl tracking-wider text-slate-800">
                        Gadget<span className="text-primary">An</span>
                    </h1>
                </div>
                <nav className="mt-8 space-y-2 px-3">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "flex items-center px-4 py-3 rounded-xl transition-all group relative overflow-hidden",
                                location.pathname === item.path
                                    ? "bg-primary/5 text-primary border border-primary/10"
                                    : "text-slate-500 hover:text-primary hover:bg-slate-50"
                            )}
                        >
                            <span className={clsx("material-icons transition-colors", location.pathname !== item.path && "group-hover:text-primary")}>
                                {item.icon}
                            </span>
                            <span className="hidden lg:block ml-3 font-semibold">{item.name}</span>
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="p-4 border-t border-gray-50">
                <div className="mt-4 flex items-center lg:px-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                        <span className="material-icons">person</span>
                    </div>
                    <div className="hidden lg:block ml-3">
                        <p className="text-sm font-bold text-slate-800">{user?.name || 'Utilisateur'}</p>
                        <p className="text-xs text-slate-500">{user?.role || 'Membre'}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;

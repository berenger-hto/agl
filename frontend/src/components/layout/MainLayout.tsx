import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
    return (
        <div className="flex h-screen overflow-hidden bg-background-light">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-20 w-[400px] h-[400px] bg-cyan-400/5 rounded-full blur-[100px] pointer-events-none"></div>

                <Header />

                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 space-y-8 scroll-smooth">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;

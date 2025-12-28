import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Dumbbell, User, PlayCircle } from 'lucide-react';
import clsx from 'clsx';

export default function Layout() {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Today' },
        { path: '/calendar', icon: Calendar, label: 'Plan' },
        { path: '/workouts', icon: Dumbbell, label: 'Workouts' },
        // { path: '/profile', icon: User, label: 'Profile' }, 
    ];

    return (
        <div className="flex flex-col h-[100dvh] bg-zinc-950 text-zinc-100 font-sans">
            <main className="flex-1 overflow-y-auto pb-20">
                <Outlet />
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-lg border-t border-zinc-800 pb-safe">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors active:scale-95",
                                    isActive ? "text-blue-500" : "text-zinc-500 hover:text-zinc-300"
                                )}
                            >
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Floating Action Button for Quick Workout Start - visible on Dashboard */}
            {location.pathname === '/' && (
                <div className="fixed bottom-20 right-4">
                    <Link to="/exercise-mode" className="flex items-center justify-center w-14 h-14 bg-blue-600 rounded-full shadow-lg shadow-blue-900/20 active:scale-90 transition-transform">
                        <PlayCircle className="text-white" size={28} fill="currentColor" />
                    </Link>
                </div>
            )}
        </div>
    );
}

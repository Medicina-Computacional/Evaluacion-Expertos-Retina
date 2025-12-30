import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-uabc-green text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center sm:px-6 lg:px-8">

                {/* Logos Section - Left Aligned */}
                <div className="flex items-center space-x-6 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                    {/* 1. UABC Logo */}
                    <div className="flex-shrink-0 h-14 w-auto flex items-center bg-white/10 rounded-lg p-1">
                        <img
                            src="/logos/uabc-logo-ser.png"
                            alt="Escudo UABC"
                            className="h-full w-auto object-contain"
                        />
                    </div>

                    <div className="h-10 w-px bg-white/20 hidden sm:block"></div>

                    {/* 2. ECS Logo */}
                    <div className="flex-shrink-0 h-10 w-auto flex items-center">
                        <img
                            src="/logos/ecs-logo.jpg"
                            alt="Facultad de Medicina y Psicología"
                            className="h-full w-auto object-contain rounded-md"
                        />
                    </div>

                    {/* 3. FIAD Logo */}
                    <div className="flex-shrink-0 h-10 w-auto flex items-center">
                        <img
                            src="/logos/fiad-logo.png"
                            alt="Facultad de Ingeniería, Arquitectura y Diseño"
                            className="h-full w-auto object-contain bg-white rounded-md p-0.5"
                        />
                    </div>

                    {/* 4. Group Logo (Profile Picture) */}
                    <div className="flex-shrink-0 h-10 w-auto flex items-center">
                        <img
                            src="/logos/group-logo.png"
                            alt="Medicina Computacional"
                            className="h-full w-auto object-contain rounded-full bg-white p-0.5"
                        />
                    </div>
                </div>

                {/* User Actions - Right Aligned */}
                {user && (
                    <div className="flex items-center space-x-4 ml-4">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-medium text-white">{user.name || user.email}</p>
                            <p className="text-xs text-uabc-gold font-semibold uppercase">
                                {user.role === 'evaluator' ? 'EVALUADOR' : user.role}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-uabc-dark hover:bg-black/30 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-uabc-gold/30"
                        >
                            Salir
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}

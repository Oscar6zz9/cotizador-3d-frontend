import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, User, LogOut, LogIn } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-600/20 group-hover:from-cyan-500/30 group-hover:to-violet-600/30 transition-all border border-cyan-500/20">
                            <Box className="w-6 h-6 text-cyan-400" />
                        </div>
                        <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500">
                            Cotizador 3D
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm font-medium">
                            Inicio
                        </Link>
                        {isAuthenticated && (
                            <Link to="/cotizador" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm font-medium">
                                Nueva Cotización
                            </Link>
                        )}

                        <div className="pl-6 border-l border-white/10 flex items-center gap-4">
                            {isAuthenticated ? (
                                <div className="flex items-center gap-4">
                                    <Link to="/profile" className="text-sm text-slate-300 flex items-center gap-2 hover:text-white transition-colors">
                                        <User className="w-4 h-4 text-cyan-400" />
                                        {user?.name}
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                                        title="Cerrar Sesión"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                                        Iniciar Sesión
                                    </Link>
                                    <Link to="/register" className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
                                        Registrarse
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

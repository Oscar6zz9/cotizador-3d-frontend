import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Box, Mail, Lock, ArrowRight } from 'lucide-react';

const MySwal = withReactContent(Swal);

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        const { email, password } = formData;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            MySwal.fire({
                icon: 'error',
                title: 'Email Inválido',
                text: 'Por favor ingresa un dirección de correo válida.',
                background: '#020617',
                color: '#fff',
                confirmButtonColor: '#06b6d4'
            });
            return false;
        }

        if (password.length < 6) {
            MySwal.fire({
                icon: 'error',
                title: 'Contraseña Corta',
                text: 'La contraseña debe tener al menos 6 caracteres.',
                background: '#020617',
                color: '#fff',
                confirmButtonColor: '#06b6d4'
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await login(formData);

            MySwal.fire({
                icon: 'success',
                title: '¡Bienvenido!',
                text: 'Has iniciado sesión correctamente.',
                background: '#020617',
                color: '#fff',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                navigate('/cotizador');
            });
        } catch (error) {
            MySwal.fire({
                icon: 'error',
                title: 'Error de Inicio de Sesión',
                text: error.response?.data?.message || 'Credenciales inválidas o error en el servidor.',
                background: '#020617',
                color: '#fff',
                confirmButtonColor: '#06b6d4'
            });
        }
    };

    return (
        <div className="min-h-screen pt-20 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-violet-600/20 rounded-xl border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                        <Box className="text-cyan-400 w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Bienvenido de nuevo</h2>
                    <p className="text-slate-400 text-sm">Ingresa a tu cuenta para cotizar</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-medium ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600"
                                placeholder="ejemplo@correo.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-medium ml-1">Contraseña</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6">
                        Iniciar Sesión
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-400">
                    ¿No tienes cuenta? <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium">Regístrate aquí</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

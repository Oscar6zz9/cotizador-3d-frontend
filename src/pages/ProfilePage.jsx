import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Package, MapPin, Save, X, Edit2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'orders'
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        region: ''
    });

    // Mock Orders
    const [orders, setOrders] = useState([
        { id: 'ORD-001', date: '2023-11-20', status: 'Entregado', total: 25000, items: 3 },
        { id: 'ORD-002', date: '2023-11-28', status: 'En Proceso', total: 12500, items: 1 },
        { id: 'ORD-003', date: '2023-12-05', status: 'Pendiente', total: 45990, items: 2 },
    ]);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                region: user.region || ''
            });

            // Check if address is missing to prompt user
            if (!user.address && activeTab === 'profile') {
                MySwal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'info',
                    title: 'Completa tu perfil',
                    text: 'Agrega una dirección para futuros envíos.',
                    showConfirmButton: false,
                    timer: 4000,
                    background: '#020617',
                    color: '#fff'
                });
            }
        }
    }, [user, activeTab]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.address) {
            MySwal.fire({
                icon: 'warning',
                title: 'Campos Vacíos',
                text: 'El nombre y la dirección son obligatorios.',
                background: '#020617',
                color: '#fff',
                confirmButtonColor: '#06b6d4'
            });
            return;
        }

        updateUser(formData);
        setIsEditing(false);

        MySwal.fire({
            icon: 'success',
            title: 'Perfil Actualizado',
            text: 'Tu información ha sido guardada correctamente.',
            background: '#020617',
            color: '#fff',
            confirmButtonColor: '#06b6d4'
        });
    };

    const handleCancelEdit = () => {
        // Revert to current user data
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            region: user.region || ''
        });
        setIsEditing(false);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'entregado': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'en proceso': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'pendiente': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };

    return (
        <div className="pt-24 pb-12 min-h-screen container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Mi Cuenta</h1>
                        <p className="text-slate-400">Administra tus datos y revisa tus pedidos anteriores.</p>
                    </div>
                    {/* User Avatar Placeholder */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-cyan-500/20">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={clsx(
                            "pb-4 px-2 text-sm font-medium transition-all relative",
                            activeTab === 'profile' ? "text-cyan-400" : "text-slate-400 hover:text-white"
                        )}
                    >
                        <span className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Mi Perfil
                        </span>
                        {activeTab === 'profile' && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={clsx(
                            "pb-4 px-2 text-sm font-medium transition-all relative",
                            activeTab === 'orders' ? "text-cyan-400" : "text-slate-400 hover:text-white"
                        )}
                    >
                        <span className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Mis Pedidos
                        </span>
                        {activeTab === 'orders' && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 rounded-t-full" />
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden min-h-[400px]">

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-cyan-500" />
                                    Información de Envío
                                </h2>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                                    >
                                        <Edit2 className="w-3 h-3" />
                                        Editar
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs text-slate-500 block mb-1.5 ml-1">Nombre Completo</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 block mb-1.5 ml-1">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        disabled={true} // Read-only
                                        className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed"
                                        title="El correo no se puede cambiar"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 block mb-1.5 ml-1">Teléfono</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="+56 9 1234 5678"
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 block mb-1.5 ml-1">Región / Comuna</label>
                                    <input
                                        type="text"
                                        name="region"
                                        value={formData.region}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs text-slate-500 block mb-1.5 ml-1">Dirección de Envío</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="Calle, Número, Depto..."
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {isEditing && (
                                    <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-white/5">
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="px-6 py-2 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors text-sm font-medium flex items-center gap-2"
                                        >
                                            <X className="w-4 h-4" />
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 rounded-xl bg-cyan-500 text-white hover:bg-cyan-400 transition-colors text-sm font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                                        >
                                            <Save className="w-4 h-4" />
                                            Guardar Cambios
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    )}

                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="p-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {orders.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/10 bg-white/5 text-xs text-slate-400 uppercase tracking-wider">
                                                <th className="p-4 font-medium">ID Pedido</th>
                                                <th className="p-4 font-medium">Fecha</th>
                                                <th className="p-4 font-medium">Estado</th>
                                                <th className="p-4 font-medium text-right">Total</th>
                                                <th className="p-4 font-medium text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {orders.map((order) => (
                                                <tr key={order.id} className="hover:bg-white/5 transition-colors text-sm">
                                                    <td className="p-4 font-mono text-slate-300">{order.id}</td>
                                                    <td className="p-4 text-slate-300">{order.date}</td>
                                                    <td className="p-4">
                                                        <span className={clsx("px-2.5 py-1 rounded-full text-xs font-medium border", getStatusColor(order.status))}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-white font-mono text-right">{formatCurrency(order.total)}</td>
                                                    <td className="p-4 text-center">
                                                        <button className="text-cyan-400 hover:text-cyan-300 text-xs font-medium underline">
                                                            Ver Detalle
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-12 flex flex-col items-center justify-center text-slate-500">
                                    <Package className="w-16 h-16 mb-4 opacity-20" />
                                    <p className="text-lg font-medium text-slate-400">No tienes pedidos aún</p>
                                    <p className="text-sm">Tus cotizaciones aprobadas aparecerán aquí.</p>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

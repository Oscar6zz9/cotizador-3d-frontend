import { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls, Stage, Center, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { Upload, Box, Settings, DollarSign, ArrowRight, Download, Check, X, Tag } from 'lucide-react';
import clsx from 'clsx';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Color Data
const MATERIAL_COLORS = {
    resin: ['Gris Estándar', 'Blanco', 'Negro', 'Transparente', 'Azul Dental'],
    pla: ['Blanco Mate', 'Negro Carbón', 'Rojo Fuego', 'Azul Eléctrico', 'Naranja']
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
};

// Model Viewer Component
const ModelViewer = ({ url, onLoaded, scale }) => {
    const meshRef = useRef();
    const geom = useLoader(STLLoader, url);

    useEffect(() => {
        if (geom) {
            geom.computeBoundingBox();
            geom.center(); // Center geometry
            const box = geom.boundingBox;
            const x = (box.max.x - box.min.x);
            const y = (box.max.y - box.min.y);
            const z = (box.max.z - box.min.z);
            onLoaded({ x, y, z });
        }
    }, [geom, onLoaded]);

    useFrame((state) => {
        if (meshRef.current) {
            // simple auto-rotation if desired
            // meshRef.current.rotation.y += 0.005; 
        }
    });

    return (
        <mesh ref={meshRef} geometry={geom} scale={scale}>
            <meshStandardMaterial color="#06b6d4" roughness={0.3} metalness={0.2} />
        </mesh>
    );
};

const QuoterPage = () => {
    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);
    const [dimensions, setDimensions] = useState({ x: 0, y: 0, z: 0 }); // Current dimensions (editable)
    const [originalDimensions, setOriginalDimensions] = useState({ x: 0, y: 0, z: 0 }); // Original from file
    const [material, setMaterial] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [itemPrice, setItemPrice] = useState(0);
    const [discountCode, setDiscountCode] = useState('');

    // Constants
    const SHIPPING_COST = 4990;

    const materials = [
        { id: 'resin', name: 'Resina', desc: 'Alta precisión', price: 60 }, // Price per cm3 (approx CLP)
        { id: 'pla', name: 'Plástico (PLA)', desc: 'Resistente', price: 25 },
    ];

    // Calculate scale vector based on original vs current dimensions
    const modelScale = useMemo(() => {
        if (originalDimensions.x === 0) return [1, 1, 1];
        // Calculate scale factor from X axis change and apply uniformly (to maintain aspect ratio)
        // Or if we want independent scaling, we'd do [x/ox, y/oy, z/oz]
        // The prompt says "update the mesh.scale proportionally". Let's assume aspect ratio lock for now, 
        // OR calculate scale based on the dominant change? 
        // Simplest valid interpretation: X/Y/Z are tied. We'll use X as the master for the visual scale if ratios change?
        // Actually, let's allow non-uniform scaling visual since inputs are separate.
        return [
            dimensions.x / originalDimensions.x,
            dimensions.y / originalDimensions.y,
            dimensions.z / originalDimensions.z
        ];
    }, [dimensions, originalDimensions]);

    useEffect(() => {
        if (dimensions.x > 0 && material) {
            // Volume in mm3 -> cm3
            const volumeCm3 = (parseFloat(dimensions.x) * parseFloat(dimensions.y) * parseFloat(dimensions.z)) / 1000;
            // Price calculation
            // Base logic: Volume * Material Rate
            let price = volumeCm3 * material.price;

            // Minimum price logic
            const minPrice = 5000; // CLP
            setItemPrice(Math.max(price, minPrice));
        } else {
            setItemPrice(0);
        }
    }, [dimensions, material, selectedColor]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFile(file);
            const url = URL.createObjectURL(file);
            setFileUrl(url);
            setMaterial(null);
            setSelectedColor(null);
        }
    };

    const handleModelLoaded = (dims) => {
        // Round to 2 decimals
        const cleanDims = {
            x: parseFloat(dims.x.toFixed(2)),
            y: parseFloat(dims.y.toFixed(2)),
            z: parseFloat(dims.z.toFixed(2))
        };
        setOriginalDimensions(cleanDims);
        setDimensions(cleanDims);
    };

    const handleDimensionChange = (axis, value) => {
        // In a real app we might lock aspect ratio here
        setDimensions(prev => ({
            ...prev,
            [axis]: parseFloat(value) || 0
        }));
    };

    const generatePDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(6, 182, 212);
        doc.text('Cotizador 3D', 20, 20);

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 30);

        // Details
        doc.setDrawColor(200);
        doc.line(20, 35, 190, 35);

        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text('Resumen de Pedido', 20, 50);

        doc.setFontSize(12);
        doc.text(`Archivo: ${file?.name || 'N/A'}`, 20, 65);
        doc.text(`Material: ${material?.name || 'N/A'}`, 20, 75);
        doc.text(`Color: ${selectedColor || 'N/A'}`, 20, 85);
        doc.text(`Dimensiones: ${dimensions.x} x ${dimensions.y} x ${dimensions.z} mm`, 20, 95);

        // Price Breakdown
        doc.text(`Costo Impresión: ${formatCurrency(itemPrice)}`, 20, 110);
        doc.text(`Envío: ${formatCurrency(SHIPPING_COST)}`, 20, 120);

        // Total
        doc.setFontSize(16);
        doc.setTextColor(6, 182, 212);
        doc.text(`Total a Pagar: ${formatCurrency(itemPrice + SHIPPING_COST)}`, 140, 140);

        doc.save('cotizacion_3d.pdf');
    };

    const handleQuoteRequest = () => {
        if (!file || !material || !selectedColor) {
            MySwal.fire({
                icon: 'warning',
                title: 'Datos Incompletos',
                text: 'Por favor completa todos los campos (Archivo, Material y Color).',
                background: '#020617',
                color: '#fff',
                confirmButtonColor: '#06b6d4'
            });
            return;
        }
        setShowModal(true);
    };

    const confirmOrder = () => {
        setShowModal(false);
        MySwal.fire({
            icon: 'success',
            title: '¡Pedido Recibido!',
            text: 'Tu solicitud ha sido enviada con éxito.',
            background: '#020617',
            color: '#fff',
            confirmButtonColor: '#06b6d4'
        });
        // Here you would typically reset state or redirect
    };

    return (
        <div className="pt-24 pb-12 min-h-screen container mx-auto px-4 lg:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">

                {/* Left Column: 3D Viewer */}
                <div className="lg:col-span-8 bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden relative flex flex-col">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center z-10 bg-slate-900/50">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-sm font-bold">1</span>
                            Carga y Visualización
                        </h2>
                    </div>

                    <div className="flex-1 relative bg-slate-950/50">
                        {fileUrl ? (
                            <div className="w-full h-full">
                                <Canvas shadows camera={{ position: [0, 0, 150], fov: 50 }}>
                                    <Suspense fallback={null}>
                                        <Stage environment="city" intensity={0.6}>
                                            <Center>
                                                <ModelViewer
                                                    url={fileUrl}
                                                    onLoaded={handleModelLoaded}
                                                    scale={modelScale}
                                                />
                                            </Center>
                                        </Stage>
                                    </Suspense>
                                    <OrbitControls autoRotate />
                                    <Grid infiniteGrid fadeDistance={400} sectionColor="#4f4f4f" cellColor="#4f4f4f" />
                                </Canvas>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 m-8 rounded-2xl">
                                <Box className="w-16 h-16 mb-4 opacity-50" />
                                <p>Visualizador 3D</p>
                                <p className="text-sm opacity-50">Sube un archivo STL para ver el modelo</p>
                            </div>
                        )}

                        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2`}>
                            <label className="cursor-pointer group">
                                <input type="file" accept=".stl" className="hidden" onChange={handleFileUpload} />
                                <div className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-medium shadow-lg shadow-cyan-500/25 flex items-center gap-2 group-hover:scale-105 transition-transform">
                                    <Upload className="w-5 h-5" />
                                    <span>{fileUrl ? 'Subir Otro Archivo' : 'Subir Archivo (.stl)'}</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right Column: Controls */}
                <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">

                    {/* Dimensions */}
                    <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xs font-bold">2</span>
                            Dimensiones (mm)
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                {['x', 'y', 'z'].map((axis) => (
                                    <div key={axis}>
                                        <label className="text-xs text-slate-500 block mb-1 uppercase">Eje {axis}</label>
                                        <input
                                            type="number"
                                            value={dimensions[axis]}
                                            onChange={(e) => handleDimensionChange(axis, e.target.value)}
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 transition-colors"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Material & Color Selection */}
                    <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xs font-bold">3</span>
                            Material y Color
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            {materials.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => {
                                        setMaterial(m);
                                        setSelectedColor(null); // Reset color on material change
                                    }}
                                    className={clsx(
                                        "relative p-4 rounded-xl border text-left transition-all",
                                        material?.id === m.id
                                            ? "bg-cyan-500/10 border-cyan-500 ring-1 ring-cyan-500/50"
                                            : "bg-slate-950/30 border-white/5 hover:border-white/10"
                                    )}
                                >
                                    <div className="font-semibold text-white mb-1">{m.name}</div>
                                    <div className="text-xs text-slate-400">{m.desc}</div>
                                </button>
                            ))}
                        </div>

                        {/* Color Dropdown */}
                        {material && (
                            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                <label className="text-xs text-slate-500 block mb-2">Color Disponible</label>
                                <select
                                    value={selectedColor || ''}
                                    onChange={(e) => setSelectedColor(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                >
                                    <option value="" disabled>Seleccionar color...</option>
                                    {MATERIAL_COLORS[material.id].map(color => (
                                        <option key={color} value={color}>{color}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mt-auto">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xs font-bold">4</span>
                            Resumen
                        </h3>

                        <div className="bg-slate-950 rounded-xl p-4 space-y-3 mb-6">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Configuración</p>
                                <p className="text-sm text-white font-medium">
                                    {material ? `${material.name} - ${selectedColor || 'Sin color'}` : "No seleccionado"}
                                </p>
                            </div>

                            {/* Discount Code */}
                            <div className="pt-2 border-t border-white/5">
                                <label className="text-xs text-slate-500 mb-1 block flex items-center gap-1">
                                    <Tag className="w-3 h-3" />
                                    Código de Descuento
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={discountCode}
                                        onChange={(e) => setDiscountCode(e.target.value)}
                                        placeholder="CÓDIGO"
                                        className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1 text-sm w-full focus:border-cyan-500 outline-none uppercase"
                                    />
                                    <button className="text-xs bg-white/5 hover:bg-white/10 px-3 rounded-lg border border-white/5 transition-colors">
                                        Aplicar
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 py-4 border-t border-white/5">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Pieza(s)</span>
                                <span className="text-white font-mono">{formatCurrency(itemPrice)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Envío Fijo</span>
                                <span className="text-white font-mono">{formatCurrency(SHIPPING_COST)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xl font-bold text-cyan-400 pt-2 border-t border-white/5 mt-2">
                                <span>TOTAL</span>
                                <span>{formatCurrency(itemPrice > 0 ? itemPrice + SHIPPING_COST : 0)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleQuoteRequest}
                            disabled={!file || !material || !selectedColor}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-bold text-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Solicitar Cotización
                        </button>
                    </div>

                </div>
            </div>

            {/* Modal Overlay */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <Check className="w-6 h-6 text-green-500" />
                            Resumen de Pedido
                        </h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-slate-400">Archivo</span>
                                <span className="text-white font-medium truncate max-w-[200px]">{file?.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-slate-400">Material</span>
                                <span className="text-white font-medium">{material?.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-slate-400">Color</span>
                                <span className="text-white font-medium">{selectedColor}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-slate-400">Dimensiones</span>
                                <span className="text-white font-medium text-sm">{dimensions.x} x {dimensions.y} x {dimensions.z} mm</span>
                            </div>
                            <div className="flex justify-between py-2 mt-4">
                                <span className="text-lg text-slate-200 font-bold">Total a Pagar</span>
                                <span className="text-2xl text-cyan-400 font-bold">{formatCurrency(itemPrice + SHIPPING_COST)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={generatePDF}
                                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-medium"
                            >
                                <Download className="w-4 h-4" />
                                Descargar PDF
                            </button>
                            <button
                                onClick={confirmOrder}
                                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 text-white hover:bg-green-500 transition-colors font-bold shadow-lg shadow-green-600/20"
                            >
                                Confirmar Pedido
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default QuoterPage;

const Footer = () => {
    return (
        <footer className="w-full border-t border-white/10 bg-slate-950 py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <p className="text-slate-500 text-sm">
                    © {new Date().getFullYear()} Cotizador 3D. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    );
};

export default Footer;

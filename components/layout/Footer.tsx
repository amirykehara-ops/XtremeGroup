import React from 'react';
import { NavLink as Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import { NAV_LINKS } from '../../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-100 pt-20 pb-10 rounded-t-[3rem] mt-20 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"></div>
        
        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
            <div className="flex flex-col items-center text-center mb-16">
                <img 
                    src="images/logo.jpg" 
                    alt="Xtreme Group" 
                    className="h-10 w-auto rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300"
                />
                <h2 className="text-2xl font-bold text-dark mb-4">Xtreme Group</h2>
                <p className="text-muted max-w-md mx-auto mb-8">
                    Líderes en distribución de equipamiento dental de alta tecnología en Perú. Innovando hoy la odontología del mañana.
                </p>
                <div className="flex gap-4">
                    {[Facebook, Instagram, Linkedin, Twitter].map((Icon, i) => (
                        <a key={i} href="#" className="h-10 w-10 rounded-full bg-white text-accent flex items-center justify-center shadow-md hover:bg-accent hover:text-white hover:-translate-y-1 transition-all duration-300">
                            <Icon size={18} />
                        </a>
                    ))}
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-12 border-t border-slate-200 pt-12">
                <div className="text-center md:text-left">
                    <h4 className="font-bold text-dark mb-6">Navegación</h4>
                    <ul className="space-y-3">
                        {NAV_LINKS.map(link => (
                            <li key={link.path}>
                                <Link to={link.path} className="text-muted hover:text-accent transition-colors">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="text-center md:text-left">
                    <h4 className="font-bold text-dark mb-6">Contacto</h4>
                    <ul className="space-y-4">
                        <li className="flex items-center justify-center md:justify-start gap-3 text-muted">
                            <MapPin size={18} className="text-accent shrink-0" />
                            <span>Av. Ejemplo 123, Lima, Perú</span>
                        </li>
                        <li className="flex items-center justify-center md:justify-start gap-3 text-muted">
                            <Phone size={18} className="text-accent shrink-0" />
                            <span>+51 900 000 000</span>
                        </li>
                        <li className="flex items-center justify-center md:justify-start gap-3 text-muted">
                            <Mail size={18} className="text-accent shrink-0" />
                            <span>contacto@xtremegroupcompany.com</span>
                        </li>
                    </ul>
                </div>

                <div className="text-center md:text-left">
                    <h4 className="font-bold text-dark mb-6">Legal</h4>
                    <ul className="space-y-3">
                        <li><a href="#" className="text-muted hover:text-accent transition-colors">Términos y Condiciones</a></li>
                        <li><a href="#" className="text-muted hover:text-accent transition-colors">Política de Privacidad</a></li>
                        <li><a href="#" className="text-muted hover:text-accent transition-colors">Libro de Reclamaciones</a></li>
                    </ul>
                </div>
            </div>
            
            <div className="mt-16 text-center text-sm text-slate-400">
                &copy; {new Date().getFullYear()} Xtreme Group Company. Todos los derechos reservados.
            </div>
        </div>
    </footer>
  );
};

export default Footer;
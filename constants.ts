import { Product, AVAILABLE_COLORS} from './types';
{/*
  colors: [
  'Azul Eléctrico',
  'Rojo Fuego',
  'Verde Esmeralda',
  'Morado Premium',
  'Naranja Vibrante',
  'Amarillo Solar',
  'Rosa Impacto',
  'Turquesa Marino',
  'Gris Titanio',
  'Dorado Luxe'
]
*/}

// src/constants/subscriptions.ts

export type SubscriptionType = 'regular' | 'prime_basic' | 'prime_pro';

export interface SubscriptionBenefits {
  name: string;
  discount: number; 
  discountcanjes: number; // porcentaje
  pointsMultiplier: number;
  freeShippingThreshold: number; // monto mínimo para envío gratis (0 = siempre, Infinity = nunca)
  badge: string;
  warrantyDays: number; // días de garantía extendida
  referralBonus: number; // % extra en puntos por referido
  earlyAccessHours: number; // horas antes para ofertas
  stockReservation: boolean; // reserva stock en lanzamientos
  volumePricing: 'none' | 'selected' | 'all'; // precios por volumen
  smartManagement: 'none' | 'basic' | 'advanced'; // gestión inteligente
  velocidadEnvio?: 'Estándar' | 'Prioritario' | 'Mismo Día'; // velocidad de envío
}

export const SUBSCRIPTION_BENEFITS: Record<SubscriptionType, SubscriptionBenefits> = {
  regular: {
    name: 'Regular',
    discount: 5,
    pointsMultiplier: 1,
    freeShippingThreshold: Infinity, // S/ 10 - S/ 30
    badge: 'Regular',
    warrantyDays: 7,
    referralBonus: 10,
    earlyAccessHours: 0,
    stockReservation: false,
    volumePricing: 'none',
    smartManagement: 'none',
    velocidadEnvio: 'Estándar',
    discountcanjes: 0
  },
  prime_basic: {
    name: 'Prime Básico',
    discount: 20,
    pointsMultiplier: 1.5,
    freeShippingThreshold: 300,
    badge: 'Prime Básico',
    warrantyDays: 180, // 6 meses
    referralBonus: 10,
    earlyAccessHours: 12,
    stockReservation: false,
    volumePricing: 'selected',
    smartManagement: 'basic',
    velocidadEnvio: 'Prioritario',
    discountcanjes: 5
  },
  prime_pro: {
    name: 'Prime Pro',
    discount: 20,
    pointsMultiplier: 3,
    freeShippingThreshold: 0, // siempre gratis
    badge: 'Prime Pro',
    warrantyDays: 365, // 12 meses
    referralBonus: 30,
    earlyAccessHours: 48,
    stockReservation: true,
    volumePricing: 'all',
    smartManagement: 'advanced',
    velocidadEnvio: 'Mismo Día',
    discountcanjes: 10,
  }
};

// Función helper para obtener beneficios del usuario actual
export const getUserBenefits = (subscription: SubscriptionType = 'regular'): SubscriptionBenefits => {
  return SUBSCRIPTION_BENEFITS[subscription] || SUBSCRIPTION_BENEFITS.regular;
};
// Colores personalizados para cada suscripción (badges)
export const SUBSCRIPTION_COLORS: Record<SubscriptionType, string> = {
  regular: 'bg-gradient-to-r from-gray-400 to-gray-600',         // Silver elegante
  prime_basic: 'bg-gradient-to-r from-accent to-accent-dark',   // Azul premium
  prime_pro: 'bg-gradient-to-r from-yellow-400 to-amber-600'    // Gold épico
};

// Función helper para obtener el color del badge
export const getSubscriptionColor = (subscription: SubscriptionType = 'regular'): string => {
  return SUBSCRIPTION_COLORS[subscription] || SUBSCRIPTION_COLORS.regular;
};

// Navigation links for the main menu
export const NAV_LINKS = [
  { label: 'Inicio', path: '/' },
  { label: 'Equipamiento', path: '/equipamiento' },
  { label: 'Clínica', path: '/clinica' },
  { label: 'Laboratorio', path: '/laboratorio' },
  { label: 'Nosotros', path: '/nosotros' },
  { label: 'Canjes', path: '/canjes' },
  {label: 'Suscripciones', path: '/suscripciones'}
];



// Sistema de niveles y descuentos
export const getUserLevel = (points: number = 0) => {
  if (points >= 1000) return { name: 'Gold', discount: 15, color: 'from-yellow-400 to-amber-600' };
  if (points >= 500) return { name: 'Silver', discount: 10, color: 'from-gray-400 to-gray-600' }; // Corregí el typo 5600 → 600
  return { name: 'Bronze', discount: 5, color: 'from-orange-600 to-amber-700' };
};

// Opcional: Niveles como objeto para usar en otros lugares (ej: barra de progreso)
export const LEVELS = {
  Bronze: { minPoints: 0, discount: 5, color: 'from-orange-600 to-amber-700' },
  Silver: { minPoints: 500, discount: 10, color: 'from-gray-400 to-gray-600' },
  Gold: { minPoints: 1000, discount: 15, color: 'from-yellow-400 to-amber-600' },
};

// Combine products from different pages into a central store for demo purposes
export const PRODUCTS: Product[] = [
  { 
    id: 1, 
    title: 'ES5 Motor Eléctrico', 
    desc: 'Todo en Uno',
    ben: 'Ligero y portátil, ideal para procedimientos móviles.',
    ind: 'Apto para endodoncia, implantología y cirugía oral.',
    price:1.50, 
    img: 'images/e5motor.jpg', 
    category: 'Motores Eléctricos', 
    specs: ['Portátil', 'Batería de larga duración', 'Sensor CMOS', 'Garantía 2 años'], 
    stock: true, 
    badge: 'Premium', 
    points: 100,

    colors: AVAILABLE_COLORS
  },
  { 
    id: 2, 
    title: 'RV004-1 Luz Unidad LED', 
    desc: `Diseño totalmente cerrado con cubiertas de mango esterilizables en autoclave.
          Temperaturas de color seleccionables (4000K a 5700K).
          Ideal para diversos procedimientos, incluidos RV004 y cirugía estética`,
    ben: 'Iluminación brillante y uniforme para una mejor visibilidad.',
    ind: 'Compatible con la mayoría de unidades dentales estándar.',
    price: 2490, 
    img: 'images/rv004.jpg', 
    category: 'Lámparas', 
    specs: ['Torque ajustable', '6 programas', 'Pantalla LCD', 'Garantía 18 meses'], 
    stock: true, 
    points: 150,
    colors: AVAILABLE_COLORS,
    badge: 'Nuevo' 
  },
  { 
    id: 3, 
    title: 'Implant Air Motor Implantes', 
    desc: 'La excelente calidad lo convierte en su opción sólida.',
    ben: 'Diseño compacto y ligero para un manejo cómodo.',
    ind: 'Adecuado para una amplia gama de procedimientos de implantes dentales.', 
    price: 1890, 
    img: 'images/implantair.jpg', 
    category: 'Implantes', 
    specs: ['Interfaz de Usuario Intuitiva', 'Motor con Precisión y Fuerza', 'Contra-ángulo Fuerte y Estable', 'Pantalla Táctil a Color con Superficie de Vidrio', 'Silenciar la Bomba Peristáltica'], 
    stock: true, 
    points: 200,
    badge: 'Top ',
    colors: AVAILABLE_COLORS
  },
  { 
    id: 4, 
    title: 'Ai-Motor Endomotor Motor Endodóntico', 
    desc: 'Contra ángulo giratorio de 360°',
    ben: 'Fácil de usar con pantalla táctil a color.',
    ind: 'Ideal para procedimientos endodónticos precisos.', 
    price: 3290,
    points: 250, 
    img: 'images/812tm.jpg', 
    category: 'Endo Motor', 
    specs: ['Contra Ángulo 6:1', 'Batería de Litio de 2000 mAh', 'Vida Útil 3 Veces más Larga', 'Carga Inalámbrica Conveniente'], 
    stock: true, 
    badge: 'Premium', 
    colors: AVAILABLE_COLORS 
  },
  {
    id: 5,
    title: 'LED-Q Ortho Lampara LED Fotocurado',
    desc: `Salida de luz enfocada mejorada
          Lente de curado por punto magnético`,
    ben: 'Curado rápido y eficiente para restauraciones duraderas.',
    ind: 'Adecuado para todo tipo de materiales dentales fotocurables.',
    price: 4890,
    img: 'images/lamparafoto.jpg',
    category: 'Fotocurado',
    points: 300,
    specs: ['3 Modos', 'Intensidad hasta 2500 mw/cm²', 'Curado de 1 Segundo'],
    stock: true, 
    colors: AVAILABLE_COLORS

  },
  {
    id: 6,
    title: 'Endo Radar Endomotor Motor Endodóntico',
    desc: 'Comunicación inalámbrica',
    ben: 'Precisión avanzada para tratamientos endodónticos efectivos.',
    ind: 'Compatible con una amplia gama de limas endodónticas.', 
    price: 2199,
    points: 100,
    img: 'images/endomotor.jpg',
    category: 'Endo Motor',
    specs: ['Carga Inalámbrica', 'Modo Alternativo', 'Determinación Integrada de la Longitud'],
    stock: true, 
    colors: AVAILABLE_COLORS
  },

  {
    id: 7,
    title: 'M5 Scaler Ultrasonido',
    desc: 'Limpieza cómoda de 360° sin ángulo muerto',
    ben: 'Eficaz para eliminar placa y sarro con mínima incomodidad.',
    ind: 'Adecuado para procedimientos periodontales y de mantenimiento dental.',
    price: 2199,
    points: 150,
    img: 'images/m1ultrasonido.jpg',
    category: 'Ultrasonidos',
    specs: ['Tratamiento periodontal', 'Limpieza de Conductos Radiculares', 'Tratamiento de Limpieza de Encías', 'Mantenimiento de Implantes', 'Evita Cortes Innecesarios', 'Puntas de Gutapercha', 'Extracción de la Corona', 'Extracción de Muñones Dentales', 'Eliminación de Calcificaciones', 'Alisado Radicular'],
    stock: true,
    colors: AVAILABLE_COLORS,
    badge: 'Nuevazo'
  },

  {
    id: 8,
    title: 'Ai-Pex Localizador Apical',
    desc: 'Fuente de energía constante',
    ben: 'Alta precisión en la localización apical para tratamientos endodónticos exitosos.',
    ind: 'Compatible con la mayoría de los sistemas de endodoncia.',
    price: 2199,
    points: 200,
    img: 'images/aipex.jpg',
    category: 'Localizadores',
    specs: ['Pruebas de Pulpa Eléctrica', 'Absorción Magnética', 'Diseño de Base Único', 'Anti-Interferencias', 'Multifrecuencia', 'Tecnología DSP'],
    stock: true, 
    colors: AVAILABLE_COLORS
  },

  {
    id: 9,
    title: 'RS-05 Taburete Dental',
    desc: 'Taburete dental RS-05',
    ben: 'Comodidad y soporte ergonómico para largas jornadas de trabajo.',
    ind: 'Ideal para profesionales dentales que buscan mejorar su postura y confort.',
    price: 2199,
    points: 250,
    img: 'images/rs05.jpg',
    category: 'Mobiliario',
    specs: ['Diseño Ergonómico', 'Duradero y Fácil de Limpiar', 'Múltiples pOciones de Color Disponibles'],
    stock: true, 
    colors: AVAILABLE_COLORS
  },
  // Generating placeholders for bulk catalog
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: 1000 + i,
    title: `Producto Dental Pro ${i + 1}`,
    desc: 'Equipo de alta gama para procedimientos avanzados.',
    ben: 'Mejora la eficiencia y precisión en tratamientos dentales.',
    ind: 'Ideal para clínicas dentales que buscan tecnología de punta.',
    price: 500 + (i * 150),
    points: 100,
    colors: AVAILABLE_COLORS,
    img: `https://picsum.photos/400/400?random=${100 + i}`,
    category: ['Cirugía', 'Imágenes', 'Restauración', 'Mobiliario'][i % 4],
    specs: ['Certificación ISO', 'Garantía Extendida', 'Soporte 24/7'],
    stock: i % 3 !== 0
  }))
];
export const CATALOG_PRODUCTS: Product[] = [
  { 
    id: 101, 
    title: 'Kit de Limas Rotatorias Premium', 
    desc: 'Set de 6 limas de níquel-titanio para endodoncia avanzada, con recubrimiento anticorrosión y precisión quirúrgica. Ideal para profesionales.',
    ben: 'Alta resistencia y flexibilidad para tratamientos seguros.',
    ind: 'Apto para una amplia gama de procedimientos endodónticos.',
    price: 150, 
    points: 250, 
    img: 'images/limas.jpg', 
    category: 'Accesorios Endodoncia', 
    specs: ['6 limas incluidas', 'Precisión 0.02mm', 'Garantía 1 año'], 
    stock: true,
    colors: AVAILABLE_COLORS 
  },
  { 
    id: 102, 
    title: 'Lupa Dental LED 3.5x', 
    desc: 'Lupa quirúrgica con iluminación LED integrada y aumento 3.5x. Ajustable y ligera para comodidad durante horas de trabajo.',
    ben: 'Mejora la visibilidad y precisión en procedimientos dentales.',
    ind: 'Ideal para cirujanos dentales y especialistas en endodoncia.',
    price: 320, 
    points: 450, 
    img: 'images/lupas.jpg', 
    category: 'Visión Asistida', 
    specs: ['LED 5000K', 'Ajuste de distancia', 'Peso 25g'], 
    stock: true, 
    colors: AVAILABLE_COLORS
  },
  { 
    id: 103, 
    title: 'Jeringa de Irrigación Desechable (Pack 50)', 
    desc: 'Jeringas de irrigación estériles de 5ml para procedimientos endodónticos. Paquete de 50 unidades para higiene óptima.',
    ben: 'Diseño ergonómico para un manejo cómodo y seguro.',
    ind: 'Perfectas para irrigación durante tratamientos de conducto radicular.',
    price: 45, 
    points: 80, 
    img: 'images/jeringas.jpg', 
    category: 'Irrigación', 
    specs: ['Estéril', '5ml', 'Agujas Luer Lock'], 
    stock: true, 
    colors: AVAILABLE_COLORS
  },
  { 
    id: 104, 
    title: 'Caja de Matrices Transparentes (200u)', 
    desc: 'Matrices transparentes de silicona para restauraciones directas. Pack de 200 para prácticas de alto volumen.',
    ben: 'Flexibles y adaptables para un sellado perfecto.',
    ind: 'Ideales para restauraciones compuestas en dientes anteriores y posteriores.',
    price: 80, 
    points: 120, 
    img: 'images/matriz.jpg', 
    category: 'Restauración', 
    specs: ['Tamaños variados', 'Reutilizables', 'No tóxicas'], 
    stock: true, 
    colors: AVAILABLE_COLORS
  },
  { 
    id: 105, 
    title: 'Escalador Ultrassónico Pieza de Mano', 
    desc: 'Pieza de mano para escalador ultrasónico con vibración piezoeléctrica. Compatible con la mayoría de unidades.',
    ben: 'Eficaz para la eliminación de sarro y placa con mínima incomodidad.',
    ind: 'Adecuada para procedimientos de limpieza dental y mantenimiento periodontal.',
    price: 280, 
    points: 400, 
    img: 'images/escalador.avif', 
    category: 'Ultrasonido', 
    specs: ['30kHz', 'Pieza ergonómica', 'Cable 2m'], 
    stock: true, 
    colors: AVAILABLE_COLORS
  },
  { 
    id: 106, 
    title: 'Compresor de Aire Portátil 1L', 
    desc: 'Compresor dental portátil de 1 litro para clínicas móviles. Silencioso y compacto para uso diario.',
    ben:  'Eficiente y fácil de transportar para procedimientos en cualquier lugar.',
    ind: 'Ideal para clínicas dentales que requieren movilidad y flexibilidad.',
    price: 420, 
    points: 600, 
    img: 'images/compresor.jpg', 
    category: 'Equipo Auxiliar', 
    specs: ['1L tanque', 'Presión 8 bar', 'Peso 15kg'], 
    stock: true, 
    colors: AVAILABLE_COLORS 
  },
  { 
    id: 107, 
    title: 'Espátulas de Mezcla Dual (Pack 12)', 
    desc: 'Espátulas de plástico dual para mezclas precisas de composites. Pack de 12 para higiene desechable.',
    ben: 'Diseño ergonómico para una mezcla eficiente y sin esfuerzo.',
    ind: 'Perfectas para la preparación de materiales restaurativos en odontología.',
    price: 25, 
    points: 50, 
    img: 'images/espatula.jpg', 
    category: 'Instrumental', 
    specs: ['Plástico no estick', 'Tamaños variados', 'Estériles'], 
    stock: true, 
    colors: AVAILABLE_COLORS 
  },
  { 
    id: 108, 
    title: 'Lámpara LED de Fotocurado 2000mW', 
    desc: 'Lámpara de fotocurado LED con 2000mW de potencia para curado rápido. Incluye puntas de fibra óptica.',
    ben: 'Curado eficiente para restauraciones duraderas.',
    ind: 'Adecuada para todo tipo de materiales dentales fotocurables.',
    price: 210, 
    points: 350, 
    img: 'images/lamparaled.png', 
    category: 'Fotocurado', 
    specs: ['2000mW', '3 modos', 'Tiempo 1-60s'], 
    stock: true, 
    colors: AVAILABLE_COLORS 
  },
  { 
    id: 109, 
    title: 'Pinzas de Extracción Curvas', 
    desc: 'Pinzas dentales de extracción curvas en acero inoxidable. Diseño ergonómico para precisión.',
    ben: 'Alta durabilidad y resistencia a la corrosión.',
    ind: 'Ideales para extracciones dentales seguras y efectivas.',
    price: 95, 
    points: 150, 
    img: 'images/pinza.png', 
    category: 'Extracción', 
    specs: ['Acero 420', 'Curvatura 45°', 'Esterilizables'], 
    stock: true, 
    colors: AVAILABLE_COLORS 
  },
  { 
    id: 110, 
    title: 'Sistema de Succión Portátil', 
    desc: 'Succión dental portátil con filtro HEPA para clínicas. Compacto y eficiente para procedimientos.',
    ben: 'Fácil de transportar y usar en cualquier entorno clínico.',
    ind: 'Perfecto para clínicas dentales móviles y de alto volumen.',
    price: 380, 
    points: 550, 
    img: 'images/succion.jpg', 
    category: 'Succión', 
    specs: ['Flujo 200L/min', 'Filtro HEPA', 'Batería 4h'], 
    stock: true, 
    colors: AVAILABLE_COLORS
  }
];
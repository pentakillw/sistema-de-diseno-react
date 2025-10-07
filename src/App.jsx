import React, { useState, useEffect, useRef } from 'react';
import tinycolor from 'tinycolor2';
import { Sparkles, Wand2, HelpCircle, X, Check, Clipboard, Download, Upload, AlertCircle, RefreshCcw } from 'lucide-react';
import { HexColorPicker, HexColorInput } from 'react-colorful';

// --- Funciones de Utilidad de Colores (lógica interna en inglés) ---

// Función de generación de sombras corregida
const generateShades = (hex) => {
  if (!tinycolor(hex).isValid()) return Array(10).fill('#cccccc');
  const baseColor = tinycolor(hex);
  const shades = [];
  
  // Genera 4 tonos más oscuros, del más oscuro al menos oscuro
  const darkSteps = [32, 24, 16, 8];
  for (const step of darkSteps) {
      shades.push(baseColor.clone().darken(step).toHexString());
  }

  // Añade el color base en la 5ta posición (índice 4)
  shades.push(baseColor.toHexString());

  // Genera 5 tonos más claros, del menos claro al más claro
  const lightSteps = [8, 16, 24, 32, 40];
  for (const step of lightSteps) {
      shades.push(baseColor.clone().lighten(step).toHexString());
  }
  
  return shades;
};

// Función de generación de grises corregida
const generateGrayShades = (hex) => {
    if (!tinycolor(hex).isValid()) return Array(10).fill('#cccccc');
    const baseColor = tinycolor(hex);
    const shades = [];
    
    // Genera 4 tonos más oscuros, del más oscuro al menos oscuro
    const darkSteps = [32, 24, 16, 8];
    for (const step of darkSteps) {
        shades.push(baseColor.clone().darken(step).toHexString());
    }

    // Añade el color base en la 5ta posición (índice 4)
    shades.push(baseColor.toHexString());

    // Genera 5 tonos más claros, del menos claro al más claro
    const lightSteps = [8, 16, 24, 32, 40];
    for (const step of lightSteps) {
        shades.push(baseColor.clone().lighten(step).toHexString());
    }
    
    return shades;
}

const displayStylesConfig = {
  'Título Grande': { fontSize: '2rem', fontWeight: '700' },
  'Título Mediano': { fontSize: '1.75rem', fontWeight: '700' },
  'Título Pequeño': { fontSize: '1.5rem', fontWeight: '700' },
  'Cuerpo Grande Negrita': { fontSize: '1.125rem', fontWeight: '700' },
  'Cuerpo Grande': { fontSize: '1.125rem', fontWeight: '400' },
  'Cuerpo Mediano Negrita': { fontSize: '1rem', fontWeight: '700' },
  'Cuerpo Mediano': { fontSize: '1rem', fontWeight: '400' },
  'Cuerpo Pequeño': { fontSize: '0.875rem', fontWeight: '400' },
  'Subtítulo': { fontSize: '0.75rem', fontWeight: '400' },
};

const generatePowerFxCode = (themeData, separator) => {
  const { brandShades, grayShades, stylePalette, theme, brandColor, grayColor, font } = themeData;
  const formatStylePalette = (palette) => palette.map(item => `    "${item.name}": "${item.color.toUpperCase()}"`).join(`${separator}\n`);
  const fontStylesRecord = Object.entries(displayStylesConfig)
    .map(([name, styles]) => `    "${name.replace(/ /g, '')}": { Font: Font.'${font.split(' ')[0]}'${separator} Size: ${parseFloat(styles.fontSize) * 10}${separator} Bold: ${styles.fontWeight === '700'} }`)
    .join(`${separator}\n`);

  return `
// --- TEMA DE DISEÑO GENERADO ---
// Modo: ${theme === 'light' ? 'Claro' : 'Oscuro'}
// Fuente: ${font}
// Marca: ${brandColor.toUpperCase()} | Base Gris: ${grayColor.toUpperCase()}
ClearCollect(
    colSistemaDeDiseño${separator}
    {
        Marca: {
${brandShades.map((s, i) => `    t${i * 100 === 0 ? '0' : i * 100}: "${s.toUpperCase()}"`).join(`${separator}\n`)}
        }${separator}
        Gris: {
${grayShades.map((s, i) => `    t${i * 100 === 0 ? '0' : i * 100}: "${s.toUpperCase()}"`).join(`${separator}\n`)}
        }${separator}
        Fondos: {
${formatStylePalette(stylePalette.backgroundColors)}
        }${separator}
        Textos: {
${formatStylePalette(stylePalette.foregroundColors)}
        }${separator}
        Bordes: {
${formatStylePalette(stylePalette.borderColors)}
        }${separator}
        Acciones: {
${formatStylePalette(stylePalette.actionColors)}
        }${separator}
        Decorativos: {
${formatStylePalette(stylePalette.decorateColors)}
        }${separator}
        Fuentes: {
${fontStylesRecord}
        }
    }
);
  `.trim();
};


// --- Componentes ---

const ColorPalette = ({ title, color, hex, shades, onShadeCopy, themeOverride }) => (
  <div className="mb-4">
    <div className="flex items-center mb-2">
      <div className="w-10 h-10 rounded-md mr-3 border" style={{ backgroundColor: color, borderColor: themeOverride === 'light' ? '#E5E7EB' : '#4B5563' }}></div>
      <div>
        <p className={`text-sm font-medium ${themeOverride === 'light' ? 'text-gray-900' : 'text-gray-50'}`}>{title}</p>
        <p className={`text-xs font-mono ${themeOverride === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>{hex.toUpperCase()}</p>
      </div>
    </div>
    <div className="flex rounded-md overflow-hidden h-8 relative group">
      {shades.map((shade, index) => (
        <div 
            key={index} 
            className="flex-1 cursor-pointer transition-transform duration-100 ease-in-out group-hover:transform group-hover:scale-y-110 hover:!scale-125 hover:z-10" 
            style={{ backgroundColor: shade }}
            onClick={() => onShadeCopy(shade)}
            title={`Copiar ${shade.toUpperCase()}`}
        />
      ))}
    </div>
     <div className={`flex text-xs font-mono px-1 ${themeOverride === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
        {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="flex-1 text-center">T{index * 100 === 0 ? '0' : index * 100}</div>
        ))}
    </div>
  </div>
);

const StyleItem = ({ name, color, onColorCopy }) => (
  <div 
    className="flex items-center mb-2 cursor-pointer group"
    onClick={() => onColorCopy(color)}
  >
    {color && <div className="w-5 h-5 rounded-full mr-3 border" style={{ backgroundColor: color, borderColor: 'var(--border-strong)' }}></div>}
    <span className="text-sm group-hover:underline" style={{ color: 'var(--text-muted)'}}>{name}</span>
  </div>
);

const StyleCard = ({ title, children }) => (
  <div className="p-4 rounded-lg flex-1 min-w-[200px] border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)'}}>
    <h3 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text-default)'}}>{title}</h3>
    {children}
  </div>
);

const Switch = ({ checked, onCheckedChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={`${
      checked ? 'bg-[var(--action-primary-default)]' : 'bg-[var(--bg-muted)]'
    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--action-primary-default)] focus:ring-offset-2`}
  >
    <span
      aria-hidden="true"
      className={`${
        checked ? 'translate-x-5' : 'translate-x-0'
      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
    />
  </button>
);

const HelpModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="p-8 rounded-xl border max-w-2xl w-full relative" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)'}}>
            <button onClick={onClose} className="absolute top-4 right-4" style={{ color: 'var(--text-muted)'}}>
                <X size={24}/>
            </button>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-default)'}}>Guía de Uso del Sistema de Diseño</h2>
            <div className="space-y-3 text-sm" style={{ color: 'var(--text-muted)'}}>
                <p>¡Bienvenido! Esta herramienta te ayuda a crear y exportar sistemas de diseño coherentes y accesibles para tus aplicaciones.</p>
                <ol className="list-decimal list-inside space-y-2">
                    <li><strong style={{ color: 'var(--text-default)'}}>Elige un Color de Marca:</strong> Usa el selector de color o el botón "Aleatorio" para encontrar un color principal accesible.</li>
                    <li><strong style={{ color: 'var(--text-default)'}}>Ajusta la Escala de Grises:</strong> Por defecto, se genera un gris armónico. Desactiva "Gris Automático" para elegir un gris base personalizado.</li>
                    <li><strong style={{ color: 'var(--text-default)'}}>Selecciona una Fuente:</strong> Cambia la tipografía de la interfaz para ver cómo afecta al diseño general.</li>
                    <li><strong style={{ color: 'var(--text-default)'}}>Exporta e Importa Temas:</strong> Guarda tu trabajo como un archivo JSON y cárgalo más tarde para continuar donde lo dejaste.</li>
                    <li><strong style={{ color: 'var(--text-default)'}}>Copia y Exporta a Power Fx:</strong> Elige tu separador regional (`,` o `;`), haz clic en cualquier color para copiarlo o muestra y copia el código Power Fx completo.</li>
                </ol>
            </div>
        </div>
    </div>
);


// --- Componente Principal ---

const availableFonts = {
  'Poppins': '"Poppins", sans-serif',
  'Roboto Slab': '"Roboto Slab", serif',
  'Inconsolata': '"Inconsolata", monospace',
  'Playfair Display': '"Playfair Display", serif',
  'Montserrat': '"Montserrat", sans-serif',
  'Lato': '"Lato", sans-serif',
  'Courier Prime': '"Courier Prime", monospace',
  'Roboto': '"Roboto", sans-serif',
  'Open Sans': '"Open Sans", sans-serif',
  'Segoe UI': '"Segoe UI", system-ui, sans-serif',
};

const defaultState = {
    theme: 'dark',
    brandColor: '#009fdb',
    isGrayAuto: true,
    font: 'Poppins',
    fxSeparator: ';',
};

function App() {
  const [theme, setTheme] = useState(defaultState.theme);
  const [brandColor, setBrandColor] = useState(defaultState.brandColor);
  const [grayColor, setGrayColor] = useState('#5d757e');
  const [isGrayAuto, setIsGrayAuto] = useState(defaultState.isGrayAuto);
  
  const [font, setFont] = useState(defaultState.font);
  const [fxSeparator, setFxSeparator] = useState(defaultState.fxSeparator);
  
  const [brandShades, setBrandShades] = useState([]);
  const [grayShades, setGrayShades] = useState([]);
  
  const [stylePalette, setStylePalette] = useState(null);
  
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const [generatedCode, setGeneratedCode] = useState('');
  const [isCodeVisible, setIsCodeVisible] = useState(false);
  const [isBrandPickerVisible, setIsBrandPickerVisible] = useState(false);
  const [isGrayPickerVisible, setIsGrayPickerVisible] = useState(false);
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const [accessibility, setAccessibility] = useState({ btn: { ratio: 0, level: 'Fail'}, text: { ratio: 0, level: 'Fail'} });

  const [usePureWhiteBg, setUsePureWhiteBg] = useState(false);
  const [usePureBlackBg, setUsePureBlackBg] = useState(false);

  const importFileRef = useRef(null);

  useEffect(() => {
    if (isGrayAuto) {
      const harmonicGray = tinycolor(brandColor).desaturate(85).toHexString();
      setGrayColor(harmonicGray);
    }
  }, [brandColor, isGrayAuto]);

  useEffect(() => {
    const newBrandShades = generateShades(brandColor);
    const newGrayShades = generateGrayShades(grayColor);
    
    setBrandShades(newBrandShades);
    setGrayShades(newGrayShades);

    if (newBrandShades.length < 10 || newGrayShades.length < 10) return;

    // Colores semánticos base (tonos puros)
    const infoBase = '#0ea5e9'; // sky-500
    const successBase = '#22c55e'; // green-500
    const attentionBase = '#f97316'; // orange-500
    const criticalBase = '#ef4444'; // red-500

    // Mezcla los colores base con el gris del tema para crear armonía
    const info = tinycolor.mix(infoBase, grayColor, 15).saturate(10).toHexString();
    const success = tinycolor.mix(successBase, grayColor, 15).saturate(10).toHexString();
    const attention = tinycolor.mix(attentionBase, grayColor, 15).saturate(10).toHexString();
    const critical = tinycolor.mix(criticalBase, grayColor, 15).saturate(10).toHexString();

    const currentPalette = {
       backgroundColors: theme === 'dark' ? [
        { name: 'Predeterminado', color: newGrayShades[0] }, { name: 'Tarjeta', color: newGrayShades[1] },
        { name: 'Apagado', color: newGrayShades[2] }, { name: 'Sutil', color: tinycolor(newGrayShades[0]).lighten(5).toHexString() },
      ] : [
        { name: 'Predeterminado', color: newGrayShades[9] }, { name: 'Tarjeta', color: '#FFFFFF' },
        { name: 'Apagado', color: newGrayShades[8] }, { name: 'Sutil', color: newGrayShades[8] },
      ],
      foregroundColors: theme === 'dark' ? [
        { name: 'Predeterminado', color: newGrayShades[9] }, { name: 'Apagado', color: newGrayShades[6] },
        { name: 'Sutil', color: newGrayShades[4] },
      ] : [
        { name: 'Predeterminado', color: newGrayShades[0] }, { name: 'Apagado', color: newGrayShades[3] },
        { name: 'Sutil', color: newGrayShades[5] },
      ],
      borderColors: theme === 'dark' ? [
        { name: 'Predeterminado', color: newGrayShades[2] }, { name: 'Fuerte', color: newGrayShades[4] },
      ] : [
        { name: 'Predeterminado', color: newGrayShades[7] }, { name: 'Fuerte', color: newGrayShades[5] },
      ],
      actionColors: [
        { name: 'Primario', color: newBrandShades[4] }, { name: 'PrimarioFlotante', color: newBrandShades[5] },
        { name: 'Secundario', color: newGrayShades[3] }, { name: 'SecundarioFlotante', color: newGrayShades[4] },
      ],
      decorateColors: [
        { name: 'Azul1', color: info }, { name: 'Azul2', color: tinycolor(info).lighten(15).toHexString() },
        { name: 'Verde1', color: success }, { name: 'Verde2', color: tinycolor(success).lighten(15).toHexString() },
        { name: 'Neutro1', color: newGrayShades[5] }, { name: 'Neutro2', color: newGrayShades[4] },
        { name: 'Naranja1', color: attention }, { name: 'Naranja2', color: tinycolor(attention).lighten(15).toHexString() },
      ],
    };
    
    currentPalette.fullActionColors = [
        { name: 'Primario', color: newBrandShades[4] }, { name: 'PrimarioFlotante', color: newBrandShades[5] },
        { name: 'PrimarioPresionado', color: newBrandShades[6] }, { name: 'Secundario', color: newGrayShades[4] },
        { name: 'SecundarioPresionado', color: newGrayShades[5] }, { name: 'Critico', color: critical },
        { name: 'CriticoFlotante', color: tinycolor(critical).lighten(10).toHexString() }, { name: 'CriticoPresionado', color: tinycolor(critical).darken(10).toHexString() },
    ];
    currentPalette.fullBackgroundColors = theme === 'dark' ? [
        { name: 'Predeterminado', color: newGrayShades[0] }, { name: 'Apagado', color: newGrayShades[1] },
        { name: 'Debil', color: newGrayShades[2] }, { name: 'Fuerte', color: newGrayShades[9] },
        { name: 'Inverso', color: newGrayShades[9] }, { name: 'InfoDebil', color: tinycolor(info).darken(25).toHexString() },
        { name: 'CriticoDebil', color: tinycolor(critical).darken(25).toHexString() }, { name: 'AtencionDebil', color: tinycolor(attention).darken(25).toHexString() },
      ] : [
        { name: 'Predeterminado', color: '#FFFFFF' }, { name: 'Apagado', color: newGrayShades[8] },
        { name: 'Debil', color: newGrayShades[7] }, { name: 'Fuerte', color: newGrayShades[0] },
        { name: 'Inverso', color: newGrayShades[0] }, { name: 'InfoDebil', color: tinycolor(info).lighten(25).toHexString() },
        { name: 'CriticoDebil', color: tinycolor(critical).lighten(25).toHexString() }, { name: 'AtencionDebil', color: tinycolor(attention).lighten(25).toHexString() },
      ];
    currentPalette.fullForegroundColors = theme === 'dark' ? [
        { name: 'Predeterminado', color: newGrayShades[9] }, { name: 'Apagado', color: newGrayShades[6] },
        { name: 'Debil', color: newGrayShades[4] }, { name: 'Fuerte', color: newGrayShades[9] },
        { name: 'Inverso', color: newGrayShades[0] }, { name: 'Info', color: info },
        { name: 'Critico', color: critical }, { name: 'Atencion', color: attention },
        { name: 'Exito', color: success }, { name: 'SobreAccento', color: '#FFFFFF' },
      ] : [
        { name: 'Predeterminado', color: newGrayShades[0] }, { name: 'Apagado', color: newGrayShades[3] },
        { name: 'Debil', color: newGrayShades[5] }, { name: 'Fuerte', color: newGrayShades[0] },
        { name: 'Inverso', color: newGrayShades[9] }, { name: 'Info', color: info },
        { name: 'Critico', color: critical }, { name: 'Atencion', color: attention },
        { name: 'Exito', color: success }, { name: 'SobreAccento', color: '#FFFFFF' },
      ];
    currentPalette.fullBorderColors = theme === 'dark' ? [
        { name: 'Predeterminado', color: newGrayShades[2] }, { name: 'Fuerte', color: newGrayShades[4] },
        { name: 'Inverso', color: newGrayShades[0] }, { name: 'InfoFuerte', color: info },
        { name: 'CriticoFuerte', color: critical }, { name: 'AtencionFuerte', color: attention },
        { name: 'ExitoFuerte', color: success },
      ] : [
        { name: 'Predeterminado', color: newGrayShades[7] }, { name: 'Fuerte', color: newGrayShades[5] },
        { name: 'Inverso', color: newGrayShades[9] }, { name: 'InfoFuerte', color: info },
        { name: 'CriticoFuerte', color: critical }, { name: 'AtencionFuerte', color: attention },
        { name: 'ExitoFuerte', color: success },
      ];
    
    setStylePalette(currentPalette);
    
    const root = document.documentElement;
    const bgColor = currentPalette.backgroundColors.find(c=>c.name==='Predeterminado').color;
    const textColor = currentPalette.foregroundColors.find(c=>c.name==='Predeterminado').color;
    root.style.setProperty('--bg-default', bgColor);
    root.style.setProperty('--bg-card', currentPalette.backgroundColors.find(c=>c.name==='Tarjeta').color);
    root.style.setProperty('--bg-muted', currentPalette.backgroundColors.find(c=>c.name==='Apagado').color);
    root.style.setProperty('--text-default', textColor);
    root.style.setProperty('--text-muted', currentPalette.foregroundColors.find(c=>c.name==='Apagado').color);
    root.style.setProperty('--border-default', currentPalette.borderColors.find(c=>c.name==='Predeterminado').color);
    root.style.setProperty('--border-strong', currentPalette.borderColors.find(c=>c.name==='Fuerte').color);
    root.style.setProperty('--action-primary-default', currentPalette.actionColors.find(c=>c.name==='Primario').color);
    root.style.setProperty('--action-primary-hover', currentPalette.actionColors.find(c=>c.name==='PrimarioFlotante').color);
    root.style.setProperty('--action-secondary-default', currentPalette.actionColors.find(c=>c.name==='Secundario').color);
    root.style.setProperty('--action-secondary-hover', currentPalette.actionColors.find(c=>c.name==='SecundarioFlotante').color);
    
    // Chequeos de Accesibilidad
    const btnContrast = tinycolor.readability(currentPalette.actionColors.find(c=>c.name==='Primario').color, '#FFFFFF');
    const textContrast = tinycolor.readability(textColor, bgColor);
    
    let btnLevel = 'Fallido', textLevel = 'Fallido';
    if (btnContrast >= 7) btnLevel = 'AAA'; else if (btnContrast >= 4.5) btnLevel = 'AA';
    if (textContrast >= 7) textLevel = 'AAA'; else if (textContrast >= 4.5) textLevel = 'AA';

    setAccessibility({ 
        btn: { ratio: btnContrast.toFixed(2), level: btnLevel },
        text: { ratio: textContrast.toFixed(2), level: textLevel } 
    });

    setGeneratedCode(generatePowerFxCode({
        brandShades: newBrandShades,
        grayShades: newGrayShades,
        stylePalette: {
            backgroundColors: currentPalette.fullBackgroundColors,
            actionColors: currentPalette.fullActionColors,
            foregroundColors: currentPalette.fullForegroundColors,
            borderColors: currentPalette.fullBorderColors,
            decorateColors: currentPalette.decorateColors,
        },
        theme, brandColor, grayColor, font
    }, fxSeparator));

  }, [brandColor, grayColor, theme, font, fxSeparator]);
  
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: 'success' }), 3000);
  };
  
  const handleCopy = (text, message) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showNotification(message, 'success');
  };
  
  const handleRandomTheme = () => {
    let newBrandColor;
    let isAccessible = false;
    while (!isAccessible) {
        newBrandColor = tinycolor.random();
        // Aseguramos que el color aleatorio sea lo suficientemente oscuro para tener contraste con texto blanco
        if (newBrandColor.isDark() && tinycolor.readability('#FFF', newBrandColor) > 4.5) {
             isAccessible = true;
        }
    }
    setIsGrayAuto(true);
    setBrandColor(newBrandColor.toHexString());
  };

  const handleExport = () => {
    const themeData = { brandColor, grayColor, font, theme, isGrayAuto, fxSeparator };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(themeData, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "mi-tema-de-diseno.json";
    link.click();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedTheme = JSON.parse(e.target.result);
          if (importedTheme.brandColor && importedTheme.font) {
            setBrandColor(importedTheme.brandColor);
            setGrayColor(importedTheme.grayColor);
            setFont(importedTheme.font);
            setTheme(importedTheme.theme);
            setIsGrayAuto(importedTheme.isGrayAuto);
            setFxSeparator(importedTheme.fxSeparator || ';');
            showNotification('¡Tema importado con éxito!');
          } else {
            showNotification('Archivo de tema inválido.', 'error');
          }
        } catch (error) {
          console.error("Error al leer el archivo de tema:", error);
          showNotification('Error al leer el archivo de tema.', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    setTheme(defaultState.theme);
    setBrandColor(defaultState.brandColor);
    setIsGrayAuto(defaultState.isGrayAuto);
    setFont(defaultState.font);
    setFxSeparator(defaultState.fxSeparator);
    showNotification("Tema reiniciado a los valores por defecto.");
  };
  
  if (!stylePalette) {
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white font-segoe">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
            <p className="mt-4 text-lg">Generando sistema de diseño...</p>
        </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 sm:p-8 transition-colors duration-300`} style={{ fontFamily: availableFonts[font], backgroundColor: 'var(--bg-default)', color: 'var(--text-default)'}}>
      <style>{`
        .react-colorful {
          width: 100%;
          height: 150px;
          border-radius: 8px;
          border: 1px solid var(--border-default);
          background-color: var(--bg-card);
        }
        .react-colorful__saturation {
          border-radius: 8px 8px 0 0;
        }
        .react-colorful__hue, .react-colorful__alpha {
          height: 20px;
          border-radius: 0 0 8px 8px;
        }
        .react-colorful__pointer {
          width: 20px;
          height: 20px;
        }
      `}</style>
      
      {isHelpVisible && <HelpModal onClose={() => setIsHelpVisible(false)} />}
      
      <header className="relative flex justify-center items-center mb-8">
        <div className="absolute left-0 font-bold text-lg" style={{ color: 'var(--text-default)'}}>
          <span style={{ color: 'var(--action-primary-default)'}}>Mi</span>Sistema
        </div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-default)'}}>
          Sistema de diseño
        </h1>
        <div className="absolute right-0 flex items-center gap-2">
            <input type="file" ref={importFileRef} onChange={handleImport} accept=".json" className="hidden"/>
            <button title="Reiniciar Tema" onClick={handleReset} className="text-sm font-medium p-2 rounded-lg" style={{ backgroundColor: 'var(--action-secondary-default)', color: 'var(--text-default)'}}><RefreshCcw size={16}/></button>
            <button title="Importar Tema" onClick={() => importFileRef.current.click()} className="text-sm font-medium p-2 rounded-lg" style={{ backgroundColor: 'var(--action-secondary-default)', color: 'var(--text-default)'}}><Upload size={16}/></button>
            <button title="Exportar Tema" onClick={handleExport} className="text-sm font-medium p-2 rounded-lg" style={{ backgroundColor: 'var(--action-secondary-default)', color: 'var(--text-default)'}}><Download size={16}/></button>
            <button title="Ayuda" onClick={() => setIsHelpVisible(true)} className="text-sm font-medium p-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--action-secondary-default)', color: 'var(--text-default)'}}><HelpCircle size={16}/></button>
        </div>
      </header>

      <main>
        <section className="p-6 rounded-xl border mb-8" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)'}}>
          <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--text-default)'}}>Vista Previa de Componentes</h2>
          <div className="flex flex-wrap items-center gap-6">
              <div className="flex-1 space-y-4 min-w-[200px]">
                  <button className="w-full text-white font-bold py-2 px-4 rounded-lg transition-colors"
                      style={{ backgroundColor: 'var(--action-primary-default)'}}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--action-primary-hover)'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--action-primary-default)'}>
                      Botón Primario
                  </button>
                  <button className="w-full font-bold py-2 px-4 rounded-lg transition-colors"
                      style={{ backgroundColor: 'var(--action-secondary-default)', color: 'var(--text-default)', border: '1px solid var(--border-strong)'}}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--action-secondary-hover)'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--action-secondary-default)'}>
                      Botón Secundario
                  </button>
              </div>
              <div className="flex-1 p-4 rounded-lg border min-w-[250px] space-y-2" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-strong)'}}>
                  <h3 className="font-bold mb-2" style={{ color: 'var(--text-default)'}}>Chequeo de Accesibilidad</h3>
                   <div className="flex items-center gap-2">
                    <span className="text-xs font-bold p-1 rounded w-12 text-center" style={{
                      backgroundColor: accessibility.btn.level === 'Fallido' ? '#fecaca' : '#bbf7d0',
                      color: accessibility.btn.level === 'Fallido' ? '#991b1b' : '#166534'
                    }}>{accessibility.btn.level}</span>
                    <span className="text-sm" style={{ color: 'var(--text-muted)'}}>Botón ({accessibility.btn.ratio}:1)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold p-1 rounded w-12 text-center" style={{
                      backgroundColor: accessibility.text.level === 'Fallido' ? '#fecaca' : '#bbf7d0',
                      color: accessibility.text.level === 'Fallido' ? '#991b1b' : '#166534'
                    }}>{accessibility.text.level}</span>
                    <span className="text-sm" style={{ color: 'var(--text-muted)'}}>Texto ({accessibility.text.ratio}:1)</span>
                  </div>
              </div>
          </div>
        </section>

        <section className="space-y-6 mb-8">
           <div 
             className="p-6 rounded-xl border" 
             style={{ backgroundColor: usePureWhiteBg ? '#FFFFFF' : grayShades[9], borderColor: grayShades[7] }}
           >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-900">Modo Claro</h2>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-600">Fondo Blanco Puro</label>
                <Switch checked={usePureWhiteBg} onCheckedChange={setUsePureWhiteBg} />
              </div>
            </div>
            <ColorPalette title="Color de Marca" color={brandColor} hex={brandColor} shades={brandShades} onShadeCopy={(color) => handleCopy(color, `Tono ${color.toUpperCase()} copiado!`)} themeOverride="light"/>
            <ColorPalette title="Escala de Grises" color={grayColor} hex={grayColor} shades={grayShades} onShadeCopy={(color) => handleCopy(color, `Tono ${color.toUpperCase()} copiado!`)} themeOverride="light"/>
          </div>
           <div 
             className="p-6 rounded-xl border" 
             style={{ backgroundColor: usePureBlackBg ? '#000000' : grayShades[0], borderColor: grayShades[2] }}
           >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-white">Modo Oscuro</h2>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-300">Fondo Negro Puro</label>
                <Switch checked={usePureBlackBg} onCheckedChange={setUsePureBlackBg} />
              </div>
            </div>
            <ColorPalette title="Color de Marca" color={brandColor} hex={brandColor} shades={brandShades} onShadeCopy={(color) => handleCopy(color, `Tono ${color.toUpperCase()} copiado!`)} themeOverride="dark"/>
            <ColorPalette title="Escala de Grises" color={grayColor} hex={grayColor} shades={grayShades} onShadeCopy={(color) => handleCopy(color, `Tono ${color.toUpperCase()} copiado!`)} themeOverride="dark"/>
          </div>
        </section>

        <section className="p-4 rounded-xl mb-8 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)'}}>
            <div className="flex flex-wrap justify-between items-center mb-2 gap-4">
                <h3 className="font-bold text-lg" style={{ color: 'var(--text-default)'}}>Código Power Fx</h3>
                <div className='flex items-center gap-4'>
                  <div className="flex items-center gap-2">
                    <label className="text-sm" style={{ color: 'var(--text-muted)'}} htmlFor="fxSeparator">Separador:</label>
                    <select
                        id="fxSeparator"
                        value={fxSeparator}
                        onChange={(e) => setFxSeparator(e.target.value)}
                        className="font-semibold px-2 py-1 rounded-md border"
                        style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)', borderColor: 'var(--border-default)'}}
                    >
                        <option value=";">;</option>
                        <option value=",">,</option>
                        <option value=";;">;;</option>
                    </select>
                  </div>
                  <button
                      onClick={() => setIsCodeVisible(!isCodeVisible)}
                      className="text-sm font-medium py-1 px-3 rounded-lg transition-colors"
                      style={{ backgroundColor: 'var(--action-secondary-default)', color: 'var(--text-default)'}}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--action-secondary-hover)'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--action-secondary-default)'}
                  >
                      {isCodeVisible ? 'Ocultar' : 'Mostrar'} Código
                  </button>
                </div>
            </div>
            {isCodeVisible && (
                <div className="relative mt-4">
                    <pre className="font-mono text-sm whitespace-pre-wrap break-all p-4 rounded-md max-h-96 overflow-auto" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)'}}>
                        <code>{generatedCode}</code>
                    </pre>
                    <button
                        onClick={() => handleCopy(generatedCode, '¡Código Power Fx copiado!')}
                        className="absolute top-3 right-3 text-sm font-medium p-2 rounded-lg text-white transition-colors"
                        style={{ backgroundColor: 'var(--action-primary-default)'}}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--action-primary-hover)'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--action-primary-default)'}
                    >
                        <Clipboard size={16}/>
                    </button>
                </div>
            )}
        </section>

        <section className="p-4 rounded-xl mb-8 flex flex-wrap items-center justify-around gap-4 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)'}}>
           <div className="flex items-center gap-2">
            <label className="text-sm" style={{ color: 'var(--text-muted)'}} htmlFor="fontSelector">Fuente:</label>
            <select
                id="fontSelector"
                value={font}
                onChange={(e) => setFont(e.target.value)}
                className="font-semibold px-2 py-1 rounded-md border"
                style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)', borderColor: 'var(--border-default)'}}
            >
                {Object.keys(availableFonts).map(fontName => (
                    <option key={fontName} value={fontName}>{fontName}</option>
                ))}
            </select>
          </div>
          <div className="relative flex items-center gap-2">
            <label className="text-sm" style={{ color: 'var(--text-muted)'}}>Color de Marca:</label>
            <div className="flex items-center rounded-md" style={{ backgroundColor: 'var(--bg-muted)'}}>
                <div
                    className="w-7 h-7 rounded-l-md cursor-pointer border-r"
                    style={{ backgroundColor: brandColor, borderColor: 'var(--border-strong)' }}
                    onClick={() => setIsBrandPickerVisible(!isBrandPickerVisible)}
                />
                 <HexColorInput 
                    color={brandColor} 
                    onChange={setBrandColor}
                    className="font-mono bg-transparent px-2 py-1 rounded-r-md w-24 focus:outline-none"
                    style={{ color: 'var(--text-default)'}}
                    prefixed
                />
            </div>
            {isBrandPickerVisible && (
                <div className="absolute z-10 top-full mt-2 left-0 w-56">
                    <div className="fixed inset-0" onClick={() => setIsBrandPickerVisible(false)} />
                    <HexColorPicker color={brandColor} onChange={setBrandColor} />
                </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
                <Wand2 size={16} style={{ color: 'var(--text-muted)'}}/>
                <label className="text-sm font-medium" style={{ color: 'var(--text-muted)'}}>Gris Automático</label>
            </div>
            <Switch checked={isGrayAuto} onCheckedChange={setIsGrayAuto} />
          </div>
          <div className={`relative flex items-center gap-2 transition-opacity ${isGrayAuto ? 'opacity-50' : 'opacity-100'}`}>
            <label className="text-sm" style={{ color: 'var(--text-muted)'}}>Escala de Grises:</label>
            <div className="flex items-center rounded-md" style={{ backgroundColor: 'var(--bg-muted)'}}>
                <div
                    className={`w-7 h-7 rounded-l-md border-r ${isGrayAuto ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{ backgroundColor: grayColor, borderColor: 'var(--border-strong)' }}
                    onClick={() => !isGrayAuto && setIsGrayPickerVisible(!isGrayPickerVisible)}
                />
                 <HexColorInput 
                    color={grayColor} 
                    onChange={setGrayColor}
                    className="font-mono bg-transparent px-2 py-1 rounded-r-md w-24 focus:outline-none"
                    style={{ color: 'var(--text-default)'}}
                    prefixed
                    disabled={isGrayAuto}
                />
            </div>
            {isGrayPickerVisible && !isGrayAuto && (
                <div className="absolute z-10 top-full mt-2 right-0 w-56">
                    <div className="fixed inset-0" onClick={() => setIsGrayPickerVisible(false)} />
                    <HexColorPicker color={grayColor} onChange={setGrayColor} />
                </div>
            )}
          </div>
           <button 
                onClick={handleRandomTheme}
                className="text-sm font-medium py-2 px-4 rounded-lg transition-colors text-white hover:opacity-90 flex items-center gap-2"
                style={{ background: 'linear-gradient(to right, var(--action-primary-default), #e11d48)'}}
              >
                <Sparkles size={16} /> Aleatorio
            </button>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setTheme('light')}
                className={`text-sm font-medium py-2 px-4 rounded-lg transition-colors`}
                style={{ 
                    backgroundColor: theme === 'light' ? 'var(--action-primary-default)' : 'var(--action-secondary-default)',
                    color: theme === 'light' ? 'white' : 'var(--text-default)'
                }}
              >
                Modo Claro
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`text-sm font-medium py-2 px-4 rounded-lg transition-colors`}
                style={{ 
                    backgroundColor: theme === 'dark' ? 'var(--action-primary-default)' : 'var(--action-secondary-default)',
                    color: theme === 'dark' ? 'white' : 'var(--text-default)'
                }}
              >
                Modo Oscuro
              </button>
            </div>
        </section>
        
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
           <StyleCard title="Tipografía">
            {Object.entries(displayStylesConfig).map(([name, styles]) => (
              <div key={name} className="mb-2 truncate">
                  <span style={{ fontSize: styles.fontSize, fontWeight: styles.fontWeight, color: 'var(--text-muted)' }}>{name}</span>
              </div>
            ))}
          </StyleCard>
          <StyleCard title="Fondos">{stylePalette.fullBackgroundColors.map(item => <StyleItem key={item.name} name={item.name} color={item.color} onColorCopy={(color) => handleCopy(color, `Color ${color.toUpperCase()} copiado!`)} />)}</StyleCard>
          <StyleCard title="Textos">{stylePalette.fullForegroundColors.map(item => <StyleItem key={item.name} name={item.name} color={item.color} onColorCopy={(color) => handleCopy(color, `Color ${color.toUpperCase()} copiado!`)} />)}</StyleCard>
          <StyleCard title="Bordes">{stylePalette.fullBorderColors.map(item => <StyleItem key={item.name} name={item.name} color={item.color} onColorCopy={(color) => handleCopy(color, `Color ${color.toUpperCase()} copiado!`)} />)}</StyleCard>
          <StyleCard title="Acciones">{stylePalette.fullActionColors.map(item => <StyleItem key={item.name} name={item.name} color={item.color} onColorCopy={(color) => handleCopy(color, `Color ${color.toUpperCase()} copiado!`)} />)}</StyleCard>
          <StyleCard title="Decorativos">{stylePalette.decorateColors.map(item => <StyleItem key={item.name} name={item.name} color={item.color} onColorCopy={(color) => handleCopy(color, `Color ${color.toUpperCase()} copiado!`)} />)}</StyleCard>
        </section>
      </main>

      <footer className="text-center mt-12 pt-8 border-t" style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)'}}>
        <p className="text-sm">Creado por JD_DM.</p>
        <p className="text-xs mt-1">Un proyecto de código abierto para la comunidad de Power Apps.</p>
      </footer>

      {notification.message && (
        <div 
          className="fixed bottom-5 right-5 text-white text-sm font-bold py-2 px-4 rounded-lg shadow-lg flex items-center gap-2" 
          style={{ backgroundColor: notification.type === 'error' ? '#EF4444' : '#10B981'}}
        >
          {notification.type === 'error' ? <AlertCircle size={16}/> : <Check size={16}/>} 
          {notification.message}
        </div>
      )}
    </div>
  );
}

export default App;


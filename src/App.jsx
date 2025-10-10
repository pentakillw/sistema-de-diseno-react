import React, { useState, useEffect, useRef } from 'react';
import tinycolor from 'tinycolor2';
import { Sparkles, Wand2, HelpCircle, X, Check, Clipboard, Download, Upload, AlertCircle, RefreshCcw, FileCode, Eye, Palette, Settings, Info, CheckCircle, AlertTriangle, Sun, Moon } from 'lucide-react';
import { HexColorPicker, HexColorInput } from 'react-colorful';

// --- Funciones de Utilidad de Colores (lógica interna en inglés) ---

const generateShades = (hex) => {
  if (!tinycolor(hex).isValid()) return Array(10).fill('#cccccc');
  const baseColor = tinycolor(hex);
  const shades = [];
  const darkSteps = [32, 24, 16, 8];
  for (const step of darkSteps) {
      shades.push(baseColor.clone().darken(step).toHexString());
  }
  shades.push(baseColor.toHexString());
  const lightSteps = [8, 16, 24, 32, 40];
  for (const step of lightSteps) {
      shades.push(baseColor.clone().lighten(step).toHexString());
  }
  return shades;
};

const generateGrayShades = (hex) => {
    if (!tinycolor(hex).isValid()) return Array(10).fill('#cccccc');
    const baseColor = tinycolor(hex);
    const shades = [];
    const darkSteps = [32, 24, 16, 8];
    for (const step of darkSteps) {
        shades.push(baseColor.clone().darken(step).toHexString());
    }
    shades.push(baseColor.toHexString());
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

// --- Funciones de Generación de Código ---

const generatePowerFxCode = (themeData, separator, useQuotes) => {
  const { brandShades, grayShades, stylePalette, theme, brandColor, grayColor, font, harmonyPalettes } = themeData;
  
  const formatKey = (key) => {
      if (useQuotes) return `"${key}"`;
      return key.replace(/ /g, '');
  };

  const formatStylePalette = (palette) => palette.map(item => `    ${formatKey(item.name)}: "${item.color.toUpperCase()}"`).join(`${separator}\n`);
  
  const fontStylesRecord = Object.entries(displayStylesConfig)
    .map(([name, styles]) => `    ${formatKey(name)}: { Font: Font.'${font.split(',')[0].replace(/"/g, '')}'${separator} Size: ${Math.round(parseFloat(styles.fontSize) * 10)}${separator} Bold: ${styles.fontWeight === '700'} }`)
    .join(`${separator}\n`);

  return `
// --- TEMA DE DISEÑO PARA POWER APPS ---
// Generado por Sistema FX
//
// CÓMO USAR:
// 1. Copia todo este código.
// 2. En Power Apps, ve a la propiedad 'OnStart' de la App.
// 3. Pega el código. Esto creará la colección 'colSistemaDeDiseño'.
//
// EJEMPLOS DE APLICACIÓN:
// - Color de un botón: LookUp(colSistemaDeDiseño, true).Acciones.Primario
// - Tamaño de fuente de una etiqueta: LookUp(colSistemaDeDiseño, true).Fuentes.'TítuloGrande'.Size
// - Familia de fuente: LookUp(colSistemaDeDiseño, true).Fuentes.'TítuloGrande'.Font
// -------------------------------------------

ClearCollect(
    colSistemaDeDiseño${separator}
    {
        Marca: {
${brandShades.map((s, i) => `    ${formatKey('t' + (i * 100))}: "${s.toUpperCase()}"`).join(`${separator}\n`)}
        }${separator}
        Gris: {
${grayShades.map((s, i) => `    ${formatKey('t' + (i * 100))}: "${s.toUpperCase()}"`).join(`${separator}\n`)}
        }${separator}
        Acento: {
${harmonyPalettes.accentShades.map((s, i) => `    ${formatKey('t' + (i * 100))}: "${s.toUpperCase()}"`).join(`${separator}\n`)}
        }${separator}
        GrisArmonico: {
${harmonyPalettes.grayShades.map((s, i) => `    ${formatKey('t' + (i * 100))}: "${s.toUpperCase()}"`).join(`${separator}\n`)}
        }${separator}
        Fondos: {
${formatStylePalette(stylePalette.fullBackgroundColors)}
        }${separator}
        Textos: {
${formatStylePalette(stylePalette.fullForegroundColors)}
        }${separator}
        Bordes: {
${formatStylePalette(stylePalette.fullBorderColors)}
        }${separator}
        Acciones: {
${formatStylePalette(stylePalette.fullActionColors)}
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

const generateCssCode = (themeData) => {
  const { brandShades, grayShades, stylePalette, theme } = themeData;

  const formatShades = (shades, prefix) => 
    shades.map((s, i) => `    --${prefix}-t${i * 100}: ${s.toUpperCase()};`).join('\n');
  
  const formatPalette = (palette, prefix) =>
    palette.map(item => `    --${prefix}-${item.name.toLowerCase().replace(/ /g, '-')}: ${item.color.toUpperCase()};`).join('\n');

  return `
/* --- TEMA DE DISEÑO GENERADO --- */
/* Modo: ${theme === 'light' ? 'Claro' : 'Oscuro'} */

:root {
    /* --- Colores de Marca --- */
${formatShades(brandShades, 'brand')}

    /* --- Escala de Grises --- */
${formatShades(grayShades, 'gray')}

    /* --- Fondos --- */
${formatPalette(stylePalette.fullBackgroundColors, 'bg')}

    /* --- Textos --- */
${formatPalette(stylePalette.fullForegroundColors, 'text')}

    /* --- Bordes --- */
${formatPalette(stylePalette.fullBorderColors, 'border')}

    /* --- Acciones --- */
${formatPalette(stylePalette.fullActionColors, 'action')}

    /* --- Decorativos --- */
${formatPalette(stylePalette.decorateColors, 'deco')}
}
  `.trim();
};

const generateTailwindCode = (themeData) => {
    const { brandShades, grayShades } = themeData;
    const formatShades = (shades) => {
    let shadeObject = '';
    shades.forEach((s, i) => {
        shadeObject += `          '${i * 100}': '${s.toUpperCase()}',\n`;
    });
    return shadeObject.slice(0, -2);
    };

    return `
// In your tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
${formatShades(brandShades)}
        },
        gray: {
${formatShades(grayShades)}
        }
      }
    }
  }
};
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
     <div className={`flex text-xs font-mono px-1 relative pt-2 mt-1 ${themeOverride === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
        <div 
          className="absolute top-0 w-0 h-0 drop-shadow-md"
          style={{
            left: 'calc(45% - 7px)',
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
            borderTop: `10px solid ${themeOverride === 'light' ? '#374151' : '#D1D5DB'}`
          }}
          title="Color Base"
        ></div>
        {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="flex-1 text-center">T{index * 100}</div>
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
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-default)'}}>Guía Rápida para Tu Sistema de Diseño</h2>
            <div className="space-y-4 text-sm" style={{ color: 'var(--text-muted)'}}>
                <p>¡Hola! Con esta herramienta, crearás una paleta de colores profesional en segundos. Sigue estos 4 pasos:</p>
                <div className="space-y-3">
                    <h3 className="font-semibold" style={{ color: 'var(--text-default)'}}>1. Elige tu Color Principal</h3>
                    <p>Usa el selector de <strong>Color de Marca</strong> para elegir tu color base. ¿No tienes uno? Presiona el botón <strong>Aleatorio ✨</strong> para descubrir colores geniales que funcionan bien.</p>
                </div>
                 <div className="space-y-3">
                    <h3 className="font-semibold" style={{ color: 'var(--text-default)'}}>2. Ajusta y Personaliza</h3>
                    <p>Activa <strong>Gris Automático 🤖</strong> para que la herramienta elija la mejor escala de grises por ti. Selecciona la <strong>Fuente</strong> que más te guste y cambia entre <strong>Modo Claro y Oscuro</strong> para previsualizar.</p>
                </div>
                 <div className="space-y-3">
                    <h3 className="font-semibold" style={{ color: 'var(--text-default)'}}>3. Guarda y Carga tus Temas</h3>
                    <p>Usa los botones de <strong>Exportar 💾</strong> para guardar tu diseño actual en un archivo. ¿Quieres continuar con un diseño guardado? Usa <strong>Importar 📂</strong> para cargarlo.</p>
                </div>
                 <div className="space-y-3">
                    <h3 className="font-semibold" style={{ color: 'var(--text-default)'}}>4. Exporta tu Código</h3>
                    <p>En la sección <strong>Opciones de Exportación</strong>, elige el formato que necesitas (Power Fx, CSS, o Tailwind), copia el código y pégalo directamente en tu proyecto. ¡Listo!</p>
                </div>
            </div>
        </div>
    </div>
);

// --- Componente de Botones Flotantes ---
const FloatingActionButtons = ({ onRandomClick, onThemeToggle, currentTheme }) => (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
      <button
        onClick={onRandomClick}
        className="h-14 w-14 rounded-full text-white flex items-center justify-center shadow-lg transform transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
        style={{ background: 'linear-gradient(to right, var(--action-primary-default), #e11d48)' }}
        title="Generar Tema Aleatorio"
      >
        <Sparkles size={24} />
      </button>
      <button
        onClick={onThemeToggle}
        className="h-14 w-14 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
        style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-default)', border: '1px solid var(--border-default)' }}
        title={currentTheme === 'light' ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro'}
      >
        {currentTheme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
      </button>
    </div>
);

// --- Componente Principal ---

const availableFonts = {
  'Segoe UI': '"Segoe UI", system-ui, sans-serif',
  'Poppins': '"Poppins", sans-serif',
  'Roboto Slab': '"Roboto Slab", serif',
  'Inconsolata': '"Inconsolata", monospace',
  'Playfair Display': '"Playfair Display", serif',
  'Montserrat': '"Montserrat", sans-serif',
  'Lato': '"Lato", sans-serif',
};

const defaultState = {
    theme: 'light',
    brandColor: '#009fdb',
    isGrayAuto: false,
    grayColor: '#5d5d5d',
    font: 'Segoe UI',
    fxSeparator: ';',
    useFxQuotes: true,
    usePureWhiteBg: true,
};

function App() {
  const [theme, setTheme] = useState(defaultState.theme);
  const [brandColor, setBrandColor] = useState(defaultState.brandColor);
  const [grayColor, setGrayColor] = useState(defaultState.grayColor);
  const [isGrayAuto, setIsGrayAuto] = useState(defaultState.isGrayAuto);
  
  const [font, setFont] = useState(defaultState.font);
  const [fxSeparator, setFxSeparator] = useState(defaultState.fxSeparator);
  const [useFxQuotes, setUseFxQuotes] = useState(defaultState.useFxQuotes);
  
  const [brandShades, setBrandShades] = useState([]);
  const [grayShades, setGrayShades] = useState([]);
  
  const [stylePalette, setStylePalette] = useState(null);
  const [harmonies, setHarmonies] = useState(null);
  const [harmonyMode, setHarmonyMode] = useState('complementary');
  const [harmonyPalettes, setHarmonyPalettes] = useState(null);
  
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const [generatedCode, setGeneratedCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [tailwindCode, setTailwindCode] = useState('');
  
  const [isExportVisible, setIsExportVisible] = useState(false);
  const [isComponentPreviewVisible, setIsComponentPreviewVisible] = useState(true);
  const [activeExport, setActiveExport] = useState('powerfx');

  const [isBrandPickerVisible, setIsBrandPickerVisible] = useState(false);
  const [isGrayPickerVisible, setIsGrayPickerVisible] = useState(false);
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const [accessibility, setAccessibility] = useState({ btn: { ratio: 0, level: 'Fail'}, text: { ratio: 0, level: 'Fail'} });

  const [usePureWhiteBg, setUsePureWhiteBg] = useState(defaultState.usePureWhiteBg);
  const [usePureBlackBg, setUsePureBlackBg] = useState(false);
  const [simulationMode, setSimulationMode] = useState('none');

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

    const baseTinyColor = tinycolor(brandColor);
    const newHarmonies = {
        complementary: [baseTinyColor.toHexString(), baseTinyColor.complement().toHexString()],
        analogous: baseTinyColor.analogous().map(c => c.toHexString()),
        triadic: baseTinyColor.triad().map(c => c.toHexString()),
    };
    setHarmonies(newHarmonies);

    let accentColor;
    switch (harmonyMode) {
        case 'analogous': accentColor = newHarmonies.analogous[1]; break;
        case 'triadic': accentColor = newHarmonies.triadic[1]; break;
        case 'complementary':
        default:
             accentColor = newHarmonies.complementary[1]; break;
    }
    const harmonyAccentShades = generateShades(accentColor);
    const harmonyGray = tinycolor(accentColor).desaturate(85).toHexString();
    const harmonyGrayShades = generateGrayShades(harmonyGray);
    const newHarmonyPalettes = {
        accentColor: accentColor,
        accentShades: harmonyAccentShades,
        gray: harmonyGray,
        grayShades: harmonyGrayShades
    };
    setHarmonyPalettes(newHarmonyPalettes);


    const infoBase = '#0ea5e9', successBase = '#22c55e', attentionBase = '#f97316', criticalBase = '#ef4444',
          purpleBase = '#a855f7', tealBase = '#14b8a6', pinkBase = '#ec4899';

    const info = tinycolor.mix(infoBase, grayColor, 15).saturate(10).toHexString(),
          success = tinycolor.mix(successBase, grayColor, 15).saturate(10).toHexString(),
          attention = tinycolor.mix(attentionBase, grayColor, 15).saturate(10).toHexString(),
          critical = tinycolor.mix(criticalBase, grayColor, 15).saturate(10).toHexString(),
          purple = tinycolor.mix(purpleBase, grayColor, 15).saturate(10).toHexString(),
          teal = tinycolor.mix(tealBase, grayColor, 15).saturate(10).toHexString(),
          pink = tinycolor.mix(pinkBase, grayColor, 15).saturate(10).toHexString();

    const currentPalette = {
      decorateColors: [
        { name: 'Azul1', color: info }, { name: 'Azul2', color: tinycolor(info).lighten(15).toHexString() },
        { name: 'Verde1', color: success }, { name: 'Verde2', color: tinycolor(success).lighten(15).toHexString() },
        { name: 'Neutro1', color: newGrayShades[5] }, { name: 'Neutro2', color: newGrayShades[4] },
        { name: 'Naranja1', color: attention }, { name: 'Naranja2', color: tinycolor(attention).lighten(15).toHexString() },
        { name: 'Violeta1', color: purple }, { name: 'Violeta2', color: tinycolor(purple).lighten(15).toHexString() },
        { name: 'Turquesa1', color: teal }, { name: 'Turquesa2', color: tinycolor(teal).lighten(15).toHexString() },
        { name: 'Rosa1', color: pink }, { name: 'Rosa2', color: tinycolor(pink).lighten(15).toHexString() },
      ],
      fullActionColors: [
        { name: 'Primario', color: newBrandShades[4] }, { name: 'PrimarioFlotante', color: newBrandShades[5] },
        { name: 'PrimarioPresionado', color: newBrandShades[6] }, { name: 'Secundario', color: newGrayShades[4] },
        { name: 'SecundarioPresionado', color: newGrayShades[5] }, { name: 'Critico', color: critical },
        { name: 'CriticoFlotante', color: tinycolor(critical).lighten(10).toHexString() }, { name: 'CriticoPresionado', color: tinycolor(critical).darken(10).toHexString() },
      ],
    };
    
    if (theme === 'dark') {
      currentPalette.fullBackgroundColors = [
        { name: 'Predeterminado', color: newGrayShades[0] }, { name: 'Apagado', color: newGrayShades[1] },
        { name: 'Debil', color: newGrayShades[2] }, { name: 'Fuerte', color: newGrayShades[9] },
        { name: 'Inverso', color: newGrayShades[9] }, { name: 'MarcaDebil', color: newBrandShades[1] },
        { name: 'InfoDebil', color: tinycolor(info).darken(25).toHexString() },
        { name: 'ExitoDebil', color: tinycolor(success).darken(25).toHexString() },
        { name: 'AtencionDebil', color: tinycolor(attention).darken(25).toHexString() },
        { name: 'CriticoDebil', color: tinycolor(critical).darken(25).toHexString() }, 
      ];
      currentPalette.fullForegroundColors = [
        { name: 'Predeterminado', color: newGrayShades[9] }, { name: 'Apagado', color: newGrayShades[6] },
        { name: 'Debil', color: newGrayShades[4] }, { name: 'Fuerte', color: newGrayShades[9] },
        { name: 'Inverso', color: newGrayShades[0] }, { name: 'Info', color: info },
        { name: 'Critico', color: critical }, { name: 'Atencion', color: attention },
        { name: 'Exito', color: success }, { name: 'SobreAccento', color: '#FFFFFF' },
      ];
      currentPalette.fullBorderColors = [
        { name: 'Predeterminado', color: newGrayShades[2] }, { name: 'Fuerte', color: newGrayShades[4] },
        { name: 'Inverso', color: newGrayShades[0] }, { name: 'InfoFuerte', color: info },
        { name: 'CriticoFuerte', color: critical }, { name: 'AtencionFuerte', color: attention },
        { name: 'ExitoFuerte', color: success },
      ];
    } else {
       currentPalette.fullBackgroundColors = [
        { name: 'Predeterminado', color: '#FFFFFF' }, { name: 'Apagado', color: newGrayShades[8] },
        { name: 'Debil', color: newGrayShades[7] }, { name: 'Fuerte', color: newGrayShades[0] },
        { name: 'Inverso', color: newGrayShades[0] }, { name: 'MarcaDebil', color: newBrandShades[8] },
        { name: 'InfoDebil', color: tinycolor(info).lighten(25).toHexString() },
        { name: 'ExitoDebil', color: tinycolor(success).lighten(25).toHexString() },
        { name: 'AtencionDebil', color: tinycolor(attention).lighten(25).toHexString() },
        { name: 'CriticoDebil', color: tinycolor(critical).lighten(25).toHexString() },
      ];
       currentPalette.fullForegroundColors = [
        { name: 'Predeterminado', color: newGrayShades[0] }, { name: 'Apagado', color: newGrayShades[3] },
        { name: 'Debil', color: newGrayShades[5] }, { name: 'Fuerte', color: newGrayShades[0] },
        { name: 'Inverso', color: newGrayShades[9] }, { name: 'Info', color: info },
        { name: 'Critico', color: critical }, { name: 'Atencion', color: attention },
        { name: 'Exito', color: success }, { name: 'SobreAccento', color: '#FFFFFF' },
      ];
       currentPalette.fullBorderColors = [
        { name: 'Predeterminado', color: newGrayShades[7] }, { name: 'Fuerte', color: newGrayShades[5] },
        { name: 'Inverso', color: newGrayShades[9] }, { name: 'InfoFuerte', color: info },
        { name: 'CriticoFuerte', color: critical }, { name: 'AtencionFuerte', color: attention },
        { name: 'ExitoFuerte', color: success },
      ];
    }
    
    setStylePalette(currentPalette);
    
    const root = document.documentElement;

    let finalBg = currentPalette.fullBackgroundColors.find(c=>c.name==='Predeterminado').color;
    let finalCard = currentPalette.fullBackgroundColors.find(c=>c.name==='Apagado').color;
    let finalMuted = currentPalette.fullBackgroundColors.find(c=>c.name==='Debil').color;

    if (usePureWhiteBg && theme === 'light') {
        finalBg = '#FFFFFF';
        finalCard = '#FFFFFF';
        finalMuted = '#FFFFFF';
    } else if (usePureBlackBg && theme === 'dark') {
        finalBg = '#000000';
        finalCard = '#000000';
        finalMuted = '#000000';
    }

    root.style.setProperty('--bg-default', finalBg);
    root.style.setProperty('--bg-card', finalCard);
    root.style.setProperty('--bg-muted', finalMuted);
    
    root.style.setProperty('--text-default', currentPalette.fullForegroundColors.find(c=>c.name==='Predeterminado').color);
    root.style.setProperty('--text-muted', currentPalette.fullForegroundColors.find(c=>c.name==='Apagado').color);
    root.style.setProperty('--border-default', currentPalette.fullBorderColors.find(c=>c.name==='Predeterminado').color);
    root.style.setProperty('--border-strong', currentPalette.fullBorderColors.find(c=>c.name==='Fuerte').color);
    root.style.setProperty('--action-primary-default', currentPalette.fullActionColors.find(c=>c.name==='Primario').color);
    root.style.setProperty('--action-primary-hover', currentPalette.fullActionColors.find(c=>c.name==='PrimarioFlotante').color);

    const infoColor = currentPalette.fullForegroundColors.find(c=>c.name==='Info').color;
    const successColor = currentPalette.fullForegroundColors.find(c=>c.name==='Exito').color;
    const attentionColor = currentPalette.fullForegroundColors.find(c=>c.name==='Atencion').color;
    const criticalColor = currentPalette.fullForegroundColors.find(c=>c.name==='Critico').color;
    
    root.style.setProperty('--text-info', infoColor);
    root.style.setProperty('--text-success', successColor);
    root.style.setProperty('--text-attention', attentionColor);
    root.style.setProperty('--text-critical', criticalColor);

    root.style.setProperty('--bg-info-weak', currentPalette.fullBackgroundColors.find(c=>c.name==='InfoDebil').color);
    root.style.setProperty('--bg-success-weak', currentPalette.fullBackgroundColors.find(c=>c.name==='ExitoDebil').color);
    root.style.setProperty('--bg-attention-weak', currentPalette.fullBackgroundColors.find(c=>c.name==='AtencionDebil').color);
    root.style.setProperty('--bg-critical-weak', currentPalette.fullBackgroundColors.find(c=>c.name==='CriticoDebil').color);
    
    const btnContrast = tinycolor.readability(currentPalette.fullActionColors.find(c=>c.name==='Primario').color, '#FFFFFF');
    const textContrast = tinycolor.readability(currentPalette.fullForegroundColors.find(c=>c.name==='Predeterminado').color, finalBg);
    
    let btnLevel = 'Fallido', textLevel = 'Fallido';
    if (btnContrast >= 7) btnLevel = 'AAA'; else if (btnContrast >= 4.5) btnLevel = 'AA';
    if (textContrast >= 7) textLevel = 'AAA'; else if (textContrast >= 4.5) textLevel = 'AA';

    setAccessibility({ 
        btn: { ratio: btnContrast.toFixed(2), level: btnLevel },
        text: { ratio: textContrast.toFixed(2), level: textLevel } 
    });
    
    const themeData = {
        brandShades: newBrandShades, grayShades: newGrayShades,
        stylePalette: currentPalette, theme, brandColor, grayColor, font,
        harmonyPalettes: newHarmonyPalettes
    };

    setGeneratedCode(generatePowerFxCode(themeData, fxSeparator, useFxQuotes));
    setCssCode(generateCssCode(themeData));
    setTailwindCode(generateTailwindCode(themeData));

  }, [brandColor, grayColor, theme, font, fxSeparator, useFxQuotes, usePureWhiteBg, usePureBlackBg, harmonyMode]);
  
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
        if (newBrandColor.isDark() && tinycolor.readability('#FFF', newBrandColor) > 4.5) {
             isAccessible = true;
        }
    }
    setIsGrayAuto(true);
    setBrandColor(newBrandColor.toHexString());
  };

  const handleRandomHarmony = () => {
    const analogousColors = tinycolor(brandColor).analogous();
    let newColor = analogousColors[Math.floor(Math.random() * analogousColors.length)];
    
    let attempts = 0;
    while(tinycolor.readability(newColor, '#FFF') < 4.5 && attempts < 20) {
        newColor = tinycolor.random();
        attempts++;
    }

    setBrandColor(newColor.toHexString());
    showNotification('¡Nueva armonía aleatoria generada!');
  };

  const handleExport = () => {
    const themeData = { brandColor, grayColor, font, theme, isGrayAuto, fxSeparator, useFxQuotes };
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
            setUseFxQuotes(importedTheme.useFxQuotes !== undefined ? importedTheme.useFxQuotes : true);
            showNotification('¡Tema importado con éxito!');
          } else {
            showNotification('Archivo de tema inválido.', 'error');
          }
        } catch (error) {
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
    setUseFxQuotes(defaultState.useFxQuotes);
    setUsePureWhiteBg(defaultState.usePureWhiteBg);
    setGrayColor(defaultState.grayColor);
    showNotification("Tema reiniciado a los valores por defecto.");
  };

  const handleThemeToggle = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  if (!stylePalette || !harmonies || !harmonyPalettes) {
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
            <p className="mt-4 text-lg">Generando sistema de diseño...</p>
        </div>
    );
  }

  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="protanopia"><feColorMatrix in="SourceGraphic" type="matrix" values="0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0" /></filter>
          <filter id="deuteranopia"><feColorMatrix in="SourceGraphic" type="matrix" values="0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0" /></filter>
          <filter id="tritanopia"><feColorMatrix in="SourceGraphic" type="matrix" values="0.95, 0.05, 0, 0, 0, 0, 0.433, 0.567, 0, 0, 0, 0.475, 0.525, 0, 0, 0, 0, 0, 1, 0" /></filter>
        </defs>
      </svg>
      <div 
        className={`min-h-screen p-4 sm:p-8 transition-colors duration-300`} 
        style={{ fontFamily: availableFonts[font], backgroundColor: 'var(--bg-default)', color: 'var(--text-default)', filter: simulationMode !== 'none' ? `url(#${simulationMode})` : 'none' }}
      >
        {isHelpVisible && <HelpModal onClose={() => setIsHelpVisible(false)} />}
        <header className="relative flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
             <div className="flex items-center gap-4">
                <img src="https://raw.githubusercontent.com/pentakillw/sistema-de-diseno-react/main/Icono_FX.png" alt="Sistema FX Logo" className="h-20 w-20 md:h-24 md:w-24 rounded-2xl shadow-md"/>
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-default)'}}>BIENVENIDOS</h1>
                    <p className="text-md" style={{ color: 'var(--text-muted)'}}>al sistema de diseño para Power Apps</p>
                </div>
            </div>
            <div className="flex items-center gap-2 self-center md:self-auto">
                <input type="file" ref={importFileRef} onChange={handleImport} accept=".json" className="hidden"/>
                <button title="Reiniciar Tema" onClick={handleReset} className="text-sm font-medium p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)'}}><RefreshCcw size={16}/></button>
                <button title="Importar Tema" onClick={() => importFileRef.current.click()} className="text-sm font-medium p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)'}}><Upload size={16}/></button>
                <button title="Exportar Tema" onClick={handleExport} className="text-sm font-medium p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)'}}><Download size={16}/></button>
                <button title="Ayuda" onClick={() => setIsHelpVisible(true)} className="text-sm font-medium p-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)'}}><HelpCircle size={16}/></button>
            </div>
        </header>

        <main>
            <div className="md:sticky top-4 z-40 mb-8">
                <section className="p-4 rounded-xl border shadow-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)'}}>
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm" style={{ color: 'var(--text-muted)'}} htmlFor="fontSelector">Fuente:</label>
                            <select id="fontSelector" value={font} onChange={(e) => setFont(e.target.value)} className="font-semibold px-2 py-1 rounded-md border" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)', borderColor: 'var(--border-default)'}}>
                                {Object.keys(availableFonts).map(fontName => (<option key={fontName} value={fontName}>{fontName}</option>))}
                            </select>
                        </div>
                        <div className="relative flex items-center gap-2">
                            <label className="text-sm" style={{ color: 'var(--text-muted)'}}>Color de Marca:</label>
                            <div className="flex items-center rounded-md" style={{ backgroundColor: 'var(--bg-muted)'}}>
                                <div className="w-7 h-7 rounded-l-md cursor-pointer border-r" style={{ backgroundColor: brandColor, borderColor: 'var(--border-strong)' }} onClick={() => setIsBrandPickerVisible(!isBrandPickerVisible)}/>
                                <HexColorInput color={brandColor} onChange={setBrandColor} className="font-mono bg-transparent px-2 py-1 rounded-r-md w-24 focus:outline-none" style={{ color: 'var(--text-default)'}} prefixed/>
                            </div>
                            {isBrandPickerVisible && (<div className="absolute z-10 top-full mt-2 left-0 w-56"><div className="fixed inset-0" onClick={() => setIsBrandPickerVisible(false)} /><HexColorPicker color={brandColor} onChange={setBrandColor} /></div>)}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2"><Wand2 size={16} style={{ color: 'var(--text-muted)'}}/><label className="text-sm font-medium" style={{ color: 'var(--text-muted)'}}>Gris Automático</label></div>
                            <Switch checked={isGrayAuto} onCheckedChange={setIsGrayAuto} />
                        </div>
                        <div className={`relative flex items-center gap-2 transition-opacity ${isGrayAuto ? 'opacity-50' : 'opacity-100'}`}>
                            <label className="text-sm" style={{ color: 'var(--text-muted)'}}>Escala de Grises:</label>
                            <div className="flex items-center rounded-md" style={{ backgroundColor: 'var(--bg-muted)'}}>
                                <div className={`w-7 h-7 rounded-l-md border-r ${isGrayAuto ? 'cursor-not-allowed' : 'cursor-pointer'}`} style={{ backgroundColor: grayColor, borderColor: 'var(--border-strong)' }} onClick={() => !isGrayAuto && setIsGrayPickerVisible(!isGrayPickerVisible)}/>
                                <HexColorInput color={grayColor} onChange={setGrayColor} className="font-mono bg-transparent px-2 py-1 rounded-r-md w-24 focus:outline-none" style={{ color: 'var(--text-default)'}} prefixed disabled={isGrayAuto}/>
                            </div>
                            {isGrayPickerVisible && !isGrayAuto && (<div className="absolute z-10 top-full mt-2 right-0 w-56"><div className="fixed inset-0" onClick={() => setIsGrayPickerVisible(false)} /><HexColorPicker color={grayColor} onChange={setGrayColor} /></div>)}
                        </div>
                        
                        <div className="hidden lg:block h-6 w-px bg-[var(--border-default)]"></div>

                        <div className="flex items-center gap-2">
                            <label className="text-sm" style={{ color: 'var(--text-muted)'}}>Accesibilidad:</label>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1" title={`Contraste del Botón: ${accessibility.btn.ratio}:1`}>
                                    <span className="text-xs font-bold p-1 rounded w-12 text-center" style={{backgroundColor: accessibility.btn.level === 'Fallido' ? '#fecaca' : '#bbf7d0', color: accessibility.btn.level === 'Fallido' ? '#991b1b' : '#166534'}}>{accessibility.btn.level}</span>
                                    <span className="text-xs" style={{color: 'var(--text-muted)'}}>Botón</span>
                                </div>
                                <div className="flex items-center gap-1" title={`Contraste del Texto: ${accessibility.text.ratio}:1`}>
                                    <span className="text-xs font-bold p-1 rounded w-12 text-center" style={{backgroundColor: accessibility.text.level === 'Fallido' ? '#fecaca' : '#bbf7d0', color: accessibility.text.level === 'Fallido' ? '#991b1b' : '#166534'}}>{accessibility.text.level}</span>
                                    <span className="text-xs" style={{color: 'var(--text-muted)'}}>Texto</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm" style={{ color: 'var(--text-muted)'}} htmlFor="simSelectorTop">Simulador:</label>
                            <select id="simSelectorTop" value={simulationMode} onChange={(e) => setSimulationMode(e.target.value)} className="font-semibold px-2 py-1 rounded-md border" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)', borderColor: 'var(--border-default)'}}>
                                <option value="none">Ninguno</option>
                                <option value="protanopia">Protanopia</option>
                                <option value="deuteranopia">Deuteranopia</option>
                                <option value="tritanopia">Tritanopia</option>
                            </select>
                        </div>
                    </div>
                </section>
            </div>
            
            <section className="p-4 rounded-xl border mb-8" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)'}}>
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: 'var(--text-default)'}}>
                        <FileCode size={20} /> Opciones de Exportación
                    </h2>
                    <button 
                        onClick={() => setIsExportVisible(!isExportVisible)}
                        className="text-sm font-medium py-1 px-3 rounded-lg"
                        style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)'}}
                    >
                        {isExportVisible ? 'Ocultar' : 'Mostrar'}
                    </button>
                </div>

                {isExportVisible && (
                    <div className="mt-4">
                        <div className="flex border-b" style={{ borderColor: 'var(--border-default)'}}>
                            <button onClick={() => setActiveExport('powerfx')} className={`py-2 px-4 text-sm font-semibold -mb-px border-b-2 ${activeExport === 'powerfx' ? 'border-[var(--action-primary-default)] text-[var(--action-primary-default)]' : 'border-transparent text-[var(--text-muted)]'}`}>Power Fx</button>
                            <button onClick={() => setActiveExport('css')} className={`py-2 px-4 text-sm font-semibold -mb-px border-b-2 ${activeExport === 'css' ? 'border-[var(--action-primary-default)] text-[var(--action-primary-default)]' : 'border-transparent text-[var(--text-muted)]'}`}>CSS</button>
                            <button onClick={() => setActiveExport('tailwind')} className={`py-2 px-4 text-sm font-semibold -mb-px border-b-2 ${activeExport === 'tailwind' ? 'border-[var(--action-primary-default)] text-[var(--action-primary-default)]' : 'border-transparent text-[var(--text-muted)]'}`}>Tailwind</button>
                        </div>
                        
                        <div className="p-4 border-b" style={{borderColor: 'var(--border-default)'}}>
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{color: 'var(--text-default)'}}><Settings size={16}/> Configuración de Salida</h4>
                            {activeExport === 'powerfx' && (
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm" style={{ color: 'var(--text-muted)'}} htmlFor="fxSeparator">Separador:</label>
                                        <select id="fxSeparator" value={fxSeparator} onChange={(e) => setFxSeparator(e.target.value)} className="font-semibold px-2 py-1 rounded-md border" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)', borderColor: 'var(--border-default)'}}>
                                            <option value=";">;</option>
                                            <option value=",">,</option>
                                            <option value=";;">;;</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm" style={{ color: 'var(--text-muted)'}}>Usar comillas en claves:</label>
                                        <Switch checked={useFxQuotes} onCheckedChange={setUseFxQuotes} />
                                    </div>
                                </div>
                            )}
                             {activeExport !== 'powerfx' && (
                                <p className="text-xs" style={{color: 'var(--text-muted)'}}>No hay configuraciones disponibles para este formato.</p>
                             )}
                        </div>

                        <div className="relative mt-4">
                            {activeExport === 'powerfx' && <pre className="font-mono text-sm whitespace-pre-wrap break-all p-4 rounded-md max-h-96 overflow-auto" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)'}}><code>{generatedCode}</code></pre>}
                            {activeExport === 'css' && <pre className="font-mono text-sm whitespace-pre-wrap break-all p-4 rounded-md max-h-96 overflow-auto" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)'}}><code>{cssCode}</code></pre>}
                            {activeExport === 'tailwind' && <pre className="font-mono text-sm whitespace-pre-wrap break-all p-4 rounded-md max-h-96 overflow-auto" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)'}}><code>{tailwindCode}</code></pre>}
                            <button onClick={() => handleCopy(activeExport === 'powerfx' ? generatedCode : activeExport === 'css' ? cssCode : tailwindCode, '¡Código copiado!')} className="absolute top-3 right-3 p-2 rounded-lg text-white" style={{ backgroundColor: 'var(--action-primary-default)'}}><Clipboard size={16}/></button>
                        </div>
                    </div>
                )}
            </section>

             <section className="space-y-6 mb-8">
               <div 
                 className="p-6 rounded-xl border" 
                 style={{ backgroundColor: usePureWhiteBg && theme === 'light' ? '#FFFFFF' : (grayShades.length > 9 ? grayShades[9] : '#FFF'), borderColor: grayShades.length > 7 ? grayShades[7] : '#E5E7EB' }}
               >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold" style={{color: usePureWhiteBg && theme === 'light' ? '#000' : 'var(--text-default)'}}>Modo Claro</h2>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium" style={{color: usePureWhiteBg && theme === 'light' ? '#374151' : 'var(--text-muted)'}}>Fondo Blanco Puro</label>
                    <Switch checked={usePureWhiteBg} onCheckedChange={setUsePureWhiteBg} />
                  </div>
                </div>
                <ColorPalette title="Color de Marca" color={brandColor} hex={brandColor} shades={brandShades} onShadeCopy={(color) => handleCopy(color, `Tono ${color.toUpperCase()} copiado!`)} themeOverride="light"/>
                <ColorPalette title="Escala de Grises" color={grayColor} hex={grayColor} shades={grayShades} onShadeCopy={(color) => handleCopy(color, `Tono ${color.toUpperCase()} copiado!`)} themeOverride="light"/>
              </div>
               <div 
                 className="p-6 rounded-xl border" 
                 style={{ backgroundColor: usePureBlackBg && theme === 'dark' ? '#000000' : (grayShades.length > 0 ? grayShades[0] : '#000'), borderColor: grayShades.length > 2 ? grayShades[2] : '#4B5563' }}
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
              <div 
                 className="p-6 rounded-xl border"
                 style={{ backgroundColor: grayShades[1], borderColor: grayShades[2] }}
               >
                <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                    <h2 className="font-bold text-white">Modo Armonía</h2>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 rounded-lg p-1" style={{backgroundColor: grayShades[2]}}>
                            <button onClick={() => setHarmonyMode('complementary')} className={`text-xs font-semibold py-1 px-3 rounded-md ${harmonyMode === 'complementary' ? 'text-white' : 'text-gray-300'}`} style={{backgroundColor: harmonyMode === 'complementary' ? brandShades[4] : 'transparent'}}>Complementaria</button>
                            <button onClick={() => setHarmonyMode('analogous')} className={`text-xs font-semibold py-1 px-3 rounded-md ${harmonyMode === 'analogous' ? 'text-white' : 'text-gray-300'}`} style={{backgroundColor: harmonyMode === 'analogous' ? brandShades[4] : 'transparent'}}>Análoga</button>
                            <button onClick={() => setHarmonyMode('triadic')} className={`text-xs font-semibold py-1 px-3 rounded-md ${harmonyMode === 'triadic' ? 'text-white' : 'text-gray-300'}`} style={{backgroundColor: harmonyMode === 'triadic' ? brandShades[4] : 'transparent'}}>Triádica</button>
                        </div>
                        <button onClick={handleRandomHarmony} className="p-2 rounded-lg text-white" style={{background: 'linear-gradient(to right, #a855f7, #ec4899)'}} title="Generar Armonía Aleatoria">
                            <Sparkles size={16}/>
                        </button>
                    </div>
                </div>
                <ColorPalette title="Color de Acento" color={harmonyPalettes.accentColor} hex={harmonyPalettes.accentColor} shades={harmonyPalettes.accentShades} onShadeCopy={(color) => handleCopy(color, `Tono ${color.toUpperCase()} copiado!`)} themeOverride="dark"/>
                <ColorPalette title="Escala de Grises Armónica" color={harmonyPalettes.gray} hex={harmonyPalettes.gray} shades={harmonyPalettes.grayShades} onShadeCopy={(color) => handleCopy(color, `Tono ${color.toUpperCase()} copiado!`)} themeOverride="dark"/>
              </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
               <StyleCard title="Tipografía">{Object.entries(displayStylesConfig).map(([name, styles]) => (<div key={name} className="mb-2 truncate"><span style={{ fontSize: styles.fontSize, fontWeight: styles.fontWeight, color: 'var(--text-muted)' }}>{name}</span></div>))}</StyleCard>
              <StyleCard title="Fondos">{stylePalette.fullBackgroundColors.map(item => <StyleItem key={item.name} name={item.name} color={item.color} onColorCopy={(color) => handleCopy(color, `Color ${color.toUpperCase()} copiado!`)} />)}</StyleCard>
              <StyleCard title="Textos">{stylePalette.fullForegroundColors.map(item => <StyleItem key={item.name} name={item.name} color={item.color} onColorCopy={(color) => handleCopy(color, `Color ${color.toUpperCase()} copiado!`)} />)}</StyleCard>
              <StyleCard title="Bordes">{stylePalette.fullBorderColors.map(item => <StyleItem key={item.name} name={item.name} color={item.color} onColorCopy={(color) => handleCopy(color, `Color ${color.toUpperCase()} copiado!`)} />)}</StyleCard>
              <StyleCard title="Acciones">{stylePalette.fullActionColors.map(item => <StyleItem key={item.name} name={item.name} color={item.color} onColorCopy={(color) => handleCopy(color, `Color ${color.toUpperCase()} copiado!`)} />)}</StyleCard>
              <StyleCard title="Decorativos">{stylePalette.decorateColors.map(item => <StyleItem key={item.name} name={item.name} color={item.color} onColorCopy={(color) => handleCopy(color, `Color ${color.toUpperCase()} copiado!`)} />)}</StyleCard>
            </section>
            
            <section className="p-4 rounded-xl border mb-8" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)'}}>
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: 'var(--text-default)'}}>
                        <Eye size={20} /> Vista Previa de Componentes
                    </h2>
                    <button 
                        onClick={() => setIsComponentPreviewVisible(!isComponentPreviewVisible)}
                        className="text-sm font-medium py-1 px-3 rounded-lg"
                        style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)'}}
                    >
                        {isComponentPreviewVisible ? 'Ocultar' : 'Mostrar'}
                    </button>
                </div>

                {isComponentPreviewVisible && (
                     <div className="mt-4 pt-4 border-t" style={{borderColor: 'var(--border-default)'}}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Columna Izquierda */}
                            <div className="space-y-6">
                                {/* Card */}
                                <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-strong)'}}>
                                    <h4 className="font-bold mb-2" style={{ color: 'var(--text-default)'}}>Título de la Tarjeta</h4>
                                    <p className="text-sm" style={{ color: 'var(--text-muted)'}}>Este es un ejemplo de cómo se ve el texto dentro de una tarjeta.</p>
                                </div>
                                {/* Inputs */}
                                <div className="space-y-3">
                                    <input type="text" placeholder="Campo de texto normal" className="w-full px-3 py-2 rounded-md border text-sm" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-default)', color: 'var(--text-default)'}} />
                                    <input type="text" placeholder="Campo de texto con borde fuerte" className="w-full px-3 py-2 rounded-md border-2 text-sm" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--action-primary-default)', color: 'var(--text-default)'}} />
                                </div>
                                {/* Botones */}
                                <div className="space-y-3">
                                    <button className="w-full text-white font-bold py-2 px-4 rounded-lg transition-colors" style={{ backgroundColor: 'var(--action-primary-default)'}}>Botón Primario</button>
                                    <button className="w-full font-bold py-2 px-4 rounded-lg transition-colors border" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-default)', borderColor: 'var(--border-strong)'}}>Botón Secundario</button>
                                </div>
                            </div>
                            {/* Columna Derecha */}
                            <div className="space-y-3">
                                <h4 className="font-bold text-md" style={{ color: 'var(--text-default)'}}>Alertas</h4>
                                <div className="flex items-center p-3 rounded-md" style={{backgroundColor: 'var(--bg-info-weak)'}}>
                                    <Info size={20} style={{color: 'var(--text-info)', minWidth: '20px'}} className="mr-3"/>
                                    <p className="text-sm font-medium" style={{color: 'var(--text-info)'}}>Esto es una notificación de información.</p>
                                </div>
                                <div className="flex items-center p-3 rounded-md" style={{backgroundColor: 'var(--bg-success-weak)'}}>
                                    <CheckCircle size={20} style={{color: 'var(--text-success)', minWidth: '20px'}} className="mr-3"/>
                                    <p className="text-sm font-medium" style={{color: 'var(--text-success)'}}>¡La operación se completó con éxito!</p>
                                </div>
                                <div className="flex items-center p-3 rounded-md" style={{backgroundColor: 'var(--bg-attention-weak)'}}>
                                    <AlertTriangle size={20} style={{color: 'var(--text-attention)', minWidth: '20px'}} className="mr-3"/>
                                    <p className="text-sm font-medium" style={{color: 'var(--text-attention)'}}>Atención: esto requiere tu revisión.</p>
                                </div>
                                <div className="flex items-center p-3 rounded-md" style={{backgroundColor: 'var(--bg-critical-weak)'}}>
                                    <AlertCircle size={20} style={{color: 'var(--text-critical)', minWidth: '20px'}} className="mr-3"/>
                                    <p className="text-sm font-medium" style={{color: 'var(--text-critical)'}}>Error: algo salió mal.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </main>
        <footer className="text-center mt-12 pt-8 border-t" style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)'}}>
            <p className="text-sm">Creado por JD_DM.</p>
            <p className="text-xs mt-1">Un proyecto de código abierto para la comunidad de Power Apps.</p>
        </footer>
        {notification.message && (<div className="fixed bottom-5 right-5 text-white text-sm font-bold py-2 px-4 rounded-lg shadow-lg flex items-center gap-2" style={{ backgroundColor: notification.type === 'error' ? '#EF4444' : '#10B981'}}><Check size={16}/> {notification.message}</div>)}
        <FloatingActionButtons 
            onRandomClick={handleRandomTheme}
            onThemeToggle={handleThemeToggle}
            currentTheme={theme}
        />
      </div>
    </>
  );
}

export default App;


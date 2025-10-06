import React, { useState, useEffect, useRef } from 'react';
import tinycolor from 'tinycolor2';
import { Sparkles, Wand2, HelpCircle, X, Check, Clipboard, Download, Upload, AlertCircle } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

// --- Funciones de Utilidad de Colores ---

const generateShades = (hex) => {
  if (!tinycolor(hex).isValid()) return Array(10).fill('#cccccc');
  const baseColor = tinycolor(hex);
  const shades = [];
  shades.push(baseColor.clone().darken(15).toHexString());
  shades.push(baseColor.clone().darken(7).toHexString());
  shades.push(baseColor.clone().toHexString());
  shades.push(baseColor.clone().lighten(8).toHexString());
  shades.push(baseColor.clone().lighten(16).toHexString());
  shades.push(baseColor.clone().lighten(24).toHexString());
  shades.push(baseColor.clone().lighten(32).toHexString());
  shades.push(baseColor.clone().lighten(40).toHexString());
  shades.push(baseColor.clone().lighten(48).toHexString());
  shades.push(baseColor.clone().lighten(56).toHexString());
  return shades;
};

const generateGrayShades = (hex) => {
    if (!tinycolor(hex).isValid()) return Array(10).fill('#cccccc');
    const baseColor = tinycolor(hex);
    const shades = [];
    const darkGray = baseColor.clone().darken(30);
    for (let i = 0; i < 10; i++) {
       shades.push(darkGray.clone().lighten(i * 9).toHexString());
    }
    return shades;
}

const displayStylesConfig = {
  'Title Large': { fontSize: '2rem', fontWeight: '700' },
  'Title Medium': { fontSize: '1.75rem', fontWeight: '700' },
  'Title Small': { fontSize: '1.5rem', fontWeight: '700' },
  'Body Large Bold': { fontSize: '1.125rem', fontWeight: '700' },
  'Body Large': { fontSize: '1.125rem', fontWeight: '400' },
  'Body Medium Bold': { fontSize: '1rem', fontWeight: '700' },
  'Body Medium': { fontSize: '1rem', fontWeight: '400' },
  'Body Small': { fontSize: '0.875rem', fontWeight: '400' },
  'Sub Text Caption': { fontSize: '0.75rem', fontWeight: '400' },
};

const generatePowerFxCode = (themeData) => {
  const { brandShades, grayShades, stylePalette, theme, brandColor, grayColor, font } = themeData;
  const formatStylePalette = (palette) => palette.map(item => `    "${item.name.replace(/ /g, '')}": "${item.color.toUpperCase()}"`).join(',\n');
  const fontStylesRecord = Object.entries(displayStylesConfig)
    .map(([name, styles]) => `    "${name.replace(/ /g, '')}": { Font: Font.'${font.split(' ')[0]}', Size: ${parseFloat(styles.fontSize) * 10}, Bold: ${styles.fontWeight === '700'} }`)
    .join(',\n');

  return `
// --- TEMA DE DISEÑO GENERADO ---
// Modo: ${theme.charAt(0).toUpperCase() + theme.slice(1)}
// Fuente: ${font}
// Brand: ${brandColor.toUpperCase()} | Gray Base: ${grayColor.toUpperCase()}
ClearCollect(
    colDesignSystem,
    {
        Brand: {
${brandShades.map((s, i) => `    c${i * 100 === 0 ? '0' : i * 100}: "${s.toUpperCase()}"`).join(',\n')}
        },
        Gray: {
${grayShades.map((s, i) => `    c${i * 100 === 0 ? '0' : i * 100}: "${s.toUpperCase()}"`).join(',\n')}
        },
        Backgrounds: {
${formatStylePalette(stylePalette.backgroundColors)}
        },
        Foregrounds: {
${formatStylePalette(stylePalette.foregroundColors)}
        },
        Borders: {
${formatStylePalette(stylePalette.borderColors)}
        },
        Actions: {
${formatStylePalette(stylePalette.actionColors)}
        },
        Fonts: {
${fontStylesRecord}
        }
    }
);
  `.trim();
};


// --- Componentes ---

const ColorPalette = ({ title, color, hex, shades, onShadeCopy }) => (
  <div className="mb-4">
    <div className="flex items-center mb-2">
      <div className="w-10 h-10 rounded-md mr-3 border" style={{ backgroundColor: color, borderColor: 'var(--border-default)' }}></div>
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-default)'}}>{title}</p>
        <p className="text-xs font-mono" style={{ color: 'var(--text-muted)'}}>{hex.toUpperCase()}</p>
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
     <div className="flex text-xs font-mono px-1" style={{ color: 'var(--text-muted)'}}>
        {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="flex-1 text-center">C{index * 100 === 0 ? '0' : index * 100}</div>
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
                    <li><strong style={{ color: 'var(--text-default)'}}>Copia y Exporta a Power Fx:</strong> Haz clic en cualquier color para copiarlo o muestra y copia el código Power Fx completo.</li>
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

function App() {
  const [theme, setTheme] = useState('dark');
  const [brandColor, setBrandColor] = useState('#009fdb');
  const [grayColor, setGrayColor] = useState('#5d757e');
  const [isGrayAuto, setIsGrayAuto] = useState(true);
  
  const [font, setFont] = useState('Poppins');
  
  const [brandShades, setBrandShades] = useState([]);
  const [grayShades, setGrayShades] = useState([]);
  
  const [stylePalette, setStylePalette] = useState(null);
  
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const [generatedCode, setGeneratedCode] = useState('');
  const [isCodeVisible, setIsCodeVisible] = useState(false);
  const [isBrandPickerVisible, setIsBrandPickerVisible] = useState(false);
  const [isGrayPickerVisible, setIsGrayPickerVisible] = useState(false);
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const [accessibility, setAccessibility] = useState({ ratio: 0, level: 'Fail' });

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

    const info = '#3B82F6', critical = '#EF4444', attention = '#F59E0B', success = '#10B981';

    const currentPalette = {
       backgroundColors: theme === 'dark' ? [
        { name: 'Default', color: newGrayShades[0] }, { name: 'Card', color: newGrayShades[1] },
        { name: 'Muted', color: newGrayShades[2] }, { name: 'Subtle', color: tinycolor(newGrayShades[0]).lighten(5).toHexString() },
      ] : [
        { name: 'Default', color: newGrayShades[9] }, { name: 'Card', color: '#FFFFFF' },
        { name: 'Muted', color: newGrayShades[8] }, { name: 'Subtle', color: newGrayShades[8] },
      ],
      foregroundColors: theme === 'dark' ? [
        { name: 'Default', color: newGrayShades[9] }, { name: 'Muted', color: newGrayShades[6] },
        { name: 'Subtle', color: newGrayShades[4] },
      ] : [
        { name: 'Default', color: newGrayShades[0] }, { name: 'Muted', color: newGrayShades[3] },
        { name: 'Subtle', color: newGrayShades[5] },
      ],
      borderColors: theme === 'dark' ? [
        { name: 'Default', color: newGrayShades[2] }, { name: 'Strong', color: newGrayShades[4] },
      ] : [
        { name: 'Default', color: newGrayShades[7] }, { name: 'Strong', color: newGrayShades[5] },
      ],
      actionColors: [
        { name: 'Primary Default', color: newBrandShades[3] }, { name: 'Primary Hover', color: newBrandShades[4] },
        { name: 'Secondary Default', color: newGrayShades[3] }, { name: 'Secondary Hover', color: newGrayShades[4] },
      ]
    };
    
    currentPalette.fullActionColors = [
        { name: 'Primary Default', color: newBrandShades[2] }, { name: 'Primary Hover', color: newBrandShades[3] },
        { name: 'Primary Pressed', color: newBrandShades[4] }, { name: 'Secondary Default', color: newGrayShades[4] },
        { name: 'Secondary Pressed', color: newGrayShades[5] }, { name: 'Critical Default', color: critical },
        { name: 'Critical Hover', color: tinycolor(critical).lighten(10).toHexString() }, { name: 'Critical Pressed', color: tinycolor(critical).darken(10).toHexString() },
    ];
    currentPalette.fullBackgroundColors = theme === 'dark' ? [
        { name: 'Default', color: newGrayShades[0] }, { name: 'Muted', color: newGrayShades[1] },
        { name: 'Weak', color: newGrayShades[2] }, { name: 'Strong', color: newGrayShades[9] },
        { name: 'Inversed', color: newGrayShades[9] }, { name: 'Info weak', color: tinycolor(info).darken(25).toHexString() },
        { name: 'Critical weak', color: tinycolor(critical).darken(25).toHexString() }, { name: 'Attention weak', color: tinycolor(attention).darken(25).toHexString() },
      ] : [
        { name: 'Default', color: '#FFFFFF' }, { name: 'Muted', color: newGrayShades[8] },
        { name: 'Weak', color: newGrayShades[7] }, { name: 'Strong', color: newGrayShades[0] },
        { name: 'Inversed', color: newGrayShades[0] }, { name: 'Info weak', color: tinycolor(info).lighten(25).toHexString() },
        { name: 'Critical weak', color: tinycolor(critical).lighten(25).toHexString() }, { name: 'Attention weak', color: tinycolor(attention).lighten(25).toHexString() },
      ];
    currentPalette.fullForegroundColors = theme === 'dark' ? [
        { name: 'Default', color: newGrayShades[9] }, { name: 'Muted', color: newGrayShades[6] },
        { name: 'Weak', color: newGrayShades[4] }, { name: 'Strong', color: newGrayShades[9] },
        { name: 'Inversed', color: newGrayShades[0] }, { name: 'Info', color: info },
        { name: 'Critical', color: critical }, { name: 'Attention', color: attention },
        { name: 'Success', color: success }, { name: 'On Accent', color: '#FFFFFF' },
      ] : [
        { name: 'Default', color: newGrayShades[0] }, { name: 'Muted', color: newGrayShades[3] },
        { name: 'Weak', color: newGrayShades[5] }, { name: 'Strong', color: newGrayShades[0] },
        { name: 'Inversed', color: newGrayShades[9] }, { name: 'Info', color: info },
        { name: 'Critical', color: critical }, { name: 'Attention', color: attention },
        { name: 'Success', color: success }, { name: 'On Accent', color: '#FFFFFF' },
      ];
    currentPalette.fullBorderColors = theme === 'dark' ? [
        { name: 'Default', color: newGrayShades[2] }, { name: 'Strong', color: newGrayShades[4] },
        { name: 'Inversed', color: newGrayShades[0] }, { name: 'Info Strong', color: info },
        { name: 'Critical Strong', color: critical }, { name: 'Attention Strong', color: attention },
        { name: 'Success Strong', color: success },
      ] : [
        { name: 'Default', color: newGrayShades[7] }, { name: 'Strong', color: newGrayShades[5] },
        { name: 'Inversed', color: newGrayShades[9] }, { name: 'Info Strong', color: info },
        { name: 'Critical Strong', color: critical }, { name: 'Attention Strong', color: attention },
        { name: 'Success Strong', color: success },
      ];
    
    setStylePalette(currentPalette);
    
    const root = document.documentElement;
    root.style.setProperty('--bg-default', currentPalette.backgroundColors.find(c=>c.name==='Default').color);
    root.style.setProperty('--bg-card', currentPalette.backgroundColors.find(c=>c.name==='Card').color);
    root.style.setProperty('--bg-muted', currentPalette.backgroundColors.find(c=>c.name==='Muted').color);
    root.style.setProperty('--text-default', currentPalette.foregroundColors.find(c=>c.name==='Default').color);
    root.style.setProperty('--text-muted', currentPalette.foregroundColors.find(c=>c.name==='Muted').color);
    root.style.setProperty('--border-default', currentPalette.borderColors.find(c=>c.name==='Default').color);
    root.style.setProperty('--border-strong', currentPalette.borderColors.find(c=>c.name==='Strong').color);
    root.style.setProperty('--action-primary-default', currentPalette.actionColors.find(c=>c.name==='Primary Default').color);
    root.style.setProperty('--action-primary-hover', currentPalette.actionColors.find(c=>c.name==='Primary Hover').color);
    root.style.setProperty('--action-secondary-default', currentPalette.actionColors.find(c=>c.name==='Secondary Default').color);
    root.style.setProperty('--action-secondary-hover', currentPalette.actionColors.find(c=>c.name==='Secondary Hover').color);
    
    // Accessibility Check
    const primaryActionColor = currentPalette.actionColors.find(c=>c.name==='Primary Default').color;
    const contrastRatio = tinycolor.readability(primaryActionColor, '#FFFFFF');
    let level = 'Fail';
    if (contrastRatio >= 7) {
      level = 'AAA';
    } else if (contrastRatio >= 4.5) {
      level = 'AA';
    }
    setAccessibility({ ratio: contrastRatio.toFixed(2), level });

    setGeneratedCode(generatePowerFxCode({
        brandShades: newBrandShades,
        grayShades: newGrayShades,
        stylePalette: {
            backgroundColors: currentPalette.fullBackgroundColors,
            actionColors: currentPalette.fullActionColors,
            foregroundColors: currentPalette.fullForegroundColors,
            borderColors: currentPalette.fullBorderColors,
        },
        theme, brandColor, grayColor, font
    }));

  }, [brandColor, grayColor, theme, font]);
  
  const decorateColors = [ { name: 'Blue 1', color: '#3B82F6' }, { name: 'Blue 2', color: '#60A5FA' }, { name: 'Green 1', color: '#10B981' }, { name: 'Green 2', color: '#34D399' }, { name: 'Neutral 1', color: '#6B7280' }, { name: 'Neutral 2', color: '#9CA3AF' }, { name: 'Orange 1', color: '#F59E0B' }, { name: 'Orange 2', color: '#FBBF24' }];

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
        const contrastWhite = tinycolor.readability('#FFF', newBrandColor);
        if (contrastWhite > 4.5) { // Check against white for button text
            isAccessible = true;
        }
    }
    setIsGrayAuto(true);
    setBrandColor(newBrandColor.toHexString());
  };

  const handleExport = () => {
    const themeData = { brandColor, grayColor, font, theme, isGrayAuto };
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
            showNotification('Tema importado con éxito!');
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
            <button title="Importar Tema" onClick={() => importFileRef.current.click()} className="text-sm font-medium p-2 rounded-lg" style={{ backgroundColor: 'var(--action-secondary-default)', color: 'var(--text-default)'}}><Upload size={16}/></button>
            <button title="Exportar Tema" onClick={handleExport} className="text-sm font-medium p-2 rounded-lg" style={{ backgroundColor: 'var(--action-secondary-default)', color: 'var(--text-default)'}}><Download size={16}/></button>
            <button title="Ayuda" onClick={() => setIsHelpVisible(true)} className="text-sm font-medium p-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--action-secondary-default)', color: 'var(--text-default)'}}><HelpCircle size={16}/></button>
        </div>
      </header>

      <main>

        <section className="p-6 rounded-xl border mb-8" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)'}}>
          <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--text-default)'}}>Live Preview de Componentes</h2>
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
                  <h3 className="font-bold mb-2" style={{ color: 'var(--text-default)'}}>Ejemplo de Tarjeta</h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)'}}>Esto es un ejemplo de cómo se verían los componentes.</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold p-1 rounded" style={{
                      backgroundColor: accessibility.level === 'Fail' ? '#fecaca' : '#bbf7d0',
                      color: accessibility.level === 'Fail' ? '#991b1b' : '#166534'
                    }}>{accessibility.level}</span>
                    <span className="text-sm" style={{ color: 'var(--text-muted)'}}>Contraste: {accessibility.ratio}:1</span>
                  </div>
              </div>
          </div>
        </section>

        <section className="space-y-6 mb-8">
           <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)'}}>
            <h2 className="font-bold mb-2">Modo Claro</h2>
            <ColorPalette title="Brand Color" color={brandColor} hex={brandColor} shades={brandShades} onShadeCopy={(color) => handleCopy(color, `Tono ${color.toUpperCase()} copiado!`)}/>
            <ColorPalette title="Gray Scale" color={grayColor} hex={grayColor} shades={grayShades} onShadeCopy={(color) => handleCopy(color, `Tono ${color.toUpperCase()} copiado!`)}/>
          </div>
           <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)'}}>
             <h2 className="font-bold mb-2">Modo Oscuro</h2>
            <ColorPalette title="Brand Color" color={brandColor} hex={brandColor} shades={brandShades} onShadeCopy={(color) => handleCopy(color, `Tono ${color.toUpperCase()} copiado!`)}/>
            <ColorPalette title="Gray Scale" color={grayColor} hex={grayColor} shades={grayShades} onShadeCopy={(color) => handleCopy(color, `Tono ${color.toUpperCase()} copiado!`)}/>
          </div>
        </section>

        <section className="p-4 rounded-xl mb-8 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)'}}>
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg" style={{ color: 'var(--text-default)'}}>Código Power Fx</h3>
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
            {isCodeVisible && (
                <div className="relative mt-4">
                    <pre className="font-mono text-sm whitespace-pre-wrap break-all p-4 rounded-md max-h-96 overflow-auto" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)'}}>
                        <code>{generatedCode}</code>
                    </pre>
                    <button
                        onClick={() => handleCopy(generatedCode, '¡Código Power Fx copiado!')}
                        className="absolute top-3 right-3 text-sm font-medium py-1 px-3 rounded-lg text-white transition-colors"
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
          {/* Controles existentes */}
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
            <label className="text-sm" style={{ color: 'var(--text-muted)'}}>Brand Color:</label>
            <div className="flex items-center rounded-md" style={{ backgroundColor: 'var(--bg-muted)'}}>
                <div
                    className="w-7 h-7 rounded-l-md cursor-pointer border-r"
                    style={{ backgroundColor: brandColor, borderColor: 'var(--border-strong)' }}
                    onClick={() => setIsBrandPickerVisible(!isBrandPickerVisible)}
                />
                <input 
                    type="text" 
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="font-mono bg-transparent px-2 py-1 rounded-r-md w-24 focus:outline-none"
                    style={{ color: 'var(--text-default)'}}
                />
            </div>
            {isBrandPickerVisible && (
                <div className="absolute z-10 top-full mt-2 left-0">
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
            <label className="text-sm" style={{ color: 'var(--text-muted)'}}>Gray Scale:</label>
            <div className="flex items-center rounded-md" style={{ backgroundColor: 'var(--bg-muted)'}}>
                <div
                    className={`w-7 h-7 rounded-l-md border-r ${isGrayAuto ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{ backgroundColor: grayColor, borderColor: 'var(--border-strong)' }}
                    onClick={() => !isGrayAuto && setIsGrayPickerVisible(!isGrayPickerVisible)}
                />
                <input 
                    type="text" 
                    value={grayColor}
                    disabled={isGrayAuto}
                    onChange={(e) => setGrayColor(e.target.value)}
                    className="font-mono bg-transparent px-2 py-1 rounded-r-md w-24 focus:outline-none"
                    style={{ color: 'var(--text-default)'}}
                />
            </div>
            {isGrayPickerVisible && !isGrayAuto && (
                <div className="absolute z-10 top-full mt-2 right-0">
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
           <StyleCard title="Display">
            {Object.entries(displayStylesConfig).map(([name, styles]) => (
              <div key={name} className="mb-2 truncate">
                  <span style={{ fontSize: styles.fontSize, fontWeight: styles.fontWeight, color: 'var(--text-muted)' }}>{name}</span>
              </div>
            ))}
          </StyleCard>
          <StyleCard title="Background Colors">{stylePalette.fullBackgroundColors.map(item => <StyleItem key={item.name} name={item.name} color={item.color} onColorCopy={(color) => handleCopy(color, `Color ${color.toUpperCase()} copiado!`)} />)}</StyleCard>
          <StyleCard title="Foreground Colors">{stylePalette.fullForegroundColors.map(item => <StyleItem key={item.name} name={item.name} color={item.color} onColorCopy={(color) => handleCopy(color, `Color ${color.toUpperCase()} copiado!`)} />)}</StyleCard>
          <StyleCard title="Border Colors">{stylePalette.fullBorderColors.map(item => <StyleItem key={item.name} name={item.name} color={item.color} onColorCopy={(color) => handleCopy(color, `Color ${color.toUpperCase()} copiado!`)} />)}</StyleCard>
          <StyleCard title="Action Colors">{stylePalette.fullActionColors.map(item => <StyleItem key={item.name} name={item.name} color={item.color} onColorCopy={(color) => handleCopy(color, `Color ${color.toUpperCase()} copiado!`)} />)}</StyleCard>
          <StyleCard title="Decorate Colors">{decorateColors.map(item => <StyleItem key={item.name} name={item.name} color={item.color} onColorCopy={(color) => handleCopy(color, `Color ${color.toUpperCase()} copiado!`)} />)}</StyleCard>
        </section>
      </main>

      <footer className="text-center mt-12 pt-8 border-t" style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)'}}>
        <p className="text-sm">Creado con ❤️ por ti y la asistencia de IA. Inspirado en el sistema de diseño de Dionny Gómez.</p>
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


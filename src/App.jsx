import React, { useState, useEffect, useRef } from 'react';
import tinycolor from 'tinycolor2';
import { Sparkles, Wand2, HelpCircle, X, Check, Clipboard, Download, Upload, AlertCircle, RefreshCcw, FileCode, Eye, Palette, Settings, Info, CheckCircle, AlertTriangle, Sun, Moon, Layers, ChevronDown, Undo2, Redo2 } from 'lucide-react';
import { HexColorPicker, HexColorInput } from 'react-colorful';

// --- Funciones de Utilidad de Colores (lógica interna en inglés) ---

const generateShades = (hex) => {
  if (!tinycolor(hex).isValid()) return Array(20).fill('#cccccc');
  const baseColor = tinycolor(hex);
  const shades = [];

  // 9 dark shades by mixing with black for a smoother gradient
  for (let i = 9; i > 0; i--) {
    shades.push(tinycolor.mix(baseColor, '#000', i * 10).toHexString());
  }

  // 1 base color
  shades.push(baseColor.toHexString());

  // 10 light shades by mixing with white
  for (let i = 1; i <= 10; i++) {
    shades.push(tinycolor.mix(baseColor, '#fff', i * 9).toHexString());
  }
  return shades;
};

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
  const { brandShades, grayShades, stylePalette, font, harmonyPalettes } = themeData;
  
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
${brandShades.map((s, i) => `    ${formatKey('t' + (i * 50))}: "${s.toUpperCase()}"`).join(`${separator}\n`)}
        }${separator}
        Gris: {
${grayShades.map((s, i) => `    ${formatKey('t' + (i * 50))}: "${s.toUpperCase()}"`).join(`${separator}\n`)}
        }${separator}
        Acento: {
${harmonyPalettes.accentShades.map((s, i) => `    ${formatKey('t' + (i * 50))}: "${s.toUpperCase()}"`).join(`${separator}\n`)}
        }${separator}
        GrisArmonico: {
${harmonyPalettes.grayShades.map((s, i) => `    ${formatKey('t' + (i * 50))}: "${s.toUpperCase()}"`).join(`${separator}\n`)}
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
    shades.map((s, i) => `    --${prefix}-t${i * 50}: ${s.toUpperCase()};`).join('\n');
  
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
        shadeObject += `          '${i * 50}': '${s.toUpperCase()}',\n`;
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

// --- Componente para el Anuncio ---
const AdBanner = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.dataset.cfasync = "false";
    script.src = "//pl27818253.effectivegatecpm.com/b1bcdef33e26ff258cea985fafbdf8da/invoke.js";
    
    const container = document.getElementById('container-b1bcdef33e26ff258cea985fafbdf8da');
    if (container) {
       if (container.children.length === 0) {
            container.appendChild(script);
       }
    }
    
  }, []);

  return (
    <div className="mb-8 flex justify-center items-center">
      <div id="container-b1bcdef33e26ff258cea985fafbdf8da"></div>
    </div>
  );
};


// --- Modal de Variaciones ---
const VariationsModal = ({ explorerPalette, onClose, onColorSelect }) => {
  const variationGenerators = {
    'Sombra': {
      generator: (base, i) => {
        const amount = (9 - i) * 8; // Reduced step for smoother, less extreme gradient
        if (amount >= 0) {
          return tinycolor.mix(base, '#fff', amount);
        } else {
          return tinycolor.mix(base, '#000', Math.abs(amount));
        }
      }
    },
    'Saturación': {
      generator: (base, i) => { const amount = (9 - i) * 10; return amount >= 0 ? base.clone().saturate(amount) : base.clone().desaturate(Math.abs(amount)); }
    },
    'Matiz': {
      generator: (base, i) => { const amount = (i - 9) * 20; return base.clone().spin(amount); }
    },
    'Temperatura': {
      generator: (base, i) => { const amount = (9 - i) * 10; if (amount > 0) return tinycolor.mix(base, '#ffc966', amount / 2); return tinycolor.mix(base, '#66b3ff', Math.abs(amount / 2)); }
    },
    'Luminosidad': {
      generator: (base, i) => { const hsl = base.toHsl(); const newLuminance = 0.05 + ((18-i) / 18) * 0.9; return tinycolor({ h: hsl.h, s: hsl.s, l: newLuminance }); }
    },
     'Ceguera': {
      generator: (base, i) => {
        const amount = (9 - i) * 5;
        return tinycolor.mix(base.clone().desaturate(amount), '#A09C7D', Math.abs(amount));
      }
    },
    'Gradiente': {
        generator: (base, i) => { const light = base.clone().lighten(40).saturate(10); const dark = base.clone().darken(20).desaturate(10); const amount = ((18-i) / 18) * 100; return tinycolor.mix(dark, light, amount); }
    }
  };

  const tabNames = Object.keys(variationGenerators);
  const [activeTab, setActiveTab] = useState(tabNames[0]);
  
  const handleSelect = (color) => {
    onColorSelect(color);
    onClose();
  };

  const getLabels = (tab) => {
    if (tab === 'Matiz') {
      return Array.from({ length: 19 }).map((_, i) => {
        const value = (i - 9) * 20;
        if (value === 0) return 'Original';
        return `${value}°`;
      });
    }
    return Array.from({ length: 19 }).map((_, i) => {
      const value = (9 - i) * 10;
      if (value === 0) return 'Original';
      return `${value > 0 ? '+' : ''}${value}%`;
    });
  };

  const currentLabels = getLabels(activeTab);
  const currentGenerator = variationGenerators[activeTab].generator;

  const paletteToShow = explorerPalette;
  
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div 
        className="p-4 sm:p-6 rounded-xl border max-w-7xl w-full relative flex flex-col" 
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)', height: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-default)' }}>Variaciones de Paleta</h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b flex-shrink-0 overflow-x-auto">
          {tabNames.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 text-sm font-semibold -mb-px border-b-2 flex-shrink-0 ${activeTab === tab ? 'border-[var(--action-primary-default)] text-[var(--action-primary-default)]' : 'border-transparent text-[var(--text-muted)]'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto mt-6">
          <div className="flex gap-x-1">
            {/* Labels Column */}
            <div className="sticky left-0 bg-[var(--bg-card)] flex-shrink-0 w-16 z-10">
                 {currentLabels.map((label, index) => (
                    <div key={index} className="h-10 flex items-center justify-end text-xs font-mono pr-2" style={{color: 'var(--text-muted)'}}>{label}</div>
                 ))}
            </div>
            
            {/* Color Columns */}
            {paletteToShow.map((colorHex, colIndex) => (
              <div key={colIndex} className="group flex flex-col gap-1 w-12 flex-shrink-0">
                {Array.from({ length: 19 }).map((_, rowIndex) => {
                  const baseColor = tinycolor(colorHex);
                  const variedColor = currentGenerator(baseColor, rowIndex).toHexString();
                  return (
                    <div 
                      key={rowIndex} 
                      className="w-full h-10 rounded-md cursor-pointer flex items-center justify-center transition-transform hover:scale-110" 
                      style={{backgroundColor: variedColor}}
                      onClick={() => handleSelect(variedColor)}
                      title={variedColor.toUpperCase()}
                    >
                        <span className="font-mono text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ color: tinycolor(variedColor).isLight() ? '#000' : '#FFF' }}>
                            {variedColor.substring(1).toUpperCase()}
                        </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};


const AccessibilityCard = ({ accessibility, colors, isVisible, onToggle }) => {
  const cardStyle = {
    backgroundColor: 'var(--bg-card)',
    borderColor: 'var(--border-default)',
    color: 'var(--text-default)'
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'AAA':
        return { bg: 'var(--bg-success-weak)', text: 'var(--text-success)' };
      case 'AA':
        return { bg: 'var(--bg-attention-weak)', text: 'var(--text-attention)' };
      default: // 'Fallido'
        return { bg: 'var(--bg-critical-weak)', text: 'var(--text-critical)' };
    }
  };
  
  const btnLevelColors = getLevelColor(accessibility.btn.level);
  const textLevelColors = getLevelColor(accessibility.text.level);

  return (
    <section className="p-4 rounded-xl border mb-8" style={cardStyle}>
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: 'var(--text-default)'}}>
          <Eye size={20} /> Verificación de Accesibilidad
        </h2>
        <button 
          onClick={onToggle}
          className="text-sm font-medium py-1 px-3 rounded-lg"
          style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)'}}
        >
          {isVisible ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      {isVisible && (
        <div className="mt-4 pt-4 border-t" style={{borderColor: 'var(--border-default)'}}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card para el Color de Acento */}
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Contraste del Color de Acento (sobre fondo)</h3>
              <div className="flex items-center gap-4">
                <div 
                  className="w-24 h-12 rounded-lg flex items-center justify-center font-bold text-sm shadow-inner p-2 text-center"
                  style={{ backgroundColor: colors.btnBg, color: colors.btnText, border: '1px solid var(--border-strong)' }}
                >
                  {colors.btnText.toUpperCase()}
                </div>
                <div className="text-sm">
                  <p>Ratio: <span className="font-bold">{accessibility.btn.ratio}:1</span></p>
                  <div className="flex items-center gap-2 mt-1">
                    <span>Nivel:</span>
                    <span className="font-bold px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: btnLevelColors.bg, color: btnLevelColors.text }}>
                      {accessibility.btn.level}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs mt-3 italic" style={{ color: 'var(--text-muted)' }}>
                Se mide el color de <span className="font-mono p-1 rounded" style={{backgroundColor: 'var(--bg-muted)'}}>{colors.btnText.toUpperCase()}</span> (acento) contra <span className="font-mono p-1 rounded" style={{backgroundColor: 'var(--bg-muted)'}}>{colors.btnBg.toUpperCase()}</span> (fondo).
              </p>
            </div>

            {/* Card para el Color de Marca */}
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Contraste del Color de Marca (sobre fondo)</h3>
              <div className="flex items-center gap-4">
                <div 
                  className="w-24 h-12 rounded-lg flex items-center justify-center text-sm shadow-inner p-2 text-center font-bold"
                  style={{ backgroundColor: colors.textBg, color: colors.textColor, border: '1px solid var(--border-strong)' }}
                >
                  {colors.textColor.toUpperCase()}
                </div>
                <div className="text-sm">
                  <p>Ratio: <span className="font-bold">{accessibility.text.ratio}:1</span></p>
                  <div className="flex items-center gap-2 mt-1">
                    <span>Nivel:</span>
                    <span className="font-bold px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: textLevelColors.bg, color: textLevelColors.text }}>
                      {accessibility.text.level}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs mt-3 italic" style={{ color: 'var(--text-muted)' }}>
                Se mide el color de <span className="font-mono p-1 rounded" style={{backgroundColor: 'var(--bg-muted)'}}>{colors.textColor.toUpperCase()}</span> (marca) contra <span className="font-mono p-1 rounded" style={{backgroundColor: 'var(--bg-muted)'}}>{colors.textBg.toUpperCase()}</span> (fondo).
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const ColorPalette = ({ title, color, hex, shades, onShadeCopy, themeOverride, isExplorer = false }) => (
  <div className="mb-4">
    {!isExplorer && (
      <div className="flex items-center mb-2">
        <div className="w-10 h-10 rounded-md mr-3 border" style={{ backgroundColor: color, borderColor: themeOverride === 'light' ? '#E5E7EB' : '#4B5563' }}></div>
        <div>
          <p className={`text-sm font-medium ${themeOverride === 'light' ? 'text-gray-900' : 'text-gray-50'}`}>{title}</p>
          <p className={`text-xs font-mono ${themeOverride === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>{hex.toUpperCase()}</p>
        </div>
      </div>
    )}
    <div className="flex flex-col">
      <div className="flex rounded-md overflow-hidden h-10 relative group">
        {shades.map((shade, index) => (
          <div 
              key={index} 
              className="flex-1 cursor-pointer transition-transform duration-100 ease-in-out group-hover:transform group-hover:scale-y-110 hover:!scale-125 hover:z-10 flex items-center justify-center" 
              style={{ backgroundColor: shade }}
              onClick={() => onShadeCopy(shade)}
              title={`Usar ${shade.toUpperCase()} como Color de Marca`}
          >
            <span className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" style={{ color: tinycolor(shade).isLight() ? '#000' : '#FFF' }}>
              {shade.substring(1).toUpperCase()}
            </span>
          </div>
        ))}
      </div>
      {!isExplorer && (
        <div className={`hidden sm:flex text-xs font-mono px-1 relative pt-2 mt-1 ${themeOverride === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
            <div 
              className="absolute top-0 w-0 h-0 drop-shadow-md"
              style={{
                left: 'calc(47.5% - 7px)',
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderTop: `10px solid ${themeOverride === 'light' ? '#374151' : '#D1D5DB'}`
              }}
              title="Color Base"
            ></div>
            {Array.from({ length: 20 }).map((_, index) => (
                <div key={index} className="flex-1 text-center text-[10px]">T{index * 50}</div>
            ))}
        </div>
      )}
    </div>
  </div>
);

const SemanticColorPalette = ({ title, colors, onColorCopy, themeOverride }) => {
    const titleColor = themeOverride === 'light' ? 'var(--text-default)' : '#FFF';
    const textColor = themeOverride === 'light' ? 'var(--text-muted)' : '#D1D5DB';

    return(
        <div className="mb-4">
        <h3 className="text-sm font-medium mb-2" style={{ color: titleColor }}>{title}</h3>
        <div className="flex flex-col">
            <div className="flex rounded-md overflow-hidden h-10 relative group">
            {colors.map((item) => (
                <div 
                    key={item.name} 
                    className="flex-1 cursor-pointer transition-transform duration-100 ease-in-out group-hover:transform group-hover:scale-y-110 hover:!scale-125 hover:z-10 flex items-center justify-center" 
                    style={{ backgroundColor: item.color }}
                    onClick={() => onColorCopy(item.color, `${title}: ${item.name} (${item.color.toUpperCase()}) copiado!`)}
                    title={`${item.name} - ${item.color.toUpperCase()}`}
                >
                <span className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" style={{ color: tinycolor(item.color).isLight() ? '#000' : '#FFF' }}>
                    {item.color.substring(1).toUpperCase()}
                </span>
                </div>
            ))}
            </div>
            <div className={`flex text-xs px-1 relative pt-2 mt-1`} style={{color: textColor}}>
                {colors.map((item) => (
                <div key={item.name} className="flex-1 text-center text-wrap text-[10px]" title={item.name}>{item.name}</div>
                ))}
            </div>
        </div>
        </div>
    );
};

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
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 flex flex-col gap-4">
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
};

const backgroundModeLabels = {
  'T950': 'Fondo T950',
  'T0': 'Fondo T0',
  'white': 'Fondo Blanco',
  'black': 'Fondo Negro',
  'default': 'Fondo Armonía',
  'card': 'Fondo Tarjeta'
};

const generationMethods = [
    { id: 'auto', name: 'Auto' },
    { id: 'mono', name: 'Monocromo' },
    { id: 'analogous', name: 'Análogo' },
    { id: 'complement', name: 'Complementario' },
    { id: 'triad', name: 'Triádico' },
    { id: 'tetrad', name: 'Tetrádico' }
];

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
  
  const [isAccessibilityVisible, setIsAccessibilityVisible] = useState(false);
  const [isExportVisible, setIsExportVisible] = useState(false);
  const [isComponentPreviewVisible, setIsComponentPreviewVisible] = useState(false);
  const [activeExport, setActiveExport] = useState('powerfx');

  const [isBrandPickerVisible, setIsBrandPickerVisible] = useState(false);
  const [isGrayPickerVisible, setIsGrayPickerVisible] = useState(false);
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const [isVariationsVisible, setIsVariationsVisible] = useState(false);
  
  const [accessibility, setAccessibility] = useState({ btn: { ratio: 0, level: 'Fail'}, text: { ratio: 0, level: 'Fail'} });
  const [accessibilityColors, setAccessibilityColors] = useState({
    btnBg: defaultState.brandColor,
    btnText: '#FFFFFF',
    textBg: '#FFFFFF',
    textColor: '#000000',
  });


  const [lightPreviewMode, setLightPreviewMode] = useState('T950');
  const [darkPreviewMode, setDarkPreviewMode] = useState('T0');
  const [semanticPreviewMode, setSemanticPreviewMode] = useState('card');
  const [colorModePreview, setColorModePreview] = useState('white');
  const [isMethodSelectorVisible, setIsMethodSelectorVisible] = useState(false);
  const [explorerMethod, setExplorerMethod] = useState('auto');

  const [simulationMode, setSimulationMode] = useState('none');
  const [primaryButtonTextColor, setPrimaryButtonTextColor] = useState('#FFFFFF');
  
  const [explorerPalette, setExplorerPalette] = useState([]);
  const [explorerGrayShades, setExplorerGrayShades] = useState([]);
  const [colorHistory, setColorHistory] = useState([defaultState.brandColor]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const isUpdateFromExplorer = useRef(false);


  const importFileRef = useRef(null);

  // --- Lógica de Generación de Temas ---
  // Genera la paleta para el Modo Color
  const generateExplorerPalette = (method = 'auto', baseColorHex) => {
    let newPalette = [];
    // Si el método es 'auto' o no hay color base, genera uno aleatorio.
    // De lo contrario, usa el color de marca actual como base para las armonías.
    const colorForExplorer = (method === 'auto' || !baseColorHex) 
      ? tinycolor.random()
      : tinycolor(baseColorHex);

    switch (method) {
        case 'mono': {
            newPalette = generateShades(colorForExplorer.toHexString());
            break;
        }
        case 'analogous': {
            const analogousColors = colorForExplorer.analogous(5, 10);
            analogousColors.forEach(c => {
                newPalette.push(...generateShades(c.toHexString()).slice(4, 8));
            });
            break;
        }
        case 'complement': {
            const complementColors = [colorForExplorer, colorForExplorer.complement()];
            complementColors.forEach(c => {
                newPalette.push(...generateShades(c.toHexString()).slice(0, 10));
            });
            break;
        }
        case 'triad': {
            const triadColors = colorForExplorer.triad();
            for(let i = 0; i < 7; i++) {
                newPalette.push(...generateShades(triadColors[0].toHexString()).slice(i*2, i*2+2));
                newPalette.push(...generateShades(triadColors[1].toHexString()).slice(i*2, i*2+2));
                newPalette.push(...generateShades(triadColors[2].toHexString()).slice(i*2, i*2+2));
            }
             newPalette = newPalette.slice(0, 20);
            break;
        }
        case 'tetrad': {
            const tetradColors = colorForExplorer.tetrad();
            tetradColors.forEach(c => {
                newPalette.push(...generateShades(c.toHexString()).slice(2, 7));
            });
            break;
        }
        case 'auto':
        default: {
            let hsv = colorForExplorer.toHsv();
            for (let i = 0; i < 20; i++) {
                hsv.h = (hsv.h + 137.508) % 360; // Golden Angle
                hsv.s = Math.max(0.3, Math.min(1, hsv.s + (Math.random() - 0.5) * 0.2));
                hsv.v = Math.max(0.6, Math.min(1, hsv.v + (Math.random() - 0.5) * 0.2));
                newPalette.push(tinycolor(hsv).toHexString());
            }
            break;
        }
    }
    setExplorerPalette(newPalette.slice(0,20));

    const baseForGray = newPalette.length > 9 ? newPalette[9] : tinycolor.random().toHexString();
    const harmonicGray = tinycolor(baseForGray).desaturate(85).toHexString();
    setExplorerGrayShades(generateShades(harmonicGray));
};
  // Función centralizada para actualizar el color de marca y manejar el historial
  const updateBrandColor = (newColor) => {
    if (newColor === brandColor) return;

    // Actualiza el historial
    const newHistory = colorHistory.slice(0, historyIndex + 1);
    newHistory.push(newColor);
    setColorHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // Actualiza el color
    setBrandColor(newColor);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setBrandColor(colorHistory[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < colorHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setBrandColor(colorHistory[newIndex]);
    }
  };


  // Genera un tema aleatorio basado en un método de armonía de color.
  const generateRandomThemeByMethod = (method) => {
    let newBrandColor;
    const baseColor = tinycolor.random();

    // Elige un color basado en el método de armonía
    switch (method) {
        case 'analogous':
            newBrandColor = baseColor.analogous()[1];
            break;
        case 'complement':
            newBrandColor = baseColor.complement();
            break;
        case 'triad':
            newBrandColor = baseColor.triad()[1];
            break;
        case 'tetrad':
            newBrandColor = baseColor.tetrad()[1];
            break;
        case 'mono':
        case 'auto':
        default:
            newBrandColor = baseColor;
            break;
    }

    // Se asegura de que el color elegido sea accesible contra blanco o negro
    let attempts = 0;
    let isAccessible = false;
    while (!isAccessible && attempts < 20) {
        // Usa la función isReadable de tinycolor para verificar el contraste a nivel AA
        if (tinycolor.isReadable('#FFF', newBrandColor, { level: "AA" }) || tinycolor.isReadable('#000', newBrandColor, { level: "AA" })) {
            isAccessible = true;
        } else {
            // Si no es accesible, genera un color completamente nuevo y lo intenta de nuevo
            newBrandColor = tinycolor.random();
        }
        attempts++;
    }

    updateBrandColor(newBrandColor.toHexString()); // Usar la nueva función
    setIsGrayAuto(true); // Activa el gris automático para una mejor armonía
    showNotification(`¡Nuevo tema aleatorio (${method}) generado!`);
    // Pasa el nuevo color directamente para que la paleta se genere en base a él
    generateExplorerPalette(method, newBrandColor.toHexString());
  };

  const handleExplorerColorPick = (newColor) => {
    isUpdateFromExplorer.current = true;
    updateBrandColor(newColor);
  };

  useEffect(() => {
    if (isUpdateFromExplorer.current) {
      // Si la actualización vino del explorador, no regeneramos la paleta.
      // Simplemente reiniciamos la bandera para la próxima vez.
      isUpdateFromExplorer.current = false;
    } else {
      // Si la actualización vino de otro lugar (deshacer, rehacer, selector principal),
      // entonces sí regeneramos la paleta de exploración.
      generateExplorerPalette(explorerMethod, brandColor);
    }
  }, [explorerMethod, brandColor]);

  // Efecto para generar paletas de colores (lógica interna)
  useEffect(() => {
    if (isGrayAuto) {
      const harmonicGray = tinycolor(brandColor).desaturate(85).toHexString();
      setGrayColor(harmonicGray);
    }
  }, [brandColor, isGrayAuto]);

  // [EFECTO PRINCIPAL] Genera todas las paletas y el código cuando cambian los colores base.
  useEffect(() => {
    const newBrandShades = generateShades(brandColor);
    const newGrayShades = generateShades(grayColor);
    
    setBrandShades(newBrandShades);
    setGrayShades(newGrayShades);

    if (newBrandShades.length < 20 || newGrayShades.length < 20) return;

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
    const harmonyGrayShades = generateShades(harmonyGray);
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

    let currentPalette = {
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
    
    // Esta lógica define los valores que se exportarán
    if (theme === 'dark') {
      currentPalette.fullBackgroundColors = [
        { name: 'Predeterminado', color: newGrayShades[0] }, { name: 'Apagado', color: newGrayShades[1] },
        { name: 'Debil', color: newGrayShades[2] }, { name: 'Fuerte', color: newGrayShades[9] },
        { name: 'Inverso', color: newGrayShades[19] }, { name: 'MarcaDebil', color: newBrandShades[1] },
        { name: 'InfoDebil', color: tinycolor(info).darken(25).toHexString() },
        { name: 'ExitoDebil', color: tinycolor(success).darken(25).toHexString() },
        { name: 'AtencionDebil', color: tinycolor(attention).darken(25).toHexString() },
        { name: 'CriticoDebil', color: tinycolor(critical).darken(25).toHexString() }, 
      ];
      currentPalette.fullForegroundColors = [
        { name: 'Predeterminado', color: newGrayShades[19] }, { name: 'Apagado', color: newGrayShades[6] },
        { name: 'Debil', color: newGrayShades[4] }, { name: 'Fuerte', color: newGrayShades[19] },
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
    } else { // light theme
       currentPalette.fullBackgroundColors = [
        { name: 'Predeterminado', color: newGrayShades[19] }, { name: 'Apagado', color: newGrayShades[18] },
        { name: 'Debil', color: newGrayShades[17] }, { name: 'Fuerte', color: newGrayShades[0] },
        { name: 'Inverso', color: newGrayShades[0] }, { name: 'MarcaDebil', color: newBrandShades[18] },
        { name: 'InfoDebil', color: tinycolor(info).lighten(25).toHexString() },
        { name: 'ExitoDebil', color: tinycolor(success).lighten(25).toHexString() },
        { name: 'AtencionDebil', color: tinycolor(attention).lighten(25).toHexString() },
        { name: 'CriticoDebil', color: tinycolor(critical).lighten(25).toHexString() },
      ];
       currentPalette.fullForegroundColors = [
        { name: 'Predeterminado', color: newGrayShades[0] }, { name: 'Apagado', color: newGrayShades[3] },
        { name: 'Debil', color: newGrayShades[5] }, { name: 'Fuerte', color: newGrayShades[0] },
        { name: 'Inverso', color: newGrayShades[19] }, { name: 'Info', color: info },
        { name: 'Critico', color: critical }, { name: 'Atencion', color: attention },
        { name: 'Exito', color: success }, { name: 'SobreAccento', color: '#FFFFFF' },
      ];
       currentPalette.fullBorderColors = [
        { name: 'Predeterminado', color: newGrayShades[17] }, { name: 'Fuerte', color: newGrayShades[5] },
        { name: 'Inverso', color: newGrayShades[19] }, { name: 'InfoFuerte', color: info },
        { name: 'CriticoFuerte', color: critical }, { name: 'AtencionFuerte', color: attention },
        { name: 'ExitoFuerte', color: success },
      ];
    }
    
    const order = {
      Fondos: ['Predeterminado', 'Apagado', 'Debil', 'Fuerte', 'Inverso', 'MarcaDebil', 'InfoDebil', 'ExitoDebil', 'AtencionDebil', 'CriticoDebil'],
      Textos: ['Predeterminado', 'Apagado', 'Debil', 'Fuerte', 'Inverso', 'SobreAccento', 'Info', 'Exito', 'Atencion', 'Critico'],
      Bordes: ['Predeterminado', 'Fuerte', 'Inverso', 'InfoFuerte', 'ExitoFuerte', 'AtencionFuerte', 'CriticoFuerte'],
      Acciones: ['Primario', 'PrimarioFlotante', 'PrimarioPresionado', 'Secundario', 'SecundarioPresionado', 'Critico', 'CriticoFlotante', 'CriticoPresionado'],
      Decorativos: ['Azul1', 'Azul2', 'Verde1', 'Verde2', 'Naranja1', 'Naranja2', 'Rosa1', 'Rosa2', 'Violeta1', 'Violeta2', 'Turquesa1', 'Turquesa2', 'Neutro1', 'Neutro2']
    };

    currentPalette.fullBackgroundColors.sort((a, b) => order.Fondos.indexOf(a.name) - order.Fondos.indexOf(b.name));
    currentPalette.fullForegroundColors.sort((a, b) => order.Textos.indexOf(a.name) - order.Textos.indexOf(b.name));
    currentPalette.fullBorderColors.sort((a, b) => order.Bordes.indexOf(a.name) - order.Bordes.indexOf(b.name));
    currentPalette.fullActionColors.sort((a, b) => order.Acciones.indexOf(a.name) - order.Acciones.indexOf(b.name));
    currentPalette.decorateColors.sort((a, b) => order.Decorativos.indexOf(a.name) - order.Decorativos.indexOf(b.name));

    setStylePalette(currentPalette);
    
    const root = document.documentElement;
    // Asigna las variables CSS que usarán los componentes internos
    root.style.setProperty('--bg-card', currentPalette.fullBackgroundColors.find(c=>c.name==='Apagado').color);
    root.style.setProperty('--bg-muted', currentPalette.fullBackgroundColors.find(c=>c.name==='Debil').color);
    root.style.setProperty('--text-default', currentPalette.fullForegroundColors.find(c=>c.name==='Predeterminado').color);
    root.style.setProperty('--text-muted', currentPalette.fullForegroundColors.find(c=>c.name==='Apagado').color);
    root.style.setProperty('--border-default', currentPalette.fullBorderColors.find(c=>c.name==='Predeterminado').color);
    root.style.setProperty('--border-strong', currentPalette.fullBorderColors.find(c=>c.name==='Fuerte').color);
    root.style.setProperty('--action-primary-default', currentPalette.fullActionColors.find(c=>c.name==='Primario').color);
    root.style.setProperty('--action-primary-hover', currentPalette.fullActionColors.find(c=>c.name==='PrimarioFlotante').color);
    root.style.setProperty('--text-info', currentPalette.fullForegroundColors.find(c=>c.name==='Info').color);
    root.style.setProperty('--text-success', currentPalette.fullForegroundColors.find(c=>c.name==='Exito').color);
    root.style.setProperty('--text-attention', currentPalette.fullForegroundColors.find(c=>c.name==='Atencion').color);
    root.style.setProperty('--text-critical', currentPalette.fullForegroundColors.find(c=>c.name==='Critico').color);
    root.style.setProperty('--bg-info-weak', currentPalette.fullBackgroundColors.find(c=>c.name==='InfoDebil').color);
    root.style.setProperty('--bg-success-weak', currentPalette.fullBackgroundColors.find(c=>c.name==='ExitoDebil').color);
    root.style.setProperty('--bg-attention-weak', currentPalette.fullBackgroundColors.find(c=>c.name==='AtencionDebil').color);
    root.style.setProperty('--bg-critical-weak', currentPalette.fullBackgroundColors.find(c=>c.name==='CriticoDebil').color);
        
    const themeData = {
        brandShades: newBrandShades, grayShades: newGrayShades,
        stylePalette: currentPalette, theme, brandColor, grayColor, font,
        harmonyPalettes: newHarmonyPalettes
    };

    setGeneratedCode(generatePowerFxCode(themeData, fxSeparator, useFxQuotes));
    setCssCode(generateCssCode(themeData));
    setTailwindCode(generateTailwindCode(themeData));

  }, [brandColor, grayColor, theme, font, fxSeparator, useFxQuotes, harmonyMode]);
  
  // [NUEVO EFECTO] Calcula la accesibilidad cada vez que la paleta de estilos cambia.
  useEffect(() => {
    // Evita ejecutar si la paleta de estilos o las escalas de grises aún no están listas.
    if (!stylePalette || !harmonyPalettes || grayShades.length < 20) {
      return;
    }

    // --- Lógica de Accesibilidad ---
    // TEST 1: Contraste del Color de Acento sobre el fondo principal.
    const accentColor = harmonyPalettes.accentColor;
    const themeBgColor = stylePalette.fullBackgroundColors.find(c => c.name === 'Predeterminado').color;
    const accentContrast = tinycolor.readability(accentColor, themeBgColor);

    let accentLevel = 'Fallido';
    if (accentContrast >= 7) accentLevel = 'AAA';
    else if (accentContrast >= 4.5) accentLevel = 'AA';

    // TEST 2: Contraste del Color de Marca sobre el fondo principal.
    const brandContrast = tinycolor.readability(brandColor, themeBgColor);
    
    // Asignación de nivel (Fallido, AA, o AAA) según las guías WCAG.
    let brandLevel = 'Fallido';
    if (brandContrast >= 7) brandLevel = 'AAA';
    else if (brandContrast >= 4.5) brandLevel = 'AA';

    // Actualización del estado de accesibilidad para la UI.
    setAccessibility({ 
        btn: { ratio: accentContrast.toFixed(2), level: accentLevel }, // 'btn' ahora representa el test de acento
        text: { ratio: brandContrast.toFixed(2), level: brandLevel } 
    });

    // Actualización de los colores exactos usados para el cálculo.
    setAccessibilityColors({
        btnBg: themeBgColor,       // Fondo para la previsualización del acento
        btnText: accentColor,      // El color de acento
        textBg: themeBgColor,      // Fondo para la previsualización de la marca
        textColor: brandColor,     // El color de marca
    });

    // Esta lógica se mantiene solo para definir el color de texto del botón en la UI de previsualización
    const primaryActionColor = stylePalette.fullActionColors.find(c => c.name === 'Primario').color;
    const lightColor = grayShades[19];
    const darkColor = grayShades[0];
    const contrastWithLight = tinycolor.readability(primaryActionColor, lightColor);
    const contrastWithDark = tinycolor.readability(primaryActionColor, darkColor);
    const newBestTextColor = contrastWithLight > contrastWithDark ? lightColor : darkColor;
    setPrimaryButtonTextColor(newBestTextColor);

  }, [stylePalette, grayShades, brandColor, harmonyPalettes]); // <-- Se ejecuta cuando cambia la paleta, los grises O EL COLOR DE MARCA.

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
    // Utiliza el método seleccionado en el combobox de configuración.
    generateRandomThemeByMethod(explorerMethod);
  };

  const handleRandomHarmony = () => {
    const analogousColors = tinycolor(brandColor).analogous();
    let newColor = analogousColors[Math.floor(Math.random() * analogousColors.length)];
    
    let attempts = 0;
    while(tinycolor.readability(newColor, '#FFF') < 4.5 && attempts < 20) {
        newColor = tinycolor.random();
        attempts++;
    }

    updateBrandColor(newColor.toHexString());
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
          console.error("Error al importar el tema:", error);
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
    setGrayColor(defaultState.grayColor);
    showNotification("Tema reiniciado a los valores por defecto.");
  };

  const handleThemeToggle = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const cyclePreviewMode = (mode, setMode, options) => {
    const currentIndex = options.indexOf(mode);
    if (currentIndex === -1) {
        setMode(options[0]);
    } else {
        const nextIndex = (currentIndex + 1) % options.length;
        setMode(options[nextIndex]);
    }
  }
  
  if (!stylePalette || !harmonies || !harmonyPalettes) {
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
            <p className="mt-4 text-lg">Generando sistema de diseño...</p>
        </div>
    );
  }

  // Define los estilos del tema visual principal (Blanco/Negro puro)
  const pageThemeStyle = {
    backgroundColor: theme === 'light' ? '#FFFFFF' : '#000000',
    color: stylePalette.fullForegroundColors.find(c => c.name === 'Predeterminado').color,
    transition: 'background-color 0.3s ease, color 0.3s ease'
  };

  const controlsThemeStyle = {
    backgroundColor: theme === 'light' ? '#F9FAFB' : stylePalette.fullBackgroundColors.find(c => c.name === 'Apagado').color,
    borderColor: theme === 'light' ? '#E5E7EB' : stylePalette.fullBorderColors.find(c => c.name === 'Predeterminado').color,
    color: theme === 'light' ? '#4B5563' : '#D1D5DB'
  }

  const getPreviewBgColor = (mode, shades, cardColor, harmonyBg) => {
    if (!shades || shades.length < 20) return '#FFFFFF';
    switch(mode) {
      case 'T950': return shades[19];
      case 'T0': return shades[0];
      case 'white': return '#FFFFFF';
      case 'black': return '#000000';
      case 'default': return harmonyBg;
      case 'card': return cardColor;
      default: return shades[19];
    }
  }

  const harmonyBg = harmonyPalettes.grayShades[1];
  const lightPreviewBg = getPreviewBgColor(lightPreviewMode, grayShades, null, harmonyBg);
  const darkPreviewBg = getPreviewBgColor(darkPreviewMode, grayShades, null, harmonyBg);
  const semanticPreviewBg = getPreviewBgColor(semanticPreviewMode, grayShades, stylePalette.fullBackgroundColors.find(c=>c.name==='Apagado').color, harmonyBg);
  const colorModeBg = getPreviewBgColor(colorModePreview, grayShades, null, harmonyBg);

  
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
        className={`min-h-screen p-4 sm:p-8`} 
        style={{ fontFamily: availableFonts[font], ...pageThemeStyle, filter: simulationMode !== 'none' ? `url(#${simulationMode})` : 'none' }}
      >
        <header className="relative flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
             <div className="flex items-center gap-4">
                <img src="https://raw.githubusercontent.com/pentakillw/sistema-de-diseno-react/main/Icono_FX.png" alt="Sistema FX Logo" className="h-20 w-20 md:h-24 md:w-24 rounded-2xl shadow-md"/>
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: pageThemeStyle.color }}>BIENVENIDOS</h1>
                    <p className="text-md" style={{ color: theme === 'light' ? '#6B7280' : '#9CA3AF' }}>al sistema de diseño para Power Apps</p>
                </div>
            </div>
            <div className="flex items-center gap-2 self-start md:self-center">
                <input type="file" ref={importFileRef} onChange={handleImport} accept=".json" className="hidden"/>
                <button title="Reiniciar Tema" onClick={handleReset} className="text-sm font-medium p-2 rounded-lg" style={{ backgroundColor: controlsThemeStyle.backgroundColor, color: controlsThemeStyle.color}}><RefreshCcw size={16}/></button>
                <button title="Importar Tema" onClick={() => importFileRef.current.click()} className="text-sm font-medium p-2 rounded-lg" style={{ backgroundColor: controlsThemeStyle.backgroundColor, color: controlsThemeStyle.color}}><Upload size={16}/></button>
                <button title="Exportar Tema" onClick={handleExport} className="text-sm font-medium p-2 rounded-lg" style={{ backgroundColor: controlsThemeStyle.backgroundColor, color: controlsThemeStyle.color}}><Download size={16}/></button>
                <button title="Ayuda" onClick={() => setIsHelpVisible(true)} className="text-sm font-medium p-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: controlsThemeStyle.backgroundColor, color: controlsThemeStyle.color}}><HelpCircle size={16}/></button>
            </div>
        </header>

        <main>
            <div className="md:sticky top-4 z-40 mb-8">
                <section className="p-4 rounded-xl border shadow-lg" style={controlsThemeStyle}>
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm" htmlFor="fontSelector">Fuente:</label>
                            <select id="fontSelector" value={font} onChange={(e) => setFont(e.target.value)} className="font-semibold px-2 py-1 rounded-md border" style={{ backgroundColor: theme === 'light' ? '#FFFFFF' : '#374151', color: pageThemeStyle.color, borderColor: controlsThemeStyle.borderColor }}>
                                {Object.keys(availableFonts).map(fontName => (<option key={fontName} value={fontName}>{fontName}</option>))}
                            </select>
                        </div>
                        <div className="relative flex items-center gap-2">
                            <label className="text-sm">Color de Marca:</label>
                            <div className="flex items-center rounded-md" style={{ backgroundColor: theme === 'light' ? '#FFFFFF' : '#374151' }}>
                                <div className="w-7 h-7 rounded-l-md cursor-pointer border-r" style={{ backgroundColor: brandColor, borderColor: controlsThemeStyle.borderColor }} onClick={() => setIsBrandPickerVisible(!isBrandPickerVisible)}/>
                                <HexColorInput color={brandColor} onChange={updateBrandColor} className="font-mono bg-transparent px-2 py-1 rounded-r-md w-24 focus:outline-none" style={{ color: pageThemeStyle.color}} prefixed/>
                            </div>
                            {isBrandPickerVisible && (<div className="absolute z-10 top-full mt-2 left-0 w-56"><div className="fixed inset-0" onClick={() => setIsBrandPickerVisible(false)} /><HexColorPicker color={brandColor} onChange={updateBrandColor} /></div>)}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2"><Wand2 size={16} /><label className="text-sm font-medium">Gris Automático</label></div>
                            <Switch checked={isGrayAuto} onCheckedChange={setIsGrayAuto} />
                        </div>
                        <div className={`relative flex items-center gap-2 transition-opacity ${isGrayAuto ? 'opacity-50' : 'opacity-100'}`}>
                            <label className="text-sm">Escala de Grises:</label>
                            <div className="flex items-center rounded-md" style={{ backgroundColor: theme === 'light' ? '#FFFFFF' : '#374151' }}>
                                <div className={`w-7 h-7 rounded-l-md border-r ${isGrayAuto ? 'cursor-not-allowed' : 'cursor-pointer'}`} style={{ backgroundColor: grayColor, borderColor: controlsThemeStyle.borderColor }} onClick={() => !isGrayAuto && setIsGrayPickerVisible(!isGrayPickerVisible)}/>
                                <HexColorInput color={grayColor} onChange={setGrayColor} className="font-mono bg-transparent px-2 py-1 rounded-r-md w-24 focus:outline-none" style={{ color: pageThemeStyle.color}} prefixed disabled={isGrayAuto}/>
                            </div>
                            {isGrayPickerVisible && !isGrayAuto && (<div className="absolute z-10 top-full mt-2 right-0 w-56"><div className="fixed inset-0" onClick={() => setIsGrayPickerVisible(false)} /><HexColorPicker color={grayColor} onChange={setGrayColor} /></div>)}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <label className="text-sm" htmlFor="methodSelector">Método Aleatorio:</label>
                            <select 
                                id="methodSelector" 
                                value={explorerMethod} 
                                onChange={(e) => setExplorerMethod(e.target.value)} 
                                className="font-semibold px-2 py-1 rounded-md border" 
                                style={{ backgroundColor: theme === 'light' ? '#FFFFFF' : '#374151', color: pageThemeStyle.color, borderColor: controlsThemeStyle.borderColor }}
                            >
                                {generationMethods.map(method => (
                                    <option key={method.id} value={method.id}>{method.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                           <button onClick={handleUndo} disabled={historyIndex === 0} className="p-2 rounded-lg disabled:opacity-50" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)'}} title="Deshacer"><Undo2 size={16}/></button>
                           <button onClick={handleRedo} disabled={historyIndex === colorHistory.length - 1} className="p-2 rounded-lg disabled:opacity-50" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)'}} title="Rehacer"><Redo2 size={16}/></button>
                        </div>

                        <div className="hidden lg:block h-6 w-px bg-[var(--border-default)]"></div>

                        <div className="flex items-center gap-2">
                            <label className="text-sm" htmlFor="simSelectorTop">Simulador:</label>
                            <select id="simSelectorTop" value={simulationMode} onChange={(e) => setSimulationMode(e.target.value)} className="font-semibold px-2 py-1 rounded-md border" style={{ backgroundColor: theme === 'light' ? '#FFFFFF' : '#374151', color: pageThemeStyle.color, borderColor: controlsThemeStyle.borderColor }}>
                                <option value="none">Ninguno</option>
                                <option value="protanopia">Protanopia</option>
                                <option value="deuteranopia">Deuteranopia</option>
                                <option value="tritanopia">Tritanopia</option>
                            </select>
                        </div>
                    </div>
                </section>
            </div>
            
            <AccessibilityCard 
              accessibility={accessibility} 
              colors={accessibilityColors} 
              isVisible={isAccessibilityVisible}
              onToggle={() => setIsAccessibilityVisible(!isAccessibilityVisible)}
            />

            <section className="p-4 rounded-xl border mb-8" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)'}}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
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

             <section className="p-4 rounded-xl border mb-8" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)'}}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
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
                                    <button className="w-full font-bold py-2 px-4 rounded-lg transition-colors" style={{ backgroundColor: 'var(--action-primary-default)', color: primaryButtonTextColor }}>Botón Primario</button>
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
             <section className="space-y-6 mb-8">
               <div className="p-4 sm:p-6 rounded-xl border" style={{ backgroundColor: colorModeBg, borderColor: grayShades.length > 2 ? grayShades[2] : '#4B5563' }}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                            <h2 className="font-bold text-lg" style={{ color: tinycolor(colorModeBg).isLight() ? '#000' : '#FFF' }}>Modo Color</h2>
                            <p className="text-sm mt-1 truncate" style={{ color: tinycolor(colorModeBg).isLight() ? '#4B5563' : '#9CA3AF' }}>Toca un color para usarlo como Color de Marca.</p>
                        </div>
                        <div className="flex items-center flex-wrap justify-end gap-2">
                           <span className="text-xs font-mono p-1 rounded-md" style={{ backgroundColor: 'rgba(0,0,0,0.1)', color: tinycolor(colorModeBg).isLight() ? '#000' : '#FFF' }}>{backgroundModeLabels[colorModePreview]}</span>
                            <button onClick={() => cyclePreviewMode(colorModePreview, setColorModePreview, ['white', 'T950', 'black', 'T0', 'default'])} className="text-sm font-medium py-1 px-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)'}}>
                               <Layers size={14}/> Alternar Fondo
                            </button>
                             <button onClick={() => setIsVariationsVisible(true)} className="text-sm font-medium py-1 px-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}>
                                <Palette size={14} /> Variaciones
                            </button>
                        </div>
                    </div>
                    <ColorPalette isExplorer={true} shades={explorerPalette} onShadeCopy={handleExplorerColorPick} themeOverride={tinycolor(colorModeBg).isLight() ? 'light' : 'dark'}/>
                    <div className="mt-6 pt-4 border-t" style={{ borderColor: tinycolor(colorModeBg).isLight() ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}>
                        <p className="text-sm font-semibold mb-2" style={{ color: tinycolor(colorModeBg).isLight() ? '#4B5563' : '#9CA3AF' }}>Escala de Grises Sugerida (toca para usar)</p>
                        <ColorPalette
                            isExplorer={true}
                            shades={explorerGrayShades}
                            onShadeCopy={setGrayColor}
                            themeOverride={tinycolor(colorModeBg).isLight() ? 'light' : 'dark'}
                        />
                    </div>
               </div>

               <div className="p-4 sm:p-6 rounded-xl border" style={{ backgroundColor: lightPreviewBg, borderColor: grayShades.length > 7 ? grayShades[7] : '#E5E7EB' }}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <h2 className="font-bold" style={{color: tinycolor(lightPreviewBg).isLight() ? '#000' : '#FFF'}}>Modo Claro</h2>
                   <div className="flex items-center gap-2 sm:gap-4">
                      <span className="text-xs font-mono p-1 rounded-md" style={{ backgroundColor: 'rgba(0,0,0,0.1)', color: tinycolor(lightPreviewBg).isLight() ? '#000' : '#FFF' }}>{backgroundModeLabels[lightPreviewMode]}</span>
                      <button 
                        onClick={() => cyclePreviewMode(lightPreviewMode, setLightPreviewMode, ['T950', 'white'])}
                        className="text-sm font-medium py-1 px-3 rounded-lg flex items-center gap-2"
                        style={{ 
                          backgroundColor: tinycolor(lightPreviewBg).isLight() ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)', 
                          color: tinycolor(lightPreviewBg).isLight() ? '#000' : '#FFF'
                        }}
                      >
                         <Layers size={14}/> Alternar Fondo
                      </button>
                  </div>
                </div>
                <ColorPalette title="Color de Marca" color={brandColor} hex={brandColor} shades={brandShades} onShadeCopy={(color) => handleCopy(color, `Tono ${color.toUpperCase()} copiado!`)} themeOverride="light"/>
                <ColorPalette title="Escala de Grises" color={grayColor} hex={grayColor} shades={grayShades} onShadeCopy={(color) => handleCopy(color, `Tono ${color.toUpperCase()} copiado!`)} themeOverride="light"/>
              </div>

               <div className="p-4 sm:p-6 rounded-xl border" style={{ backgroundColor: darkPreviewBg, borderColor: grayShades.length > 2 ? grayShades[2] : '#4B5563' }}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div className="flex-1">
                     <h2 className="font-bold text-white" style={{color: tinycolor(darkPreviewBg).isLight() ? '#000' : '#FFF'}}>Modo Oscuro</h2>
                  </div>
                   <div className="flex flex-col sm:flex-row items-start sm:items-center flex-wrap gap-4">
                        <div className="flex items-center gap-2 sm:gap-4">
                          <span className="text-xs font-mono p-1 rounded-md" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: tinycolor(darkPreviewBg).isLight() ? '#000' : '#FFF' }}>{backgroundModeLabels[darkPreviewMode]}</span>
                          <button 
                            onClick={() => cyclePreviewMode(darkPreviewMode, setDarkPreviewMode, ['T0', 'black'])}
                            className="text-sm font-medium py-1 px-3 rounded-lg flex items-center gap-2"
                            style={{ 
                              backgroundColor: tinycolor(darkPreviewBg).isLight() ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)', 
                              color: tinycolor(darkPreviewBg).isLight() ? '#000' : '#FFF'
                            }}
                          >
                             <Layers size={14}/> Alternar Fondo
                          </button>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg p-1" style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
                            <button onClick={() => setHarmonyMode('complementary')} className={`text-xs font-semibold py-1 px-3 rounded-md ${harmonyMode === 'complementary' ? 'text-white' : 'text-gray-300'}`} style={{backgroundColor: harmonyMode === 'complementary' ? brandShades[4] : 'transparent'}}>Complementaria</button>
                            <button onClick={() => setHarmonyMode('analogous')} className={`text-xs font-semibold py-1 px-3 rounded-md ${harmonyMode === 'analogous' ? 'text-white' : 'text-gray-300'}`} style={{backgroundColor: harmonyMode === 'analogous' ? brandShades[4] : 'transparent'}}>Análoga</button>
                            <button onClick={() => setHarmonyMode('triadic')} className={`text-xs font-semibold py-1 px-3 rounded-md ${harmonyMode === 'triadic' ? 'text-white' : 'text-gray-300'}`} style={{backgroundColor: harmonyMode === 'triadic' ? brandShades[4] : 'transparent'}}>Triádica</button>
                        </div>
                   </div>
                </div>
                <ColorPalette title="Color de Marca" color={brandColor} hex={brandColor} shades={brandShades} onShadeCopy={(color) => handleCopy(color, `Tono ${color.toUpperCase()} copiado!`)} themeOverride="dark"/>
                <ColorPalette title="Escala de Grises" color={grayColor} hex={grayColor} shades={grayShades} onShadeCopy={(color) => handleCopy(color, `Tono ${color.toUpperCase()} copiado!`)} themeOverride="dark"/>
                <div className="mt-6 pt-4 border-t" style={{ borderColor: tinycolor(darkPreviewBg).isLight() ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}>
                  <ColorPalette title="Color de Acento" color={harmonyPalettes.accentColor} hex={harmonyPalettes.accentColor} shades={harmonyPalettes.accentShades} onShadeCopy={(color) => handleCopy(color, `Tono ${color.toUpperCase()} copiado!`)} themeOverride="dark"/>
                  <ColorPalette title="Escala de Grises Armónica" color={harmonyPalettes.gray} hex={harmonyPalettes.gray} shades={harmonyPalettes.grayShades} onShadeCopy={(color) => handleCopy(color, `Tono ${color.toUpperCase()} copiado!`)} themeOverride="dark"/>
                </div>
              </div>

               <div className="p-4 sm:p-6 rounded-xl border" style={{ backgroundColor: semanticPreviewBg, borderColor: 'var(--border-default)'}}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <h2 className="font-bold text-lg" style={{ color: tinycolor(semanticPreviewBg).isLight() ? '#000' : '#FFF' }}>Paletas Semánticas</h2>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <span className="text-xs font-mono p-1 rounded-md" style={{ backgroundColor: 'rgba(0,0,0,0.1)', color: tinycolor(semanticPreviewBg).isLight() ? 'var(--text-muted)' : '#FFF' }}>{backgroundModeLabels[semanticPreviewBg]}</span>
                       <button 
                        onClick={() => cyclePreviewMode(semanticPreviewBg, setSemanticPreviewMode, ['white', 'T950', 'black', 'T0', 'card'])}
                        className="text-sm font-medium py-1 px-3 rounded-lg flex items-center gap-2"
                        style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)'}}
                      >
                         <Layers size={14}/> Alternar Fondo
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--border-default)'}}>
                      <SemanticColorPalette title="Fondos" colors={stylePalette.fullBackgroundColors} onColorCopy={handleCopy} themeOverride={tinycolor(semanticPreviewBg).isLight() ? 'light' : 'dark'} />
                      <SemanticColorPalette title="Textos" colors={stylePalette.fullForegroundColors} onColorCopy={handleCopy} themeOverride={tinycolor(semanticPreviewBg).isLight() ? 'light' : 'dark'} />
                      <SemanticColorPalette title="Bordes" colors={stylePalette.fullBorderColors} onColorCopy={handleCopy} themeOverride={tinycolor(semanticPreviewBg).isLight() ? 'light' : 'dark'} />
                      <SemanticColorPalette title="Acciones" colors={stylePalette.fullActionColors} onColorCopy={handleCopy} themeOverride={tinycolor(semanticPreviewBg).isLight() ? 'light' : 'dark'} />
                      <SemanticColorPalette title="Decorativos" colors={stylePalette.decorateColors} onColorCopy={handleCopy} themeOverride={tinycolor(semanticPreviewBg).isLight() ? 'light' : 'dark'} />
                  </div>
              </div>

            </section>
        </main>
        <footer className="text-center mt-12 pt-8 border-t" style={{ borderColor: controlsThemeStyle.borderColor, color: controlsThemeStyle.color}}>
            <AdBanner />
            <p className="text-sm">Creado por JD_DM.</p>
            <p className="text-xs mt-1">Un proyecto de código abierto para la comunidad de Power Apps.</p>
        </footer>
        {notification.message && (<div className="fixed bottom-5 right-5 text-white text-sm font-bold py-2 px-4 rounded-lg shadow-lg flex items-center gap-2" style={{ backgroundColor: notification.type === 'error' ? '#EF4444' : '#10B981'}}><Check size={16}/> {notification.message}</div>)}
        <FloatingActionButtons 
            onRandomClick={handleRandomTheme}
            onThemeToggle={handleThemeToggle}
            currentTheme={theme}
        />
        {isHelpVisible && <HelpModal onClose={() => setIsHelpVisible(false)} />}
        {isVariationsVisible && <VariationsModal 
            explorerPalette={explorerPalette}
            onClose={() => setIsVariationsVisible(false)}
            onColorSelect={updateBrandColor}
        />}
      </div>
    </>
  );
}

export default App;


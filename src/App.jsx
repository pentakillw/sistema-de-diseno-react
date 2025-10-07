import React, { useState, useEffect, useRef, useMemo } from 'react';
import tinycolor from 'tinycolor2';
import { Sparkles, Wand2, HelpCircle, X, Check, Clipboard, Download, Upload, AlertCircle, RefreshCcw, Image as ImageIcon } from 'lucide-react';
import { HexColorPicker, HexColorInput } from 'react-colorful';

// --- CONFIGURACIÓN Y VALORES POR DEFECTO ---

const availableFonts = {
  'Poppins': '"Poppins", sans-serif',
  'Roboto': '"Roboto", sans-serif',
  'Open Sans': '"Open Sans", sans-serif',
  'Lato': '"Lato", sans-serif',
  'Montserrat': '"Montserrat", sans-serif',
  'Segoe UI': '"Segoe UI", system-ui, sans-serif',
};

const defaultState = {
    theme: 'dark',
    brandColor: '#8a2be2',
    isGrayAuto: true,
    grayColor: '#6f6a75',
    font: 'Poppins',
    fxSeparator: ';',
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

// --- FUNCIONES DE UTILIDAD Y LÓGICA DE NEGOCIO ---

const generateShades = (hex) => {
  if (!tinycolor(hex).isValid()) return Array(10).fill('#cccccc');
  const baseColor = tinycolor(hex);
  const shades = Array(10).fill('');
  shades[5] = baseColor.toHexString();
  for (let i = 1; i <= 5; i++) shades[5 - i] = baseColor.clone().darken(i * 8).toHexString();
  for (let i = 1; i <= 4; i++) shades[5 + i] = baseColor.clone().lighten(i * 8).toHexString();
  return shades;
};

const generatePowerFxCode = (themeData, separator) => {
  const { brandShades, grayShades, stylePalette, theme, brandColor, grayColor, font } = themeData;
  const { backgroundColors, foregroundColors, borderColors, actionColors, decorateColors } = stylePalette;

  const formatStylePalette = (palette) => palette.map(item => `    "${item.name}": "${item.color.toUpperCase()}"`).join(`${separator}\n`);
  const fontStylesRecord = Object.entries(displayStylesConfig)
    .map(([name, styles]) => `    "${name.replace(/ /g, '')}": { Font: Font.'${font.split(' ')[0]}'${separator} Size: ${parseFloat(styles.fontSize) * 10}${separator} Bold: ${styles.fontWeight === '700'} }`)
    .join(`${separator}\n`);

  return `
// --- TEMA DE DISEÑO GENERADO ---
// Modo: ${theme === 'light' ? 'Claro' : 'Oscuro'} | Fuente: ${font}
// Marca: ${brandColor.toUpperCase()} | Base Gris: ${grayColor.toUpperCase()}
ClearCollect(
    colSistemaDeDiseño${separator}
    {
        Marca: {
${brandShades.map((s, i) => `    t${i * 100 === 0 ? '50' : (i+1) * 100}: "${s.toUpperCase()}"`).join(`${separator}\n`)}
        }${separator}
        Gris: {
${grayShades.map((s, i) => `    t${i * 100 === 0 ? '50' : (i+1) * 100}: "${s.toUpperCase()}"`).join(`${separator}\n`)}
        }${separator}
        Fondos: {
${formatStylePalette(backgroundColors)}
        }${separator}
        Textos: {
${formatStylePalette(foregroundColors)}
        }${separator}
        Bordes: {
${formatStylePalette(borderColors)}
        }${separator}
        Acciones: {
${formatStylePalette(actionColors)}
        }${separator}
        Decorativos: {
${formatStylePalette(decorateColors)}
        }${separator}
        Fuentes: {
${fontStylesRecord}
        }
    }
);
  `.trim();
};

const extractColorsFromImage = (imageUrl, colorCount = 6) => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "Anonymous";
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d', { willReadFrequently: true });
            const maxDimension = 100;
            let width = image.width, height = image.height;

            if (width > height) { if (width > maxDimension) { height *= maxDimension / width; width = maxDimension; } } 
            else { if (height > maxDimension) { width *= maxDimension / height; height = maxDimension; } }
            
            canvas.width = width; canvas.height = height;
            context.drawImage(image, 0, 0, width, height);
            
            try {
                const imageData = context.getImageData(0, 0, width, height).data;
                const colorMap = {};
                for (let i = 0; i < imageData.length; i += 16) {
                    const [r, g, b] = [imageData[i], imageData[i + 1], imageData[i + 2]];
                    const hex = tinycolor({ r, g, b }).toHexString();
                    if (tinycolor(hex).getLuminance() > 0.1 && tinycolor(hex).getLuminance() < 0.9) {
                       colorMap[hex] = (colorMap[hex] || 0) + 1;
                    }
                }
                const sortedColors = Object.keys(colorMap).sort((a, b) => colorMap[b] - colorMap[a]);
                resolve(sortedColors.slice(0, colorCount));
            } catch (error) { reject(new Error("No se pudo procesar la imagen.")); }
        };
        image.onerror = () => reject(new Error("No se pudo cargar la imagen."));
        image.src = imageUrl;
    });
};

// --- HOOKS PERSONALIZADOS ---

const useDesignSystem = (config) => {
    const { brandColor, grayColor: manualGrayColor, isGrayAuto, theme, font, fxSeparator } = config;

    const effectiveGrayColor = useMemo(() => isGrayAuto ? tinycolor(brandColor).desaturate(85).toHexString() : manualGrayColor, [brandColor, manualGrayColor, isGrayAuto]);
    const brandShades = useMemo(() => generateShades(brandColor), [brandColor]);
    const grayShades = useMemo(() => generateShades(effectiveGrayColor), [effectiveGrayColor]);

    const stylePalette = useMemo(() => {
        if (brandShades.length < 10 || grayShades.length < 10) return null;
        const infoBase = '#0ea5e9', successBase = '#22c55e', attentionBase = '#f97316', criticalBase = '#ef4444';
        const mix = (c1, c2) => tinycolor.mix(c1, c2, 15).saturate(10).toHexString();
        const info = mix(infoBase, effectiveGrayColor), success = mix(successBase, effectiveGrayColor), attention = mix(attentionBase, effectiveGrayColor), critical = mix(criticalBase, effectiveGrayColor);

        const palettes = {
            dark: {
                backgroundColors: [ { name: 'Predeterminado', color: grayShades[0] }, { name: 'Tarjeta', color: grayShades[1] }, { name: 'Apagado', color: grayShades[2] }, { name: 'Sutil', color: tinycolor(grayShades[0]).lighten(5).toHexString() } ],
                foregroundColors: [ { name: 'Predeterminado', color: grayShades[9] }, { name: 'Apagado', color: grayShades[7] }, { name: 'Sutil', color: grayShades[6] } ],
                borderColors: [ { name: 'Predeterminado', color: grayShades[2] }, { name: 'Fuerte', color: grayShades[4] } ],
            },
            light: {
                backgroundColors: [ { name: 'Predeterminado', color: '#FFFFFF' }, { name: 'Tarjeta', color: '#FFFFFF' }, { name: 'Apagado', color: grayShades[8] }, { name: 'Sutil', color: grayShades[8] } ],
                foregroundColors: [ { name: 'Predeterminado', color: grayShades[0] }, { name: 'Apagado', color: grayShades[3] }, { name: 'Sutil', color: grayShades[5] } ],
                borderColors: [ { name: 'Predeterminado', color: grayShades[7] }, { name: 'Fuerte', color: grayShades[5] } ],
            },
            common: {
                actionColors: [ { name: 'Primario', color: brandShades[5] }, { name: 'PrimarioFlotante', color: brandShades[6] }, { name: 'PrimarioPresionado', color: brandShades[7] }, { name: 'Secundario', color: grayShades[4] }, { name: 'SecundarioPresionado', color: grayShades[5] } ],
                decorateColors: [ { name: 'Azul1', color: info }, { name: 'Verde1', color: success }, { name: 'Naranja1', color: attention }, { name: 'Critico1', color: critical } ],
            }
        };
        return { ...palettes[theme], ...palettes.common };
    }, [brandShades, grayShades, theme, effectiveGrayColor]);
    
    const accessibility = useMemo(() => {
        if (!stylePalette) return { btn: { ratio: 0, level: 'Fail'}, text: { ratio: 0, level: 'Fail'} };
        const btnBg = stylePalette.actionColors.find(c => c.name === 'Primario').color;
        const btnFg = tinycolor.mostReadable(btnBg, ["#FFFFFF", "#000000"]).toHexString();
        const textBg = stylePalette.backgroundColors.find(c => c.name === 'Predeterminado').color;
        const textFg = stylePalette.foregroundColors.find(c => c.name === 'Predeterminado').color;

        const btnContrast = tinycolor.readability(btnBg, btnFg);
        const textContrast = tinycolor.readability(textBg, textFg);
        const getLevel = (ratio) => (ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Fallido');

        return {
            btn: { ratio: btnContrast.toFixed(2), level: getLevel(btnContrast) },
            text: { ratio: textContrast.toFixed(2), level: getLevel(textContrast) },
            btnFg
        };
    }, [stylePalette]);

    const generatedCode = useMemo(() => {
        if (!stylePalette) return "// Generando código...";
        return generatePowerFxCode({ brandShades, grayShades, stylePalette, theme, brandColor, grayColor: effectiveGrayColor, font }, fxSeparator);
    }, [stylePalette, brandShades, grayShades, theme, brandColor, effectiveGrayColor, font, fxSeparator]);

    return { brandShades, grayShades, stylePalette, accessibility, generatedCode, effectiveGrayColor };
};

const useThemeEffect = (stylePalette, font) => {
    useEffect(() => {
      if (!stylePalette) return;
      const root = document.documentElement;
      root.style.fontFamily = availableFonts[font];
      
      const mappings = {
        '--bg-default': stylePalette.backgroundColors.find(c=>c.name==='Predeterminado').color,
        '--bg-card': stylePalette.backgroundColors.find(c=>c.name==='Tarjeta').color,
        '--bg-muted': stylePalette.backgroundColors.find(c=>c.name==='Apagado').color,
        '--text-default': stylePalette.foregroundColors.find(c=>c.name==='Predeterminado').color,
        '--text-muted': stylePalette.foregroundColors.find(c=>c.name==='Apagado').color,
        '--border-default': stylePalette.borderColors.find(c=>c.name==='Predeterminado').color,
        '--border-strong': stylePalette.borderColors.find(c=>c.name==='Fuerte').color,
        '--action-primary-default': stylePalette.actionColors.find(c=>c.name==='Primario').color,
        '--action-primary-hover': stylePalette.actionColors.find(c=>c.name==='PrimarioFlotante').color,
        '--action-secondary-default': stylePalette.actionColors.find(c=>c.name==='Secundario').color,
        '--action-secondary-hover': tinycolor(stylePalette.actionColors.find(c=>c.name==='Secundario').color).lighten(5).toHexString(),
      };
      
      Object.entries(mappings).forEach(([key, value]) => root.style.setProperty(key, value));
    }, [stylePalette, font]);
};


// --- SUB-COMPONENTES DE UI ---
const ColorPalette = ({ title, color, hex, shades, onShadeCopy, themeOverride }) => (
    <div>
        <div className="flex items-center mb-2">
            <div className={`w-10 h-10 rounded-md mr-3 border ${themeOverride === 'light' ? 'border-gray-200' : 'border-gray-700'}`} style={{ backgroundColor: color }}></div>
            <div>
                <p className={`text-sm font-medium ${themeOverride === 'light' ? 'text-gray-900' : 'text-gray-100'}`}>{title}</p>
                <p className={`text-xs font-mono ${themeOverride === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>{hex.toUpperCase()}</p>
            </div>
        </div>
        <div className="flex rounded-md overflow-hidden h-8 relative group">
            {shades.map((shade, index) => (
                <div key={index} className="flex-1 cursor-pointer transition-transform duration-100 ease-in-out group-hover:transform group-hover:scale-y-110 hover:!scale-125 hover:z-10"
                    style={{ backgroundColor: shade, border: index === 5 ? `2px solid ${tinycolor(shade).isLight() ? 'black' : 'white'}` : 'none', zIndex: index === 5 ? 20 : 10 }}
                    onClick={() => onShadeCopy(shade)} title={`Copiar ${shade.toUpperCase()}`} />
            ))}
        </div>
        <div className={`flex text-xs font-mono px-1 ${themeOverride === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
            {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className={`flex-1 text-center ${index === 5 ? 'font-bold' : ''}`}>T{index === 0 ? '50' : (index+1)*100}</div>
            ))}
        </div>
    </div>
);

const ColorPickerInput = ({ label, color, setColor }) => {
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    return (
        <div className="relative flex items-center gap-2">
            <label className="text-sm" style={{color: 'var(--text-muted)'}}>{label}:</label>
            <div className="flex items-center rounded-md" style={{backgroundColor: 'var(--bg-muted)'}}>
                <div className="w-7 h-7 rounded-l-md cursor-pointer border-r" style={{ backgroundColor: color, borderColor: 'var(--border-strong)' }} onClick={() => setIsPickerVisible(p => !p)} />
                <HexColorInput color={color} onChange={setColor} className="font-mono bg-transparent px-2 py-1 rounded-r-md w-24 focus:outline-none" style={{color: 'var(--text-default)'}} prefixed />
            </div>
            {isPickerVisible && (
                <div className="absolute z-50 top-full mt-2 left-0 w-56">
                    <div className="fixed inset-0" onClick={() => setIsPickerVisible(false)} />
                    <HexColorPicker color={color} onChange={setColor} />
                </div>
            )}
        </div>
    );
};

const ImagePaletteExtractor = ({ onColorSelect, showNotification }) => {
    const [imagePreview, setImagePreview] = useState(null);
    const [extractedColors, setExtractedColors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            setImagePreview(e.target.result);
            setIsLoading(true);
            setExtractedColors([]);
            try {
                const colors = await extractColorsFromImage(e.target.result);
                setExtractedColors(colors);
                showNotification('¡Paleta extraída con éxito!');
            } catch (error) {
                showNotification(error.message, 'error');
            } finally { setIsLoading(false); }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="p-6 rounded-xl border" style={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)'}}>
            <h2 className="font-bold text-lg mb-4">Crear Paleta desde Imagen</h2>
            <div className="grid md:grid-cols-2 gap-6 items-center">
                <div onClick={() => fileInputRef.current.click()} className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden" style={{borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)'}}>
                    {imagePreview ? <img src={imagePreview} alt="Vista previa" className="w-full h-full object-cover"/> : (<><ImageIcon size={40} /><p className="mt-2 text-sm font-semibold">Haz clic para subir una imagen</p></>)}
                    {isLoading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-white"></div></div>}
                </div>
                <div className="w-full">
                    {extractedColors.length > 0 ? (
                        <>
                           <p className="text-sm mb-3" style={{color: 'var(--text-muted)'}}>Colores extraídos (haz clic para usar):</p>
                           <div className="flex flex-wrap gap-3">
                            {extractedColors.map(color => <div key={color} onClick={() => onColorSelect(color)} title={`Usar ${color.toUpperCase()}`} className="w-10 h-10 rounded-full cursor-pointer border-2 hover:border-white transition-all transform hover:scale-110 shadow-lg" style={{ backgroundColor: color, borderColor: 'var(--bg-card)' }} />)}
                           </div>
                        </>
                    ) : <p className="text-sm text-center" style={{color: 'var(--text-muted)'}}>Sube una imagen para ver la paleta de colores sugerida.</p>}
                </div>
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
        </div>
    );
};

const GradientGenerator = ({ onCopy, initialStart, initialEnd }) => {
    const [startColor, setStartColor] = useState(initialStart);
    const [endColor, setEndColor] = useState(initialEnd);
    const [angle, setAngle] = useState(90);
    const [type, setType] = useState('linear');

    useEffect(() => {
        setStartColor(initialStart);
        setEndColor(initialEnd);
    }, [initialStart, initialEnd]);
    
    const gradientCss = useMemo(() => {
        return type === 'linear'
            ? `linear-gradient(${angle}deg, ${startColor}, ${endColor})`
            : `radial-gradient(circle, ${startColor}, ${endColor})`;
    }, [startColor, endColor, angle, type]);

    return (
        <div className="p-6 rounded-xl border" style={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)'}}>
            <h2 className="font-bold text-lg mb-4">Generador de Degradados</h2>
            <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <ColorPickerInput label="Inicio" color={startColor} setColor={setStartColor} />
                        <ColorPickerInput label="Fin" color={endColor} setColor={setEndColor} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{color: 'var(--text-muted)'}}>Ángulo: {angle}°</label>
                        <input type="range" min="0" max="360" value={angle} onChange={(e) => setAngle(e.target.value)}
                               className="w-full range-slider" disabled={type !== 'linear'}/>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setType('linear')} className={`text-sm font-medium py-2 px-4 rounded-lg transition-colors ${type === 'linear' ? 'text-white' : ''}`} style={{backgroundColor: type === 'linear' ? 'var(--action-primary-default)' : 'var(--action-secondary-default)', color: type === 'linear' ? '' : 'var(--text-default)'}}>Lineal</button>
                        <button onClick={() => setType('radial')} className={`text-sm font-medium py-2 px-4 rounded-lg transition-colors ${type === 'radial' ? 'text-white' : ''}`} style={{backgroundColor: type === 'radial' ? 'var(--action-primary-default)' : 'var(--action-secondary-default)', color: type === 'radial' ? '' : 'var(--text-default)'}}>Radial</button>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="w-full h-32 rounded-lg" style={{ background: gradientCss }}></div>
                    <div className="relative">
                        <pre className="font-mono text-sm whitespace-pre-wrap break-all p-3 pr-12 rounded-md" style={{backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)'}}>
                            <code>background: {gradientCss};</code>
                        </pre>
                        <button onClick={() => onCopy(`background: ${gradientCss};`, '¡CSS de degradado copiado!')}
                                className="absolute top-1/2 right-3 -translate-y-1/2 p-2 rounded-lg text-white" style={{backgroundColor: 'var(--action-primary-default)'}}>
                            <Clipboard size={16}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
function App() {
  const [config, setConfig] = useState(defaultState);
  const { brandShades, grayShades, stylePalette, accessibility, generatedCode, effectiveGrayColor } = useDesignSystem(config);
  
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const [isCodeVisible, setIsCodeVisible] = useState(false);
  const importFileRef = useRef(null);
  
  useThemeEffect(stylePalette, config.font);

  const handleCopy = (text, message) => { navigator.clipboard.writeText(text); showNotification(message); };
  
  const handleRandomTheme = () => {
    let newBrandColor;
    do { newBrandColor = tinycolor.random(); } while (!(tinycolor.readability(newBrandColor, '#FFF') > 4.5 || tinycolor.readability(newBrandColor, '#000') > 4.5));
    setConfig(p => ({ ...p, isGrayAuto: true, brandColor: newBrandColor.toHexString() }));
  };

  const handleExport = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(config, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "mi-tema-de-diseno.json";
    link.click();
  };
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        setConfig(prev => ({...prev, ...imported}));
        showNotification('¡Tema importado con éxito!');
      } catch (error) { showNotification('Error al leer el archivo de tema.', 'error'); }
    };
    reader.readAsText(file);
  };
  const handleReset = () => { setConfig(defaultState); showNotification("Tema reiniciado a los valores por defecto."); };
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: 'success' }), 3000);
  };
  
  if (!stylePalette) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin" style={{borderColor: config.brandColor}}></div></div>;
  
  const { brandColor, grayColor, isGrayAuto, theme, font, fxSeparator } = config;

  return (
    <div className="min-h-screen p-4 sm:p-8 transition-colors duration-300" style={{backgroundColor: 'var(--bg-default)', color: 'var(--text-default)', fontFamily: availableFonts[font]}}>
      <style>{`
        :root { --brand-color: ${brandColor}; }
        .react-colorful { width: 100%; height: 150px; border-radius: 8px; border: 1px solid var(--border-default); background-color: var(--bg-card); }
        .react-colorful__saturation { border-radius: 8px 8px 0 0; }
        .react-colorful__hue, .react-colorful__alpha { height: 20px; border-radius: 0 0 8px 8px; }
        .react-colorful__pointer { width: 20px; height: 20px; }
        .range-slider { -webkit-appearance: none; width: 100%; height: 8px; border-radius: 5px; background: var(--bg-muted); outline: none; opacity: 0.7; transition: opacity .2s; }
        .range-slider:hover { opacity: 1; }
        .range-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: var(--action-primary-default); cursor: pointer; border: 2px solid var(--bg-card); }
        .range-slider::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: var(--action-primary-default); cursor: pointer; border: 2px solid var(--bg-card); }
      `}</style>
      
      <header className="relative flex justify-between items-center mb-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold"><span style={{color: 'var(--action-primary-default)'}}>Mi</span>Sistema</h1>
        <div className="flex items-center gap-2">
            <input type="file" ref={importFileRef} onChange={handleImport} accept=".json" className="hidden"/>
            <button title="Reiniciar" onClick={handleReset} className="p-2 rounded-lg" style={{backgroundColor: 'var(--bg-muted)'}}><RefreshCcw size={16}/></button>
            <button title="Importar" onClick={() => importFileRef.current.click()} className="p-2 rounded-lg" style={{backgroundColor: 'var(--bg-muted)'}}><Upload size={16}/></button>
            <button title="Exportar" onClick={handleExport} className="p-2 rounded-lg" style={{backgroundColor: 'var(--bg-muted)'}}><Download size={16}/></button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        <div className="p-4 rounded-xl border flex flex-wrap items-center justify-center gap-x-6 gap-y-4" style={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)'}}>
            <div className="flex items-center gap-2">
                <label className="text-sm" style={{color: 'var(--text-muted)'}}>Fuente:</label>
                <select value={font} onChange={(e) => setConfig(p => ({...p, font: e.target.value}))} className="font-semibold px-2 py-1 rounded-md border" style={{backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)', borderColor: 'var(--border-default)'}}>
                    {Object.keys(availableFonts).map(f => (<option key={f} value={f}>{f}</option>))}
                </select>
            </div>
            <ColorPickerInput label="Color de Marca" color={brandColor} setColor={c => setConfig(p => ({...p, brandColor: c}))} />
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2"><Wand2 size={16} style={{color: 'var(--text-muted)'}}/><label className="text-sm font-medium" style={{color: 'var(--text-muted)'}}>Gris Automático</label></div>
                <button type="button" role="switch" aria-checked={isGrayAuto} onClick={() => setConfig(p => ({...p, isGrayAuto: !p.isGrayAuto}))} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent`} style={{backgroundColor: isGrayAuto ? 'var(--action-primary-default)' : 'var(--bg-muted)'}}>
                    <span className={`${isGrayAuto ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition`} />
                </button>
            </div>
            <div className={`transition-opacity ${isGrayAuto ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}><ColorPickerInput label="Gris Base" color={grayColor} setColor={c => setConfig(p => ({...p, grayColor: c}))} /></div>
            <button onClick={handleRandomTheme} className="text-sm font-medium py-2 px-4 rounded-lg text-white hover:opacity-90 flex items-center gap-2" style={{ background: `linear-gradient(to right, ${brandColor}, #e11d48)`}}><Sparkles size={16} /> Aleatorio</button>
            <div className="flex items-center gap-2">
              <button onClick={() => setConfig(p => ({...p, theme: 'light'}))} className={`text-sm font-medium py-2 px-4 rounded-lg`} style={{backgroundColor: theme === 'light' ? 'var(--action-primary-default)' : 'var(--action-secondary-default)', color: theme === 'light' ? accessibility.btnFg : 'var(--text-default)'}}>Modo Claro</button>
              <button onClick={() => setConfig(p => ({...p, theme: 'dark'}))} className={`text-sm font-medium py-2 px-4 rounded-lg`} style={{backgroundColor: theme === 'dark' ? 'var(--action-primary-default)' : 'var(--action-secondary-default)', color: theme === 'dark' ? accessibility.btnFg : 'var(--text-default)'}}>Modo Oscuro</button>
            </div>
        </div>
        
        <ImagePaletteExtractor onColorSelect={(color) => setConfig(p => ({...p, brandColor: color, isGrayAuto: true}))} showNotification={showNotification} />
        
        <div className="p-6 rounded-xl border" style={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)'}}>
          <h2 className="font-bold text-lg mb-4">Vista Previa de Componentes</h2>
          <div className="flex flex-wrap items-center gap-6">
              <div className="flex-1 space-y-4 min-w-[200px]">
                  <button className="w-full font-bold py-2 px-4 rounded-lg transition-colors" style={{ backgroundColor: 'var(--action-primary-default)', color: accessibility.btnFg }}>Botón Primario</button>
                  <button className="w-full font-bold py-2 px-4 rounded-lg transition-colors" style={{ backgroundColor: 'var(--action-secondary-default)', color: 'var(--text-default)', border: `1px solid var(--border-strong)` }}>Botón Secundario</button>
              </div>
              <div className="flex-1 p-4 rounded-lg border min-w-[250px] space-y-2" style={{backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-strong)'}}>
                  <h3 className="font-bold mb-2">Chequeo de Accesibilidad</h3>
                   {Object.entries(accessibility).filter(([k]) => k !== 'btnFg').map(([key, value]) => (<div key={key} className="flex items-center gap-2"><span className={`text-xs font-bold p-1 rounded w-12 text-center ${value.level === 'Fallido' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>{value.level}</span><span className="text-sm" style={{color: 'var(--text-muted)'}}>{key === 'btn' ? 'Botón' : 'Texto'} ({value.ratio}:1)</span></div>))}
              </div>
          </div>
        </div>
        
        <GradientGenerator onCopy={handleCopy} initialStart={brandColor} initialEnd={stylePalette.decorateColors[0].color} />

        <div className="grid md:grid-cols-2 gap-8">
           <div className="p-6 rounded-xl space-y-4" style={{backgroundColor: '#FFFFFF', color: '#000000'}}>
            <h2 className="font-bold text-gray-900">Modo Claro</h2>
            <ColorPalette title="Color de Marca" color={brandColor} hex={brandColor} shades={brandShades} onShadeCopy={(c) => handleCopy(c, `Tono ${c.toUpperCase()} copiado!`)} themeOverride="light"/>
            <ColorPalette title="Escala de Grises" color={effectiveGrayColor} hex={effectiveGrayColor} shades={grayShades} onShadeCopy={(c) => handleCopy(c, `Tono ${c.toUpperCase()} copiado!`)} themeOverride="light"/>
          </div>
           <div className="border p-6 rounded-xl space-y-4" style={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)'}}>
             <h2 className="font-bold">Modo Oscuro</h2>
            <ColorPalette title="Color de Marca" color={brandColor} hex={brandColor} shades={brandShades} onShadeCopy={(c) => handleCopy(c, `Tono ${c.toUpperCase()} copiado!`)} themeOverride="dark"/>
            <ColorPalette title="Escala de Grises" color={effectiveGrayColor} hex={effectiveGrayColor} shades={grayShades} onShadeCopy={(c) => handleCopy(c, `Tono ${c.toUpperCase()} copiado!`)} themeOverride="dark"/>
          </div>
        </div>

        <div className="p-6 rounded-xl border" style={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)'}}>
            <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                <h3 className="font-bold text-lg">Código Power Fx</h3>
                <div className='flex items-center gap-4'>
                  <div className="flex items-center gap-2">
                    <label className="text-sm" style={{color: 'var(--text-muted)'}}>Separador:</label>
                    <select value={fxSeparator} onChange={(e) => setConfig(p => ({...p, fxSeparator: e.target.value}))}
                        className="font-semibold px-2 py-1 rounded-md border" style={{backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)', borderColor: 'var(--border-default)'}}>
                        <option value=";">;</option> <option value=",">,</option> <option value=";;">;;</option>
                    </select>
                  </div>
                  <button onClick={() => setIsCodeVisible(!isCodeVisible)} className="text-sm font-medium py-2 px-4 rounded-lg" style={{backgroundColor: 'var(--action-secondary-default)', color: 'var(--text-default)'}}>
                      {isCodeVisible ? 'Ocultar' : 'Mostrar'} Código
                  </button>
                </div>
            </div>
            {isCodeVisible && (
                <div className="relative">
                    <pre className="font-mono text-sm p-4 rounded-md max-h-96 overflow-auto" style={{backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)'}}><code>{generatedCode}</code></pre>
                    <button onClick={() => handleCopy(generatedCode, '¡Código Power Fx copiado!')} className="absolute top-3 right-3 p-2 rounded-lg text-white" style={{backgroundColor: 'var(--action-primary-default)'}}><Clipboard size={16}/></button>
                </div>
            )}
        </div>

      </main>

      <footer className="text-center mt-12 pt-8 border-t max-w-7xl mx-auto" style={{borderColor: 'var(--border-default)', color: 'var(--text-muted)'}}><p className="text-sm">Creado con ❤️ por ti y la asistencia de IA.</p></footer>

      {notification.message && (<div className={`fixed bottom-5 right-5 text-white text-sm font-bold py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}><AlertCircle size={16}/> {notification.message}</div>)}
    </div>
  );
}

export default App;


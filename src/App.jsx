import React, { useState, useEffect, useCallback } from 'react';
import { Palette, RefreshCw, Lock, Unlock, Copy, Check, Download, Sparkles, Sun, Moon } from 'lucide-react';

const ColorPaletteGenerator = () => {
  const [colors, setColors] = useState([]);
  const [lockedColors, setLockedColors] = useState({});
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [paletteMode, setPaletteMode] = useState('monochromatic');
  const [baseHue, setBaseHue] = useState(200);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const generateColor = useCallback(() => {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 40 + 60);
    const l = Math.floor(Math.random() * 30 + 40);
    return { h, s, l };
  }, []);

  const hslToHex = (h, s, l) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const generatePalette = useCallback(() => {
    let newColors = [];
    
    switch(paletteMode) {
      case 'monochromatic':
        for (let i = 0; i < 5; i++) {
          newColors.push({
            h: baseHue,
            s: 70 - i * 5,
            l: 30 + i * 15
          });
        }
        break;
      
      case 'analogous':
        for (let i = 0; i < 5; i++) {
          newColors.push({
            h: (baseHue + (i - 2) * 30 + 360) % 360,
            s: 70,
            l: 50 + (i % 2) * 10
          });
        }
        break;
      
      case 'complementary':
        const complement = (baseHue + 180) % 360;
        newColors = [
          { h: baseHue, s: 70, l: 45 },
          { h: baseHue, s: 60, l: 60 },
          { h: complement, s: 70, l: 45 },
          { h: complement, s: 60, l: 60 },
          { h: (baseHue + 90) % 360, s: 50, l: 50 }
        ];
        break;
      
      case 'triadic':
        const tri1 = (baseHue + 120) % 360;
        const tri2 = (baseHue + 240) % 360;
        newColors = [
          { h: baseHue, s: 70, l: 50 },
          { h: baseHue, s: 60, l: 65 },
          { h: tri1, s: 70, l: 50 },
          { h: tri2, s: 70, l: 50 },
          { h: tri2, s: 60, l: 65 }
        ];
        break;
      
      default:
        for (let i = 0; i < 5; i++) {
          newColors.push(generateColor());
        }
    }
    
    const finalColors = newColors.map((color, i) => 
      lockedColors[i] ? colors[i] : color
    );
    
    setColors(finalColors);
  }, [paletteMode, baseHue, lockedColors, colors, generateColor]);

  useEffect(() => {
    generatePalette();
  }, []);

  const toggleLock = (index) => {
    setLockedColors(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const copyToClipboard = (hex, index) => {
    navigator.clipboard.writeText(hex);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const exportPalette = () => {
    const paletteData = colors.map(c => hslToHex(c.h, c.s, c.l)).join('\n');
    const blob = new Blob([paletteData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'palette.txt';
    a.click();
  };

  const getLuminance = (h, s, l) => {
    return l > 60 ? 'text-gray-900' : 'text-white';
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`absolute right-0 top-0 p-3 rounded-full transition-all ${isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-700 shadow-lg'}`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <Palette className={`w-10 h-10 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <h1 className={`text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent`}>
              Palette Studio
            </h1>
          </div>
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Créez des palettes de couleurs harmonieuses en un clic
          </p>
        </div>

        {/* Controls */}
        <div className={`rounded-2xl p-6 mb-8 backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/70 shadow-xl border border-white'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Mode de palette
              </label>
              <select
                value={paletteMode}
                onChange={(e) => setPaletteMode(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-purple-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
              >
                <option value="random">Aléatoire</option>
                <option value="monochromatic">Monochromatique</option>
                <option value="analogous">Analogues</option>
                <option value="complementary">Complémentaires</option>
                <option value="triadic">Triadique</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Teinte de base: {baseHue}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={baseHue}
                onChange={(e) => setBaseHue(Number(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, 
                    hsl(0, 70%, 50%), 
                    hsl(60, 70%, 50%), 
                    hsl(120, 70%, 50%), 
                    hsl(180, 70%, 50%), 
                    hsl(240, 70%, 50%), 
                    hsl(300, 70%, 50%), 
                    hsl(360, 70%, 50%))`
                }}
              />
            </div>

            <button
              onClick={generatePalette}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              Générer
            </button>

            <button
              onClick={exportPalette}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <Download className="w-5 h-5" />
              Exporter
            </button>
          </div>
        </div>

        {/* Color Palette */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {colors.map((color, index) => {
            const hex = hslToHex(color.h, color.s, color.l);
            const textColor = getLuminance(color.h, color.s, color.l);
            
            return (
              <div
                key={index}
                className="group relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer"
                style={{ 
                  backgroundColor: hex,
                  minHeight: '300px'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative h-full p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <button
                      onClick={() => toggleLock(index)}
                      className={`p-2 rounded-lg transition-all ${lockedColors[index] ? 'bg-white/20 backdrop-blur-sm' : 'bg-black/10 opacity-0 group-hover:opacity-100'}`}
                    >
                      {lockedColors[index] ? 
                        <Lock className={`w-5 h-5 ${textColor}`} /> : 
                        <Unlock className={`w-5 h-5 ${textColor}`} />
                      }
                    </button>
                    
                    <button
                      onClick={() => copyToClipboard(hex, index)}
                      className="p-2 rounded-lg bg-black/10 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                    >
                      {copiedIndex === index ? 
                        <Check className={`w-5 h-5 ${textColor}`} /> : 
                        <Copy className={`w-5 h-5 ${textColor}`} />
                      }
                    </button>
                  </div>

                  <div className={`space-y-2 ${textColor}`}>
                    <div className="font-bold text-2xl tracking-wider">{hex.toUpperCase()}</div>
                    <div className="text-sm opacity-90">
                      <div>H: {color.h}°</div>
                      <div>S: {color.s}%</div>
                      <div>L: {color.l}%</div>
                    </div>
                    <div className="text-xs opacity-75">
                      RGB: {hex.slice(1).match(/.{2}/g).map(x => parseInt(x, 16)).join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tips */}
        <div className={`rounded-2xl p-6 backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/70 shadow-xl border border-white'}`}>
          <div className="flex items-start gap-3">
            <Sparkles className={`w-6 h-6 mt-1 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <div>
              <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Astuces d'utilisation
              </h3>
              <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>🔒 Cliquez sur le cadenas pour verrouiller une couleur</li>
                <li>📋 Cliquez sur l'icône copier pour copier le code hexadécimal</li>
                <li>🎨 Ajustez la teinte de base pour modifier toute la palette</li>
                <li>💾 Exportez votre palette en format texte</li>
                <li>🌙 Basculez entre le mode clair et sombre</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteGenerator;
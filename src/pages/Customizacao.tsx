import { useState } from "react";
import { useCustomTheme } from "@customizacao/hooks/useCustomTheme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Palette, Type, Component, RotateCcw, Save } from "lucide-react";

const COLOR_LABELS: Record<string, string> = {
  primary: "Primária",
  "primary-foreground": "Primária (texto)",
  secondary: "Secundária",
  "secondary-foreground": "Secundária (texto)",
  background: "Fundo",
  foreground: "Texto principal",
  muted: "Muted",
  "muted-foreground": "Muted (texto)",
  accent: "Accent",
  "accent-foreground": "Accent (texto)",
  destructive: "Destrutiva",
  "destructive-foreground": "Destrutiva (texto)",
  border: "Borda",
  card: "Card",
  "card-foreground": "Card (texto)",
};

const hslToHex = (hsl: string): string => {
  const parts = hsl.split(" ");
  if (parts.length < 3) return "#000000";
  const h = parseFloat(parts[0]) / 360;
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const hexToHsl = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0 0% 0%";

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s: number;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const FONT_WEIGHTS = [300, 400, 500, 600, 700, 800, 900];
const WEIGHT_LABELS: Record<number, string> = {
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "Semi Bold",
  700: "Bold",
  800: "Extra Bold",
  900: "Black",
};

const Customizacao = () => {
  const {
    colors, setColors, font, setFont, saveColors, saveFont, resetColors,
    defaultColors, isAdmin,
  } = useCustomTheme();

  const [localFont, setLocalFont] = useState(font);

  const handleColorChange = (key: string, hex: string) => {
    const hsl = hexToHsl(hex);
    setColors((prev) => ({ ...prev, [key]: hsl }));
    document.documentElement.style.setProperty(`--${key}`, hsl);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-foreground">Customização</h1>
        <p className="text-muted-foreground text-sm mt-1">Design system e identidade visual da plataforma</p>
      </div>

      <Tabs defaultValue="cores">
        <TabsList>
          <TabsTrigger value="cores" className="gap-2">
            <Palette className="h-4 w-4" /> Cores
          </TabsTrigger>
          <TabsTrigger value="tipografia" className="gap-2">
            <Type className="h-4 w-4" /> Tipografia
          </TabsTrigger>
          <TabsTrigger value="componentes" className="gap-2">
            <Component className="h-4 w-4" /> Componentes
          </TabsTrigger>
        </TabsList>

        {/* Cores */}
        <TabsContent value="cores" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Paleta de Cores</CardTitle>
              {isAdmin && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={resetColors}>
                    <RotateCcw className="h-4 w-4 mr-1" /> Restaurar Padrão
                  </Button>
                  <Button size="sm" onClick={() => saveColors(colors)}>
                    <Save className="h-4 w-4 mr-1" /> Salvar
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(COLOR_LABELS).map(([key, label]) => (
                  <div key={key} className="space-y-2">
                    <Label className="text-xs font-medium">{label}</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={hslToHex(colors[key] ?? defaultColors[key])}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        disabled={!isAdmin}
                        className="w-10 h-10 rounded-md border border-border cursor-pointer disabled:opacity-50"
                      />
                      <span className="text-xs text-muted-foreground font-mono">
                        {colors[key] ?? defaultColors[key]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tipografia */}
        <TabsContent value="tipografia" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Tipografia</CardTitle>
              {isAdmin && (
                <Button
                  size="sm"
                  onClick={() => {
                    saveFont(localFont);
                  }}
                >
                  <Save className="h-4 w-4 mr-1" /> Salvar Fonte
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {isAdmin && (
                <div className="space-y-2 max-w-sm">
                  <Label>Fonte principal (Google Fonts)</Label>
                  <Input
                    value={localFont}
                    onChange={(e) => setLocalFont(e.target.value)}
                    placeholder="Ex: Poppins, Inter, Roboto..."
                  />
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Pesos da fonte: {font}
                </h3>
                <div className="space-y-3">
                  {FONT_WEIGHTS.map((w) => (
                    <div key={w} className="flex items-baseline gap-4">
                      <span className="text-xs text-muted-foreground w-24">
                        {w} — {WEIGHT_LABELS[w]}
                      </span>
                      <span style={{ fontWeight: w, fontFamily: `'${font}', sans-serif` }} className="text-lg">
                        Aa Bb Cc Dd 0123
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Headings
                </h3>
                <h1 className="font-display font-bold text-4xl">Heading 1</h1>
                <h2 className="font-display font-bold text-3xl">Heading 2</h2>
                <h3 className="font-display font-semibold text-2xl">Heading 3</h3>
                <h4 className="font-display font-semibold text-xl">Heading 4</h4>
                <h5 className="font-display font-medium text-lg">Heading 5</h5>
                <h6 className="font-display font-medium text-base">Heading 6</h6>
                <p className="text-sm text-muted-foreground mt-2">
                  Texto body padrão. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Componentes */}
        <TabsContent value="componentes" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Showcase de Componentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Buttons */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Botões
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link</Button>
                  <Button size="sm">Small</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>

              <Separator />

              {/* Badges */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Badges
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
              </div>

              <Separator />

              {/* Inputs */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Inputs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                  <div className="space-y-2">
                    <Label>Input padrão</Label>
                    <Input placeholder="Digite algo..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Input desabilitado</Label>
                    <Input placeholder="Desabilitado" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Select</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a">Opção A</SelectItem>
                        <SelectItem value="b">Opção B</SelectItem>
                        <SelectItem value="c">Opção C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Switch</Label>
                    <div className="flex items-center gap-2">
                      <Switch />
                      <span className="text-sm text-muted-foreground">Ativar</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Cards */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Cards
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Card Exemplo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Conteúdo de exemplo para preview do card.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-primary">
                    <CardHeader>
                      <CardTitle className="text-base">Card Destaque</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Card com borda primary.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Customizacao;

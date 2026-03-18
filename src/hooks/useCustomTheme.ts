import { useEffect, useState, useCallback } from "react";
import { supabase } from "@core/integrations/supabase/client";
import { useAuth } from "@core/contexts/AuthContext";
import { toast } from "@core/hooks/use-toast";

const DEFAULT_COLORS: Record<string, string> = {
  primary: "37 91% 55%",
  "primary-foreground": "230 25% 10%",
  secondary: "232 47% 13%",
  "secondary-foreground": "0 0% 98%",
  background: "0 0% 100%",
  foreground: "230 25% 10%",
  muted: "220 20% 96%",
  "muted-foreground": "220 10% 46%",
  accent: "37 91% 55%",
  "accent-foreground": "230 25% 10%",
  destructive: "0 84% 60%",
  "destructive-foreground": "0 0% 98%",
  border: "220 15% 90%",
  card: "0 0% 100%",
  "card-foreground": "230 25% 10%",
};

const DEFAULT_FONT = "Poppins";

export const useCustomTheme = () => {
  const { isAdmin } = useAuth();
  const [colors, setColors] = useState<Record<string, string>>(DEFAULT_COLORS);
  const [font, setFont] = useState(DEFAULT_FONT);
  const [loaded, setLoaded] = useState(false);

  const applyColors = useCallback((c: Record<string, string>) => {
    const root = document.documentElement;
    Object.entries(c).forEach(([key, val]) => {
      root.style.setProperty(`--${key}`, val);
    });
  }, []);

  const applyFont = useCallback((f: string) => {
    document.documentElement.style.setProperty("--font-custom", `'${f}', sans-serif`);
  }, []);

  // Load theme from DB
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("pdi_configuracoes")
        .select("chave, valor")
        .in("chave", ["tema_cores", "tema_fontes"]);

      if (data) {
        for (const row of data) {
          if (row.chave === "tema_cores" && row.valor) {
            const savedColors = row.valor as Record<string, string>;
            setColors((prev) => ({ ...prev, ...savedColors }));
            applyColors({ ...DEFAULT_COLORS, ...savedColors });
          }
          if (row.chave === "tema_fontes" && row.valor) {
            const savedFont = (row.valor as Record<string, string>).font ?? DEFAULT_FONT;
            setFont(savedFont);
            applyFont(savedFont);
          }
        }
      }
      setLoaded(true);
    };
    load();
  }, [applyColors, applyFont]);

  const saveColors = async (newColors: Record<string, string>) => {
    setColors(newColors);
    applyColors(newColors);

    const { data: existing } = await supabase
      .from("pdi_configuracoes")
      .select("id")
      .eq("chave", "tema_cores")
      .single();

    if (existing) {
      await supabase.from("pdi_configuracoes").update({ valor: newColors as any }).eq("chave", "tema_cores");
    } else {
      await supabase.from("pdi_configuracoes").insert({ chave: "tema_cores", valor: newColors as any });
    }
    toast({ title: "Cores salvas com sucesso!" });
  };

  const saveFont = async (newFont: string) => {
    setFont(newFont);
    applyFont(newFont);

    const val = { font: newFont } as any;
    const { data: existing } = await supabase
      .from("pdi_configuracoes")
      .select("id")
      .eq("chave", "tema_fontes")
      .single();

    if (existing) {
      await supabase.from("pdi_configuracoes").update({ valor: val }).eq("chave", "tema_fontes");
    } else {
      await supabase.from("pdi_configuracoes").insert({ chave: "tema_fontes", valor: val });
    }
    toast({ title: "Fonte salva com sucesso!" });
  };

  const resetColors = () => {
    setColors(DEFAULT_COLORS);
    applyColors(DEFAULT_COLORS);
  };

  return {
    colors,
    setColors,
    font,
    setFont,
    loaded,
    saveColors,
    saveFont,
    resetColors,
    defaultColors: DEFAULT_COLORS,
    defaultFont: DEFAULT_FONT,
    isAdmin,
  };
};

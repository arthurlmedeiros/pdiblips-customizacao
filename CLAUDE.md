# Customização — PDI Blips

## Visão Geral

Módulo de personalização do tema da plataforma. Permite ao `admin_geral` alterar as cores primárias e outros tokens visuais do sistema, persistindo as configurações na tabela `pdi_configuracoes` e aplicando via sobrescrita de variáveis CSS.

---

## Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `src/pages/Customizacao.tsx` | Página de configuração de tema — seletores de cor e preview |
| `src/hooks/useCustomTheme.ts` | Leitura e escrita de configurações de tema em `pdi_configuracoes` |

---

## Contexto Técnico

### Tabela Envolvida

| Tabela | Descrição |
|--------|-----------|
| `pdi_configuracoes` | Configurações do sistema — campos: `chave`, `valor`, `updated_at` |

Exemplos de chaves armazenadas:
- `theme_primary` — cor primária em formato HSL (ex: `"221.2 83.2% 53.3%"`)
- `theme_background` — cor de fundo
- `theme_accent` — cor de destaque

### Padrão de Sobrescrita de CSS Vars

O hook `useCustomTheme` carrega as configurações do banco e as aplica dinamicamente sobrescrevendo variáveis CSS no elemento `:root`:

```ts
// useCustomTheme.ts
const applyTheme = (config: ThemeConfig) => {
  const root = document.documentElement
  if (config.theme_primary) {
    root.style.setProperty('--primary', config.theme_primary)
  }
  if (config.theme_background) {
    root.style.setProperty('--background', config.theme_background)
  }
}
```

As variáveis seguem o formato **HSL sem `hsl()`** (padrão do projeto — ver módulo `layout`):
```css
--primary: 221.2 83.2% 53.3%;  /* sem hsl() */
```

### Aplicação do Tema

O tema é aplicado no `main.tsx` ou `App.tsx` ao iniciar a aplicação:

```ts
// Carrega tema salvo e aplica antes do primeiro render visível
const { data: config } = useCustomTheme()
useEffect(() => { if (config) applyTheme(config) }, [config])
```

### Acesso

Rota `/app/customizacao` restrita a `admin_geral`.

---

## Imports

```ts
import { useCustomTheme } from '@customizacao/hooks/useCustomTheme'
```

---

## Restrições

1. **Acesso exclusivo `admin_geral`** — validar na UI e via RLS
2. **Formato HSL sem `hsl()`** — valores armazenados e aplicados sem a função wrapper (ex: `"221.2 83.2% 53.3%"`, não `"hsl(221.2, 83.2%, 53.3%)"`)
3. **Sem reset automático**: não sobrescrever configurações padrão sem confirmação do usuário
4. **Preview antes de salvar**: exibir preview das cores antes de persistir no banco

---

## Modo Standalone vs Delegado

**Standalone**: clonar para trabalhar na personalização de tema de forma isolada. Requer credenciais com role `admin_geral` para ler/escrever em `pdi_configuracoes`.

**Delegado**: o orquestrador injeta este módulo ao coordenar tarefas que envolvam tema junto com o layout (CSS vars) ou ao configurar o ambiente inicial da plataforma.

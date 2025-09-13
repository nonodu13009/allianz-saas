# 🎨 Design System Guide – Allianz SaaS

## 🎯 Objectif

Garantir un design **cohérent, moderne et accessible** dans tout le projet Next.js.
Chaque développeur doit suivre ces règles lorsqu’il crée ou modifie un composant UI.

---

## 0) Stack & conventions

* **Next.js (App Router)** + **TypeScript strict**
* **TailwindCSS** + **shadcn/ui** (cva, tailwind-merge)
* **lucide-react** pour les icônes
* **next-themes** pour la gestion clair/sombre
* **framer-motion** pour des animations subtiles
* Composants stockés dans `src/components/ui/*`

---

## 1) Design tokens (source de vérité)

* **Couleurs** (CSS vars) :

  * `--allianz-500`, `--allianz-600`
  * `--success-500/600`, `--warning-500/600`, `--danger-500/600`, `--info-500/600`
* **Base** : `--background`, `--foreground`, `--border`
* **Radius** : `--radius`, `--radius-lg`, `--radius-xl`
* **Ombres** : `shadow-allianz`, `shadow-glass`

✅ Toujours utiliser les tokens.
❌ Jamais de couleurs hex directement dans les composants.

---

## 2) Typographie & grille

* Police : Poppins/Inter ou système par défaut
* Hiérarchie :

  * H1 : 30–36px
  * H2 : 22–24px
  * H3 : 18–20px
  * Body : 14–16px
* Layout : container centré, largeur max contrôlée
* Espacements : utiliser `space-y-*`, pas des marges incohérentes

---

## 3) Composants & variantes

* Chaque composant exporte une **API stable** avec variantes (`variant`, `size`, `tone`, `state`).
* **Pattern recommandé** : `cva` pour les classes + `cn()` pour fusion.
* Exemple : `<Button variant="primary" size="lg" />`
* ❌ Interdit : multiplier les classes utilitaires dans les pages pour “bricoler” un style → créer une variante dans le composant.

---

## 4) Thème clair/sombre

* Tous les styles passent par les tokens.
* Contraste minimum AA.
* Vérifier lisibilité en mode sombre.

---

## 5) États & interactions

* États requis : **default, hover, focus-visible, active, disabled, loading**
* Focus : anneau `ring-2` accessible
* Skeletons si chargement > 300 ms
* Transitions ≤ 300 ms, discrètes

---

## 6) Animations & effets “wow”

* Utiliser **framer-motion** : fade, slide, opacity, translate ≤ 8px
* Hover-lift sur cartes : légère élévation + ombre
* ❌ Interdit : parallax lourds, zooms sur texte, animations trop agressives

---

## 7) Iconographie

* **lucide-react** uniquement
* Tailles standardisées : 16, 18, 20, 24px
* ❌ Interdit : mélanger plusieurs sets d’icônes

---

## 8) Formulaires & feedback

* Inputs/boutons = variantes shadcn/ui
* Toujours un label (jamais placeholder seul)
* Validation inline + résumé global si long
* Toasts discrets, non bloquants

---

## 9) Tables & listes

* Lignes zébrées légères
* Header sticky si besoin
* Alignement : texte à gauche, chiffres à droite
* Empty states standardisés (icône + message + CTA)

---

## 10) Accessibilité (A11y)

* Navigation clavier complète
* `aria-*` cohérents (expanded, selected, busy, etc.)
* Texte alternatif pour les images
* Aucun contenu critique uniquement “visuel”

---

## 11) Responsive & perf

* Mobile-first
* Images via `next/image`
* Pagination ou virtualisation pour grandes listes
* Pas de libs UI lourdes

---

## 12) Documentation & Stories

* Chaque composant a un fichier **Storybook** avec :

  * `Default`
  * `Variants`
  * `DarkMode`
  * `Error/Loading`
  * `LongContent`
* Tests visuels via **Chromatic**
* ❌ Interdit : merger sans stories

---

## 13) Sécurité & SSR

* Variables sensibles via `.env`
* Pas de `window` côté serveur
* Pas de HTML dangereux dans les props

---

## 14) Modèle de composant

```tsx
// src/components/ui/button.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        ghost: "bg-transparent hover:bg-foreground/5",
        danger: "bg-danger-500 text-white hover:bg-danger-600",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-11 px-6 text-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export default function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
```

---

## 15) Process de livraison (Definition of Done)

Avant de merger :

* ✅ Respect tokens & dark mode
* ✅ Variantes via `cva` + stories
* ✅ États complets (hover/focus/etc.)
* ✅ Accessibilité vérifiée
* ✅ Responsive OK
* ✅ Tests visuels Chromatic OK

---

## 16) Modèle de PR

```
PR Title: feat(ui): <Composant> — variantes + dark mode

Résumé:
- <ce qui a été fait>

Design Review:
- Tokens: OK
- Variantes: <liste>
- A11y: <points clés>
- Responsive/Perf: <ok/notes>
- Stories/Chromatic: liens builds

Risques:
- <…>

Screenshots/GIF:
- <…>
```


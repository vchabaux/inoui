# Remplacement des dépendances @owlabio

## Contexte

Le projet inoui repose sur des packages privés `@owlabio/*` hébergés sur GitHub Packages. Ces packages ne sont pas accessibles publiquement, ce qui bloque le build et contredit la nature open source du projet.

La sauvegarde de la prod (`owl-boilerplate-main-20260702T091409Z-3-001`) contient les squelettes de ces packages dans ses `node_modules` mais pas les fichiers buildés (`dist/` vides). Les repos GitHub owlabio sont en 404. Les packages npm sont en 403. Aucun token valide n'est disponible.

**Objectif :** Remplacer chaque dépendance @owlabio par des alternatives open source maintenues, ou par du code directement dans le projet quand aucune alternative n'existe.

---

## Analyse des packages

### 1. `@owlabio/owl-ui` — Design system de composants Vue

**Rôle :** Librairie de composants UI maison (Container, Button, Field, Icon, Text, Dialog, Link, Thumbnail, Image, Separator, Editor, LayoutColumn, LayoutSidebar, Sidebar).

**Utilisation :** ~597 occurrences dans les templates. C'est le squelette de toute l'UI du projet.

**Préconisation :** Remplacer par **PrimeVue** (https://primevue.org/) — librairie de composants Vue 3 open source, complète, maintenue, avec des équivalents pour chaque composant owl-ui :

| owl-ui | PrimeVue |
|---|---|
| `<Container>` | `<div>` avec classes utilitaires ou `Card` |
| `<Button>` | `Button` |
| `<Field>` | `InputText`, `Select`, `Textarea` |
| `<Icon>` | `i` avec FontAwesome directement |
| `<Text>` | `<p>`, `<h1>`... HTML natif |
| `<Dialog>` | `Dialog` |
| `<Link>` | `<router-link>` ou `<a>` |
| `<Thumbnail>` | `Image` |
| `<Separator>` | `Divider` |
| `<Editor>` | `Editor` (TipTap-based) |

---

### 2. `@owlabio/each-vue` — Composant d'itération `<Each>`

**Rôle :** Un composant `<Each :of={array} :like={component} />` qui permet d'itérer sur des listes/arbres avec un composant custom.

**Utilisation :** 4 fichiers (FormPoint.vue, FormTrack.vue, Nakala.vue, PlaylistForm.vue, Settings.vue, Categories.vue)

**Préconisation :** Remplacer par le **`v-for` natif de Vue 3**. Aucune dépendance externe nécessaire. Le composant `<Each>` est un simple helper d'itération qu'on peut réécrire en 15 lignes dans chaque fichier, ou créer un composant `<ForEach>` utilitaire dans le projet.

---

### 3. `@owlabio/category-manager` — Gestionnaire de catégories

**Rôle :** Store Pinia + composant pour gérer des catégories organisées en arbre (fetch depuis l'API, CRUD, tree view).

**Exports :**
- `initStoreCategory(http)` — initialise le store dans main.js
- `useStoreCategory()` — store Pinia pour les catégories
- `<Categories>` — composant d'administration des catégories (tree + CRUD)
- `@owlabio/category-manager/style.css` — styles associés

**Utilisation :** main.js (init), Controls.vue (useStoreCategory pour filtres), Categories.vue (page admin)

**Préconisation :** À remplacer par un **store Pinia + composant Vue maison** directement dans le projet. Le store fait des appels API REST (GET/POST/DELETE sur `/category`). Le composant arbre est relativement simple à reproduire en utilisant `<Each>` (ou `v-for` récursif).

---

### 4. `@owlabio/da-table` — Tableau de données

**Rôle :** Tableau générique avec colonnes configurables, tri, pagination.

**Exports :** Default export `DaTable` / `Datable`

**Utilisation :** 7 pages admin (Content, Musicians, Nakala, Notices, Playlists, Tracks, Users)

**Préconisation :** Remplacer par **PrimeVue DataTable** (`DataTable`). C'est le composant le plus standard — colonnes, tri, pagination sont des fonctionnalités universelles. PrimeVue DataTable est mature et bien documenté.

---

### 5. `@owlabio/owl-css` — Design system CSS

**Rôle :** Reset CSS + tokens de design (couleurs, espacements, typographie) + classes utilitaires.

**Utilisation :** Un seul import dans `App.vue` : `import "@owlabio/owl-css/dist/style.css"`

**Préconisation :** Remplacer par un **fichier CSS de reset standard** à créer dans le projet. On peut partir de :
- Un reset CSS minimal (type normalize.css ou modern-css-reset)
- Recopier les variables CSS/couleurs utilisées (à extraire du CSS compilé de icon-manager ou du DOM de la prod)

---

### 6. `@owlabio/icon-manager` — Gestionnaire d'icônes FontAwesome

**Rôle :** Wrapper Pinia + composants pour gérer les icônes FontAwesome côté client et serveur.

**Exports :**
- `ScriptFontAwesome` — composant qui importe et enregistre les icônes FA dans la librairie
- `iconManagerPlugin` — plugin Pinia pour init
- `IconPicker` — sélecteur d'icône
- `IconManager` — gestionnaire d'icônes

**État actuel :** ✅ C'est le seul package qui a un build fonctionnel dans la sauvegarde (`dist/client/icon-manager.es.js`). Mais il dépend de `@owlabio/owl-ui` (Container, Text, Button, Field, Icon, Details, Dialog) — donc il sera cassé quand on aura supprimé owl-ui.

**Utilisation :** App.vue (ScriptFontAwesome), main.js (plugin), Categories.vue (IconPicker), Icons.vue (IconManager)

**Préconisation :** Remplacer par **`@fortawesome/vue-fontawesome`** directement. Le package owlabio n'est qu'un wrapper autour de FontAwesome. On peut :
1. Installer `@fortawesome/fontawesome-svg-core`, `@fortawesome/free-solid-svg-icons`, `@fortawesome/free-regular-svg-icons`, `@fortawesome/vue-fontawesome`
2. Remplacer `ScriptFontAwesome` par l'initialisation standard FA dans main.js
3. Remplacer `<Icon>` (owl-ui) et l'usage IconManager par `<FontAwesomeIcon>` natif
4. `IconPicker` et `IconManager` sont des pages admin spécifiques — à réécrire dans le projet

---

## Plan de migration en 4 phases

### Phase 0 — Préparation (aucune modification de code)

1. **Installer PrimeVue** (et ses dépendances : `primeicons`, `primeflex` optionnel)
2. **Installer `@fortawesome/vue-fontawesome`** + les packages FA free
3. Créer la structure `client/src/stubs/` qui contiendra temporairement les composants de remplacement
4. Mettre à jour le `.npmrc` pour retirer les registres @owlabio et @fortawesome (qui bloquent npm)
5. Créer le fichier CSS de reset "maison" (`client/src/assets/owl-css-reset.css`)

### Phase 1 — owl-css (le plus facile, sans risque)

1. **Créer** `client/src/assets/owl-css-reset.css` — un reset CSS standard
2. **Modifier** `App.vue` : remplacer `import "@owlabio/owl-css/dist/style.css"` par `import "@/assets/owl-css-reset.css"`
3. Vérifier que le layout de base tient (couleurs, polices, marges)

### Phase 2 — each-vue (très simple, 4 fichiers)

1. **Remplacer** `<Each :of={items} :like={Component} />` par `v-for` dans chaque fichier :
   - `FormPoint.vue`
   - `FormTrack.vue`
   - `Nakala.vue`
   - `PlaylistForm.vue`
   - `Settings.vue`
   - `Categories.vue`
2. Pattern : `<Component v-for="item in items" :key="item.id" v-bind="item" />` au lieu de `<Each :of="items" :like="Component" />`

### Phase 3 — owl-ui vers PrimeVue (le plus gros)

Remplacer les composants owl-ui par leurs équivalents PrimeVue dans TOUS les fichiers `.vue` du projet.

**Mapping détaillé :**

| Owl UI → PrimeVue |
|---|
| `<Container>` → `<div class="p-4">` ou composant `Card` selon le contexte |
| `<Button>` → `<Button>` |
| `<Field>` → `<InputText>`, `<Select>`, `<Textarea>` selon `type` |
| `<Icon name="..." type="far/fas">` → `<i class="fa-regular fa-...">` ou `<FontAwesomeIcon>` |
| `<Text>` → `<p>`, `<span>`, `<h1>`... HTML natif |
| `<Dialog>` → `<Dialog>` |
| `<Link>` → `<router-link>` ou `<a>` |
| `<Thumbnail>` → `<img>` ou `<Image>` |
| `<Image>` → `<img>` ou `<Image>` |
| `<Separator>` → `<Divider>` |
| `<LayoutColumn>` → `<div>` avec grid/flex |
| `<LayoutSidebar>` → `<div>` avec sidebar classes |
| `<Sidebar>` → `<div>` ou `Sidebar` |
| `<Editor>` → `<Editor>` (PrimeVue Editor est basé sur TipTap) |

**Attention :** Les props owl-ui ont parfois des noms différents de PrimeVue. Par exemple :
- `@click` reste `@click`
- `:pending` sur Button → `:loading` sur PrimeVue Button
- `wide` → `class="w-full"`
- `variant="text"` → `text` (boolean prop)
- `:lines="1"` sur Text → à gérer avec CSS `line-clamp`
- `tag="h1"` sur Text → remplacer par `<h1>` directement

### Phase 4 — da-table + category-manager + icon-manager ✅ (terminée)

1. **da-table** : Remplacer les imports de `@owlabio/da-table` par les `DataTable` de PrimeVue dans les pages admin. Configurer colonnes, tri, pagination.
   → Fait : création d'un wrapper `client/src/components/DaTable.vue` qui expose la même API, 7 pages admin modifiées.

2. **category-manager** :
   - Créer un store Pinia `client/src/stores/categories.js` avec les mêmes méthodes que `useStoreCategory`
   - Créer un composant `Categories.vue` (page admin) qui remplace le composant `<Categories>` importé
   - Adapter `Controls.vue`, `AppCards.vue`, `AppMap.vue` pour utiliser le nouveau store
   → Fait : store créé + composant arbre `Categories.vue` + sous-composant récursif `CategoryNode.vue`.

3. **icon-manager** :
   - Remplacer `IconPicker` dans `Categories.vue` par un sélecteur d'icône FA maison
   - Remplacer `IconManager` dans `Icons.vue` par une page admin utilisant l'API FA directement
   → Fait : `IconPicker.vue` + `Icons.vue` réécrit.

4. **Bugs préexistants corrigés** (hérités de la Phase 3) :
   - `Settings.vue` : fichier corrompu par des artéfacts — réécrit
   - `Controls.vue` : attributs dupliqués (`text`, `class`) — nettoyage
   - `Notice.vue`, `Tuto.vue`, `FormDelete.vue` : `v-model:visible="open"` sur prop — corrigé

### Phase 5 — Nettoyage final et build

#### Contexte
Le build compile **100 modules** sans aucune référence `@owlabio`. La seule erreur restante est :
```
Rollup failed to resolve import "quill" from "node_modules/primevue/editor/index.mjs"
```
`quill` est la bibliothèque d'édition de texte riche utilisée par PrimeVue Editor.

#### Actions

1. **Installer `quill`** (dépendance manquante de PrimeVue Editor) :
   ```bash
   cd client && npm install quill
   ```

2. **Supprimer le stub `quill`** créé temporairement pendant la Phase 4 :
   ```bash
   rm client/src/stubs/quill.js
   ```

3. **Supprimer l'alias `quill`** dans `client/vite.config.js` (si ajouté pendant la Phase 4) :
   - Retirer `quill: path.resolve(__dirname, "./src/stubs/quill.js")` de `resolve.alias`

4. **Lancer le build final** :
   ```bash
   cd client && npm run build
   ```

5. **Vérifier la compilation** : `npm run build` doit réussir sans erreur.

6. **Commiter** après build réussi :
   ```bash
   git add -A && git commit -m "phase 5: nettoyage final - installation quill, build OK"
   ```

---

## Règles pour les phases de code

1. **Ne JAMAIS modifier `package.json` ni installer de dépendances** avant la Phase 5. Tous les imports vers des packages non installés doivent être commentés temporairement ou remplacés par des stubs inline.
2. **Ne JAMAIS modifier `issues.md`** (le fichier original des prompts)
3. **Travailler phase par phase** dans l'ordre — la Phase 1 doit compiler sans erreur avant d'attaquer la Phase 2.
4. **Commiter après chaque phase réussie** : `git add -A && git commit -m "phase N: ..."`
5. **À la fin de chaque phase**, vérifier la compilation (même si ça ne marche pas encore, les erreurs doivent être cohérentes avec le travail restant).
6. **Ne pas supprimer les dossiers `node_modules` existants** avant la Phase 5 — ils contiennent icon-manager qui est fonctionnel.
7. **garder une trace des erreurs** dans un fichier `errors-phaseX.md` pour les corriger itérativement.

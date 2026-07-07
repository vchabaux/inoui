# Erreurs Phase 4

## Build réussi à 100 modules transformés

### Erreur restante : `quill` manquant
- **Fichier :** `node_modules/primevue/editor/index.mjs`
- **Message :** `Rollup failed to resolve import "quill"`
- **Cause :** PrimeVue Editor dépend de `quill` (éditeur de texte riche) qui n'est pas installé
- **Solution Phase 5 :** `npm install quill` dans `client/`

### Autres bugs préexistants corrigés dans cette phase :
1. **Settings.vue** : fichier corrompu par des artéfacts dans le commit Phase 3 — réécrit proprement
2. **Controls.vue** : attributs dupliqués (`text`, `class`) — 5 corrections de balises HTML
3. **Notice.vue** : `v-model:visible="open"` sur une prop — remplacé par `:visible="open" @hide`
4. **Tuto.vue** : même problème — corrigé
5. **FormDelete.vue** : même problème — corrigé

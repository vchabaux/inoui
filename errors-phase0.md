# Phase 0 — Erreurs résiduelles

## Build client (vite build)

### Erreur : Rollup failed to resolve import "@owlabio/owl-ui"
- **Cause** : Les packages `@owlabio/owl-ui` ne sont plus dans `node_modules` (retirés par npm car non déclarés dans package.json)
- **Impact** : Tous les fichiers `.vue` qui importent depuis `@owlabio/owl-ui` (54 fichiers)
- **Résolution** : Phase 3 — Remplacer owl-ui par PrimeVue

### Erreur : Rollup failed to resolve import "@owlabio/each-vue"
- **Cause** : `@owlabio/each-vue` retiré de node_modules
- **Impact** : 6 fichiers (FormPoint, FormTrack, Nakala, PlaylistForm, Settings, Categories)
- **Résolution** : Phase 2 — Remplacer `<Each>` par `v-for`

### Erreur : Rollup failed to resolve import "@owlabio/da-table"
- **Cause** : `@owlabio/da-table` retiré de node_modules
- **Impact** : 7 pages admin (Content, Musicians, Nakala, Notices, Playlists, Tracks, Users)
- **Résolution** : Phase 4 — Remplacer par PrimeVue DataTable

### Erreur : Rollup failed to resolve import "@owlabio/category-manager"
- **Cause** : `@owlabio/category-manager` retiré de node_modules
- **Impact** : Categories.vue, Controls.vue, NoticeForm.vue, AppCards.vue, AppMap.vue
- **Résolution** : Phase 4 — Créer store maison

### Erreur : Rollup failed to resolve import "@owlabio/icon-manager"
- **Cause** : `@owlabio/icon-manager` retiré de node_modules
- **Impact** : Icons.vue, Categories.vue
- **Résolution** : Phase 4 — Remplacer par FontAwesome standard

### Note
Toutes ces erreurs sont **attendues** et seront résolues dans les phases 2-4. Le build ne peut pas réussir tant que les imports owl-ui, each-vue, da-table, category-manager et icon-manager ne sont pas remplacés.
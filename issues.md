Inoui : [GitHub - vchabaux/inoui · GitHub](https://github.com/vchabaux/inoui)

    Issues sur le projet

Des élements sont envoyés sur nakala mais ne peuvent pas être retrouvés ensuite pour le inséer dans l'éditeur de notices.

Souvent, ce sont les nouveaux qui ne sont pas visoble.

Upload de gros fichiers :

    Limittion côté Nakala, avec l'api pour upload de gros fichier.

POC depot gros fichiers nakala : [DHUNE / TUS_api_nakala · GitLab](https://gitlab.huma-num.fr/dhune/tus_api_nakala)

[Company](https://immersion.huma-num.fr/admin)

TEST Nakala:

[https://test.nakala.fr/](https://test.nakala.fr/)

[Nakala - API](https://apitest.nakala.fr/doc)



## Prompt 1 — Visibilité et recherche des éléments Nakala dans l'éditeur de notices

**Contexte :** Les données Nakala sont gérées via le store Pinia `useNakalaStore` (`client/src/stores/nakala.js`). Ce store possède une méthode `initialize()` qui fetch toutes les datas d'une collection Nakala via pagination complète (`getAll()`). Actuellement, `initialize()` n'est appelée que dans la page admin `Nakala.vue`. Le composant `Medias.vue` (utilisé comme picker dans l'éditeur de notices `NoticeForm.vue`) lit `nakalaStore.assets` sans jamais initialiser le store, donc la bibliothèque est vide si l'utilisateur n'a pas visité la page Nakala avant. De plus, la méthode `search(value)` dans le store est un TODO vide (ligne 99-105) — la recherche par tag dans `Library.vue` (ligne 31, `filterByTags`) ne fait qu'un filtrage local sur les tags déjà chargés, pas une vraie requête API.

**Objectif :** Garantir que les éléments Nakala sont visibles dans le sélecteur média de l'éditeur de notices, et implémenter une vraie recherche par mots-clés interrogeant l'API Nakala.

**Tâches à réaliser :**

1. **Initialiser le store Nakala dans le sélecteur média** (`client/src/pages/admin/Medias.vue` ligne 52) :
   - Après `const nakalaStore = useStore("nakala")`, appeler `nakalaStore.initialize()` dans le setup ou dans un `onMounted` pour garantir que les données sont chargées à l'ouverture du sélecteur
   - Conserver l'appel existant dans `Nakala.vue` (ligne 96) — ne pas le supprimer

2. **Corriger la condition de destination** (`client/src/pages/admin/Medias.vue` lignes 79-82) :
   - Remplacer `if (!destination.value === "nakala") return null;` par `if (destination.value !== "nakala") return null;`
   - Le `!` a une priorité plus haute que `===`, ce qui rend la condition toujours fausse quelle que soit la destination

3. **Implémenter la recherche dans le store Nakala** (`client/src/stores/nakala.js` lignes 99-105) :
   - Implémenter `async function search(value)` qui interroge l'API Nakala via le proxy
   - Endpoint : `/nakala/collections/{collectionId}/datas?limit=20&search=${encodeURIComponent(value)}` (voir ligne 322 pour le pattern de construction d'URL existant)
   - Stocker les résultats dans `searchResults.value` (déjà déclaré ligne 75)
   - Ajouter un debounce de 300ms sur la recherche (mettre le debounce côté appelant dans Library.vue, pas dans le store)
   - Ajouter une propriété `searchLoading` (ref) pour l'état de chargement

4. **Wiring de la recherche dans Library.vue** (`client/src/components/media/Library.vue`) :
   - Quand l'utilisateur tape dans le champ `search` (ligne 31), au lieu du simple filtrage local par `filterByTags`, déclencher la recherche Nakala avec debounce 300ms
   - `filterByTags` (lignes 208-216) ne filtre que les assets déjà chargés — garder ce filtrage local comme fallback pour le mode local, mais pour le mode Nakala, utiliser `nakalaStore.search(value)`
   - Afficher un indicateur de chargement (`searchLoading`) pendant que la recherche Nakala est en cours
   - Si `searchResults` n'est pas vide, afficher ces résultats dans `currentAssets` au lieu de `props.data`
   - Si la recherche est vide, revenir à l'affichage normal de `props.data`
   - La prop `data` du composant Library est passée par Medias.vue et peut être la liste complète ou filtrée selon le mode

5. **Ajouter la méthode refresh** (`client/src/stores/nakala.js`) :
   - Ajouter `async function refresh()` qui appelle `getAll()` sans le guard `loaded`
   - Utiliser cette méthode dans le sélecteur média après un import pour rafraîchir la liste

**Fichiers de référence à consulter :**
- `client/src/stores/nakala.js` — Store Pinia, méthodes getAll(), create(), initialize(), search() (TODO), formatDatas(), assets computed
- `client/src/pages/admin/Medias.vue` — Composant sélecteur média, lit nakalaStore.assets, condition destination buggée
- `client/src/components/media/Library.vue` — Grille d'assets avec champ de recherche Tag, filtres currentAssets, callbacks select/delete/preview
- `client/src/pages/admin/Nakala.vue` — Page admin qui appelle nakalaStore.initialize()
- `client/src/pages/admin/NoticeForm.vue` — L'éditeur de notices qui ouvre le sélecteur Medias en mode picker

**Contraintes :**
- Ne pas casser le mode stockage local (quand `settings.storage.destination === "local"`, la recherche doit continuer à filtrer localement via `filterByTags`)
- La recherche doit fonctionner en mode picker (éditeur de notices) ET en mode admin (page /admin/medias)
- L'API Nakala peut avoir un délai de rafraîchissement après création — la recherche ne doit pas bloquer l'interface si l'API répond lentement
- Ne pas modifier `NoticeForm.vue` ni `Nakala.vue` sauf si nécessaire pour le rafraîchissement
---

## Prompt 2a — Upload temporaire des fichiers vers le serveur dès la sélection

**Contexte :** Actuellement, l'upload vers Nakala se fait en une seule opération bloquante à la validation du formulaire : les fichiers sont envoyés en multipart vers le proxy Node.js (`server/src/middlewares/proxyHttp.js`) via `multer().array("images")` qui les charge entièrement en RAM, puis forwardés vers `POST /datas/uploads` de l'API Nakala. L'objectif est de découper le processus : d'abord uploader les fichiers vers le serveur dès que l'utilisateur les sélectionne (stockage disque), puis plus tard les publier vers Nakala. Ce prompt couvre uniquement la première étape : upload client → serveur + stockage temporaire.

**Objectif :** Permettre à l'utilisateur de sélectionner des fichiers et de les voir uploader immédiatement vers le serveur Node.js avec barre de progression, sans attendre la validation du formulaire. Les fichiers sont stockés sur disque et identifiés par un `tempId`.

**Tâches à réaliser :**

1. **Modifier multer pour stocker sur disque** (`server/src/middlewares/proxyHttp.js`) :
   - Remplacer `multer().array("images")` (stockage mémoire) par `multer.diskStorage({ destination: './uploads/temp/' })`
   - Créer le dossier `./uploads/temp/` au démarrage du serveur (`fs.mkdirSync` avec `recursive: true`)
   - Renommer les fichiers stockés avec un UUID + extension d'origine pour éviter les collisions
   - Conserver le fonctionnement existant pour l'endpoint `/datas/uploads` actuel — laisser `proxyHttp.js` utiliser le diskStorage par défaut

2. **Créer un endpoint d'upload temporaire** (nouveau fichier `server/src/routes/nakalaTemp.routes.js` à monter dans `server/src/routes/index.js`) :
   - `POST /nakala/temp-upload` : reçoit des fichiers via multer (diskStorage), retourne un tableau d'objets `{ tempId, originalname, size, mimetype, path }`
   - `tempId` = UUID v4 généré côté serveur, associé aux fichiers temporaires
   - Utiliser une Map côté serveur pour associer tempId → `{ files: [...], createdAt: Date }`
   - Ajouter un nettoyage automatique : un `setInterval` toutes les 15 minutes supprime les fichiers temporaires de plus d'1h et nettoie la Map

3. **Upload automatique côté client** (`client/src/components/forms/FormAssetNakala.vue`) :
   - Modifier le champ file (ligne 39-45, event `@change="checkUploadSize"`) : dès que des fichiers sont sélectionnés, déclencher un upload vers `POST /nakala/temp-upload`
   - Créer une ref `uploadedFiles = ref([])` pour stocker les réponses du serveur `{ tempId, originalname, size, mimetype }`
   - Créer une ref `uploadingFiles = ref(false)` pour l'état de chargement
   - Créer une ref `uploadProgress = ref(0)` pour la progression (0-100)
   - Utiliser `axios.post()` avec l'option `onUploadProgress` pour la barre de progression
   - Afficher visuellement pour chaque fichier : spinner (en cours) → check vert (fait) → icône erreur (échec)
   - En cas d'échec, afficher un bouton "Réessayer" à côté du fichier concerné
   - Réactiver la fonction `checkUploadSize` (lignes 228-243, actuellement commentée) pour alerter l'utilisateur si un fichier dépasse une limite configurable (ex: 2 GB)

4. **Adapter le bouton de soumission** (`client/src/components/forms/FormAssetNakala.vue`, ligne 87-89) :
   - Le bouton "Add to nakala library" ne doit PAS être bloqué pendant l'upload temporaire (upload en parallèle du remplissage du formulaire)
   - Si l'upload temporaire est encore en cours au moment du clic, afficher un message "Upload en cours, veuillez patienter..." mais ne pas bloquer — attendre la fin des uploads avant de procéder

**Fichiers de référence à consulter :**
- `server/src/middlewares/proxyHttp.js` — Proxy actuel, configuration multer, logique de forward
- `server/src/routes/index.js` — Montage des routes, configuration Nakala
- `server/src/index.js` — Point d'entrée du serveur Express
- `client/src/components/forms/FormAssetNakala.vue` — Formulaire d'upload, champ file, checkUploadSize (commenté), fonctions createData/updateData

**Contraintes :**
- Ne pas casser l'upload multipart existant vers `/datas/uploads` — le diskStorage est rétrocompatible
- L'upload temporaire ne doit pas bloquer l'interface utilisateur (upload asynchrone)
- Les fichiers temporaires doivent être automatiquement nettoyés après 1h
- Ne pas modifier le comportement du formulaire pour les petits fichiers qui n'utilisent pas encore ce mécanisme
- Le `tempId` doit être unique et non prédictible
---

## Prompt 2b — Publication vers Nakala via TUS à la validation du formulaire

**Contexte :** Ce prompt dépend du Prompt 2a (upload temporaire). Les fichiers sont déjà stockés sur le serveur (dossier `./uploads/temp/`) et identifiés par des `tempId` côté client. Il reste à implémenter la publication vers Nakala : quand l'utilisateur valide le formulaire, le serveur doit prendre les fichiers temporaires, les uploader vers Nakala via le protocole TUS (endpoint non documenté `/tus/`), récupérer les SHA1 via `/file/cache`, puis créer la data Nakala avec les métadonnées du formulaire. Le POC Python démontre le workflow complet : `TUS_upload_nakala.ipynb`.

**Objectif :** À la validation du formulaire, envoyer les `tempId` + métadonnées au serveur qui orchestre l'upload TUS vers Nakala, la récupération du SHA1, la création de la data, et le nettoyage des fichiers temporaires.

**Tâches à réaliser :**

1. **Créer un endpoint de publication** (dans le même fichier `server/src/routes/nakalaTemp.routes.js` du Prompt 2a) :
   - `POST /nakala/publish` : reçoit `{ tempIds: [...], title, description, language, license: { code }, metas: [...], keywords: [...] }`
   - Récupérer chaque fichier depuis le disque via son `tempId` dans la Map
   - Uploader chaque fichier vers Nakala via le protocole TUS :
     - Endpoint TUS : `https://api.nakala.fr/tus/` (ou `https://apitest.nakala.fr/tus/` selon config, voir `server/src/routes/index.js` ligne 22-32)
     - Header `X-API-KEY` : clé API Nakala (définie dans `server/src/routes/index.js` ligne 5)
     - Utiliser chunks de 15MB (15 * 1024 * 1024 bytes)
     - Headers TUS requis : `Upload-Length` (taille totale), `Upload-Metadata` (filename, filetype encodés en base64), `Tus-Resumable: 1.0.0`
     - Implémenter l'upload TUS avec `axios` (pas de dépendance externe, requêtes HTTP PATCH avec header `Upload-Offset`)
     - Le TUS termine en renvoyant l'URL de la ressource — en extraire le `tusId` (dernier segment de l'URL)
   - Pour chaque `tusId`, appeler `POST /file/cache` avec `{ ids: [tusId] }` pour récupérer `{ name, sha1 }`
   - Formater les métadonnées Nakala : suivre le même format que `client/src/stores/nakala.js` fonction `create()` (lignes 242-288) — title, license, type COAR, creator (null), created (null), description, keywords
   - Appeler `POST /datas` avec `{ files: [{ name, sha1, tusId }], metas: [...], status: "published", collectionIds: [collectionID] }`
   - Supprimer les fichiers temporaires du disque après publication réussie
   - En cas d'échec à n'importe quelle étape, NE PAS supprimer les fichiers temporaires (permettre une re-tentative)
   - Retourner la réponse Nakala (identifiant de la data créée) au client

2. **Mettre à jour le store client Nakala** (`client/src/stores/nakala.js`) :
   - Modifier la fonction `create()` (lignes 205-316) : ne plus appeler `upload(files)` si des `tempIds` sont fournis
   - À la place, envoyer une requête `POST /nakala/publish` avec les `tempIds` et les métadonnées du formulaire
   - Conserver l'ancien chemin (`upload()` + `create()` direct via multipart) pour compatibilité — le store doit pouvoir gérer les deux cas
   - Après publication réussie, appeler `getAll()` comme actuellement pour rafraîchir la liste

3. **Mettre à jour le formulaire client** (`client/src/components/forms/FormAssetNakala.vue`) :
   - Modifier `createData()` (lignes 296-325) : passer les `tempIds` stockés (`uploadedTempIds`) au store au lieu des fichiers bruts
   - Si `uploadedTempIds` est vide (pas de fichier sélectionné), ne pas appeler `/publish` (data sans fichier)
   - Afficher un état "Publication en cours..." pendant l'appel à `/publish`
   - Modifier `updateData()` (lignes 275-293) pour le même mécanisme : si de nouveaux fichiers ont été uploadés en temporaire, les inclure dans la publication

4. **Nettoyage de la Map des tempIds** (`server/src/routes/nakalaTemp.routes.js`) :
   - Après publication réussie, retirer les `tempIds` de la Map
   - Le `setInterval` de nettoyage doit ignorer les fichiers dont le tempId n'est plus dans la Map (déjà publiés)

**Fichiers de référence à consulter :**
- `server/src/routes/nakalaTemp.routes.js` — Créé dans le Prompt 2a, endpoint temp-upload + Map + nettoyage
- `server/src/routes/index.js` — Configuration Nakala (URL, clé API), montage des routes
- `client/src/stores/nakala.js` — Store Pinia, fonctions `create()` (lignes 205-316) et `upload()` (lignes 130-144)
- `client/src/components/forms/FormAssetNakala.vue` — Formulaire, fonctions `createData()` (lignes 296-325), `updateData()` (lignes 275-293)
- POC TUS Nakala : `https://gitlab.huma-num.fr/dhune/tus_api_nakala/-/raw/main/TUS_upload_nakala.ipynb` — Notebook Python montrant le workflow complet : TUS upload → /file/cache → POST /datas avec `{name, sha1, tusId}`

**Contraintes :**
- La clé API Nakala ne doit jamais être exposée côté client — tout passe par le serveur
- Conserver le flux actuel (upload multipart direct vers `/nakala/datas/uploads` puis création) comme fallback pour les petits fichiers qui n'utilisent pas le TUS
- En cas d'échec TUS, les fichiers temporaires doivent être conservés pour re-tentative
- Le format des métadonnées Nakala doit être identique à celui utilisé actuellement dans `create()` du store
- La réponse doit inclure l'identifiant Nakala de la data créée pour que le client puisse l'afficher

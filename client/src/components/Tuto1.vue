<template>
  <p>
    La carte présente des parcours colorés, avec un ou plusieurs points. Le but est de les visiter et lire les notices associées. Deux modes sont disponibles, cliquez sur
    le bouton <i class="fa-solid fa-route" /> / <i class="fa-solid fa-location-dot" /> <span class="emphasis-text">Mode</span> pour alterner.
  </p>

  <h3>1. <i class="fa-solid fa-route" /> Mode exploration (par défaut)</h3>

  <p>
    Seuls les points d'entrée sont trouvables. Cliquez sur un pour révéler le parcours. Vous serez guidé•e d'un point à l'autre. Cliquez sur le bouton
    <i class="fa-solid fa-arrow-left" /> <span class="emphasis-text">Retour</span> pour afficher tous les points d'entrée à nouveau.
  </p>

  <p>
    Le parcours suit les points principaux (<span class="plain-line"></span> ligne pleine) et leurs détours (<span class="dashed-line"></span> ligne pointillée).
  </p>

  <p>
    Vous pouvez activer / désactiver l'audio en cliquant sur le bouton <i class="fa-solid fa-volume-xmark" /> / <i class="fa-solid fa-volume-high" /> <span class="emphasis-text">Audio</span> (désactivé par défaut) pour une expérience immersive !
  </p>

  <p v-if="hasDetectiveMode">
    Attention : certains points d'entrée sont cachés ! <br> Activez l'audio pour les trouver. Si vous ne pouvez pas ou si vous souhaitez simplement afficher tous les points d'entrée, cliquez sur le bouton <i class="fa-solid fa-eye-slash" /> / <i class="fa-solid fa-eye" /> <span class="emphasis-text">Afficher ou non les points d'entrée</span>.
  </p>

  <h3>2. <i class="fa-solid fa-location-dot" /> Mode visible </h3>

  <p>Tous les points sont affichés, vous pouvez utiliser le menu <i class="fa-solid fa-filter" /> <span class="emphasis-text">Filtres</span>.</p>
</template>

<script setup>
const props = defineProps({
  hasDetectiveMode: Boolean,
});
</script>

<style scoped>
p {
  color: var(--color-text-fade) !important;
}

p:not(h3 ~ p)::first-letter,
h3 {
  padding-left: var(--size-8);
}

.plain-line,
.dashed-line {
  display: inline-block;
  width: 30px;
  margin-bottom: var(--size-1);
}

.plain-line {
  border: 1.5px solid currentColor;
}

.dashed-line {
  border: 1.5px dashed currentColor;
}
</style>

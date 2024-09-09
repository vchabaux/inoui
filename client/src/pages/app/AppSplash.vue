<template>
  <audio id="gong" src="/gong.mp3"></audio>
  <div class="container">
    <div class="inoui-container">
      <p class="inoui"><span>IN</span>O<span>UI</span></p>
    </div>
    <div class="text-container">
      <p class="text1">Musiques du monde</p>
      <p class="text2">monde de Nanterre</p>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(["complete"]);

setTimeout(() => {
  document.getElementById("gong").play();
}, 9000);

setTimeout(() => {
  emit("complete");
}, 18000);
</script>

<style scoped>
:global(main) {
  overflow: hidden;
}

.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0;
}

.inoui-container {
  position: relative;
}

.inoui {
  position: relative;
  display: flex;
  font-family: "Bauhaus", sans-serif;
}

.inoui span {
  transform: scaleX(1.2);
}

.inoui {
  transform: rotate(-90deg);
  animation: spinin 3s ease-in-out forwards 2s, spinout 3s ease-in-out forwards 14s, fadeout 1s ease-in-out forwards 17s;
}

.inoui::before {
  content: "¨";
  position: absolute;
  inset-block-start: -0.2em;
  opacity: 0;
  animation: fadein 1s ease-in-out forwards 5s, fadeout 1s ease-in-out forwards 14s;
}

.inoui::after {
  content: "O";
  position: absolute;
  inset-inline-start: 50%;
  transform: translateX(-50%);
  animation: pulse 1s ease-in-out 9s;
}

.text-container {
  position: relative;
}

.text1 {
  position: absolute;
  width: max-content;
  opacity: 0;
  inset-block-start: calc(100% - var(--size-2));
  animation: slideLeftIn 4s ease-in-out forwards 4s, fadein 2s ease-in-out forwards 6.5s, slideLeftOut 2s ease-in-out forwards 12s;
}

.text2 {
  position: absolute;
  width: max-content;
  opacity: 0;
  inset-block-start: calc(100% - var(--size-2));
  animation: slideRightIn 4s ease-in-out forwards 5s, fadein 2s ease-in-out forwards 7.5s, slideRightOut 2s ease-in-out forwards 11s;
}

@media (max-width: 767px) {
  .inoui-container {
    animation: exit 2s ease-in-out forwards 14s;
    font-size: calc(var(--size-10) * 2.5);
  }

  .inoui {
    gap: 0.75rem;
  }

  .inoui::before {
    inset-inline-end: -0.85rem;
  }

  .text1,
  .text2 {
    --text-fix: 1.2rem;
    font-size: var(--size-3);
  }
}

@media (min-width: 768px) {
  .inoui-container {
    animation: exit 1.5s ease-in-out forwards 14s;
    font-size: calc(var(--size-20) * 2.5);
  }

  .inoui {
    gap: 1.5rem;
  }

  .inoui::before {
    inset-inline-end: -1.75rem;
  }

  .text1,
  .text2 {
    --text-fix: 1.95rem;
    font-size: var(--size-5);
  }
}

@keyframes spinin {
  from {
    transform: rotate(-90deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes spinout {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(450deg);
  }
}

@keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeout {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes slideRightIn {
  from {
    inset-inline-start: 200vw;
  }
  to {
    inset-inline-start: calc(50% - var(--text-fix));
  }
}

@keyframes slideRightOut {
  from {
    inset-inline-start: calc(50% - var(--text-fix));
  }
  to {
    inset-inline-start: -200vw;
  }
}

@keyframes slideLeftIn {
  from {
    inset-inline-end: 200vw;
  }
  to {
    inset-inline-end: calc(50% - var(--text-fix));
  }
}

@keyframes slideLeftOut {
  from {
    inset-inline-end: calc(50% - var(--text-fix));
  }
  to {
    inset-inline-end: -200vw;
  }
}

@keyframes pulse {
  0% {
    filter: none;
  }
  20% {
    filter: blur(6px);
  }
  40% {
    filter: blur(4px);
  }
  60% {
    filter: blur(2px);
  }
  80% {
    filter: blur(6px);
  }
  100% {
    filter: none;
  }
}

@keyframes exit {
  from {
    margin-inline-start: 0;
  }
  to {
    margin-inline-end: calc(100vw - 1em);
  }
}
</style>

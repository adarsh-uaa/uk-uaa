<script setup lang="ts">
const progress=ref(0)
function update(){const d=document.documentElement;progress.value=Math.min(100,Math.max(0,((window.scrollY)/(d.scrollHeight-innerHeight||1))*100))}
onMounted(()=>{update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update)})
onUnmounted(()=>{window.removeEventListener('scroll',update);window.removeEventListener('resize',update)})
</script><template><div class="scroll-progress" :style="{transform:`scaleX(${progress/100})`}" aria-hidden="true"/></template>

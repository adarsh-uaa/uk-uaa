<script setup lang="ts">
import {airportsCatalog,journeyTypes,extrasCatalog,selectAirport} from '~/data/booking'
const props=defineProps<{airport:string; service:string; extras:string[]; showExtras?:boolean}>()
const emit=defineEmits<{ 'update:airport':[value:string]; 'update:service':[value:string]; 'update:extras':[value:string[]] }>()
const current=computed(()=>selectAirport(props.airport))
const availableTypes=computed(()=>journeyTypes.filter(s=>(current.value.types as readonly string[]).includes(s.slug)))
const availableExtras=computed(()=>extrasCatalog.filter(s=>(current.value.extras as readonly string[]).includes(s.slug)))
watch(()=>props.airport,()=>{
 if(!availableTypes.value.some(s=>s.slug===props.service))emit('update:service',availableTypes.value[0]?.slug||'arrival')
 emit('update:extras',props.extras.filter(v=>availableExtras.value.some(s=>s.slug===v)))
})
function toggleExtra(v:string,checked:boolean){emit('update:extras',checked?[...props.extras,v]:props.extras.filter(x=>x!==v))}
</script>
<template>
 <div class="linked-fields">
  <label class="premium-field"><span>Airport <b>*</b></span><select :value="airport" required @change="emit('update:airport',($event.target as HTMLSelectElement).value)"><option v-for="a in airportsCatalog" :key="a.slug" :value="a.slug">{{a.name}} ({{a.code}})</option></select></label>
  <label class="premium-field"><span>Service type <b>*</b></span><select :value="service" required @change="emit('update:service',($event.target as HTMLSelectElement).value)"><option v-for="s in availableTypes" :key="s.slug" :value="s.slug">{{s.name}}</option></select></label>
 </div>
 <div v-if="showExtras" class="optional-services"><p class="micro-label">AVAILABLE ADD-ONS FOR {{current.code}}</p><p class="subtle-note">Options vary by airport. Availability and inclusions are confirmed before booking.</p><div class="choice-grid"><label v-for="x in availableExtras" :key="x.slug" class="checkbox-choice"><input type="checkbox" :checked="extras.includes(x.slug)" @change="toggleExtra(x.slug,($event.target as HTMLInputElement).checked)"/>{{x.name}}</label></div></div>
</template>

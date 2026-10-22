<script setup lang="ts">
import {airportsCatalog,selectAirport} from '~/data/booking'
const props=withDefaults(defineProps<{initialAirport?:string}>(),{initialAirport:'heathrow'})
const airport=ref(props.initialAirport),service=ref('arrival'),extras=ref<string[]>([])
const selected=computed(()=>selectAirport(airport.value))
function proceed(){return navigateTo({path:'/book',query:{airport:airport.value,service:service.value}})}
</script><template><div class="journey-panel"><div><AirportServices v-model:airport="airport" v-model:service="service" v-model:extras="extras" show-extras/></div><div class="journey-panel-summary"><span class="luxe-kicker">YOUR AIRPORT EXPERIENCE</span><h3>{{selected.name}}</h3><p>Services shown reflect a sample configuration. Your team should confirm availability and supplier ID mapping for each airport.</p><button class="premium-submit" @click="proceed">Continue to booking →</button></div></div></template>

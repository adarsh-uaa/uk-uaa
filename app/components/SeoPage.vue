<script setup lang="ts">
const props=defineProps<{title:string;description:string;path:string;eyebrow?:string;heading:string;intro:string;image?:string}>()
const siteUrl=useRuntimeConfig().public.siteUrl
useSeoMeta({title:props.title,description:props.description,ogTitle:props.title,ogDescription:props.description,ogType:'website',ogUrl:siteUrl+props.path,twitterCard:'summary_large_image'})
useHead({link:[{rel:'canonical',href:siteUrl+props.path}]})
</script><template><section class="interior-hero"><div class="container"><span class="luxe-kicker">{{eyebrow||'UK AIRPORT ASSISTANCE'}}</span><h1>{{heading}}</h1><p>{{intro}}</p></div></section></template>

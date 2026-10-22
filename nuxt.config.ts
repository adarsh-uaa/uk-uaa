export default defineNuxtConfig({
 compatibilityDate:'2026-10-01',
 css:['~/assets/css/main.css','~/assets/css/luxe.css'],
 devtools:{enabled:false},
 app:{head:{htmlAttrs:{lang:'en-GB'},title:'UK Airport Assistance | VIP Meet & Greet',meta:[{name:'theme-color',content:'#f6f2eb'},{name:'color-scheme',content:'light'}],link:[{rel:'preconnect',href:'https://fonts.googleapis.com'},{rel:'preconnect',href:'https://fonts.gstatic.com',crossorigin:''},{rel:'stylesheet',href:'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;1,400&display=swap'}]}},
 runtimeConfig:{bookingApiUrl:process.env.BOOKING_API_URL||'https://abc.api.com/abc-test',bookingApiEnabled:process.env.BOOKING_API_ENABLED==='true',bookingApiToken:process.env.BOOKING_API_TOKEN||'',public:{siteUrl:process.env.NUXT_PUBLIC_SITE_URL||'http://localhost:3000'}}
})
import {createError,readBody} from 'h3'
// POST remains disabled until you explicitly enable it. Never expose upstream API keys to the browser.
export default defineEventHandler(async(event)=>{
 const cfg=useRuntimeConfig()
 const payload=await readBody(event)
 const keys=['airport_name','airport_name_id','email','mobile','service_types_id','arrival_flight_number','arrival_date','departure_flight_number','departure_date','class_of_travel_id','servicesinput_id','no_luggages','traveler_name','arrival_time','departure_time','uaa_url','uaa_p_c_method','childrens_count','infants_count','adults_count']
 if(!payload||typeof payload!=='object'||keys.some(k=>typeof payload[k]!=='string'))throw createError({statusCode:400,statusMessage:'Invalid booking payload'})
 if(!payload.email||!payload.mobile||!payload.airport_name_id||!payload.traveler_name)throw createError({statusCode:400,statusMessage:'Missing required booking fields'})
 if(!cfg.bookingApiEnabled)throw createError({statusCode:503,statusMessage:'Demo mode: outbound booking API disabled. Configure supplier IDs and BOOKING_API_ENABLED=true to activate.'})
 // Provider must support a unique idempotency key to safely retry submissions.
 // This route deliberately never retries failed requests automatically.
 try{
  const data=await $fetch(cfg.bookingApiUrl as string,{method:'POST',body:payload,headers:cfg.bookingApiToken?{Authorization:`Bearer ${cfg.bookingApiToken}`}:{},timeout:15000,retry:0})
  return {success:true,message:'Request received by supplier',data}
 }catch(err:any){console.error('Booking upstream failed:',err?.statusCode||err?.message);throw createError({statusCode:502,statusMessage:'Supplier request failed. Please contact support before retrying to avoid a duplicate booking.'})}
})

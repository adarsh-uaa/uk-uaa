export const airports = [
  { slug: 'heathrow', name: 'London Heathrow', code: 'LHR', city: 'London', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=850&q=82', note: 'The international gateway · VIP Suites Available', is_vip: true },
  { slug: 'gatwick', name: 'London Gatwick', code: 'LGW', city: 'London', image: 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?auto=format&fit=crop&w=850&q=82', note: 'A refined welcome · VIP Terminal Available', is_vip: true },
  { slug: 'manchester', name: 'Manchester', code: 'MAN', city: 'Manchester', image: 'https://images.unsplash.com/photo-1515569067071-ec3b51335dd0?auto=format&fit=crop&w=850&q=82', note: 'Northern connections · Premier Meet & Greet', is_vip: false },
  { slug: 'edinburgh', name: 'Edinburgh', code: 'EDI', city: 'Edinburgh', image: 'https://images.unsplash.com/photo-1506377585622-bedcbb027afc?auto=format&fit=crop&w=850&q=82', note: 'Arrive in Scotland · Premier Meet & Greet', is_vip: false },
  { slug: 'birmingham', name: 'Birmingham', code: 'BHX', city: 'Birmingham', image: 'https://images.unsplash.com/photo-1490430657723-4d607c1503fc?auto=format&fit=crop&w=850&q=82', note: 'Central UK gateway · Premier Meet & Greet', is_vip: false },
  { slug: 'stansted', name: 'London Stansted', code: 'STN', city: 'London', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=850&q=82', note: 'Travel, considered · Premier Meet & Greet', is_vip: false }
] as const
export const services = [
 { slug:'meet-and-greet', eyebrow:'01 / ARRIVE', name:'Meet & Greet', detail:'A warm welcome and a dedicated assistant to guide your journey.', icon:'handshake', image:'/images/meet-and-greet.webp?auto=format&fit=crop&w=850&q=80' },
 { slug:'fast-track', eyebrow:'02 / FLOW', name:'Fast Track', detail:'Priority services where available and authorized by the airport.', icon:'clock', image:'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=850&q=80' },
 { slug:'lounge', eyebrow:'03 / UNWIND', name:'VIP Lounges', detail:'An elevated pause before your flight, subject to access.', icon:'armchair', image:'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=850&q=80' },
 { slug:'family-assistance', eyebrow:'04 / CARE', name:'Family Assistance', detail:'A thoughtful experience for those travelling together.', icon:'users', image:'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=850&q=80' }
] as const

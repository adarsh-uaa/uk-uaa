<script setup lang="ts">
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  LogOut,
  RefreshCw,
  Plane,
  Star,
  Search,
  Download,
  Eye,
  EyeOff,
  Ban,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Globe,
  Clock,
  X,
  BarChart3,
  TrendingUp,
  Calendar
} from 'lucide-vue-next'

interface BookingRecord {
  id: string
  enquiryReference: string | null
  timestamp: string
  timestampLocal: string
  status: 'SUCCESS' | 'FAILED'
  statusCode: number
  category: string
  error: string | null
  traveler: {
    name: string
    email: string
    mobile: string
    contactMethod: string
  }
  party: {
    adults: string
    children: string
    infants: string
    luggage: string
  }
  journey: {
    airportName: string
    airportCode: string
    terminal: string
    serviceType: string
    services: string[]
    travelClass: string
    arrivalFlight: string
    arrivalDate: string
    arrivalTime: string
    departureFlight: string
    departureDate: string
    departureTime: string
  }
  ip: string
  userAgent: string
}

interface ReviewRecord {
  id: string
  bookingReference: string
  rating: number
  ratingLabel: string
  comment: string
  timestamp: string
  timestampLocal: string
  clientIp: string
  userAgent: string
  sourceUrl: string
}

interface IpSummaryRecord {
  ip: string
  accessHits: number
  bookingsCount: number
  reviewsCount: number
  blockedHits: number
  lastSeen: string
  lastPath: string
  userAgent: string
  isBlocked: boolean
  blockReason: string | null
  blockedAt: string | null
}

interface BlockedIpRecord {
  ip: string
  reason: string
  blockedAt: string
  blockedBy: string
}

interface SecurityEventRecord {
  timestamp: string
  category: string
  ip: string
  method: string
  path: string
  details: string
  userAgent: string
  blocked: boolean
}

interface AccessLogRecord {
  timestamp: string
  ip: string
  method: string
  path: string
  statusCode: number
  blocked: boolean
  userAgent: string
}

interface BreakdownItem {
  label: string
  count: number
  percent: number
}

interface DashboardResponse {
  availableMonths: string[]
  selectedMonth: string
  generatedAt: string
  kpis: {
    totalBookings: number
    successfulBookings: number
    failedBookings: number
    successRate: number
    totalReviews: number
    averageRating: number
    uniqueIps: number
    totalAccessHits: number
    blockedEventsCount: number
    activeBlockedIpsCount: number
  }
  analytics: {
    dailyBookings: { date: string; success: number; failed: number; total: number }[]
    allDailyBookings: { date: string; success: number; failed: number; total: number }[]
    monthlyBookings: { month: string; label: string; success: number; failed: number; total: number }[]
    topAirports: BreakdownItem[]
    serviceTypes: BreakdownItem[]
    terminalSplit: BreakdownItem[]
    travelClasses: BreakdownItem[]
    ratingDistribution: { stars: number; count: number; percent: number }[]
    topPaths: BreakdownItem[]
    securityBreakdown: BreakdownItem[]
  }
  bookings: BookingRecord[]
  reviews: ReviewRecord[]
  ipSummary: IpSummaryRecord[]
  blockedIps: BlockedIpRecord[]
  securityEvents: SecurityEventRecord[]
  accessLogs: AccessLogRecord[]
}

const { siteName } = useSiteMeta()
const toast = useToast()

useSeoMeta({
  title: computed(() => `Operations & Security Portal | ${siteName.value}`),
  robots: 'noindex, nofollow'
})

// Session check (forwards cookie on SSR refresh)
const reqHeaders = import.meta.server ? useRequestHeaders(['cookie']) : undefined
const { data: sessionState, refresh: refreshSession } = await useFetch<{
  configured: boolean
  authenticated: boolean
  username: string | null
}>('/api/admin/session', {
  headers: reqHeaders
})

const configured = computed(() => sessionState.value?.configured ?? true)
const authenticated = computed(() => Boolean(sessionState.value?.authenticated))
const activeUser = computed(() => sessionState.value?.username || 'admin')

// Login Form State
const loginUsername = ref('admin')
const loginPassword = ref('')
const showPassword = ref(false)
const loginLoading = ref(false)
const loginError = ref('')

type VolumeMetricFilter = 'all' | 'total' | 'confirmed' | 'failed'

// Dashboard State
const activeTab = ref<'overview' | 'bookings' | 'reviews' | 'security'>('overview')
const selectedMonth = ref('all')
const volumeGranularity = ref<'daily' | 'monthly'>('daily')
const volumeMonth = ref('all')
const volumeMetricFilter = ref<VolumeMetricFilter>('all')
const chartStyle = ref<'area' | 'bars'>('area')
const hoveredVolumeIdx = ref<number | null>(null)
const dashboard = ref<DashboardResponse | null>(null)
const loadingDashboard = ref(false)
const dashboardError = ref('')

// Filters & Inspectors
const bookingSearch = ref('')
const bookingStatusFilter = ref<'ALL' | 'SUCCESS' | 'FAILED'>('ALL')
const selectedBooking = ref<BookingRecord | null>(null)

const reviewSearch = ref('')
const reviewStarFilter = ref<number>(0)

const ipSearch = ref('')
const blockIpInput = ref('')
const blockReasonInput = ref('')
const ipActionPending = ref(false)

async function loadDashboard() {
  if (!authenticated.value) return
  loadingDashboard.value = true
  dashboardError.value = ''

  try {
    const res = await $fetch<DashboardResponse>('/api/admin/dashboard', {
      query: { month: selectedMonth.value },
      headers: import.meta.server ? reqHeaders : undefined
    })
    dashboard.value = res
  } catch (err: any) {
    if (err?.statusCode === 401) {
      await refreshSession()
    } else {
      dashboardError.value = err?.data?.statusMessage || err?.message || 'Failed to load logs.'
    }
  } finally {
    loadingDashboard.value = false
  }
}

if (authenticated.value) {
  await loadDashboard()
}

watch(selectedMonth, (val) => {
  volumeMonth.value = val
  hoveredVolumeIdx.value = null
  if (authenticated.value) {
    loadDashboard()
  }
})

watch(volumeMonth, (val) => {
  hoveredVolumeIdx.value = null
  if (val !== 'all' && volumeGranularity.value === 'monthly') {
    volumeGranularity.value = 'daily'
  }
})

watch([volumeGranularity, chartStyle, volumeMetricFilter], () => {
  hoveredVolumeIdx.value = null
})

function toggleVolumeMetricFilter(target: 'total' | 'confirmed' | 'failed') {
  volumeMetricFilter.value = volumeMetricFilter.value === target ? 'all' : target
}

async function handleLogin() {
  if (loginLoading.value) return
  loginError.value = ''
  loginLoading.value = true

  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: {
        username: loginUsername.value,
        password: loginPassword.value
      }
    })
    loginPassword.value = ''
    await refreshSession()
    await loadDashboard()
  } catch (err: any) {
    loginError.value =
      err?.data?.statusMessage ||
      err?.data?.message ||
      'Authentication failed. Check your credentials.'
  } finally {
    loginLoading.value = false
  }
}

async function handleLogout() {
  try {
    await $fetch('/api/admin/logout', { method: 'POST' })
  } finally {
    dashboard.value = null
    selectedBooking.value = null
    await refreshSession()
  }
}

async function toggleBlockIp(ip: string, currentlyBlocked: boolean, customReason?: string) {
  if (ipActionPending.value || !ip) return
  ipActionPending.value = true

  try {
    const action = currentlyBlocked ? 'unblock' : 'block'
    await $fetch('/api/admin/ip-block', {
      method: 'POST',
      body: {
        action,
        ip,
        reason: customReason || blockReasonInput.value.trim() || 'Blocked from Admin Security Portal'
      }
    })

    toast.success({
      title: action === 'block' ? 'IP Blocked' : 'IP Unblocked',
      message: `${ip} has been ${action === 'block' ? 'added to the blocklist' : 'removed from the blocklist'}.`
    })

    if (!currentlyBlocked) {
      blockIpInput.value = ''
      blockReasonInput.value = ''
    }

    await loadDashboard()
  } catch (err: any) {
    toast.error({
      title: 'Action Failed',
      message: err?.data?.statusMessage || err?.message || 'Unable to update IP blocklist.'
    })
  } finally {
    ipActionPending.value = false
  }
}

function handleManualBlockSubmit() {
  const cleanIp = blockIpInput.value.trim()
  if (!cleanIp) return
  toggleBlockIp(cleanIp, false, blockReasonInput.value.trim())
}

function matchesQuery(q: string, ...fields: (string | null | undefined)[]): boolean {
  for (const field of fields) {
    if (field && field.toLowerCase().includes(q)) return true
  }
  return false
}

// Filtered collections
const filteredBookings = computed(() => {
  const list = dashboard.value?.bookings || []
  const q = bookingSearch.value.trim().toLowerCase()
  const statusFilter = bookingStatusFilter.value

  return list.filter((b) => {
    if (statusFilter !== 'ALL' && b.status !== statusFilter) {
      return false
    }
    if (!q) return true
    return matchesQuery(
      q,
      b.id,
      b.enquiryReference,
      b.traveler.name,
      b.traveler.email,
      b.traveler.mobile,
      b.journey.airportName,
      b.journey.airportCode,
      b.ip,
      b.category
    )
  })
})

const filteredReviews = computed(() => {
  const list = dashboard.value?.reviews || []
  const q = reviewSearch.value.trim().toLowerCase()
  const starFilter = reviewStarFilter.value

  return list.filter((r) => {
    if (starFilter > 0 && Math.round(Number(r.rating)) !== starFilter) {
      return false
    }
    if (!q) return true
    return matchesQuery(q, r.id, r.bookingReference, r.comment, r.clientIp)
  })
})

const filteredIps = computed(() => {
  const list = dashboard.value?.ipSummary || []
  const q = ipSearch.value.trim().toLowerCase()
  if (!q) return list
  return list.filter(item =>
    item.ip.toLowerCase().includes(q) ||
    (item.blockReason && item.blockReason.toLowerCase().includes(q)) ||
    item.lastPath.toLowerCase().includes(q)
  )
})

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatMonthLabel(ym: string): string {
  const m = ym.match(/^(\d{4})-(\d{2})$/)
  if (!m || !m[1] || !m[2]) return ym
  return `${SHORT_MONTHS[Number(m[2]) - 1] || m[2]} ${m[1]}`
}

function formatDayShortLabel(isoDate: string): string {
  const m = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m || !m[2] || !m[3]) return isoDate
  return `${Number(m[3])} ${SHORT_MONTHS[Number(m[2]) - 1] || m[2]}`
}

const CHART_W = 860
const CHART_H = 264
const CHART_PAD_L = 42
const CHART_PAD_R = 20
const CHART_PAD_T = 20
const CHART_PAD_B = 34
const CHART_PLOT_W = CHART_W - CHART_PAD_L - CHART_PAD_R
const CHART_PLOT_H = CHART_H - CHART_PAD_T - CHART_PAD_B
const CHART_BASELINE = CHART_PAD_T + CHART_PLOT_H

interface VolumeChartPoint {
  key: string
  label: string
  shortLabel: string
  success: number
  failed: number
  total: number
  x: number
  slotX: number
  slotW: number
  yTotal: number
  ySuccess: number
  yFailed: number
  barSuccessX: number
  barFailedX: number
  barW: number
  barSingleX: number
  barSingleW: number
  barTotalH: number
  barSuccessH: number
  barFailedH: number
}

const volumeRawSeries = computed(() => {
  const analytics = dashboard.value?.analytics
  if (!analytics) return []

  if (volumeGranularity.value === 'monthly') {
    return (analytics.monthlyBookings || []).map(m => ({
      key: m.month,
      label: m.label,
      shortLabel: m.label,
      success: m.success,
      failed: m.failed,
      total: m.total
    }))
  }

  const allDays = analytics.allDailyBookings || analytics.dailyBookings || []
  const filtered =
    volumeMonth.value && volumeMonth.value !== 'all'
      ? allDays.filter(d => d.date.startsWith(`${volumeMonth.value}-`))
      : allDays.slice(-31)

  return filtered.map(d => ({
    key: d.date,
    label: `${formatDayShortLabel(d.date)} ${d.date.slice(0, 4)}`,
    shortLabel: formatDayShortLabel(d.date),
    success: d.success,
    failed: d.failed,
    total: d.total
  }))
})

const volumeScale = computed(() => {
  const items = volumeRawSeries.value
  const mode = volumeMetricFilter.value
  const rawMax = Math.max(
    1,
    ...items.map((d) => {
      if (mode === 'total') return d.total
      if (mode === 'confirmed') return d.success
      if (mode === 'failed') return d.failed
      return Math.max(d.success, d.failed)
    })
  )
  const rawStep = Math.max(1, Math.ceil(rawMax / 4))
  const step = rawStep <= 5 ? rawStep : Math.ceil(rawStep / 5) * 5
  const yMax = step * 4

  const ticks = [0, 1, 2, 3, 4].map((idx) => {
    const val = idx * step
    return {
      value: val,
      y: CHART_BASELINE - (val / yMax) * CHART_PLOT_H
    }
  })

  return { yMax, ticks }
})

const volumePoints = computed<VolumeChartPoint[]>(() => {
  const items = volumeRawSeries.value
  const count = items.length
  if (!count) return []

  const { yMax } = volumeScale.value
  const slotW = CHART_PLOT_W / count
  const barGap = count > 18 ? 2 : 4
  const barW = Math.max(6, Math.min(26, Math.floor((slotW - barGap - 8) / 2)))
  const barSingleW = Math.max(10, Math.min(38, Math.floor(slotW * 0.46)))
  const valueToY = (val: number) => CHART_BASELINE - (Math.max(0, val) / yMax) * CHART_PLOT_H
  const valueToH = (val: number, yPos: number) => (val > 0 ? Math.max(4, CHART_BASELINE - yPos) : 2)

  return items.map((item, i) => {
    const slotX = CHART_PAD_L + i * slotW
    const x = slotX + slotW / 2
    const yTotal = valueToY(item.total)
    const ySuccess = valueToY(item.success)
    const yFailed = valueToY(item.failed)

    return {
      ...item,
      x,
      slotX,
      slotW,
      yTotal,
      ySuccess,
      yFailed,
      barSuccessX: x - barGap / 2 - barW,
      barFailedX: x + barGap / 2,
      barW,
      barSingleX: x - barSingleW / 2,
      barSingleW,
      barTotalH: valueToH(item.total, yTotal),
      barSuccessH: valueToH(item.success, ySuccess),
      barFailedH: valueToH(item.failed, yFailed)
    }
  })
})

function clampChartY(y: number): number {
  return Math.max(CHART_PAD_T, Math.min(CHART_BASELINE, y))
}

function buildMonotonePaths(coords: { x: number; y: number }[]) {
  const n = coords.length
  if (n === 0) return { line: '', area: '' }

  const first = coords[0]!
  if (n === 1) {
    const span = 52
    const x0 = Math.max(CHART_PAD_L, first.x - span)
    const x1 = Math.min(CHART_W - CHART_PAD_R, first.x + span)
    const line = `M ${x0.toFixed(1)} ${first.y.toFixed(1)} L ${x1.toFixed(1)} ${first.y.toFixed(1)}`
    const area = `${line} L ${x1.toFixed(1)} ${CHART_BASELINE} L ${x0.toFixed(1)} ${CHART_BASELINE} Z`
    return { line, area }
  }

  if (n === 2) {
    const second = coords[1]!
    const line = `M ${first.x.toFixed(1)} ${first.y.toFixed(1)} L ${second.x.toFixed(1)} ${second.y.toFixed(1)}`
    const area = `${line} L ${second.x.toFixed(1)} ${CHART_BASELINE} L ${first.x.toFixed(1)} ${CHART_BASELINE} Z`
    return { line, area }
  }

  const d: number[] = []
  for (let i = 0; i < n - 1; i++) {
    const p0 = coords[i]!
    const p1 = coords[i + 1]!
    const dx = p1.x - p0.x
    d.push(Math.abs(dx) > 1e-6 ? (p1.y - p0.y) / dx : 0)
  }

  const m: number[] = new Array(n).fill(0)
  m[0] = d[0] ?? 0
  m[n - 1] = d[n - 2] ?? 0

  for (let i = 1; i < n - 1; i++) {
    const dPrev = d[i - 1] ?? 0
    const dCurr = d[i] ?? 0
    m[i] = dPrev * dCurr <= 0 ? 0 : (dPrev + dCurr) / 2
  }

  for (let i = 0; i < n - 1; i++) {
    const slope = d[i] ?? 0
    if (Math.abs(slope) < 1e-9) {
      m[i] = 0
      m[i + 1] = 0
    } else {
      const a = (m[i] ?? 0) / slope
      const b = (m[i + 1] ?? 0) / slope
      const s = a * a + b * b
      if (s > 9) {
        const tau = 3 / Math.sqrt(s)
        m[i] = tau * a * slope
        m[i + 1] = tau * b * slope
      }
    }
  }

  let line = `M ${first.x.toFixed(1)} ${first.y.toFixed(1)}`
  for (let i = 0; i < n - 1; i++) {
    const p0 = coords[i]!
    const p1 = coords[i + 1]!
    const dx = (p1.x - p0.x) / 3
    const cx1 = p0.x + dx
    const cy1 = clampChartY(p0.y + (m[i] ?? 0) * dx)
    const cx2 = p1.x - dx
    const cy2 = clampChartY(p1.y - (m[i + 1] ?? 0) * dx)
    line += ` C ${cx1.toFixed(1)} ${cy1.toFixed(1)}, ${cx2.toFixed(1)} ${cy2.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`
  }

  const last = coords[n - 1]!
  const area = `${line} L ${last.x.toFixed(1)} ${CHART_BASELINE} L ${first.x.toFixed(1)} ${CHART_BASELINE} Z`
  return { line, area }
}

interface ChartSeriesConfig {
  id: 'total' | 'confirmed' | 'failed'
  label: string
  stroke: string
  strokeWidth: number
  areaFill: string
  barFill: string
  dotClass: string
  capClass: string
  getVal: (p: VolumeChartPoint) => number
  getY: (p: VolumeChartPoint) => number
  getBarH: (p: VolumeChartPoint) => number
}

interface ChartSeriesMeta extends ChartSeriesConfig {
  paths: { line: string; area: string }
}

const CHART_SERIES_CONFIG: Record<'total' | 'confirmed' | 'failed', ChartSeriesConfig> = {
  total: {
    id: 'total',
    label: 'Total',
    stroke: '#182a40',
    strokeWidth: 2.75,
    areaFill: 'url(#uaaTotalAreaGrad)',
    barFill: 'url(#uaaTotalBarGrad)',
    dotClass: 'total',
    capClass: 'total',
    getVal: p => p.total,
    getY: p => p.yTotal,
    getBarH: p => p.barTotalH
  },
  confirmed: {
    id: 'confirmed',
    label: 'Confirmed',
    stroke: '#059669',
    strokeWidth: 2.75,
    areaFill: 'url(#uaaSuccessAreaGrad)',
    barFill: 'url(#uaaSuccessBarGrad)',
    dotClass: 'success',
    capClass: 'success',
    getVal: p => p.success,
    getY: p => p.ySuccess,
    getBarH: p => p.barSuccessH
  },
  failed: {
    id: 'failed',
    label: 'Failed / Demo',
    stroke: '#e11d48',
    strokeWidth: 2.25,
    areaFill: 'url(#uaaFailedAreaGrad)',
    barFill: 'url(#uaaFailedBarGrad)',
    dotClass: 'failed',
    capClass: 'failed',
    getVal: p => p.failed,
    getY: p => p.yFailed,
    getBarH: p => p.barFailedH
  }
}

const EMPTY_PATHS = { line: '', area: '' }

const visibleChartSeries = computed<ChartSeriesMeta[]>(() => {
  const mode = volumeMetricFilter.value
  const pts = volumePoints.value
  const isArea = chartStyle.value === 'area'
  const selected =
    mode === 'total'
      ? [CHART_SERIES_CONFIG.total]
      : mode === 'confirmed'
        ? [CHART_SERIES_CONFIG.confirmed]
        : mode === 'failed'
          ? [CHART_SERIES_CONFIG.failed]
          : [CHART_SERIES_CONFIG.failed, CHART_SERIES_CONFIG.confirmed]

  return selected.map(cfg => ({
    ...cfg,
    paths: isArea ? buildMonotonePaths(pts.map(p => ({ x: p.x, y: cfg.getY(p) }))) : EMPTY_PATHS
  }))
})

function getFocusedPointCapValue(pt: VolumeChartPoint): number {
  const mode = volumeMetricFilter.value
  if (mode === 'confirmed') return pt.success
  if (mode === 'failed') return pt.failed
  return pt.total
}

function getFocusedPointCapY(pt: VolumeChartPoint): number {
  const mode = volumeMetricFilter.value
  const refY =
    mode === 'total'
      ? pt.yTotal
      : mode === 'confirmed'
        ? pt.ySuccess
        : mode === 'failed'
          ? pt.yFailed
          : Math.min(pt.ySuccess, pt.yFailed)
  return Math.max(CHART_PAD_T + 10, refY - 10)
}

const xAxisLabelStep = computed(() => {
  const n = volumePoints.value.length
  return n <= 10 ? 1 : Math.ceil(n / 8)
})

const volumeSummary = computed(() => {
  const items = volumeRawSeries.value
  const mode = volumeMetricFilter.value
  let total = 0
  let success = 0
  let failed = 0
  let peakLabel = '-'
  let peakVal = 0

  for (const item of items) {
    total += item.total
    success += item.success
    failed += item.failed
    const metricVal =
      mode === 'confirmed' ? item.success : mode === 'failed' ? item.failed : item.total
    if (metricVal > peakVal) {
      peakVal = metricVal
      peakLabel = item.shortLabel
    }
  }

  return {
    total,
    success,
    failed,
    rate: total > 0 ? Math.round((success / total) * 100) : 0,
    peakLabel,
    peakTotal: peakVal,
    buckets: items.length
  }
})

const activeVolumePoint = computed(() => {
  const idx = hoveredVolumeIdx.value
  if (idx === null) return null
  return volumePoints.value[idx] || null
})

const activeTooltipStyle = computed(() => {
  const pt = activeVolumePoint.value
  if (!pt) return {}
  const xPct = (pt.x / CHART_W) * 100
  if (xPct < 18) {
    return { left: `${Math.max(2, xPct - 4).toFixed(1)}%`, transform: 'translateX(0)' }
  }
  if (xPct > 82) {
    return { right: `${Math.max(2, 100 - xPct - 4).toFixed(1)}%`, left: 'auto', transform: 'translateX(0)' }
  }
  return { left: `${xPct.toFixed(1)}%`, transform: 'translateX(-50%)' }
})

const UK_DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
})

function formatTimestamp(iso: string): string {
  if (!iso) return '-'
  try {
    return UK_DATE_FORMATTER.format(new Date(iso))
  } catch {
    return iso
  }
}

function escapeCsvCell(val: unknown): string {
  let str = String(val ?? '').replace(/[\r\n]+/g, ' ')
  if (/^[=+\-@\t\r]/.test(str) && !/^\+\d{5,18}$/.test(str.trim())) {
    str = `'${str}`
  }
  return `"${str.replace(/"/g, '""')}"`
}

function exportBookingsCsv() {
  const rows = filteredBookings.value
  if (!rows.length) return

  const headers = [
    'Booking ID',
    'Enquiry Ref',
    'Timestamp (UK)',
    'Status',
    'Traveller Name',
    'Email',
    'Mobile',
    'Airport',
    'Terminal',
    'Service Type',
    'Services',
    'Class',
    'Arrival Flight',
    'Arrival Date',
    'Departure Flight',
    'Departure Date',
    'Adults',
    'Children',
    'Infants',
    'Luggage',
    'Client IP',
    'Error'
  ]

  const csvLines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map(b =>
      [
        b.id,
        b.enquiryReference || '',
        b.timestampLocal,
        b.status,
        b.traveler.name,
        b.traveler.email,
        b.traveler.mobile,
        b.journey.airportName,
        b.journey.terminal,
        b.journey.serviceType,
        b.journey.services.join('; '),
        b.journey.travelClass,
        b.journey.arrivalFlight,
        b.journey.arrivalDate,
        b.journey.departureFlight,
        b.journey.departureDate,
        b.party.adults,
        b.party.children,
        b.party.infants,
        b.party.luggage,
        b.ip,
        b.error || ''
      ]
        .map(escapeCsvCell)
        .join(',')
    )
  ]

  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `uaa-bookings-${selectedMonth.value}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="admin-shell">
    <!-- =========================================================== -->
    <!-- LOGIN PORTAL (Rendered when not authenticated)              -->
    <!-- =========================================================== -->
    <main v-if="!authenticated" class="admin-login-screen">
      <div class="login-card">
        <div class="login-brand-badge">
          <Shield :size="26" />
        </div>
        <span class="login-kicker">CONCIERGE OPERATIONS</span>
        <h1>Admin &amp; Security Portal</h1>
        <p class="login-subtitle">
          Restricted access for viewing booking logs, customer feedback, traffic analytics, and IP firewall controls.
        </p>

        <!-- Setup instructions if ADMIN_PASSWORD_HASH / ADMIN_PASSWORD not configured -->
        <div v-if="!configured" class="setup-warning-box" role="alert">
          <!-- <AlertTriangle :size="20" class="warn-icon" />
          <div>
            <strong>Admin Credentials Not Configured</strong>
            <p>
              Set <code>ADMIN_USERNAME</code> and <code>ADMIN_PASSWORD_HASH</code> in your <code>.env</code> file to enable access. Generate a secure salted hash by running:
            </p>
            <pre>npm run admin:password</pre>
          </div> -->
        </div>

        <form v-else class="login-form" @submit.prevent="handleLogin">
          <div class="form-field">
            <label for="admin-username">Username</label>
            <input
              id="admin-username"
              v-model="loginUsername"
              type="text"
              autocomplete="username"
              placeholder="admin"
              required
            />
          </div>

          <div class="form-field">
            <label for="admin-password">Password</label>
            <div class="password-input-wrap">
              <input
                id="admin-password"
                v-model="loginPassword"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Enter administrator password"
                required
              />
              <button
                type="button"
                class="toggle-pw-btn"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" :size="16" />
                <Eye v-else :size="16" />
              </button>
            </div>
          </div>

          <div v-if="loginError" class="login-error-alert" role="alert">
            <ShieldAlert :size="16" />
            <span>{{ loginError }}</span>
          </div>

          <button type="submit" class="login-submit-btn" :disabled="loginLoading">
            <Lock :size="16" />
            <span>{{ loginLoading ? 'Verifying Credentials...' : 'Sign In to Dashboard' }}</span>
          </button>
        </form>

        <div class="login-footer-link">
          <NuxtLink to="/">← Return to {{ siteName }}</NuxtLink>
        </div>
      </div>
    </main>

    <!-- =========================================================== -->
    <!-- AUTHENTICATED ANALYTICS & LOG DASHBOARD                     -->
    <!-- =========================================================== -->
    <div v-else class="admin-workspace">
      <header class="admin-topbar">
        <div class="topbar-inner">
          <div class="topbar-brand">
            <div class="topbar-icon">
              <ShieldCheck :size="20" />
            </div>
            <div>
              <span class="topbar-kicker">{{ siteName.toUpperCase() }}</span>
              <h1>Analytics &amp; Log Console</h1>
            </div>
          </div>

          <div class="topbar-actions">
            <div class="month-filter-wrap">
              <Clock :size="14" />
              <select v-model="selectedMonth" aria-label="Filter logs by month">
                <option value="all">All Retained Months</option>
                <option v-for="ym in dashboard?.availableMonths || []" :key="ym" :value="ym">
                  {{ formatMonthLabel(ym) }}
                </option>
              </select>
            </div>

            <button
              type="button"
              class="topbar-btn"
              :disabled="loadingDashboard"
              @click="loadDashboard"
            >
              <RefreshCw :size="15" :class="{ spinning: loadingDashboard }" />
              <span>Refresh</span>
            </button>

            <NuxtLink to="/" class="topbar-btn">
              <ExternalLink :size="15" />
              <span>Public Site</span>
            </NuxtLink>

            <div class="user-pill">
              <span class="user-dot"></span>
              <span>{{ activeUser }}</span>
            </div>

            <button type="button" class="topbar-btn btn-logout" @click="handleLogout">
              <LogOut :size="15" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main class="admin-content">
        <div v-if="dashboardError" class="dashboard-error-banner" role="alert">
          {{ dashboardError }}
        </div>

        <!-- KPI SUMMARY CARDS -->
        <section class="kpi-grid" aria-label="Key metrics">
          <article class="kpi-card">
            <div class="kpi-head">
              <span class="kpi-label">Total Bookings</span>
              <span class="kpi-icon-box navy">
                <Plane :size="18" />
              </span>
            </div>
            <div class="kpi-value">{{ dashboard?.kpis.totalBookings ?? 0 }}</div>
            <div class="kpi-meta">
              <span class="badge-green">{{ dashboard?.kpis.successfulBookings ?? 0 }} Confirmed</span>
              <span class="badge-red">{{ dashboard?.kpis.failedBookings ?? 0 }} Failed/Demo</span>
              <span class="muted-rate">({{ dashboard?.kpis.successRate ?? 0 }}% rate)</span>
            </div>
          </article>

          <article class="kpi-card">
            <div class="kpi-head">
              <span class="kpi-label">Customer Reviews</span>
              <span class="kpi-icon-box gold">
                <Star :size="18" />
              </span>
            </div>
            <div class="kpi-value">
              {{ dashboard?.kpis.averageRating ? `${dashboard.kpis.averageRating} ★` : '-' }}
            </div>
            <div class="kpi-meta">
              <span>{{ dashboard?.kpis.totalReviews ?? 0 }} submitted reviews</span>
            </div>
          </article>

          <article class="kpi-card">
            <div class="kpi-head">
              <span class="kpi-label">IPs &amp; Traffic Hits</span>
              <span class="kpi-icon-box slate">
                <Globe :size="18" />
              </span>
            </div>
            <div class="kpi-value">{{ dashboard?.kpis.uniqueIps ?? 0 }} IPs</div>
            <div class="kpi-meta">
              <span>{{ dashboard?.kpis.totalAccessHits ?? 0 }} logged page &amp; API hits</span>
            </div>
          </article>

          <article class="kpi-card">
            <div class="kpi-head">
              <span class="kpi-label">Blocked Activity</span>
              <span class="kpi-icon-box crimson">
                <ShieldAlert :size="18" />
              </span>
            </div>
            <div class="kpi-value">{{ dashboard?.kpis.blockedEventsCount ?? 0 }}</div>
            <div class="kpi-meta">
              <span class="badge-red">{{ dashboard?.kpis.activeBlockedIpsCount ?? 0 }} Active IP Blocks</span>
            </div>
          </article>
        </section>

        <!-- NAVIGATION TABS -->
        <nav class="admin-tabs" aria-label="Dashboard sections">
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'overview' }"
            @click="activeTab = 'overview'"
          >
            <BarChart3 :size="16" />
            <span>Analytics Overview</span>
          </button>

          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'bookings' }"
            @click="activeTab = 'bookings'"
          >
            <Plane :size="16" />
            <span>Past Bookings ({{ dashboard?.bookings.length ?? 0 }})</span>
          </button>

          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'reviews' }"
            @click="activeTab = 'reviews'"
          >
            <Star :size="16" />
            <span>Reviews ({{ dashboard?.reviews.length ?? 0 }})</span>
          </button>

          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'security' }"
            @click="activeTab = 'security'"
          >
            <Shield :size="16" />
            <span>IPs &amp; Security ({{ dashboard?.securityEvents.length ?? 0 }})</span>
          </button>
        </nav>

        <!-- ======================================================= -->
        <!-- TAB 1: ANALYTICS OVERVIEW                               -->
        <!-- ======================================================= -->
        <section v-if="activeTab === 'overview' && dashboard" class="analytics-grid">
          <!-- Booking Volume Chart (Daily / Monthly + All / Total / Confirmed / Failed + Area / Bars) -->
          <article class="panel-card span-2 volume-panel">
            <div class="volume-header">
              <div class="volume-title-block">
                <div class="volume-title-row">
                  <h2>{{ volumeGranularity === 'monthly' ? 'Monthly Booking Volume' : 'Daily Booking Volume' }}</h2>
                  <div class="chart-legend">
                    <span v-if="volumeMetricFilter === 'total'">
                      <i class="dot total"></i>Total Bookings
                    </span>
                    <span v-if="volumeMetricFilter === 'all' || volumeMetricFilter === 'confirmed'">
                      <i class="dot success"></i>Confirmed
                    </span>
                    <span v-if="volumeMetricFilter === 'all' || volumeMetricFilter === 'failed'">
                      <i class="dot failed"></i>Failed / Demo
                    </span>
                  </div>
                </div>
                <p class="volume-subtitle">
                  <template v-if="volumeGranularity === 'monthly'">
                    Comparing {{ volumeSummary.buckets }} retained {{ volumeSummary.buckets === 1 ? 'month' : 'months' }} across all logs
                  </template>
                  <template v-else-if="volumeMonth !== 'all'">
                    Daily bookings for {{ formatMonthLabel(volumeMonth) }} ({{ volumeSummary.buckets }} active {{ volumeSummary.buckets === 1 ? 'day' : 'days' }})
                  </template>
                  <template v-else>
                    All retained months (showing latest {{ volumeSummary.buckets }} active {{ volumeSummary.buckets === 1 ? 'day' : 'days' }})
                  </template>
                </p>
              </div>

              <div class="volume-controls">
                <div class="segmented-control" role="group" aria-label="Timeframe granularity">
                  <button
                    type="button"
                    class="seg-btn"
                    :class="{ active: volumeGranularity === 'daily' }"
                    @click="volumeGranularity = 'daily'"
                  >
                    Daily
                  </button>
                  <button
                    type="button"
                    class="seg-btn"
                    :class="{ active: volumeGranularity === 'monthly' }"
                    @click="volumeGranularity = 'monthly'"
                  >
                    Monthly
                  </button>
                </div>

                <label
                  class="card-month-select"
                  :class="{ 'is-dimmed': volumeGranularity === 'monthly' }"
                  title="Filter daily booking volume chart by month"
                >
                  <Calendar :size="14" />
                  <select
                    v-model="volumeMonth"
                    aria-label="Filter booking volume chart by month"
                    @change="volumeGranularity = 'daily'"
                  >
                    <option value="all">All Months</option>
                    <option v-for="ym in dashboard.availableMonths" :key="ym" :value="ym">
                      {{ formatMonthLabel(ym) }}
                    </option>
                  </select>
                </label>

                <div class="segmented-control" role="group" aria-label="Metric filter">
                  <button
                    type="button"
                    class="seg-btn"
                    :class="{ active: volumeMetricFilter === 'all' }"
                    @click="volumeMetricFilter = 'all'"
                  >
                    All
                  </button>
                  <button
                    type="button"
                    class="seg-btn"
                    :class="{ active: volumeMetricFilter === 'total' }"
                    @click="volumeMetricFilter = 'total'"
                  >
                    Total
                  </button>
                  <button
                    type="button"
                    class="seg-btn"
                    :class="{ active: volumeMetricFilter === 'confirmed' }"
                    @click="volumeMetricFilter = 'confirmed'"
                  >
                    Confirmed
                  </button>
                  <button
                    type="button"
                    class="seg-btn"
                    :class="{ active: volumeMetricFilter === 'failed' }"
                    @click="volumeMetricFilter = 'failed'"
                  >
                    Failed
                  </button>
                </div>

                <div class="segmented-control" role="group" aria-label="Graph style">
                  <button
                    type="button"
                    class="seg-btn"
                    :class="{ active: chartStyle === 'area' }"
                    @click="chartStyle = 'area'"
                  >
                    <TrendingUp :size="13" />
                    <span>Area</span>
                  </button>
                  <button
                    type="button"
                    class="seg-btn"
                    :class="{ active: chartStyle === 'bars' }"
                    @click="chartStyle = 'bars'"
                  >
                    <BarChart3 :size="13" />
                    <span>Bars</span>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="volumePoints.length" class="volume-summary-strip">
              <button
                type="button"
                class="summary-chip is-interactive"
                :class="{ 'is-selected': volumeMetricFilter === 'total' }"
                title="Focus graph on Total bookings"
                @click="toggleVolumeMetricFilter('total')"
              >
                <span>Period Total</span>
                <strong>{{ volumeSummary.total }}</strong>
              </button>
              <button
                type="button"
                class="summary-chip success is-interactive"
                :class="{ 'is-selected': volumeMetricFilter === 'confirmed' }"
                title="Focus graph on Confirmed bookings"
                @click="toggleVolumeMetricFilter('confirmed')"
              >
                <span>Confirmed</span>
                <strong>{{ volumeSummary.success }} ({{ volumeSummary.rate }}%)</strong>
              </button>
              <button
                type="button"
                class="summary-chip failed is-interactive"
                :class="{ 'is-selected': volumeMetricFilter === 'failed' }"
                title="Focus graph on Failed / Demo bookings"
                @click="toggleVolumeMetricFilter('failed')"
              >
                <span>Failed / Demo</span>
                <strong>{{ volumeSummary.failed }}</strong>
              </button>
              <div class="summary-chip peak">
                <span>
                  Peak
                  {{
                    volumeMetricFilter === 'confirmed'
                      ? 'Confirmed'
                      : volumeMetricFilter === 'failed'
                        ? 'Failed'
                        : volumeGranularity === 'monthly'
                          ? 'Month'
                          : 'Day'
                  }}
                </span>
                <strong>{{ volumeSummary.peakLabel }} · {{ volumeSummary.peakTotal }}</strong>
              </div>
            </div>

            <div v-if="volumePoints.length" class="volume-chart-scroll">
              <div class="volume-chart-stage" @mouseleave="hoveredVolumeIdx = null">
                <div
                  v-if="activeVolumePoint"
                  class="volume-tooltip"
                  :style="activeTooltipStyle"
                  role="status"
                >
                  <div class="tooltip-date">{{ activeVolumePoint.label }}</div>
                  <div class="tooltip-grid">
                    <span><i class="dot total light"></i>Total Bookings</span>
                    <strong>{{ activeVolumePoint.total }}</strong>
                    <span><i class="dot success"></i>Confirmed</span>
                    <strong class="txt-green">{{ activeVolumePoint.success }}</strong>
                    <span><i class="dot failed"></i>Failed / Demo</span>
                    <strong class="txt-red">{{ activeVolumePoint.failed }}</strong>
                  </div>
                </div>

                <svg
                  :viewBox="`0 0 ${CHART_W} ${CHART_H}`"
                  class="volume-svg"
                  role="img"
                  aria-label="Booking volume chart"
                >
                  <defs>
                    <linearGradient id="uaaTotalAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#182a40" stop-opacity="0.24" />
                      <stop offset="100%" stop-color="#c49a52" stop-opacity="0.03" />
                    </linearGradient>
                    <linearGradient id="uaaSuccessAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#059669" stop-opacity="0.30" />
                      <stop offset="100%" stop-color="#059669" stop-opacity="0.02" />
                    </linearGradient>
                    <linearGradient id="uaaFailedAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#e11d48" stop-opacity="0.22" />
                      <stop offset="100%" stop-color="#e11d48" stop-opacity="0.01" />
                    </linearGradient>
                    <linearGradient id="uaaTotalBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#2c4969" />
                      <stop offset="100%" stop-color="#182a40" />
                    </linearGradient>
                    <linearGradient id="uaaSuccessBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#10b981" />
                      <stop offset="100%" stop-color="#047857" />
                    </linearGradient>
                    <linearGradient id="uaaFailedBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#f43f5e" />
                      <stop offset="100%" stop-color="#be123c" />
                    </linearGradient>
                  </defs>

                  <!-- Y-axis gridlines & tick labels -->
                  <g class="svg-grid">
                    <template v-for="tick in volumeScale.ticks" :key="tick.value">
                      <line
                        :x1="CHART_PAD_L"
                        :x2="CHART_W - CHART_PAD_R"
                        :y1="tick.y"
                        :y2="tick.y"
                        :class="tick.value === 0 ? 'axis-baseline' : 'grid-line'"
                      />
                      <text
                        :x="CHART_PAD_L - 8"
                        :y="tick.y + 4"
                        text-anchor="end"
                        class="axis-tick-text"
                      >
                        {{ tick.value }}
                      </text>
                    </template>
                  </g>

                  <!-- Hover column crosshair -->
                  <line
                    v-if="activeVolumePoint"
                    :x1="activeVolumePoint.x"
                    :x2="activeVolumePoint.x"
                    :y1="CHART_PAD_T"
                    :y2="CHART_BASELINE"
                    class="hover-crosshair"
                  />

                  <!-- GRAPH STYLE 1: SMOOTH AREA & LINE TREND -->
                  <g v-if="chartStyle === 'area'">
                    <path
                      v-for="s in visibleChartSeries"
                      :key="`area-${s.id}`"
                      :d="s.paths.area"
                      :fill="s.areaFill"
                    />
                    <path
                      v-for="s in visibleChartSeries"
                      :key="`line-${s.id}`"
                      :d="s.paths.line"
                      fill="none"
                      :stroke="s.stroke"
                      :stroke-width="s.strokeWidth"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />

                    <g v-for="(pt, idx) in volumePoints" :key="pt.key">
                      <circle
                        v-for="s in visibleChartSeries"
                        v-show="hoveredVolumeIdx === idx || volumePoints.length <= 14"
                        :key="`dot-${s.id}-${pt.key}`"
                        :cx="pt.x"
                        :cy="s.getY(pt)"
                        :r="hoveredVolumeIdx === idx ? 5.5 : 3.6"
                        class="node-dot"
                        :class="s.dotClass"
                      />
                      <text
                        v-if="hoveredVolumeIdx === idx || volumePoints.length === 1"
                        :x="pt.x"
                        :y="getFocusedPointCapY(pt)"
                        text-anchor="middle"
                        class="point-cap-label"
                      >
                        {{ getFocusedPointCapValue(pt) }}
                      </text>
                    </g>
                  </g>

                  <!-- GRAPH STYLE 2: GROUPED OR SINGLE ROUNDED SVG COLUMNS -->
                  <g v-else>
                    <g v-for="(pt, idx) in volumePoints" :key="pt.key">
                      <rect
                        v-if="hoveredVolumeIdx === idx"
                        :x="pt.slotX + 2"
                        :y="CHART_PAD_T"
                        :width="Math.max(4, pt.slotW - 4)"
                        :height="CHART_PLOT_H"
                        rx="6"
                        class="bar-hover-band"
                      />

                      <!-- Single centered bar when filtering Total / Confirmed / Failed -->
                      <template v-if="visibleChartSeries.length === 1 && visibleChartSeries[0]">
                        <rect
                          :x="pt.barSingleX"
                          :y="CHART_BASELINE - visibleChartSeries[0].getBarH(pt)"
                          :width="pt.barSingleW"
                          :height="visibleChartSeries[0].getBarH(pt)"
                          rx="4"
                          :fill="visibleChartSeries[0].barFill"
                          :opacity="visibleChartSeries[0].getVal(pt) > 0 ? 1 : 0.2"
                        />
                        <text
                          v-if="visibleChartSeries[0].getVal(pt) > 0 && (volumePoints.length <= 20 || hoveredVolumeIdx === idx)"
                          :x="pt.x"
                          :y="CHART_BASELINE - visibleChartSeries[0].getBarH(pt) - 6"
                          text-anchor="middle"
                          class="bar-cap-text"
                          :class="visibleChartSeries[0].capClass"
                        >
                          {{ visibleChartSeries[0].getVal(pt) }}
                        </text>
                      </template>

                      <!-- Paired Confirmed + Failed columns in All mode -->
                      <template v-else>
                        <rect
                          :x="pt.barSuccessX"
                          :y="CHART_BASELINE - pt.barSuccessH"
                          :width="pt.barW"
                          :height="pt.barSuccessH"
                          rx="3.5"
                          fill="url(#uaaSuccessBarGrad)"
                          :opacity="pt.success > 0 ? 1 : 0.2"
                        />
                        <rect
                          :x="pt.barFailedX"
                          :y="CHART_BASELINE - pt.barFailedH"
                          :width="pt.barW"
                          :height="pt.barFailedH"
                          rx="3.5"
                          fill="url(#uaaFailedBarGrad)"
                          :opacity="pt.failed > 0 ? 1 : 0.2"
                        />
                        <text
                          v-if="pt.success > 0 && (volumePoints.length <= 16 || hoveredVolumeIdx === idx)"
                          :x="pt.barSuccessX + pt.barW / 2"
                          :y="CHART_BASELINE - pt.barSuccessH - 5"
                          text-anchor="middle"
                          class="bar-cap-text success"
                        >
                          {{ pt.success }}
                        </text>
                        <text
                          v-if="pt.failed > 0 && (volumePoints.length <= 16 || hoveredVolumeIdx === idx)"
                          :x="pt.barFailedX + pt.barW / 2"
                          :y="CHART_BASELINE - pt.barFailedH - 5"
                          text-anchor="middle"
                          class="bar-cap-text failed"
                        >
                          {{ pt.failed }}
                        </text>
                      </template>
                    </g>
                  </g>

                  <!-- X-axis labels -->
                  <g class="svg-x-labels">
                    <template v-for="(pt, idx) in volumePoints" :key="pt.key">
                      <text
                        v-if="idx % xAxisLabelStep === 0 || idx === volumePoints.length - 1"
                        :x="pt.x"
                        :y="CHART_H - 10"
                        text-anchor="middle"
                        class="axis-tick-text"
                        :class="{ 'is-active': hoveredVolumeIdx === idx }"
                      >
                        {{ pt.shortLabel }}
                      </text>
                    </template>
                  </g>

                  <!-- Full-slot interactive hit targets -->
                  <rect
                    v-for="(pt, idx) in volumePoints"
                    :key="`hit-${pt.key}`"
                    :x="pt.slotX"
                    :y="CHART_PAD_T"
                    :width="pt.slotW"
                    :height="CHART_PLOT_H + 20"
                    fill="transparent"
                    class="hit-slot"
                    tabindex="0"
                    :aria-label="`${pt.label}: ${pt.success} confirmed, ${pt.failed} failed`"
                    @mouseenter="hoveredVolumeIdx = idx"
                    @focus="hoveredVolumeIdx = idx"
                    @click="hoveredVolumeIdx = hoveredVolumeIdx === idx ? null : idx"
                  />
                </svg>
              </div>
            </div>
            <p v-else class="empty-note">No booking volume data found for this filter.</p>
          </article>

          <!-- Top Airports -->
          <article class="panel-card">
            <div class="panel-header">
              <h2>Top Airports</h2>
            </div>
            <div v-if="dashboard.analytics.topAirports.length" class="progress-list">
              <div v-for="item in dashboard.analytics.topAirports" :key="item.label" class="progress-item">
                <div class="progress-row">
                  <span class="progress-name">{{ item.label }}</span>
                  <span class="progress-val">{{ item.count }} ({{ item.percent }}%)</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill gold" :style="{ width: `${item.percent}%` }"></div>
                </div>
              </div>
            </div>
            <p v-else class="empty-note">No airport records yet.</p>
          </article>

          <!-- Star Rating Distribution -->
          <article class="panel-card">
            <div class="panel-header">
              <h2>Review Ratings Breakdown</h2>
            </div>
            <div class="progress-list">
              <div
                v-for="row in dashboard.analytics.ratingDistribution"
                :key="row.stars"
                class="progress-item"
              >
                <div class="progress-row">
                  <span class="progress-name">{{ row.stars }} ★</span>
                  <span class="progress-val">{{ row.count }} ({{ row.percent }}%)</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill navy" :style="{ width: `${row.percent}%` }"></div>
                </div>
              </div>
            </div>
          </article>

          <!-- Terminal & Service Type Split -->
          <article class="panel-card">
            <div class="panel-header">
              <h2>Service Type &amp; Terminal Split</h2>
            </div>
            <div class="split-groups">
              <div>
                <h3 class="sub-heading">Journey Types</h3>
                <div class="chip-stat-list">
                  <div v-for="s in dashboard.analytics.serviceTypes" :key="s.label" class="chip-stat">
                    <span>{{ s.label }}</span>
                    <strong>{{ s.count }}</strong>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="sub-heading">Terminal Preference</h3>
                <div class="chip-stat-list">
                  <div v-for="t in dashboard.analytics.terminalSplit" :key="t.label" class="chip-stat">
                    <span>{{ t.label }}</span>
                    <strong>{{ t.count }}</strong>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="sub-heading">Travel Classes</h3>
                <div class="chip-stat-list">
                  <div v-for="c in dashboard.analytics.travelClasses" :key="c.label" class="chip-stat">
                    <span>{{ c.label }}</span>
                    <strong>{{ c.count }}</strong>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <!-- Top Accessed Routes & Threats -->
          <article class="panel-card">
            <div class="panel-header">
              <h2>Traffic Paths &amp; Threat Types</h2>
            </div>
            <div class="split-groups">
              <div>
                <h3 class="sub-heading">Most Accessed Paths</h3>
                <div v-if="dashboard.analytics.topPaths.length" class="mini-kv-list">
                  <div v-for="p in dashboard.analytics.topPaths.slice(0, 6)" :key="p.label" class="mini-kv">
                    <code>{{ p.label }}</code>
                    <strong>{{ p.count }}</strong>
                  </div>
                </div>
                <p v-else class="empty-note">Access log will populate as requests arrive.</p>
              </div>
              <div>
                <h3 class="sub-heading">Security Event Categories</h3>
                <div v-if="dashboard.analytics.securityBreakdown.length" class="mini-kv-list">
                  <div v-for="sec in dashboard.analytics.securityBreakdown" :key="sec.label" class="mini-kv">
                    <span class="sec-cat-badge">{{ sec.label }}</span>
                    <strong>{{ sec.count }}</strong>
                  </div>
                </div>
                <p v-else class="empty-note">Zero blocked threats recorded.</p>
              </div>
            </div>
          </article>
        </section>

        <!-- ======================================================= -->
        <!-- TAB 2: PAST BOOKINGS                                    -->
        <!-- ======================================================= -->
        <section v-if="activeTab === 'bookings'" class="panel-card">
          <div class="table-toolbar">
            <div class="search-box">
              <Search :size="15" />
              <input
                v-model="bookingSearch"
                type="search"
                placeholder="Search ref (BU...), name, email, airport, IP..."
              />
            </div>

            <div class="toolbar-right">
              <select v-model="bookingStatusFilter" class="filter-select" aria-label="Filter by status">
                <option value="ALL">All Statuses</option>
                <option value="SUCCESS">Confirmed (SUCCESS)</option>
                <option value="FAILED">Failed / Demo</option>
              </select>

              <button
                type="button"
                class="action-btn-gold"
                :disabled="!filteredBookings.length"
                @click="exportBookingsCsv"
              >
                <Download :size="15" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date (UK)</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th>Traveller</th>
                  <th>Airport &amp; Service</th>
                  <th>Client IP</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="b in filteredBookings" :key="b.id">
                  <td class="nowrap">{{ b.timestampLocal }}</td>
                  <td>
                    <strong class="mono">{{ b.enquiryReference || b.id }}</strong>
                  </td>
                  <td>
                    <span
                      class="status-pill"
                      :class="b.status === 'SUCCESS' ? 'pill-success' : 'pill-failed'"
                    >
                      <CheckCircle2 v-if="b.status === 'SUCCESS'" :size="13" />
                      <XCircle v-else :size="13" />
                      {{ b.status }}
                    </span>
                  </td>
                  <td>
                    <div class="cell-primary">{{ b.traveler.name || 'Anonymous' }}</div>
                    <div class="cell-sub">{{ b.traveler.email }} · {{ b.traveler.mobile }}</div>
                  </td>
                  <td>
                    <div class="cell-primary">
                      {{ b.journey.airportName }}
                      <span v-if="b.journey.airportCode">({{ b.journey.airportCode }})</span>
                    </div>
                    <div class="cell-sub">
                      {{ b.journey.terminal }} · {{ b.journey.serviceType }} · {{ b.journey.travelClass }}
                    </div>
                  </td>
                  <td class="mono">{{ b.ip }}</td>
                  <td>
                    <button
                      type="button"
                      class="inspect-btn"
                      @click="selectedBooking = b"
                    >
                      Details
                    </button>
                  </td>
                </tr>
                <tr v-if="!filteredBookings.length">
                  <td colspan="7" class="empty-cell">No bookings match your current filter.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- ======================================================= -->
        <!-- TAB 3: REVIEWS                                          -->
        <!-- ======================================================= -->
        <section v-if="activeTab === 'reviews'" class="panel-card">
          <div class="table-toolbar">
            <div class="search-box">
              <Search :size="15" />
              <input
                v-model="reviewSearch"
                type="search"
                placeholder="Search by booking ref, comment, or IP..."
              />
            </div>

            <div class="toolbar-right">
              <select v-model.number="reviewStarFilter" class="filter-select" aria-label="Filter by stars">
                <option :value="0">All Ratings</option>
                <option :value="5">5 Stars</option>
                <option :value="4">4 Stars</option>
                <option :value="3">3 Stars</option>
                <option :value="2">2 Stars</option>
                <option :value="1">1 Star</option>
              </select>
            </div>
          </div>

          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date (UK)</th>
                  <th>Review ID</th>
                  <th>Booking Ref</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Client IP</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in filteredReviews" :key="r.id">
                  <td class="nowrap">{{ r.timestampLocal }}</td>
                  <td class="mono">{{ r.id }}</td>
                  <td>
                    <strong class="mono">{{ r.bookingReference }}</strong>
                  </td>
                  <td class="nowrap">
                    <span class="stars-display" :aria-label="`${r.rating} out of 5`">
                      {{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5 - r.rating) }}
                    </span>
                    <span class="cell-sub">({{ r.rating }}/5)</span>
                  </td>
                  <td class="comment-cell">
                    {{ r.comment || '- No comment provided -' }}
                  </td>
                  <td class="mono">{{ r.clientIp }}</td>
                </tr>
                <tr v-if="!filteredReviews.length">
                  <td colspan="6" class="empty-cell">No reviews found matching your filter.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- ======================================================= -->
        <!-- TAB 4: IPs ACCESSED, BLOCKED IPs & SECURITY LOGS        -->
        <!-- ======================================================= -->
        <section v-if="activeTab === 'security'" class="security-stack">
          <!-- Manual IP Block Control -->
          <article class="panel-card">
            <div class="panel-header">
              <h2>IP Firewall &amp; Manual Block Manager</h2>
              <span class="muted-note">Changes apply immediately across all site &amp; API routes</span>
            </div>

            <form class="ip-block-form" @submit.prevent="handleManualBlockSubmit">
              <input
                v-model="blockIpInput"
                type="text"
                placeholder="IP Address (e.g. 203.0.113.45)"
                required
              />
              <input
                v-model="blockReasonInput"
                type="text"
                placeholder="Reason (optional, e.g. Automated scraper / spam)"
              />
              <button type="submit" class="action-btn-danger" :disabled="ipActionPending">
                <Ban :size="15" />
                <span>Block IP</span>
              </button>
            </form>

            <div v-if="dashboard?.blockedIps.length" class="blocked-chips-grid">
              <div v-for="blk in dashboard.blockedIps" :key="blk.ip" class="blocked-ip-chip">
                <div>
                  <strong class="mono">{{ blk.ip }}</strong>
                  <span class="chip-reason">{{ blk.reason }} · {{ formatTimestamp(blk.blockedAt) }}</span>
                </div>
                <button
                  type="button"
                  class="unblock-chip-btn"
                  :disabled="ipActionPending"
                  @click="toggleBlockIp(blk.ip, true)"
                >
                  Unblock
                </button>
              </div>
            </div>
            <p v-else class="empty-note">No IPs are currently on the persistent blocklist.</p>
          </article>

          <!-- Unique IPs Accessed -->
          <article class="panel-card">
            <div class="table-toolbar">
              <h2>Unique IPs Seen Across Logs ({{ filteredIps.length }})</h2>
              <div class="search-box">
                <Search :size="15" />
                <input v-model="ipSearch" type="search" placeholder="Filter by IP or path..." />
              </div>
            </div>

            <div class="table-scroll">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>IP Address</th>
                    <th>Status</th>
                    <th>Access Hits</th>
                    <th>Bookings</th>
                    <th>Reviews</th>
                    <th>Blocked Hits</th>
                    <th>Last Seen</th>
                    <th>Last Path</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ipRow in filteredIps" :key="ipRow.ip">
                    <td class="mono"><strong>{{ ipRow.ip }}</strong></td>
                    <td>
                      <span
                        class="status-pill"
                        :class="ipRow.isBlocked ? 'pill-failed' : 'pill-success'"
                      >
                        {{ ipRow.isBlocked ? 'BLOCKED' : 'ALLOWED' }}
                      </span>
                    </td>
                    <td>{{ ipRow.accessHits }}</td>
                    <td>{{ ipRow.bookingsCount }}</td>
                    <td>{{ ipRow.reviewsCount }}</td>
                    <td>
                      <span :class="{ 'text-danger-bold': ipRow.blockedHits > 0 }">
                        {{ ipRow.blockedHits }}
                      </span>
                    </td>
                    <td class="nowrap">{{ formatTimestamp(ipRow.lastSeen) }}</td>
                    <td><code>{{ ipRow.lastPath || '/' }}</code></td>
                    <td>
                      <button
                        type="button"
                        :class="ipRow.isBlocked ? 'inspect-btn' : 'block-row-btn'"
                        :disabled="ipActionPending"
                        @click="toggleBlockIp(ipRow.ip, ipRow.isBlocked)"
                      >
                        {{ ipRow.isBlocked ? 'Unblock' : 'Block IP' }}
                      </button>
                    </td>
                  </tr>
                  <tr v-if="!filteredIps.length">
                    <td colspan="9" class="empty-cell">No IP activity recorded yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          <!-- Blocked & Security Threat Log -->
          <article class="panel-card">
            <div class="panel-header">
              <h2>Security &amp; Blocked Events Log</h2>
              <span class="muted-note">SQLi, XSS, Brute-Force, Path Traversal, Honeypot &amp; Blocklist Hits</span>
            </div>

            <div class="table-scroll">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Category</th>
                    <th>IP</th>
                    <th>Request</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(ev, idx) in dashboard?.securityEvents || []" :key="idx">
                    <td class="nowrap">{{ formatTimestamp(ev.timestamp) }}</td>
                    <td>
                      <span
                        class="status-pill"
                        :class="ev.blocked ? 'pill-failed' : 'pill-info'"
                      >
                        {{ ev.category }}
                      </span>
                    </td>
                    <td class="mono">{{ ev.ip }}</td>
                    <td><code>{{ ev.method }} {{ ev.path }}</code></td>
                    <td>{{ ev.details }}</td>
                  </tr>
                  <tr v-if="!(dashboard?.securityEvents.length)">
                    <td colspan="5" class="empty-cell">No security events logged in selected period.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          <!-- Recent Access Feed -->
          <article class="panel-card">
            <div class="panel-header">
              <h2>Recent Access Feed (Latest 250 Page &amp; API Hits)</h2>
            </div>

            <div class="table-scroll">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>IP</th>
                    <th>Method</th>
                    <th>Path</th>
                    <th>Status</th>
                    <th>User-Agent</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(acc, idx) in dashboard?.accessLogs || []" :key="idx">
                    <td class="nowrap">{{ formatTimestamp(acc.timestamp) }}</td>
                    <td class="mono">{{ acc.ip }}</td>
                    <td><span class="method-badge">{{ acc.method }}</span></td>
                    <td><code>{{ acc.path }}</code></td>
                    <td>
                      <span
                        class="status-pill"
                        :class="acc.statusCode >= 400 ? 'pill-failed' : 'pill-success'"
                      >
                        {{ acc.statusCode }}
                      </span>
                    </td>
                    <td class="ua-cell">{{ acc.userAgent }}</td>
                  </tr>
                  <tr v-if="!(dashboard?.accessLogs.length)">
                    <td colspan="6" class="empty-cell">
                      No access log entries yet. Public page and API requests will appear here automatically.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </main>

      <!-- BOOKING INSPECTOR MODAL -->
      <Teleport to="body">
        <div
          v-if="selectedBooking"
          class="inspector-backdrop"
          role="dialog"
          aria-modal="true"
          @click.self="selectedBooking = null"
        >
          <div class="inspector-modal">
            <button
              type="button"
              class="inspector-close"
              aria-label="Close booking inspector"
              @click="selectedBooking = null"
            >
              <X :size="18" />
            </button>

            <span class="login-kicker">{{ selectedBooking.category }}</span>
            <h2>
              Booking {{ selectedBooking.enquiryReference || selectedBooking.id }}
            </h2>
            <p class="inspector-time">
              Logged: {{ selectedBooking.timestampLocal }} · Status:
              <strong>{{ selectedBooking.status }} ({{ selectedBooking.statusCode }})</strong>
            </p>

            <div v-if="selectedBooking.error" class="inspector-error-box">
              <strong>Error Details:</strong> {{ selectedBooking.error }}
            </div>

            <div class="inspector-grid">
              <div class="inspector-section">
                <h3>Traveller</h3>
                <p><strong>Name:</strong> {{ selectedBooking.traveler.name }}</p>
                <p><strong>Email:</strong> {{ selectedBooking.traveler.email }}</p>
                <p><strong>Mobile:</strong> {{ selectedBooking.traveler.mobile }}</p>
                <p><strong>Contact Pref:</strong> {{ selectedBooking.traveler.contactMethod }}</p>
              </div>

              <div class="inspector-section">
                <h3>Journey &amp; Party</h3>
                <p>
                  <strong>Airport:</strong> {{ selectedBooking.journey.airportName }}
                  <span v-if="selectedBooking.journey.airportCode">({{ selectedBooking.journey.airportCode }})</span>
                </p>
                <p><strong>Terminal:</strong> {{ selectedBooking.journey.terminal }}</p>
                <p><strong>Type:</strong> {{ selectedBooking.journey.serviceType }}</p>
                <p><strong>Class:</strong> {{ selectedBooking.journey.travelClass }}</p>
                <p>
                  <strong>Services:</strong>
                  {{ selectedBooking.journey.services.join(', ') || 'None' }}
                </p>
                <p>
                  <strong>Party:</strong> {{ selectedBooking.party.adults }} Adults,
                  {{ selectedBooking.party.children }} Children,
                  {{ selectedBooking.party.infants }} Infants ·
                  {{ selectedBooking.party.luggage }} Bags
                </p>
              </div>

              <div class="inspector-section span-2">
                <h3>Flights &amp; Client Metadata</h3>
                <p v-if="selectedBooking.journey.arrivalFlight || selectedBooking.journey.arrivalDate">
                  <strong>Arrival:</strong> Flight {{ selectedBooking.journey.arrivalFlight || 'TBD' }}
                  on {{ selectedBooking.journey.arrivalDate || 'TBD' }} at {{ selectedBooking.journey.arrivalTime || 'TBD' }}
                </p>
                <p v-if="selectedBooking.journey.departureFlight || selectedBooking.journey.departureDate">
                  <strong>Departure:</strong> Flight {{ selectedBooking.journey.departureFlight || 'TBD' }}
                  on {{ selectedBooking.journey.departureDate || 'TBD' }} at {{ selectedBooking.journey.departureTime || 'TBD' }}
                </p>
                <p>
                  <strong>Client IP:</strong> <code class="mono">{{ selectedBooking.ip }}</code>
                </p>
                <p><strong>User-Agent:</strong> {{ selectedBooking.userAgent }}</p>
              </div>
            </div>

            <div class="inspector-footer">
              <NuxtLink
                v-if="selectedBooking.enquiryReference"
                :to="`/booking-confirmation/${encodeURIComponent(selectedBooking.enquiryReference)}`"
                target="_blank"
                class="inspect-btn"
              >
                Open Confirmation Page ↗
              </NuxtLink>
              <button
                type="button"
                class="block-row-btn"
                @click="toggleBlockIp(selectedBooking.ip, false, `From booking ${selectedBooking.id}`)"
              >
                Block IP ({{ selectedBooking.ip }})
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<style scoped>
.admin-shell {
  min-height: 100vh;
  background: #f5f2eb;
  color: #182a40;
  font-family: 'Montserrat', sans-serif;
}

/* ------------------------------------------------ */
/* LOGIN PORTAL                                     */
/* ------------------------------------------------ */
.admin-login-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: radial-gradient(circle at top, #1f334a 0%, #101b27 75%);
}

.login-card {
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border: 1px solid rgba(201, 168, 106, 0.45);
  border-radius: 14px;
  padding: 36px 32px 30px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.38);
  text-align: center;
}

.login-brand-badge {
  width: 54px;
  height: 54px;
  margin: 0 auto 14px;
  border-radius: 50%;
  background: #182a40;
  color: #c9a86a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-kicker {
  display: block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #9e7834;
  margin-bottom: 6px;
}

.login-card h1 {
  font-family: 'Playfair Display', serif;
  font-size: 26px;
  font-weight: 600;
  color: #182a40;
  margin: 0 0 8px;
}

.login-subtitle {
  font-size: 13.5px;
  color: #5c6774;
  line-height: 1.5;
  margin: 0 0 24px;
}

.setup-warning-box {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  text-align: left;
  background: #fffbeb;
  border: 1px solid #f59e0b;
  color: #78350f;
  border-radius: 8px;
  padding: 14px;
  font-size: 12.5px;
  line-height: 1.5;
}

.setup-warning-box .warn-icon {
  flex-shrink: 0;
  color: #d97706;
  margin-top: 2px;
}

.setup-warning-box pre {
  margin: 8px 0 0;
  padding: 8px 10px;
  background: #182a40;
  color: #f4eadf;
  border-radius: 5px;
  font-size: 12px;
  overflow-x: auto;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-size: 12.5px;
  font-weight: 700;
  color: #182a40;
}

.form-field input {
  width: 100%;
  box-sizing: border-box;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #d8d0c3;
  border-radius: 6px;
  font-size: 14px;
  color: #182a40;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-field input:focus {
  border-color: #c9a86a;
  box-shadow: 0 0 0 3px rgba(201, 168, 106, 0.2);
}

.password-input-wrap {
  position: relative;
}

.password-input-wrap input {
  padding-right: 42px;
}

.toggle-pw-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: #6f7c8a;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.login-error-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #b91c1c;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.login-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 46px;
  background: linear-gradient(135deg, #c9a86a 0%, #b48d48 100%);
  color: #182a40;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 4px;
  transition: filter 0.2s ease, transform 0.2s ease;
}

.login-submit-btn:hover:not(:disabled) {
  filter: brightness(1.06);
  transform: translateY(-1px);
}

.login-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer-link {
  margin-top: 22px;
  font-size: 13px;
}

.login-footer-link a {
  color: #6c7a89;
  text-decoration: none;
}

.login-footer-link a:hover {
  color: #182a40;
}

/* ------------------------------------------------ */
/* TOP BAR                                          */
/* ------------------------------------------------ */
.admin-topbar {
  background: #182a40;
  color: #ffffff;
  border-bottom: 2px solid #c9a86a;
  position: sticky;
  top: 0;
  z-index: 50;
}

.topbar-inner {
  max-width: 1380px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.topbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar-icon {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: rgba(201, 168, 106, 0.16);
  border: 1px solid rgba(201, 168, 106, 0.4);
  color: #c9a86a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.topbar-kicker {
  display: block;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: #c9a86a;
}

.topbar-brand h1 {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  font-weight: 500;
  margin: 0;
  color: #ffffff;
}

.topbar-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.month-filter-wrap {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0 10px;
  height: 36px;
  border-radius: 6px;
  color: #e4d4b7;
}

.month-filter-wrap select {
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 12.5px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
}

.month-filter-wrap select option {
  background: #182a40;
  color: #ffffff;
}

.topbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.06);
  color: #f4eadf;
  font-size: 12.5px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.topbar-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.14);
  border-color: #c9a86a;
}

.btn-logout {
  border-color: rgba(239, 68, 68, 0.45);
  color: #fecaca;
}

.btn-logout:hover {
  background: rgba(220, 38, 38, 0.25) !important;
  border-color: #ef4444 !important;
}

.user-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 11px;
  height: 36px;
  border-radius: 20px;
  background: rgba(201, 168, 106, 0.15);
  border: 1px solid rgba(201, 168, 106, 0.35);
  font-size: 12.5px;
  font-weight: 600;
  color: #f3e2be;
}

.user-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #34d399;
}

.spinning {
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ------------------------------------------------ */
/* WORKSPACE & KPIS                                 */
/* ------------------------------------------------ */
.admin-content {
  max-width: 1380px;
  margin: 0 auto;
  padding: 28px 24px 64px;
}

.dashboard-error-banner {
  background: #fef2f2;
  border: 1px solid #f87171;
  color: #991b1b;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 600;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 24px;
}

.kpi-card {
  background: #ffffff;
  border: 1px solid #e5dfd3;
  border-radius: 10px;
  padding: 20px 22px;
  box-shadow: 0 4px 16px rgba(24, 42, 64, 0.04);
}

.kpi-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.kpi-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
}

.kpi-icon-box {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-icon-box.navy {
  background: #eef2f6;
  color: #182a40;
}

.kpi-icon-box.gold {
  background: #fbf5ea;
  color: #a37c35;
}

.kpi-icon-box.slate {
  background: #f1f5f9;
  color: #334155;
}

.kpi-icon-box.crimson {
  background: #fef2f2;
  color: #b91c1c;
}

.kpi-value {
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  font-weight: 600;
  color: #182a40;
  margin-bottom: 8px;
}

.kpi-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: #64748b;
}

.badge-green {
  background: #ecfdf5;
  color: #047857;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.badge-red {
  background: #fef2f2;
  color: #b91c1c;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.muted-rate {
  color: #6b7280;
}

/* ------------------------------------------------ */
/* TABS                                             */
/* ------------------------------------------------ */
.admin-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 22px;
  border-bottom: 1px solid #e2dbd0;
  padding-bottom: 12px;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 7px;
  border: 1px solid transparent;
  background: transparent;
  color: #5c6774;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: #ebe5da;
  color: #182a40;
}

.tab-btn.active {
  background: #182a40;
  color: #f4eadf;
  border-color: #182a40;
}

/* ------------------------------------------------ */
/* PANELS & CHARTS                                  */
/* ------------------------------------------------ */
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.security-stack {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.panel-card {
  background: #ffffff;
  border: 1px solid #e5dfd3;
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(24, 42, 64, 0.04);
}

.panel-card.span-2 {
  grid-column: 1 / -1;
}

.panel-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.panel-header h2,
.table-toolbar h2 {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  font-weight: 500;
  color: #182a40;
  margin: 0;
}

.chart-legend {
  display: flex;
  gap: 14px;
  font-size: 12.5px;
  color: #475569;
}

.chart-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
}

.dot.total {
  background: #182a40;
}

.dot.total.light {
  background: #c49a52;
}

.dot.success {
  background: #059669;
}

.dot.failed {
  background: #e11d48;
}

.volume-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}

.volume-title-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.volume-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.volume-title-row h2 {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  font-weight: 500;
  color: #182a40;
  margin: 0;
}

.volume-subtitle {
  margin: 0;
  font-size: 12.5px;
  color: #64748b;
}

.volume-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.segmented-control {
  display: inline-flex;
  align-items: center;
  padding: 3px;
  background: #f3efe6;
  border: 1px solid #e2dbd0;
  border-radius: 8px;
  gap: 2px;
}

.seg-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: none;
  background: transparent;
  color: #556170;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
}

.seg-btn:hover {
  color: #182a40;
}

.seg-btn.active {
  background: #182a40;
  color: #f4eadf;
  box-shadow: 0 2px 6px rgba(24, 42, 64, 0.16);
}

.card-month-select {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  background: #fbf9f4;
  border: 1px solid #ddd5c6;
  border-radius: 8px;
  color: #8c6a2e;
  transition: opacity 0.18s ease, border-color 0.18s ease;
}

.card-month-select.is-dimmed {
  opacity: 0.72;
}

.card-month-select:hover,
.card-month-select:focus-within {
  opacity: 1;
  border-color: #c49a52;
}

.card-month-select select {
  border: none;
  background: transparent;
  color: #182a40;
  font-size: 12.5px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
}

.volume-summary-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.summary-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  background: #f9f7f2;
  border: 1px solid #e8e1d5;
  font-size: 12px;
  font-family: inherit;
  color: #5c6774;
}

.summary-chip.is-interactive {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.summary-chip.is-interactive:hover {
  transform: translateY(-1px);
  border-color: #c49a52;
}

.summary-chip.is-interactive.is-selected {
  box-shadow: 0 0 0 2px #182a40;
  border-color: #182a40;
}

.summary-chip.success.is-interactive.is-selected {
  box-shadow: 0 0 0 2px #059669;
  border-color: #059669;
}

.summary-chip.failed.is-interactive.is-selected {
  box-shadow: 0 0 0 2px #e11d48;
  border-color: #e11d48;
}

.summary-chip strong {
  color: #182a40;
  font-weight: 700;
}

.summary-chip.success {
  background: #f0fdf8;
  border-color: #bbf7d0;
}

.summary-chip.success strong {
  color: #047857;
}

.summary-chip.failed {
  background: #fff1f2;
  border-color: #fecdd3;
}

.summary-chip.failed strong {
  color: #be123c;
}

.summary-chip.peak {
  background: #fbf6eb;
  border-color: #ead7b0;
}

.summary-chip.peak strong {
  color: #8c6a2e;
}

.volume-chart-scroll {
  overflow-x: auto;
  padding-bottom: 4px;
}

.volume-chart-stage {
  position: relative;
  min-width: 560px;
}

.volume-svg {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
}

.grid-line {
  stroke: #ece6da;
  stroke-width: 1;
  stroke-dasharray: 4 4;
}

.axis-baseline {
  stroke: #d5cbb8;
  stroke-width: 1.25;
}

.axis-tick-text {
  fill: #64748b;
  font-size: 11px;
  font-weight: 500;
  font-family: inherit;
}

.axis-tick-text.is-active {
  fill: #182a40;
  font-weight: 700;
}

.hover-crosshair {
  stroke: #c49a52;
  stroke-width: 1.25;
  stroke-dasharray: 4 3;
}

.bar-hover-band {
  fill: rgba(196, 154, 82, 0.1);
}

.node-dot {
  fill: #ffffff;
  stroke-width: 2.25;
  transition: r 0.15s ease;
}

.node-dot.total {
  stroke: #182a40;
}

.node-dot.success {
  stroke: #059669;
}

.node-dot.failed {
  stroke: #e11d48;
}

.point-cap-label {
  fill: #182a40;
  font-size: 11px;
  font-weight: 700;
}

.bar-cap-text {
  font-size: 10px;
  font-weight: 700;
}

.bar-cap-text.total {
  fill: #182a40;
}

.bar-cap-text.success {
  fill: #047857;
}

.bar-cap-text.failed {
  fill: #be123c;
}

.hit-slot {
  cursor: pointer;
  outline: none;
}

.volume-tooltip {
  position: absolute;
  top: 6px;
  z-index: 5;
  pointer-events: none;
  background: #182a40;
  color: #f8f5ef;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(201, 168, 106, 0.45);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.24);
  min-width: 175px;
  font-size: 12px;
}

.tooltip-date {
  font-weight: 700;
  color: #e4d4b7;
  margin-bottom: 6px;
  padding-bottom: 5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.tooltip-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px 12px;
  align-items: center;
}

.tooltip-grid span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #cbd5e1;
}

.tooltip-grid .txt-green {
  color: #6ee7b7;
}

.tooltip-grid .txt-red {
  color: #fda4af;
}

.progress-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 5px;
}

.progress-name {
  font-weight: 600;
  color: #182a40;
}

.progress-val {
  color: #64748b;
  font-size: 12.5px;
}

.progress-track {
  height: 8px;
  background: #f1ede4;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 6px;
}

.progress-fill.gold {
  background: linear-gradient(90deg, #c9a86a, #b48d48);
}

.progress-fill.navy {
  background: linear-gradient(90deg, #182a40, #314b6a);
}

.split-groups {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.sub-heading {
  font-size: 11.5px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #8c6a2e;
  margin: 0 0 8px;
}

.chip-stat-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip-stat {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #faf8f4;
  border: 1px solid #e6dfd3;
  padding: 6px 11px;
  border-radius: 6px;
  font-size: 12.5px;
}

.chip-stat strong {
  color: #182a40;
}

.mini-kv-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.mini-kv {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12.5px;
  padding: 6px 10px;
  background: #faf8f4;
  border-radius: 5px;
}

.sec-cat-badge {
  font-family: 'Montserrat', sans-serif;
  font-variant-numeric: tabular-nums;
  font-size: 11.5px;
  font-weight: 700;
  color: #9b1c31;
}

/* ------------------------------------------------ */
/* TABLES & TOOLBARS                                */
/* ------------------------------------------------ */
.table-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #faf8f4;
  border: 1px solid #dcd4c7;
  border-radius: 6px;
  padding: 0 12px;
  height: 40px;
  min-width: 260px;
  flex: 1;
  max-width: 420px;
  color: #6b7280;
}

.search-box input {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-size: 13.5px;
  color: #182a40;
}

.toolbar-right {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.filter-select {
  height: 40px;
  padding: 0 12px;
  border: 1px solid #dcd4c7;
  border-radius: 6px;
  background: #ffffff;
  color: #182a40;
  font-size: 13px;
  font-weight: 600;
  outline: none;
}

.action-btn-gold {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 40px;
  padding: 0 16px;
  border-radius: 6px;
  border: 1px solid #c9a86a;
  background: #c9a86a;
  color: #182a40;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.action-btn-gold:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 40px;
  padding: 0 16px;
  border-radius: 6px;
  border: none;
  background: #9b1c31;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.table-scroll {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table th {
  text-align: left;
  padding: 11px 12px;
  background: #faf8f4;
  border-bottom: 1px solid #e2dbd0;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
  white-space: nowrap;
}

.data-table td {
  padding: 12px;
  border-bottom: 1px solid #f0ece4;
  vertical-align: middle;
}

.data-table tr:hover td {
  background: #fcfaf6;
}

.cell-primary {
  font-weight: 600;
  color: #182a40;
}

.cell-sub {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.mono {
  font-family: 'Montserrat', sans-serif;
  font-variant-numeric: tabular-nums;
}

.nowrap {
  white-space: nowrap;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.pill-success {
  background: #ecfdf5;
  color: #047857;
}

.pill-failed {
  background: #fef2f2;
  color: #b91c1c;
}

.pill-info {
  background: #eff6ff;
  color: #1d4ed8;
}

.stars-display {
  color: #d4a342;
  letter-spacing: 1px;
  font-size: 14px;
}

.comment-cell {
  max-width: 320px;
  line-height: 1.45;
}

.ua-cell {
  max-width: 260px;
  font-size: 11.5px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.method-badge {
  display: inline-block;
  padding: 2px 7px;
  background: #eef2f6;
  color: #182a40;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  font-family: 'Montserrat', sans-serif;
  font-variant-numeric: tabular-nums;
}

.inspect-btn {
  padding: 5px 11px;
  border-radius: 5px;
  border: 1px solid #d5cdc0;
  background: #ffffff;
  color: #182a40;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}

.inspect-btn:hover {
  border-color: #182a40;
  background: #182a40;
  color: #ffffff;
}

.block-row-btn {
  padding: 5px 11px;
  border-radius: 5px;
  border: 1px solid rgba(185, 28, 28, 0.35);
  background: #fef2f2;
  color: #b91c1c;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.block-row-btn:hover {
  background: #b91c1c;
  color: #ffffff;
}

.ip-block-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.ip-block-form input {
  flex: 1;
  min-width: 200px;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #dcd4c7;
  border-radius: 6px;
  font-size: 13.5px;
  outline: none;
}

.blocked-chips-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.blocked-ip-chip {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 8px 12px;
}

.blocked-ip-chip strong {
  display: block;
  color: #991b1b;
  font-size: 13px;
}

.chip-reason {
  display: block;
  font-size: 11.5px;
  color: #7f1d1d;
}

.unblock-chip-btn {
  border: 1px solid #fca5a5;
  background: #ffffff;
  color: #991b1b;
  padding: 4px 10px;
  border-radius: 5px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
}

.unblock-chip-btn:hover {
  background: #991b1b;
  color: #ffffff;
}

.text-danger-bold {
  color: #b91c1c;
  font-weight: 700;
}

.empty-cell,
.empty-note,
.muted-note {
  color: #6b7280;
  font-size: 13px;
}

.empty-cell {
  text-align: center;
  padding: 28px 12px !important;
}

/* ------------------------------------------------ */
/* BOOKING INSPECTOR MODAL                          */
/* ------------------------------------------------ */
.inspector-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(12, 20, 30, 0.7);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  overflow-y: auto;
}

.inspector-modal {
  position: relative;
  width: 100%;
  max-width: 720px;
  background: #ffffff;
  border: 1px solid rgba(201, 168, 106, 0.45);
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
}

.inspector-close {
  position: absolute;
  top: 14px;
  right: 14px;
  border: none;
  background: #f3efe6;
  color: #182a40;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.inspector-modal h2 {
  font-family: 'Playfair Display', serif;
  margin: 0 0 6px;
  font-size: 24px;
  color: #182a40;
}

.inspector-time {
  margin: 0 0 18px;
  font-size: 13px;
  color: #64748b;
}

.inspector-error-box {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 16px;
}

.inspector-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.inspector-section {
  background: #faf8f4;
  border: 1px solid #ebe4d8;
  border-radius: 8px;
  padding: 14px 16px;
}

.inspector-section.span-2 {
  grid-column: 1 / -1;
}

.inspector-section h3 {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #8c6a2e;
  margin: 0 0 8px;
}

.inspector-section p {
  margin: 4px 0;
  font-size: 13px;
  color: #182a40;
  line-height: 1.45;
  word-break: break-word;
}

.inspector-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}

@media (max-width: 1024px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .kpi-grid,
  .analytics-grid,
  .inspector-grid {
    grid-template-columns: 1fr;
  }

  .topbar-inner {
    padding: 12px 16px;
  }

  .admin-content {
    padding: 20px 16px 48px;
  }
}
</style>


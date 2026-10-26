import { logBooking } from '../server/utils/bookingLogger.ts'
import fs from 'node:fs'
import path from 'node:path'

async function runTests() {
  console.log('Testing booking logger...')

  // Test 1: Successful booking attempt
  const successEntry = await logBooking({
    status: 'SUCCESS',
    statusCode: 200,
    category: 'SUCCESS',
    clientIp: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
    upstreamResponse: {
      jsonrpc: '2.0',
      id: null,
      result: {
        status: true,
        message: 'Success',
        airport_enquiry: 'BU24444'
      }
    },
    payload: {
      airport_name: 'Johnathan Archer',
      airport_name_id: 'LHR-001',
      email: 'j.archer@starfleet.example',
      mobile: '+447911123456',
      service_types_id: '1',
      arrival_flight_number: 'BA1492',
      arrival_date: 'Oct/28/2026',
      arrival_time: '14:30',
      departure_flight_number: '',
      departure_date: '',
      departure_time: '',
      class_of_travel_id: '3',
      servicesinput_id: 'porter, lounge',
      no_luggages: '3',
      traveler_name: 'Johnathan Archer',
      uaa_url: 'UK Airport Assistance',
      uaa_p_c_method: 'Email (Default), WhatsApp – Message Only',
      childrens_count: '1',
      infants_count: '0',
      adults_count: '2'
    }
  })
  console.log('Logged SUCCESS test entry:', successEntry.id)

  // Test 2: Failed booking attempt - Demo mode disabled (503)
  const failedDemoEntry = await logBooking({
    status: 'FAILED',
    statusCode: 503,
    category: 'DEMO_MODE_DISABLED',
    errorMessage: 'Demo mode: outbound booking API disabled. Configure supplier IDs and BOOKING_API_ENABLED=true to activate.',
    clientIp: '86.12.34.56',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    payload: {
      airport_name: 'Sarah Connor',
      airport_name_id: 'LGW-002',
      email: 'sarah.c@cyberdyne.example',
      mobile: '+447700900123',
      service_types_id: '2',
      arrival_flight_number: '',
      arrival_date: '',
      arrival_time: '',
      departure_flight_number: 'VS24',
      departure_date: 'Nov/05/2026',
      departure_time: '18:15',
      class_of_travel_id: '4',
      servicesinput_id: 'chauffeur',
      no_luggages: '2',
      traveler_name: 'Sarah Connor',
      uaa_url: 'UK Airport Assistance',
      uaa_p_c_method: 'WhatsApp – Message & Call',
      childrens_count: '0',
      infants_count: '0',
      adults_count: '1'
    }
  })
  console.log('Logged FAILED Demo entry:', failedDemoEntry.id)

  // Test 3: Failed booking attempt - Upstream supplier failure (502)
  const failedSupplierEntry = await logBooking({
    status: 'FAILED',
    statusCode: 502,
    category: 'UPSTREAM_SUPPLIER_ERROR',
    errorMessage: 'Supplier request failed. Please contact support before retrying to avoid a duplicate booking.',
    errorDetails: {
      upstreamStatus: 504,
      upstreamMessage: 'Gateway Timeout connecting to provider api.supplier.com'
    },
    clientIp: '195.12.88.9',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    payload: {
      airport_name: 'Bruce Wayne',
      airport_name_id: 'EDI-003',
      email: 'bruce@wayne-enterprises.example',
      mobile: '+447890123456',
      service_types_id: '3',
      arrival_flight_number: 'BA1320',
      arrival_date: 'Dec/12/2026',
      arrival_time: '10:00',
      departure_flight_number: 'EK036',
      departure_date: 'Dec/12/2026',
      departure_time: '16:45',
      class_of_travel_id: '4',
      servicesinput_id: 'porter, lounge, family',
      no_luggages: '4',
      traveler_name: 'Bruce Wayne',
      uaa_url: 'UK Airport Assistance',
      uaa_p_c_method: 'Direct Call',
      childrens_count: '0',
      infants_count: '0',
      adults_count: '1'
    }
  })
  console.log('Logged FAILED Supplier entry:', failedSupplierEntry.id)

  // Wait a small moment for async file appends to complete
  await new Promise(r => setTimeout(r, 200))

  // Verify file existence and contents
  const logsDir = path.resolve(process.cwd(), 'logs')
  const jsonlPath = path.join(logsDir, 'bookings.jsonl')
  const csvPath = path.join(logsDir, 'bookings.csv')
  const logPath = path.join(logsDir, 'bookings.log')

  if (!fs.existsSync(jsonlPath)) throw new Error('bookings.jsonl not found!')
  if (!fs.existsSync(csvPath)) throw new Error('bookings.csv not found!')
  if (!fs.existsSync(logPath)) throw new Error('bookings.log not found!')

  const jsonlContent = fs.readFileSync(jsonlPath, 'utf-8').trim().split('\n')
  const csvLines = fs.readFileSync(csvPath, 'utf-8').trim().split('\n')
  const logContent = fs.readFileSync(logPath, 'utf-8')

  console.log(`\nVerification successful:`)
  console.log(`- bookings.jsonl: ${jsonlContent.length} entries`)
  console.log(`- bookings.csv: ${csvLines.length} lines (including header)`)
  console.log(`- bookings.log size: ${logContent.length} characters`)

  // Check JSON parsing
  jsonlContent.forEach((line, idx) => {
    const parsed = JSON.parse(line)
    console.log(`  Entry ${idx + 1}: [${parsed.status}] ID: ${parsed.id} | Traveler: ${parsed.traveler.name} | Airport: ${parsed.journey.airportId}`)
  })
}

runTests().catch(err => {
  console.error('Test failed:', err)
  process.exit(1)
})

import { logBooking, cleanOldLogs, getRetainedMonths, getYearMonth } from '../server/utils/bookingLogger.ts'
import fs from 'node:fs'
import path from 'node:path'

async function runTests() {
  console.log('Testing monthwise booking logger and retention...')

  const currentYm = getYearMonth()
  console.log('Current Year-Month:', currentYm)

  const retained = getRetainedMonths(3)
  console.log('Retained months (max 3):', Array.from(retained))

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
      arrival_date: 'Nov/02/2026',
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

  // Wait a small moment for async file appends to complete
  await new Promise(r => setTimeout(r, 400))

  const logsDir = path.resolve(process.cwd(), 'logs')
  const monthJsonlPath = path.join(logsDir, `bookings-${currentYm}.jsonl`)
  const monthCsvPath = path.join(logsDir, `bookings-${currentYm}.csv`)
  const monthLogPath = path.join(logsDir, `bookings-${currentYm}.log`)

  if (!fs.existsSync(monthJsonlPath)) throw new Error(`bookings-${currentYm}.jsonl not found!`)
  if (!fs.existsSync(monthCsvPath)) throw new Error(`bookings-${currentYm}.csv not found!`)
  if (!fs.existsSync(monthLogPath)) throw new Error(`bookings-${currentYm}.log not found!`)

  const jsonlLines = fs.readFileSync(monthJsonlPath, 'utf-8').trim().split('\n')
  const csvLines = fs.readFileSync(monthCsvPath, 'utf-8').trim().split('\n')
  const logContent = fs.readFileSync(monthLogPath, 'utf-8')

  console.log(`\nMonthwise log verification for ${currentYm}:`)
  console.log(`- bookings-${currentYm}.jsonl: ${jsonlLines.length} entries`)
  console.log(`- bookings-${currentYm}.csv: ${csvLines.length} lines (including CSV header)`)
  console.log(`- bookings-${currentYm}.log: ${logContent.length} characters`)

  // Test 3: Test 3-month retention and automatic deletion of older files
  console.log('\nTesting 3-month retention cleanup...')
  const dummyOldLog = path.join(logsDir, 'bookings-2026-04.log')
  const dummyOldCsv = path.join(logsDir, 'bookings-2026-04.csv')
  const dummyOldJsonl = path.join(logsDir, 'bookings-2026-04.jsonl')
  
  fs.writeFileSync(dummyOldLog, 'Old log content April 2026\n', 'utf-8')
  fs.writeFileSync(dummyOldCsv, 'Old csv content April 2026\n', 'utf-8')
  fs.writeFileSync(dummyOldJsonl, '{"test":"april"}\n', 'utf-8')

  console.log('Created dummy old files for 2026-04 (older than 3 months).')
  const deletedFiles = await cleanOldLogs(3, true)
  console.log('cleanOldLogs deleted:', deletedFiles)

  if (fs.existsSync(dummyOldLog) || fs.existsSync(dummyOldCsv) || fs.existsSync(dummyOldJsonl)) {
    throw new Error('Old logs for 2026-04 were not deleted!')
  }
  console.log('Successfully verified automatic deletion of logs older than 3 months.')

  // Verify retained files still exist
  if (!fs.existsSync(monthLogPath)) {
    throw new Error(`Current month log bookings-${currentYm}.log was mistakenly deleted!`)
  }
  console.log(`Confirmed retained month logs remain intact: bookings-${currentYm}.*`)
}

runTests().catch(err => {
  console.error('Test failed:', err)
  process.exit(1)
})

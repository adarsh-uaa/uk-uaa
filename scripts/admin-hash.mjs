import crypto from 'node:crypto'
import readline from 'node:readline'

function printOutput(username, password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const derived = crypto.scryptSync(password, salt, 64).toString('hex')
  const hash = `scrypt$${salt}$${derived}`
  const sessionSecret = crypto.randomBytes(32).toString('hex')

  console.log('\nAdd these lines to your .env file (never commit .env to git):\n')
  console.log(`ADMIN_USERNAME=${username}`)
  console.log(`ADMIN_PASSWORD_HASH=${hash}`)
  console.log(`ADMIN_SESSION_SECRET=${sessionSecret}`)
  console.log('')
}

const argPass = process.argv[2]
const argUser = process.argv[3] || 'admin'

if (argPass) {
  if (argPass.length < 8) {
    console.error('Error: Please choose a password with at least 8 characters.')
    process.exit(1)
  }
  printOutput(argUser, argPass)
  process.exit(0)
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('Admin username (default: admin): ', (userInput) => {
  const username = (userInput || 'admin').trim() || 'admin'
  rl.question('Admin password (min 8 chars): ', (passInput) => {
    rl.close()
    const password = String(passInput || '')
    if (password.length < 8) {
      console.error('\nError: Password must be at least 8 characters long.')
      process.exit(1)
    }
    printOutput(username, password)
  })
})


import { createError, readBody, getRequestIP, getRequestHeader } from 'h3'
import nodemailer from 'nodemailer'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig()
  const clientIp = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const userAgent = getRequestHeader(event, 'user-agent') || 'unknown'

  let body: Record<string, any> = {}

  try {
    body = await readBody(event)
  } catch (err: any) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request body'
    })
  }

  // Honeypot check for spam bots
  if (body.website_check || body.honeypot) {
    // Silently succeed so bots think it was sent
    return { success: true, message: 'Enquiry received.' }
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''

  if (!name || name.length < 2) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please provide a valid name (at least 2 characters).'
    })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please provide a valid email address.'
    })
  }

  if (!message || message.length < 5) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please enter a message (at least 5 characters).'
    })
  }

  const smtpConfig = cfg.smtp as {
    host?: string
    port?: number
    user?: string
    pass?: string
    secure?: boolean
    from?: string
    to?: string
  }

  // Check if SMTP credentials are provided
  if (!smtpConfig?.host || !smtpConfig?.user || !smtpConfig?.pass) {
    console.warn('[Contact Form] SMTP credentials are not configured in .env')
    throw createError({
      statusCode: 503,
      statusMessage: 'SMTP credentials are not configured yet. Please configure SMTP_HOST, SMTP_USER, and SMTP_PASS in your .env file.'
    })
  }

  const senderFrom = smtpConfig.from || `"UK Airport Assistance" <${smtpConfig.user}>`
  const recipientTo = smtpConfig.to || smtpConfig.user

  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port || 587,
    secure: smtpConfig.secure ?? false,
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  })

  const timestamp = new Date().toISOString()
  const timestampFormatted = new Date().toLocaleString('en-GB', {
    timeZone: 'Europe/London',
    dateStyle: 'full',
    timeStyle: 'medium'
  })

  const escapedName = escapeHtml(name)
  const escapedEmail = escapeHtml(email)
  const escapedPhone = phone ? escapeHtml(phone) : 'Not provided'
  const escapedMessage = escapeHtml(message).replace(/\n/g, '<br>')

  const subject = `[Enquiry] New VIP Concierge Contact from ${name}`

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f3ed; color: #20251f; margin: 0; padding: 24px; }
    .card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 6px; border: 1px solid #dcd5ca; overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.06); }
    .header { background: #182a40; color: #f7f3ed; padding: 26px 30px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.05em; color: #e8d7be; }
    .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.85; }
    .content { padding: 30px; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px; }
    .info-table td { padding: 9px 12px; border-bottom: 1px solid #eee9df; }
    .info-table td.label { font-weight: 600; color: #622a31; width: 30%; }
    .info-table td.value { color: #252721; }
    .message-box { background: #faf8f5; border-left: 3px solid #b18b65; padding: 18px 20px; margin-top: 14px; font-size: 14px; line-height: 1.65; color: #252721; border-radius: 2px; }
    .footer { background: #f2eee8; padding: 16px 30px; font-size: 11px; color: #6f6d66; border-top: 1px solid #e5ded4; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>UK Airport Assistance</h1>
      <p>New Contact Form Submission</p>
    </div>
    <div class="content">
      <table class="info-table">
        <tr>
          <td class="label">Full Name</td>
          <td class="value"><strong>${escapedName}</strong></td>
        </tr>
        <tr>
          <td class="label">Email Address</td>
          <td class="value"><a href="mailto:${escapedEmail}" style="color: #622a31;">${escapedEmail}</a></td>
        </tr>
        <tr>
          <td class="label">Phone</td>
          <td class="value">${escapedPhone}</td>
        </tr>
        <tr>
          <td class="label">Received (UK)</td>
          <td class="value">${timestampFormatted}</td>
        </tr>
      </table>

      <h3 style="font-size: 14px; margin-bottom: 8px; color: #182a40; text-transform: uppercase; letter-spacing: 0.08em;">Message</h3>
      <div class="message-box">
        ${escapedMessage}
      </div>
    </div>
    <div class="footer">
      <div>Source: UK Airport Assistance Contact Form</div>
      <div>Client IP: ${clientIp} | Timestamp: ${timestamp}</div>
    </div>
  </div>
</body>
</html>
  `

  const textContent = `
New Contact Form Submission - UK Airport Assistance
--------------------------------------------------
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Time (UK): ${timestampFormatted}
Client IP: ${clientIp}

Message:
${message}
--------------------------------------------------
  `.trim()

  try {
    const info = await transporter.sendMail({
      from: senderFrom,
      to: recipientTo,
      replyTo: `"${name}" <${email}>`,
      subject,
      text: textContent,
      html: htmlContent
    })

    return {
      success: true,
      message: 'Your enquiry has been sent successfully. Our VIP team will contact you shortly.',
      messageId: info.messageId
    }
  } catch (err: any) {
    console.error('[Contact Form] Failed to send email via SMTP:', err)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to send enquiry email: ${err?.message || 'SMTP transmission error'}`
    })
  }
})

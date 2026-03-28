/**
 * Email Service using Gmail SMTP with Nodemailer
 * Premium confirmation emails for "Youm El Salib" event
 * Integrates with Supabase booking system
 */

import nodemailer from 'nodemailer'

// Gmail SMTP Configuration
const gmailUser = process.env.GMAIL_USER
const gmailPass = process.env.GMAIL_PASS
const gmailFromEmail = process.env.GMAIL_FROM_EMAIL || 'Sunday School Family <andrewaks21@gmail.com>'

// Check if Gmail credentials are configured
if (!gmailUser || !gmailPass) {
  console.warn(
    '⚠️ Missing Gmail SMTP credentials. ' +
    'Email functionality will not work. ' +
    'Please add GMAIL_USER and GMAIL_PASS to your .env.local file.'
  )
}

// Create Nodemailer transporter for Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use TLS
  auth: {
    user: gmailUser,
    pass: gmailPass,
  },
})

// Verify transporter connection
transporter.verify((error: any, success: any) => {
  if (error) {
    console.error('❌ Gmail transporter error:', error)
  } else {
    console.log('✅ Gmail transporter ready:', success)
  }
})

/**
 * Send confirmation email for "Youm El Salib" event using Gmail SMTP
 * @param email - Recipient email address
 * @param name - Recipient's full name
 * @param code - 8-character confirmation code
 * @returns Response with success status
 */
export async function sendConfirmationEmail(
  email: string,
  name: string,
  code: string
) {
  if (!gmailUser || !gmailPass) {
    console.warn('⚠️ Gmail credentials not configured, skipping email')
    return { success: false, error: 'Gmail credentials not configured' }
  }

  try {
    const htmlContent = generatePremiumConfirmationHTML(name, code)

    const mailOptions = {
      from: gmailFromEmail,
      to: email,
      subject: 'Youm El Salib - Registration Confirmed ✨ | تأكيد التسجيل',
      html: htmlContent,
      replyTo: 'andrewaks21@gmail.com',
    }

    const info = await transporter.sendMail(mailOptions)

    console.log(`✅ Confirmation email sent to ${email}`)
    console.log(`📧 Message ID: ${info.messageId}`)
    
    return { 
      success: true, 
      messageId: info.messageId,
      email: email 
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error(`❌ Email error: ${errorMsg}`)
    return { success: false, error: errorMsg }
  }
}

/**
 * Send waiting list email for applicants from other churches
 * @param email - Recipient email address
 * @param name - Recipient's full name
 * @param code - Reference/confirmation code for waiting list
 * @returns Response with success status
 */
export async function sendWaitingListEmail(
  email: string,
  name: string,
  code: string
) {
  if (!gmailUser || !gmailPass) {
    console.warn('⚠️ Gmail credentials not configured, skipping email')
    return { success: false, error: 'Gmail credentials not configured' }
  }

  try {
    const htmlContent = generateWaitingListHTML(name, code)

    const mailOptions = {
      from: gmailFromEmail,
      to: email,
      subject: 'Youm El Salib - Application Received (Waiting List) | تم استقبال طلبك',
      html: htmlContent,
      replyTo: 'andrewaks21@gmail.com',
    }

    const info = await transporter.sendMail(mailOptions)

    console.log(`✅ Waiting list email sent to ${email}`)
    console.log(`📧 Message ID: ${info.messageId}`)
    
    return { 
      success: true, 
      messageId: info.messageId,
      email: email 
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error(`❌ Email error: ${errorMsg}`)
    return { success: false, error: errorMsg }
  }
}

/**
 * Format date to: "Sunday 2nd of April" and "02/04/2026"
 * April 2, 2026 is a Wednesday
 */
function formatEventDate() {
  const eventDate = new Date(2026, 3, 2) // April 2, 2026 (months are 0-indexed)
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  
  const dayName = dayNames[eventDate.getDay()]
  const dayNum = eventDate.getDate()
  const monthName = monthNames[eventDate.getMonth()]
  const year = eventDate.getFullYear()
  
  // Get ordinal suffix (st, nd, rd, th)
  let suffix = 'th'
  if (dayNum === 1 || dayNum === 21 || dayNum === 31) suffix = 'st'
  else if (dayNum === 2 || dayNum === 22) suffix = 'nd'
  else if (dayNum === 3 || dayNum === 23) suffix = 'rd'
  
  const formattedLong = `${dayName} ${dayNum}${suffix} of ${monthName}`
  const formattedShort = `${String(dayNum).padStart(2, '0')}/${String(eventDate.getMonth() + 1).padStart(2, '0')}/${year}`
  
  return { long: formattedLong, short: formattedShort }
}

/**
 * Generate premium HTML for Youm El Salib confirmation email
 * Bilingual: English and Arabic with poster image
 */
function generatePremiumConfirmationHTML(
  name: string,
  confirmationCode: string
): string {
  const { long: dateFormatted, short: dateShort } = formatEventDate()
  
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Youm El Salib - Registration Confirmed</title>
        <style>
          @media (max-width: 700px) {
            .bilingual-table { display: block !important; }
            .bilingual-col { display: block !important; width: 100% !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #f9f7f4;">
        <!-- Outer wrapper -->
        <table role="presentation" width="100%" style="background-color: #f9f7f4; padding: 20px 0;">
          <tr>
            <td align="center">
              <!-- Main container -->
              <table role="presentation" width="100%" style="max-width: 600px; background: linear-gradient(135deg, #fdfbf8 0%, #f5f1ed 100%); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                
                <!-- Header with gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #8B6F47 0%, #A08060 100%); padding: 40px 20px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 36px; font-weight: normal; letter-spacing: 2px;">Youm El Salib</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px; font-weight: 300; letter-spacing: 1px; opacity: 0.9;">Registration Confirmed ✨</p>
                  </td>
                </tr>

                <!-- Body content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <!-- BILINGUAL TABLE: ENGLISH (left) | ARABIC (right) -->
                    <table class="bilingual-table" role="presentation" width="100%" style="width:100%; border-spacing:0; border-collapse:collapse;">
                      <tr>
                        <!-- ENGLISH SECTION -->
                        <td class="bilingual-col" style="vertical-align:top; width:50%; padding: 0 10px 0 0; border-right: 2px solid #D4AF37;">
                          <div>
                            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
                              Dear <strong>${name}</strong>,
                            </p>
                            <p style="margin: 0 0 20px 0; font-size: 15px; color: #555; line-height: 1.8;">
                              Thank you for registering for <strong>Youm El Salib</strong>. We are honored by your participation and look forward to celebrating this special occasion with you.
                            </p>
                            <!-- Poster Image -->
                            <div style="margin: 30px 0; text-align: center; border-radius: 8px; overflow: hidden;">
                              <img src="https://drive.google.com/u/0/drive-viewer/AKGpihZCKbmkthtEz7oDbafx-77HTmt9rmMM696Jr5jC1GejliVRWl3at1BdIy-Wzy8rC2C9IU8nqmpjXYUGUO4eK2ZEg9bac9rGqA=s1600-rw-v1?auditContext=forDisplay" alt="Youm El Salib Poster" style="width: 100%; height: auto; max-width: 300px; display: block; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
                            </div>
                            <table role="presentation" width="100%" style="margin: 30px 0; border: 2px solid #D4622A; border-radius: 8px; overflow: hidden;">
                        <tr style="background-color: #F5E6D3;">
                          <td style="padding: 15px 20px; color: #8B6F47; font-weight: 600; font-size: 14px; border-bottom: 2px solid #D4622A;">
                            EVENT DETAILS
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 20px;">
                            <table role="presentation" width="100%">
                              <tr style="margin-bottom: 12px; display: block;">
                                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                  <p style="margin: 0 0 4px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Date</p>
                                  <p style="margin: 0; font-size: 16px; color: #333; font-weight: 600;">${dateFormatted}</p>
                                  <p style="margin: 5px 0 0 0; font-size: 14px; color: #8B6F47;">${dateShort}</p>
                                </td>
                              </tr>
                              <tr style="margin-bottom: 12px; display: block;">
                                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                  <p style="margin: 0 0 4px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Time</p>
                                  <p style="margin: 0; font-size: 15px; color: #333; font-weight: 500;">7:30 PM</p>
                                </td>
                              </tr>
                              <tr style="margin-bottom: 12px; display: block;">
                                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                  <p style="margin: 0 0 4px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Location</p>
                                  <p style="margin: 0; font-size: 15px; color: #333; font-weight: 500;">St Mary Maraashly Church - Zamalek, Cairo</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Confirmation code section -->
                      <table role="presentation" width="100%" style="margin: 30px 0; background: #f9f7f4; border: 2px solid #D4622A; border-radius: 8px; overflow: hidden;">
                        <tr>
                          <td align="center" style="padding: 25px;">
                            <p style="margin: 0 0 12px 0; font-size: 12px; color: #8B6F47; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Your Confirmation Code</p>
                            <p style="margin: 0; font-size: 40px; color: #D4622A; font-family: 'Courier New', monospace; font-weight: bold; letter-spacing: 4px;">
                              ${confirmationCode}
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- Important notice -->
                      <div style="background: #FFF8F3; border-left: 4px solid #D4622A; padding: 15px; border-radius: 4px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px; color: #333; line-height: 1.6;">
                          <strong style="color: #D4622A;">✓ Please present this confirmation code at the entrance.</strong> Keep this email for your records.
                        </p>
                      </div>

                      <!-- Additional info -->
                      <p style="margin: 20px 0 0 0; font-size: 14px; color: #666; line-height: 1.6;">
                        If you have any questions about the event or need to make changes to your registration, please don't hesitate to contact us.
                      </p>
                    </div>

                        </td>
                        <!-- ARABIC SECTION -->
                        <td class="bilingual-col" style="vertical-align:top; width:50%; padding: 0 0 0 10px; direction: rtl; text-align: right;">
                          <div>
                            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
                              السيد / السيدة <strong>${name}</strong>،
                            </p>
                            <p style="margin: 0 0 20px 0; font-size: 15px; color: #555; line-height: 1.8;">
                              شكراً لك على التسجيل في حدث <strong>يوم الصليب</strong>. نحن فخورون بمشاركتك وننتظر بفارغ الصبر للاحتفال بهذه المناسبة الخاصة معك.
                            </p>
                            <!-- Poster Image (mirrored for AR) -->
                            <div style="margin: 30px 0; text-align: center; border-radius: 8px; overflow: hidden;">
                              <img src="https://drive.google.com/u/0/drive-viewer/AKGpihZCKbmkthtEz7oDbafx-77HTmt9rmMM696Jr5jC1GejliVRWl3at1BdIy-Wzy8rC2C9IU8nqmpjXYUGUO4eK2ZEg9bac9rGqA=s1600-rw-v1?auditContext=forDisplay" alt="بوستر يوم الصليب" style="width: 100%; height: auto; max-width: 300px; display: block; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
                            </div>
                            <table role="presentation" width="100%" style="margin: 30px 0; border: 2px solid #D4622A; border-radius: 8px; overflow: hidden;">
                        <tr style="background-color: #F5E6D3;">
                          <td style="padding: 15px 20px; color: #8B6F47; font-weight: 600; font-size: 14px; border-bottom: 2px solid #D4622A; text-align: right;">
                            تفاصيل الحدث
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 20px;">
                            <table role="presentation" width="100%">
                              <tr style="margin-bottom: 12px; display: block;">
                                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
                                  <p style="margin: 0 0 4px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">التاريخ</p>
                                  <p style="margin: 0; font-size: 16px; color: #333; font-weight: 600;">الخميس 2 أبريل</p>
                                  <p style="margin: 5px 0 0 0; font-size: 14px; color: #8B6F47;">02/04/2026</p>
                                </td>
                              </tr>
                              <tr style="margin-bottom: 12px; display: block;">
                                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
                                  <p style="margin: 0 0 4px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">الوقت</p>
                                  <p style="margin: 0; font-size: 15px; color: #333; font-weight: 500;">الساعة 7:30 مساءً</p>
                                </td>
                              </tr>
                              <tr style="margin-bottom: 12px; display: block;">
                                <td style="padding: 8px 0; text-align: right;">
                                  <p style="margin: 0 0 4px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">الموقع</p>
                                  <p style="margin: 0; font-size: 15px; color: #333; font-weight: 500;">كنيسة السيدة العذراء مريم بالمرعشلي - الزمالك، القاهرة</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Arabic Confirmation Code -->
                      <table role="presentation" width="100%" style="margin: 30px 0; background: #f9f7f4; border: 2px solid #D4622A; border-radius: 8px; overflow: hidden;">
                        <tr>
                          <td align="center" style="padding: 25px;">
                            <p style="margin: 0 0 12px 0; font-size: 12px; color: #8B6F47; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">رمز التأكيد الخاص بك</p>
                            <p style="margin: 0; font-size: 40px; color: #D4622A; font-family: 'Courier New', monospace; font-weight: bold; letter-spacing: 4px;">
                              ${confirmationCode}
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- Arabic Important Notice -->
                      <div style="background: #FFF8F3; border-left: 4px solid #D4622A; padding: 15px; border-radius: 4px; margin: 20px 0; border-right: 4px solid #D4622A; border-left: none;">
                        <p style="margin: 0; font-size: 14px; color: #333; line-height: 1.6;">
                          <strong style="color: #D4622A;">✓ يرجى تقديم رمز التأكيد هذا عند الدخول.</strong> احتفظ برسالة البريد الإلكترونية هذه لسجلاتك.
                        </p>
                      </div>

                      <!-- Arabic Additional Info -->
                      <p style="margin: 20px 0 0 0; font-size: 14px; color: #666; line-height: 1.6;">
                        إذا كان لديك أي أسئلة حول الحدث أو تحتاج إلى إجراء تغييرات على تسجيلك، فيرجى عدم التردد في التواصل معنا.
                      </p>
                          </div>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f5f1ed; padding: 30px 20px; text-align: center; border-top: 2px solid #D4AF37;">
                    <p style="margin: 0 0 10px 0; font-size: 12px; color: #999;">
                      © 2026 Madares A7ad - St Mary Church Zamalek - All rights reserved
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #8B6F47; font-weight: 600;">
                      Youm El Salib | يوم الصليب | A Celebration of Faith
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

/**
 * Generate HTML for waiting list email (for non-St Mary church members)
 */
function generateWaitingListHTML(name: string, referenceCode: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en" dir="ltr">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Youm El Salib - Waiting List</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #f9f7f4;">
        <!-- Outer wrapper -->
        <table role="presentation" width="100%" style="background-color: #f9f7f4; padding: 20px 0;">
          <tr>
            <td align="center">
              <!-- Main container -->
              <table role="presentation" width="100%" style="max-width: 600px; background: linear-gradient(135deg, #fdfbf8 0%, #f5f1ed 100%); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                
                <!-- Header with gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #8B6F47 0%, #A08060 100%); padding: 40px 20px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 36px; font-weight: normal; letter-spacing: 2px;">Youm El Salib</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px; font-weight: 300; letter-spacing: 1px; opacity: 0.9;">Waiting List</p>
                  </td>
                </tr>

                <!-- Body content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    
                    <!-- ENGLISH SECTION -->
                    <div style="margin-bottom: 40px; border-bottom: 3px solid #D4AF37; padding-bottom: 30px;">
                      <!-- Greeting -->
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
                        Dear <strong>${name}</strong>,
                      </p>

                      <!-- Welcome message -->
                      <p style="margin: 0 0 20px 0; font-size: 15px; color: #555; line-height: 1.8;">
                        Thank you for your interest in <strong>Youm El Salib</strong>. Thank you for your registration, we have placed your registration on our <strong>waiting list</strong>.
                      </p>

                      <!-- Details -->
                      <p style="margin: 0 0 20px 0; font-size: 15px; color: #555; line-height: 1.8;">
                        Should availability arise or circumstances change, we will contact you directly to confirm your participation. Your interest means a great deal to us, and we remain committed to including you should space become available.
                      </p>

                      <!-- Reference Code Box -->
                      <table role="presentation" width="100%" style="margin: 30px 0; background: #f9f7f4; border: 2px solid #D4622A; border-radius: 8px; overflow: hidden;">
                        <tr>
                          <td align="center" style="padding: 25px;">
                            <p style="margin: 0 0 12px 0; font-size: 12px; color: #8B6F47; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Your Reference Number</p>
                            <p style="margin: 0; font-size: 40px; color: #D4622A; font-family: 'Courier New', monospace; font-weight: bold; letter-spacing: 4px;">
                              ${referenceCode}
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- Event details box -->
                      <table role="presentation" width="100%" style="margin: 30px 0; border: 2px solid #D4622A; border-radius: 8px; overflow: hidden;">
                        <tr style="background-color: #F5E6D3;">
                          <td style="padding: 15px 20px; color: #8B6F47; font-weight: 600; font-size: 14px; border-bottom: 2px solid #D4622A;">
                            EVENT DETAILS
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 20px;">
                            <table role="presentation" width="100%">
                              <tr style="margin-bottom: 12px; display: block;">
                                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                  <p style="margin: 0 0 4px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Location</p>
                                  <p style="margin: 0; font-size: 15px; color: #333; font-weight: 500;">St Mary Maraashly Church - Zamalek</p>
                                </td>
                              </tr>
                              <tr style="margin-bottom: 12px; display: block;">
                                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                  <p style="margin: 0 0 4px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Date & Time</p>
                                  <p style="margin: 0; font-size: 15px; color: #333; font-weight: 500;">Wednesday 2nd of April, 2026 at 7:30 PM</p>
                                </td>
                              </tr>
                              <tr style="display: block;">
                                <td style="padding: 8px 0;">
                                  <p style="margin: 0 0 4px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Status</p>
                                  <p style="margin: 0; font-size: 15px; color: #D4622A; font-weight: 600;">On Waiting List</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Closing -->
                      <p style="margin: 20px 0 0 0; font-size: 14px; color: #666; line-height: 1.6;">
                        We will keep you updated on any developments. Thank you for your patience and understanding.
                      </p>
                    </div>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f5f1ed; padding: 30px 20px; text-align: center; border-top: 2px solid #D4AF37;">
                    <p style="margin: 0 0 10px 0; font-size: 12px; color: #999;">
                      © 2026 Madares A7ad - St Mary Church Zamalek - All rights reserved
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #8B6F47; font-weight: 600;">
                      Youm El Salib | يوم الصليب | A Celebration of Faith
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

/**
 * Generate HTML for reminder email
 */
function generateReminderEmailHTML(): string {
  return '' // Placeholder - can be implemented later
}

/**
 * Generate HTML for thank you email
 */
function generateThankYouEmailHTML(): string {
  return '' // Placeholder - can be implemented later
}

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
export function generateWaitingListHTML(name: string, referenceCode: string): string {
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
                    <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: 400; letter-spacing: 1px; opacity: 0.95;">Waiting List Status Update</p>
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

                      <!-- Main Message -->
                      <p style="margin: 0 0 20px 0; font-size: 15px; color: #555; line-height: 1.8;">
                        We are writing to remind you that your registration for <strong>Youm El Salib</strong> is currently on our <strong>waiting list</strong>.
                      </p>

                      <!-- Key Information Box -->
                      <table role="presentation" width="100%" style="margin: 25px 0; background: linear-gradient(135deg, #fff9f0 0%, #ffe8d6 100%); border: 2px solid #D4622A; border-radius: 8px; overflow: hidden;">
                        <tr style="background-color: #F5E6D3;">
                          <td style="padding: 12px 20px; color: #8B6F47; font-weight: 600; font-size: 13px; border-bottom: 2px solid #D4622A;">
                            YOUR WAITING LIST NUMBER
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding: 25px;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; color: #8B6F47; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Please keep this number for your records</p>
                            <p style="margin: 0; font-size: 42px; color: #D4622A; font-family: 'Courier New', monospace; font-weight: bold; letter-spacing: 5px;">
                              ${referenceCode}
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- What This Means -->
                      <div style="margin: 20px 0; padding: 15px; background-color: #f5f1ed; border-left: 4px solid #D4622A; border-radius: 4px;">
                        <p style="margin: 0; font-size: 14px; color: #7a5c3e; line-height: 1.7;">
                          <strong>What This Means:</strong><br/>
                          We have received your registration request and appreciate your interest in attending Youm El Salib. Due to limited seating, we have placed your registration on a waiting list. <strong>If a spot becomes available and your turn comes up, we will contact you directly</strong> to confirm your attendance.
                        </p>
                      </div>

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
                                  <p style="margin: 0 0 4px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Event Name</p>
                                  <p style="margin: 0; font-size: 15px; color: #333; font-weight: 500;">Youm El Salib - A Celebration of Faith</p>
                                </td>
                              </tr>
                              <tr style="margin-bottom: 12px; display: block;">
                                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                  <p style="margin: 0 0 4px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Date & Time</p>
                                  <p style="margin: 0; font-size: 15px; color: #333; font-weight: 500;">Thursday, April 2nd, 2026 at 7:30 PM</p>
                                </td>
                              </tr>
                              <tr style="margin-bottom: 12px; display: block;">
                                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                  <p style="margin: 0 0 4px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Location</p>
                                  <p style="margin: 0; font-size: 15px; color: #333; font-weight: 500;">St Mary Maraashly Church, Zamalek, Cairo</p>
                                </td>
                              </tr>
                              <tr style="display: block;">
                                <td style="padding: 8px 0;">
                                  <p style="margin: 0 0 4px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Your Current Status</p>
                                  <p style="margin: 0; font-size: 15px; color: #D4622A; font-weight: 600;">⏳ On Waiting List</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Next Steps -->
                      <div style="margin: 20px 0; padding: 15px; background-color: #e8f4f8; border-left: 4px solid #0288d1; border-radius: 4px;">
                        <p style="margin: 0 0 8px 0; font-size: 14px; color: #01579b; font-weight: 600; line-height: 1.6;">
                          <strong>What To Expect Next:</strong>
                        </p>
                        <ul style="margin: 8px 0 0 20px; padding: 0; font-size: 14px; color: #01579b; line-height: 1.8;">
                          <li>We will monitor registrations and availability throughout the event period</li>
                          <li><strong>If space becomes available and it's your turn, we will contact you directly</strong> via email or phone to confirm</li>
                          <li>Keep your confirmation number handy for reference</li>
                          <li>Thank you for your patience and understanding</li>
                        </ul>
                      </div>

                      <!-- Closing -->
                      <p style="margin: 20px 0 0 0; font-size: 14px; color: #666; line-height: 1.6;">
                        If you have any questions, please feel free to reach out to us. We truly appreciate your interest and hope to welcome you to Youm El Salib!
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
 * Send email to waiting list users notifying them of their status
 * @param email - Recipient email address
 * @param name - Recipient's full name
 * @param code - Confirmation code for reference
 * @returns Response with success status
 */
export async function sendWaitingListNotificationEmail(
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
      subject: 'Youm El Salib - Waiting List Update | تحديث قائمة الانتظار',
      html: htmlContent,
      replyTo: 'andrewaks21@gmail.com',
    }

    const info = await transporter.sendMail(mailOptions)

    console.log(`✅ Waiting list notification email sent to ${email}`)
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
 * Send promotion email when user moves from waiting list to confirmed
 * @param email - Recipient email address
 * @param name - Recipient's full name
 * @param code - Confirmation code
 * @returns Response with success status
 */
export async function sendPromotionEmail(
  email: string,
  name: string,
  code: string
) {
  if (!gmailUser || !gmailPass) {
    console.warn('⚠️ Gmail credentials not configured, skipping email')
    return { success: false, error: 'Gmail credentials not configured' }
  }

  try {
    const htmlContent = generatePromotionHTML(name, code)

    const mailOptions = {
      from: gmailFromEmail,
      to: email,
      subject: 'Great News! Youm El Salib - You Are Now Confirmed ✨ | تم تأكيد حضورك',
      html: htmlContent,
      replyTo: 'andrewaks21@gmail.com',
    }

    const info = await transporter.sendMail(mailOptions)

    console.log(`✅ Promotion email sent to ${email}`)
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
 * Send cancellation email
 * @param email - Recipient email address
 * @param name - Recipient's full name
 * @returns Response with success status
 */
export async function sendCancellationEmail(
  email: string,
  name: string
) {
  if (!gmailUser || !gmailPass) {
    console.warn('⚠️ Gmail credentials not configured, skipping email')
    return { success: false, error: 'Gmail credentials not configured' }
  }

  try {
    const htmlContent = generateCancellationHTML(name)

    const mailOptions = {
      from: gmailFromEmail,
      to: email,
      subject: 'Youm El Salib - Registration Cancelled | تم إلغاء التسجيل',
      html: htmlContent,
      replyTo: 'andrewaks21@gmail.com',
    }

    const info = await transporter.sendMail(mailOptions)

    console.log(`✅ Cancellation email sent to ${email}`)
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
 * Generate HTML for waiting list notification email
 */
function generateWaitingListNotificationHTML(
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
        <title>Youm El Salib - Waiting List</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #f9f7f4;">
        <table role="presentation" width="100%" style="background-color: #f9f7f4; padding: 20px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" style="max-width: 600px; background: linear-gradient(135deg, #fdfbf8 0%, #f5f1ed 100%); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                
                <tr>
                  <td style="background: linear-gradient(135deg, #FFA500 0%, #FFB84D 100%); padding: 40px 20px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 36px; font-weight: normal; letter-spacing: 2px;">Youm El Salib</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px; font-weight: 300; letter-spacing: 1px;">You're on the Waiting List</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
                      Dear <strong>${name}</strong>,
                    </p>
                    <p style="margin: 0 0 20px 0; font-size: 15px; color: #555; line-height: 1.8;">
                      Thank you for registering for <strong>Youm El Salib</strong>. Due to high demand, your registration is currently on our waiting list. We will notify you as soon as a spot becomes available.
                    </p>

                    <table role="presentation" width="100%" style="margin: 30px 0; border: 2px solid #FFA500; border-radius: 8px; overflow: hidden;">
                      <tr style="background-color: #FFF8F3;">
                        <td style="padding: 15px 20px; color: #FF8C00; font-weight: 600; font-size: 14px;">
                          EVENT DETAILS
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0 0 10px 0; font-size: 14px; color: #333;"><strong>Date:</strong> ${dateFormatted} (${dateShort})</p>
                          <p style="margin: 0 0 10px 0; font-size: 14px; color: #333;"><strong>Time:</strong> 7:30 PM</p>
                          <p style="margin: 0; font-size: 14px; color: #333;"><strong>Location:</strong> St Mary Maraashly Church - Zamalek, Cairo</p>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" style="margin: 30px 0; background: #f9f7f4; border: 2px solid #FFA500; border-radius: 8px; overflow: hidden;">
                      <tr>
                        <td align="center" style="padding: 25px;">
                          <p style="margin: 0 0 12px 0; font-size: 12px; color: #FF8C00; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Your Reference Code</p>
                          <p style="margin: 0; font-size: 40px; color: #FFA500; font-family: 'Courier New', monospace; font-weight: bold; letter-spacing: 4px;">
                            ${confirmationCode}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <div style="background: #FFF8F3; border-left: 4px solid #FFA500; padding: 15px; border-radius: 4px; margin: 20px 0;">
                      <p style="margin: 0; font-size: 14px; color: #333; line-height: 1.6;">
                        <strong style="color: #FFA500;">⏳ Stay tuned!</strong> We will update you as soon as a spot becomes available.
                      </p>
                    </div>

                    <p style="margin: 20px 0 0 0; font-size: 14px; color: #666; line-height: 1.6;">
                      If you have any questions, please don't hesitate to contact us.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="background-color: #f5f1ed; padding: 30px 20px; text-align: center; border-top: 2px solid #FFA500;">
                    <p style="margin: 0 0 10px 0; font-size: 12px; color: #999;">
                      © 2026 Madares A7ad - St Mary Church Zamalek - All rights reserved
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #8B6F47; font-weight: 600;">
                      Youm El Salib | يوم الصليب
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
 * Generate HTML for promotion email (waiting → confirmed)
 */
function generatePromotionHTML(
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
        <title>Youm El Salib - You're Confirmed!</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #f9f7f4;">
        <table role="presentation" width="100%" style="background-color: #f9f7f4; padding: 20px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" style="max-width: 600px; background: linear-gradient(135deg, #fdfbf8 0%, #f5f1ed 100%); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                
                <tr>
                  <td style="background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); padding: 40px 20px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 36px; font-weight: normal; letter-spacing: 2px;">🎉 Great News!</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px; font-weight: 300; letter-spacing: 1px;">You Are Now Confirmed</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
                      Dear <strong>${name}</strong>,
                    </p>
                    <p style="margin: 0 0 20px 0; font-size: 15px; color: #555; line-height: 1.8;">
                      Wonderful news! Your registration for <strong>Youm El Salib</strong> has been confirmed. We are excited to have you with us at this special celebration!
                    </p>

                    <table role="presentation" width="100%" style="margin: 30px 0; border: 2px solid #22C55E; border-radius: 8px; overflow: hidden;">
                      <tr style="background-color: #F0FDF4;">
                        <td style="padding: 15px 20px; color: #15803D; font-weight: 600; font-size: 14px;">
                          ✓ EVENT DETAILS
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0 0 10px 0; font-size: 14px; color: #333;"><strong>Date:</strong> ${dateFormatted} (${dateShort})</p>
                          <p style="margin: 0 0 10px 0; font-size: 14px; color: #333;"><strong>Time:</strong> 7:30 PM</p>
                          <p style="margin: 0; font-size: 14px; color: #333;"><strong>Location:</strong> St Mary Maraashly Church - Zamalek, Cairo</p>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" style="margin: 30px 0; background: #f9f7f4; border: 2px solid #22C55E; border-radius: 8px; overflow: hidden;">
                      <tr>
                        <td align="center" style="padding: 25px;">
                          <p style="margin: 0 0 12px 0; font-size: 12px; color: #22C55E; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Your Confirmation Code</p>
                          <p style="margin: 0; font-size: 40px; color: #22C55E; font-family: 'Courier New', monospace; font-weight: bold; letter-spacing: 4px;">
                            ${confirmationCode}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <div style="background: #F0FDF4; border-left: 4px solid #22C55E; padding: 15px; border-radius: 4px; margin: 20px 0;">
                      <p style="margin: 0; font-size: 14px; color: #333; line-height: 1.6;">
                        <strong style="color: #22C55E;">✓ Please save this confirmation code</strong> - you'll need it to check in at the event.
                      </p>
                    </div>

                    <p style="margin: 20px 0 0 0; font-size: 14px; color: #666; line-height: 1.6;">
                      We look forward to celebrating with you! If you have any questions, please don't hesitate to contact us.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="background-color: #f5f1ed; padding: 30px 20px; text-align: center; border-top: 2px solid #22C55E;">
                    <p style="margin: 0 0 10px 0; font-size: 12px; color: #999;">
                      © 2026 Madares A7ad - St Mary Church Zamalek - All rights reserved
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #8B6F47; font-weight: 600;">
                      Youm El Salib | يوم الصليب
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
 * Generate HTML for cancellation email
 */
function generateCancellationHTML(name: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Youm El Salib - Registration Cancelled</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #f9f7f4;">
        <table role="presentation" width="100%" style="background-color: #f9f7f4; padding: 20px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" style="max-width: 600px; background: linear-gradient(135deg, #fdfbf8 0%, #f5f1ed 100%); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                
                <tr>
                  <td style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); padding: 40px 20px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 36px; font-weight: normal; letter-spacing: 2px;">Youm El Salib</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px; font-weight: 300; letter-spacing: 1px;">Registration Cancelled</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
                      Dear <strong>${name}</strong>,
                    </p>
                    <p style="margin: 0 0 20px 0; font-size: 15px; color: #555; line-height: 1.8;">
                      Your registration for <strong>Youm El Salib</strong> has been cancelled. You have been added to our waiting list. We hope to see you at future events!
                    </p>

                    <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; border-radius: 4px; margin: 20px 0;">
                      <p style="margin: 0; font-size: 14px; color: #333; line-height: 1.6;">
                        <strong style="color: #EF4444;">Status Updated:</strong> You are now on the waiting list. We will notify you if a spot becomes available.
                      </p>
                    </div>

                    <p style="margin: 20px 0 0 0; font-size: 14px; color: #666; line-height: 1.6;">
                      If you have any questions or would like to re-register, please contact us.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="background-color: #f5f1ed; padding: 30px 20px; text-align: center; border-top: 2px solid #EF4444;">
                    <p style="margin: 0 0 10px 0; font-size: 12px; color: #999;">
                      © 2026 Madares A7ad - St Mary Church Zamalek - All rights reserved
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #8B6F47; font-weight: 600;">
                      Youm El Salib | يوم الصليب
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

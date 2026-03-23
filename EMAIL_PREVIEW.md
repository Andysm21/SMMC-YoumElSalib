# Confirmation Email - Preview

## Subject Line
```
Youm El Salib - Registration Confirmed ✨ | تأكيد التسجيل
```

## Email Structure

### Header (Brown Gradient)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     Youm El Salib
  Registration Confirmed ✨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Body Content

#### ENGLISH SECTION
```
Dear John Smith,

Thank you for registering for Youm El Salib. We are honored by your 
participation and look forward to celebrating this special occasion with you.

    [POSTER IMAGE]
    (550px wide, professional event poster)

┌─────────────────────────────────────────┐
│          EVENT DETAILS                  │
├─────────────────────────────────────────┤
│ Date:     Wednesday 2nd of April        │
│           02/04/2026                    │
│                                         │
│ Time:     7:30 PM                       │
│                                         │
│ Location: St Mary Maraashly Church      │
│           Zamalek, Cairo                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Your Confirmation Code                 │
│                                         │
│    YMSLB12345                           │
│                                         │
└─────────────────────────────────────────┘

✓ Please present this confirmation code at the entrance.
  Keep this email for your records.

If you have any questions about the event or need to make changes to 
your registration, please don't hesitate to contact us.
```

#### ARABIC SECTION (Right-to-Left Layout)
```
السيد / السيدة جون سميث،

شكراً لك على التسجيل في حدث يوم الصليب. نحن فخورون بمشاركتك 
وننتظر بفارغ الصبر للاحتفال بهذه المناسبة الخاصة معك.

    [SAME POSTER IMAGE]

┌─────────────────────────────────────────┐
│          تفاصيل الحدث                    │
├─────────────────────────────────────────┤
│ التاريخ:    الأربعاء 2 أبريل            │
│           02/04/2026                    │
│                                         │
│ الوقت:      الساعة 7:30 مساءً           │
│                                         │
│ الموقع:     كنيسة السيدة العذراء       │
│           مريم بالمرعشلي، الزمالك      │
│           القاهرة                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  رمز التأكيد الخاص بك                   │
│                                         │
│    YMSLB12345                           │
│                                         │
└─────────────────────────────────────────┘

✓ يرجى تقديم رمز التأكيد هذا عند الدخول.
  احتفظ برسالة البريد الإلكترونية هذه لسجلاتك.

إذا كان لديك أي أسئلة حول الحدث أو تحتاج إلى إجراء تغييرات على 
تسجيلك، فيرجى عدم التردد في التواصل معنا.
```

### Footer (Brown Background with Gold Border)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
© 2026 Osret Sanawy - All rights reserved
Youm El Salib | يوم الصليب | A Celebration of Faith
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Key Features

✅ **Date Formatting**
- Natural language: "Wednesday 2nd of April"
- Short format: "02/04/2026"
- Displayed clearly in event details section

✅ **Bilingual Design**
- Separate English and Arabic sections
- RTL (right-to-left) support for Arabic
- Professional visual separation with gold divider

✅ **Poster Image**
- Professional poster display
- 550px width, responsive
- Proper shadow and rounded corners
- References `/public/poster.jpg`

✅ **Confirmation Code**
- Large, easy-to-read format
- Monospace font for clarity
- Appears in both English and Arabic sections

✅ **Professional Styling**
- Color scheme: Browns (#8B6F47), Golds (#D4AF37), Terracotta (#D4622A)
- Typography: Georgia serif font
- Consistent spacing and alignment
- Email client compatible

## Email Client Compatibility

The email uses:
- HTML tables for layout (works in all email clients)
- Inline CSS (no external stylesheets)
- Standard font families (Georgia serif)
- Responsive design for mobile devices
- Proper alt text for images

## Production Considerations

1. **Image URL**: Currently set to `https://youmelsal.com/poster.jpg`
   - Update the domain name when you have your production domain
   - Ensure the poster image is accessible from the internet

2. **From Address**: Currently `Osret Sanawy <andrewaks21@gmail.com>`
   - Configure in `.env.local` via `GMAIL_FROM_EMAIL`

3. **Reply-To**: Currently `andrewaks21@gmail.com`
   - Update in email.ts if needed

## Testing Checklist

- [ ] Test in Gmail (web)
- [ ] Test in Outlook (web)
- [ ] Test in Apple Mail
- [ ] Test on iPhone
- [ ] Test on Android
- [ ] Verify Arabic text renders correctly with proper RTL layout
- [ ] Verify poster image displays
- [ ] Verify confirmation code is readable
- [ ] Verify hyperlinks work (if any are added)

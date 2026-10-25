/**
 * A calendar file with one daily repeating event per lesson time, each with an alarm.
 * Phones show the alarm as a notification, so families get reminders without push setup.
 */
export function lessonCalendar(times: string[], url: string, now = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const events = times.map((t, i) => {
    const [h, m] = t.split(':')
    return [
      'BEGIN:VEVENT',
      `UID:irooto-lesson-${i + 1}@zettaionkan.jp`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=Asia/Tokyo:${date}T${pad(Number(h))}${pad(Number(m))}00`,
      'DURATION:PT5M',
      'RRULE:FREQ=DAILY',
      `SUMMARY:いろおと レッスン（${i + 1}回目）`,
      `DESCRIPTION:30秒の和音レッスンの時間です。${url}`,
      `URL:${url}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:いろおと レッスン',
      'TRIGGER:PT0M',
      'END:VALARM',
      'END:VEVENT'
    ].join('\r\n')
  })
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Akatsuki Inc.//irooto//JA',
    'CALSCALE:GREGORIAN',
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Tokyo',
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0900',
    'TZOFFSETTO:+0900',
    'TZNAME:JST',
    'END:STANDARD',
    'END:VTIMEZONE',
    ...events,
    'END:VCALENDAR',
    ''
  ].join('\r\n')
}

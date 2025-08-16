// ---- Config ----
const MEETING_RULE = { which: 'first', weekday: 4 }; // Thursday (0=Sun..6=Sat)
const MEETINGS_TO_SHOW = 6;
const MEETING_TIME_LABEL = '4:30 PM – 5:30 PM';
const MEETING_LOCATION = 'Room 1428';
const MEET_LINK = 'https://meet.google.com/atk-cecp-cma';

// ---- Helpers ----
function nthWeekdayOfMonth(year, monthIndex, weekday, which='first') {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const firstWeekday = firstOfMonth.getDay();
  let day = 1 + ((7 + weekday - firstWeekday) % 7); // first occurrence
  const map = { first: 0, second: 1, third: 2, fourth: 3, last: 'last' };
  const n = map[which];
  if (n === 'last') {
    const nextMonth = new Date(year, monthIndex + 1, 1);
    const lastDayPrev = new Date(nextMonth - 1);
    const offset = (7 + lastDayPrev.getDay() - weekday) % 7;
    return new Date(lastDayPrev.getFullYear(), lastDayPrev.getMonth(), lastDayPrev.getDate() - offset);
  } else {
    return new Date(year, monthIndex, day + n * 7);
  }
}

function* upcomingMeetings(startDate = new Date(), count = 6) {
  let y = startDate.getFullYear();
  let m = startDate.getMonth();
  let produced = 0;
  while (produced < count) {
    const d = nthWeekdayOfMonth(y, m, MEETING_RULE.weekday, MEETING_RULE.which);
    const today = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    if (d >= today) {
      yield d;
      produced++;
    }
    m += 1; if (m > 11) { m = 0; y += 1; }
  }
}

function fmtDate(d) {
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function icsForMeeting(date, title='SFHS ML Club Meeting', location=MEETING_LOCATION, desc='Monthly meeting') {
  // 4:30–5:30 PM local → convert to UTC
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 16, 30);
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 17, 30);
  const pad = n => String(n).padStart(2, '0');
  const toUTC = d =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  const uid = `${start.getTime()}@sfhs-ml-club`;
  const ics = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SFHS ML Club//Meetings//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,`DTSTAMP:${toUTC(new Date())}`,
    `DTSTART:${toUTC(start)}`,`DTEND:${toUTC(end)}`,
    `SUMMARY:${title}`,`LOCATION:${location}`,`DESCRIPTION:${desc}`,
    'END:VEVENT','END:VCALENDAR'
  ].join('\r\n');
  return 'data:text/calendar;charset=utf8,' + encodeURIComponent(ics);
}

// ---- DOM hookups ----
document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('nav-menu');
  toggle?.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  // Current year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Meeting cards
  const list = document.getElementById('meeting-list');
  if (list) {
    list.innerHTML = '';
    for (const d of upcomingMeetings(new Date(), MEETINGS_TO_SHOW)) {
      const card = document.createElement('article');
      card.className = 'card';
      card.setAttribute('role', 'listitem');
      card.innerHTML = `
        <h3>${fmtDate(d)}</h3>
        <p class="muted">${MEETING_TIME_LABEL} · ${MEETING_LOCATION}</p>
        <div style="display:flex; gap:.5rem; margin-top:.6rem; flex-wrap:wrap;">
          <a class="button primary" href="${icsForMeeting(d)}" download="sfhs-ml-meeting-${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}.ics">Add to Calendar</a>
          <a class="button ghost" href="${MEET_LINK}" target="_blank" rel="noopener">Join online</a>
        </div>
      `;
      list.appendChild(card);
    }
  }
});

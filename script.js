// ---- Config ----
const MEETING_RULE = { which: 'first', weekday: 4 }; // Thursday: 0=Sun ... 6=Sat
const MEETINGS_TO_SHOW = 6;
const MEETING_TIME = '3:30 PM – 4:30 PM';
const MEETING_LOCATION = 'Room 214 (CS Lab)';

// ---- Helpers ----
function nthWeekdayOfMonth(year, monthIndex, weekday, which='first') {
  const firstOfMonth = new Date(year, monthIndex, 1);
  let firstWeekday = firstOfMonth.getDay();
  let day = 1 + ((7 + weekday - firstWeekday) % 7); // first occurrence
  const map = { first: 0, second: 1, third: 2, fourth: 3, last: 'last' };
  const n = map[which];
  if (n === 'last') {
    // Go to next month, step back by 1 week to last target weekday
    const nextMonth = new Date(year, monthIndex + 1, 1);
    const lastDayPrev = new Date(nextMonth - 1); // last day of current month
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
    const date = nthWeekdayOfMonth(y, m, MEETING_RULE.weekday, MEETING_RULE.which);
    if (date >= new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())) {
      yield date;
      produced++;
    }
    m += 1;
    if (m > 11) { m = 0; y += 1; }
  }
}

function fmtDate(d) {
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function icsForMeeting(date, title='SFHS ML Club Meeting', location=MEETING_LOCATION, desc='Monthly meeting') {
  // Simple 1-hour block event at 15:30 local time
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 15, 30);
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 16, 30);
  const pad = n => String(n).padStart(2, '0');
  const toUTC = d => `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  const uid = `${start.getTime()}@sfhs-ml-club`;
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SFHS ML Club//Meetings//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toUTC(new Date())}`,
    `DTSTART:${toUTC(start)}`,
    `DTEND:${toUTC(end)}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${desc}`,
    'END:VEVENT',
    'END:VCALENDAR'
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

  // Year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Meetings
  const list = document.getElementById('meeting-list');
  if (list) {
    for (const d of upcomingMeetings(new Date(), MEETINGS_TO_SHOW)) {
      const card = document.createElement('article');
      card.className = 'card';
      card.setAttribute('role', 'listitem');
      card.innerHTML = `
        <h3>${fmtDate(d)}</h3>
        <p class="muted">${MEETING_TIME} · ${MEETING_LOCATION}</p>
        <div style="display:flex; gap:.5rem; margin-top:.6rem;">
          <a class="button primary" href="${icsForMeeting(d)}" download="sfhs-ml-meeting-${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}.ics">Add to Calendar</a>
          <a class="button ghost" href="#join">Get reminder</a>
        </div>
      `;
      list.appendChild(card);
    }
  }

  // Join form (no backend; friendly UX)
  const form = document.getElementById('join-form');
  const status = document.getElementById('form-status');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.email) {
      status.textContent = 'Please enter a valid email.';
      return;
    }
    // Save locally (optional)
    const saved = JSON.parse(localStorage.getItem('sfhs-ml-subs') || '[]');
    saved.push({ ...data, ts: new Date().toISOString() });
    localStorage.setItem('sfhs-ml-subs', JSON.stringify(saved));
    form.reset();
    status.textContent = 'Thanks! You’re on the list. (This demo stores signups in your browser only.)';
  });
});

// Meeting configuration
const MEETING_RULE = { week: 1, day: 4 }; // 1st Thursday of each month
const MEETING_TIME = { start: "16:30", end: "17:30" }; // 4:30–5:30 PM
const MEETING_LOCATION = "Room 1429";

// Generate next 6 meetings
function generateMeetings() {
  const list = document.getElementById("meeting-list");
  if (!list) return;

  const now = new Date();
  let month = now.getMonth();
  let year = now.getFullYear();
  const meetings = [];

  while (meetings.length < 6) {
    const date = nthWeekdayOfMonth(year, month, MEETING_RULE.week, MEETING_RULE.day);
    if (date > now) {
      meetings.push(date);
    }
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  list.innerHTML = "";
  meetings.forEach(d => list.appendChild(meetingCard(d)));
}

function nthWeekdayOfMonth(year, month, nth, weekday) {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = (weekday - firstDay.getDay() + 7) % 7;
  const day = 1 + firstWeekday + (nth - 1) * 7;
  return new Date(year, month, day);
}

function meetingCard(date) {
  const card = document.createElement("article");
  card.className = "card";

  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  const dateStr = date.toLocaleDateString(undefined, options);

  const startTime = MEETING_TIME.start.replace(":", ":") + " PM";
  const endTime = MEETING_TIME.end.replace(":", ":") + " PM";

  card.innerHTML = `
    <h3>${dateStr}</h3>
    <p>${formatTime(MEETING_TIME.start)} – ${formatTime(MEETING_TIME.end)} · ${MEETING_LOCATION}</p>
    <div class="buttons">
      <a href="#" class="button primary small">Add to Calendar</a>
      <a href="#" class="button ghost small">Get reminder</a>
    </div>
  `;
  return card;
}

function formatTime(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

document.addEventListener("DOMContentLoaded", generateMeetings);


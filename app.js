const cities = [
  { name: "New York", country: "Hoa Kỳ", zone: "America/New_York", emoji: "🗽" },
  { name: "London", country: "Vương quốc Anh", zone: "Europe/London", emoji: "🇬🇧" },
  { name: "Paris", country: "Pháp", zone: "Europe/Paris", emoji: "🗼" },
  { name: "Dubai", country: "Các Tiểu Vương quốc Ả Rập", zone: "Asia/Dubai", emoji: "🌆" },
  { name: "Singapore", country: "Singapore", zone: "Asia/Singapore", emoji: "🇸🇬" },
  { name: "Tokyo", country: "Nhật Bản", zone: "Asia/Tokyo", emoji: "🗾" },
  { name: "Sydney", country: "Úc", zone: "Australia/Sydney", emoji: "🇦🇺" },
  { name: "Los Angeles", country: "Hoa Kỳ", zone: "America/Los_Angeles", emoji: "🌴" },
];

const cityGrid = document.querySelector("#city-grid");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#city-search");
const localClock = document.querySelector("#local-clock");
const localZone = document.querySelector("#local-zone");
const localDate = document.querySelector("#local-date");
const format24Button = document.querySelector("#format-24");
const format12Button = document.querySelector("#format-12");

let use24Hour = true;

const timeFormatter = (zone, hour12 = !use24Hour, seconds = true) => new Intl.DateTimeFormat("vi-VN", {
  timeZone: zone,
  hour: "2-digit",
  minute: "2-digit",
  ...(seconds ? { second: "2-digit" } : {}),
  hour12,
});

const dateFormatter = (zone, options = {}) => new Intl.DateTimeFormat("vi-VN", {
  timeZone: zone,
  weekday: "long",
  day: "numeric",
  month: "long",
  ...options,
});

function getOffsetLabel(zone, date) {
  const zoneName = new Intl.DateTimeFormat("en", {
    timeZone: zone,
    timeZoneName: "shortOffset",
  }).formatToParts(date).find((part) => part.type === "timeZoneName")?.value;

  const match = zoneName?.match(/^GMT(?:([+-])(\d{1,2})(?::?(\d{2}))?)?$/);
  if (!match) return zoneName ?? zone;

  const [, sign = "+", hours = "0", minutes = "00"] = match;
  return `UTC${sign}${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}

function getDayDifference(zone, date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const cityDay = Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day));
  const localParts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const localValues = Object.fromEntries(localParts.map(({ type, value }) => [type, value]));
  const currentDay = Date.UTC(Number(localValues.year), Number(localValues.month) - 1, Number(localValues.day));
  return Math.round((cityDay - currentDay) / 86_400_000);
}

function dayLabel(difference, date, zone) {
  if (difference === 0) return "Hôm nay";
  if (difference === -1) return "Hôm qua";
  if (difference === 1) return "Ngày mai";
  return dateFormatter(zone, { weekday: "short" }).format(date);
}

function renderCities() {
  const query = searchInput.value.trim().toLocaleLowerCase("vi");
  const filteredCities = cities.filter(({ name, country, zone }) =>
    `${name} ${country} ${zone}`.toLocaleLowerCase("vi").includes(query));

  cityGrid.innerHTML = filteredCities.map(({ name, country, zone, emoji }) => `
    <article class="city-card" data-zone="${zone}">
      <div class="city-topline">
        <div>
          <h3 class="city-name">${name}</h3>
          <p class="city-country">${country}</p>
        </div>
        <span class="city-emoji" aria-hidden="true">${emoji}</span>
      </div>
      <div class="city-time-row">
        <time class="city-time" data-time></time>
        <span class="city-period" data-period></span>
      </div>
      <div class="city-bottom">
        <span data-date></span>
        <span class="city-offset" data-offset></span>
      </div>
    </article>
  `).join("");
  emptyState.hidden = filteredCities.length > 0;
  updateClocks();
}

function updateClocks() {
  const now = new Date();
  const localTime = timeFormatter(Intl.DateTimeFormat().resolvedOptions().timeZone).formatToParts(now);
  localClock.textContent = localTime
    .filter(({ type }) => ["hour", "minute", "second", "literal"].includes(type))
    .map(({ value }) => value)
    .join("");
  localZone.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone.replaceAll("_", " ");
  localDate.textContent = dateFormatter(Intl.DateTimeFormat().resolvedOptions().timeZone).format(now);

  cityGrid.querySelectorAll(".city-card").forEach((card) => {
    const zone = card.dataset.zone;
    const timeParts = timeFormatter(zone).formatToParts(now);
    const time = timeParts
      .filter(({ type }) => ["hour", "minute"].includes(type))
      .map(({ value }) => value)
      .join(":");
    const period = timeParts.find(({ type }) => type === "dayPeriod")?.value ?? "";

    card.querySelector("[data-time]").textContent = time;
    card.querySelector("[data-period]").textContent = period;
    card.querySelector("[data-date]").textContent = dayLabel(getDayDifference(zone, now), now, zone);
    card.querySelector("[data-offset]").textContent = getOffsetLabel(zone, now);
  });
}

function setHourFormat(use24) {
  use24Hour = use24;
  format24Button.classList.toggle("is-selected", use24);
  format24Button.setAttribute("aria-pressed", String(use24));
  format12Button.classList.toggle("is-selected", !use24);
  format12Button.setAttribute("aria-pressed", String(!use24));
  updateClocks();
}

searchInput.addEventListener("input", renderCities);
format24Button.addEventListener("click", () => setHourFormat(true));
format12Button.addEventListener("click", () => setHourFormat(false));
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
});

renderCities();
window.setInterval(updateClocks, 1000);

const calendarContainer = document.getElementById("calendarContainer");
const monthButtonsContainer = document.getElementById("monthButtons");
const now = new Date();
const currentYear = now.getFullYear();
let currentMonth = now.getMonth();
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const eventsByDate = {};

monthNames.forEach((name, index) => {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.className = "monthBtn";
    if (index === currentMonth) btn.classList.add("active");
    btn.onclick = () => {
        currentMonth = index;
        updateActiveButton();
        renderCalendar(currentMonth, currentYear);
    };
    monthButtonsContainer.appendChild(btn);
});

function updateActiveButton() {
    document.querySelectorAll(".monthBtn").forEach((btn, idx) => {
        btn.classList.toggle("active", idx === currentMonth);
    });
}

function renderCalendar(month, year) {
    calendarContainer.innerHTML = "";
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement("div");
        cell.className = "day";

        const isToday =
            year === now.getFullYear() &&
            month === now.getMonth() &&
            day === now.getDate();

        if (isToday) {
            cell.classList.add("today");
        }
        cell.textContent = day;

        const key = `${month + 1}월 ${day}일`;
        if (eventsByDate[key]) {
            const tooltip = document.createElement("div");
            tooltip.className = "tooltip";

            eventsByDate[key].forEach(event => {
                const entry = document.createElement("div");
                entry.className = "tooltip-entry";
                if (event.recurring) entry.classList.add("recurring");

                const name = document.createElement("div");
                name.className = "tooltip-name";
                name.textContent = event.name;

                const char = document.createElement("div");
                char.className = "tooltip-char";
                char.innerHTML = event.char.replace(/\n/g, "<br>");

                entry.appendChild(name);
                entry.appendChild(char);
                tooltip.appendChild(entry);
            });

            const markerContainer = document.createElement("div");
            markerContainer.className = "marker-container";

            eventsByDate[key].forEach(event => {
                const marker = document.createElement("div");
                marker.className = `marker ${event.recurring ? 'recurring' : 'fixed'}`;
                markerContainer.appendChild(marker);
            });

            cell.appendChild(markerContainer);
            cell.appendChild(tooltip);
        }

        calendarContainer.appendChild(cell);
    }
}

function loadEvents() {

    Papa.parse("data.csv", {
        download: true,
        complete: (results) => {
            let lastDate = "";
            for (const row of results.data) {
                if (row.length < 3) continue;
                const [date, name, char] = row;
                const dateKey = date.trim() || lastDate;
                if (!dateKey) continue;
                if (!eventsByDate[dateKey]) eventsByDate[dateKey] = [];
                eventsByDate[dateKey].push({
                    name: name.trim(),
                    char: char.trim(),
                    recurring: false
                });
                lastDate = dateKey;
            }

            loadRepeatingEvents();
        }
    });
}

function loadRepeatingEvents() {
    Papa.parse("data2.csv", {
        download: true,
        complete: (results) => {
            for (const row of results.data) {
                if (row.length < 3) continue;
                const [dayStr, name, char] = row;
                const day = parseInt(dayStr.trim());
                if (isNaN(day) || day < 1 || day > 31) continue;

                for (let m = 1; m <= 12; m++) {
                    const daysInMonth = new Date(currentYear, m, 0).getDate();
                    if (day <= daysInMonth) {
                        const key = `${m}월 ${day}일`;
                        if (!eventsByDate[key]) eventsByDate[key] = [];
                        eventsByDate[key].push({
                            name: name.trim(),
                            char: char.trim(),
                            recurring: true
                        });
                    }
                }
            }

            injectLastDayEvent();
            renderCalendar(currentMonth, currentYear);
        }
    });
}

function injectLastDayEvent() {
    for (let m = 1; m <= 12; m++) {
        const daysInMonth = new Date(currentYear, m, 0).getDate();
        const key = `${m}월 ${daysInMonth}일`;
        if (!eventsByDate[key]) eventsByDate[key] = [];

        eventsByDate[key].push({
            name: "달자매의 날",
            char: "와타츠키노 토요히메 & 와타츠키노 요리히메\n무게츠 & 겐게츠",
            recurring: true
        });
    }
}

loadEvents();
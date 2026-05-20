// Default timezones to display
const DEFAULT_TIMEZONES = ['America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'];

// Store active timezones
let activeTimezones = [...DEFAULT_TIMEZONES];

// DOM Elements
const clocksContainer = document.getElementById('clocksContainer');
const timezoneInput = document.getElementById('timezoneInput');
const addButton = document.getElementById('addButton');
const errorMessage = document.getElementById('errorMessage');

/**
 * Initialize the application
 */
function init() {
    renderClocks();
    updateClocks();
    
    // Update clocks every second
    setInterval(updateClocks, 1000);

    // Event listeners
    addButton.addEventListener('click', handleAddTimezone);
    timezoneInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddTimezone();
        }
    });
}

/**
 * Validate timezone name
 */
function isValidTimezone(timezone) {
    try {
        Intl.DateTimeFormat(undefined, { timeZone: timezone });
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Show error message
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 4000);
}

/**
 * Handle adding a new timezone
 */
function handleAddTimezone() {
    const timezone = timezoneInput.value.trim();

    if (!timezone) {
        showError('❌ Please enter a timezone name');
        return;
    }

    if (!isValidTimezone(timezone)) {
        showError(`❌ Invalid timezone: "${timezone}". Try "Europe/Paris" or "Asia/Dubai"`);
        return;
    }

    if (activeTimezones.includes(timezone)) {
        showError(`⚠️ Timezone "${timezone}" is already added`);
        return;
    }

    activeTimezones.push(timezone);
    timezoneInput.value = '';
    renderClocks();
}

/**
 * Handle removing a timezone
 */
function handleRemoveTimezone(timezone) {
    const index = activeTimezones.indexOf(timezone);
    if (index > -1) {
        activeTimezones.splice(index, 1);
        renderClocks();
    }
}

/**
 * Format time for display
 */
function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

/**
 * Format date for display
 */
function formatDate(date) {
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Get UTC offset string
 */
function getUTCOffset(timezone) {
    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            timeZoneName: 'longOffset'
        });
        const parts = formatter.formatToParts(new Date());
        const offsetPart = parts.find(part => part.type === 'timeZoneName');
        return offsetPart ? offsetPart.value : 'UTC';
    } catch (error) {
        return 'UTC';
    }
}

/**
 * Get current time in a specific timezone
 */
function getTimeInTimezone(timezone) {
    const now = new Date();
    const options = { timeZone: timezone };
    
    // Create a date in the target timezone
    const formatter = new Intl.DateTimeFormat('en-CA', {
        ...options,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const parts = formatter.formatToParts(now);
    const timeParts = {};
    
    parts.forEach(part => {
        timeParts[part.type] = part.value;
    });

    const date = new Date(
        `${timeParts.year}-${timeParts.month}-${timeParts.day}T${timeParts.hour}:${timeParts.minute}:${timeParts.second}`
    );

    return date;
}

/**
 * Render all clock cards
 */
function renderClocks() {
    clocksContainer.innerHTML = '';

    activeTimezones.forEach(timezone => {
        const date = getTimeInTimezone(timezone);
        const time = formatTime(date);
        const dateStr = formatDate(date);
        const offset = getUTCOffset(timezone);

        const card = document.createElement('div');
        card.className = 'clock-card';
        card.innerHTML = `
            <button class="close-btn" data-timezone="${timezone}">×</button>
            <div class="timezone-name">${timezone.replace(/_/g, ' ')}</div>
            <div class="time-display">${time}</div>
            <div class="date-display">${dateStr}</div>
            <div class="utc-offset">${offset}</div>
        `;

        card.querySelector('.close-btn').addEventListener('click', () => {
            card.classList.add('removing');
            setTimeout(() => {
                handleRemoveTimezone(timezone);
            }, 300);
        });

        clocksContainer.appendChild(card);
    });
}

/**
 * Update all clock displays
 */
function updateClocks() {
    const cards = document.querySelectorAll('.clock-card');
    
    cards.forEach((card, index) => {
        const timezone = activeTimezones[index];
        const date = getTimeInTimezone(timezone);
        const time = formatTime(date);
        const dateStr = formatDate(date);

        const timeDisplay = card.querySelector('.time-display');
        const dateDisplay = card.querySelector('.date-display');

        timeDisplay.textContent = time;
        dateDisplay.textContent = dateStr;
    });
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', init);

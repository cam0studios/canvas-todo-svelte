class Cache {
    constructor() {
        this.store = new Map();

        let store = JSON.parse(sessionStorage.getItem("calendarCache"));
        for (let key in store) {
            if (Date.now() > store[key].expiry) {
                delete store[key];
                continue;
            }
            this.store.set(key, store[key]);
        }
    }
    
    get(key) {
        const entry = this.store.get(key);
        if (!entry) return null;
        const { value, expiry } = entry;
        if (Date.now() > expiry) {
            this.store.delete(key);
            return null;
        }
        return value;
    }

    getTTL(key) {
        const entry = this.store.get(key);
        if (!entry) return null;
        const { expiry } = entry;
        if (Date.now() > expiry) {
            this.store.delete(key);
            return null;
        }
        return expiry - Date.now();
    }
    
    put(key, value, ttl = 1000 * 60 * 10) {
        const expiry = Date.now() + ttl;
        this.store.set(key, { value, expiry });
        sessionStorage.setItem("calendarCache", JSON.stringify(Object.fromEntries(this.store)));
    }
}

const cache = new Cache();

async function fetchCached(url = "", ttl = 1000 * 60 * 10, func = async (response) => await response.json()) {
    const cached = cache.get(url);
    if (cached) {
        return cached;
    }
    const response = await fetch(url);
    const ret = await func(response);
    cache.put(url, ret, ttl);
    return ret;
}

export function getDateString(date = new Date()) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

export async function getToday() {
    const calendar = await fetchCached("https://hcpss.space/api/calendar/events", 1000 * 60 * 10);
    const today = getDateString();
    const events = calendar.events.find(event => event.date === today) || [];

    let schedule = 0;
    events.forEach(event => {
        if (event.summary.includes("schools") && event.summary.includes("closed")) {
            // schedule = -1;
        }
        if (event.summary.includes("schools") && event.summary.includes("3 hours early")) {
            schedule = 1;
        }
    });

    return {
        events,
        day: calendar.dayTypes[today],
        schedule
    };
}

export async function getStatus() {
    const status = await fetchCached("https://hcpss.space/api/status", 1000 * 60);
    // if (status.main.includes("closed")) return -1;
    if (status.main.includes("normal")) return 0;
    if (status.main.includes("early dismissal")) return 2;
    if (status.main.includes("two hours late")) return 3;
    return 0;
}
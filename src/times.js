export class TimeSheet {
	constructor(periods = [{ name: "1", start: 0, end: 0 }]) {
		this.periods = periods;
	}
	getCurrentPeriod() {
		let currentTime = TimeSheet.currentTime;
		let periods = this.periods;
		if (currentTime > periods[periods.length - 1].end || currentTime < periods[0].start) {
			return null;
		}
		for (let period of periods) {
			if (currentTime >= period.start && currentTime <= period.end) {
				return { period, timeLeft: period.end - currentTime };
			}
			if (currentTime < period.start) {
				return { period: { name: "Transition", start: periods[periods.indexOf(period)].end, end: period.start }, timeLeft: period.start - currentTime };
			}
		}
		return null;
	}
	static get currentTime() {
		let now = new Date();
		return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60 - 120;
	}
	static getTimeFromString(time = "12:00") {
		let hour = parseInt(time.split(":")[0]);
		let minute = parseInt(time.split(":")[1]);
		if (hour < 5) hour += 12;
		return hour * 60 + minute;
	}
	static formatTime(time = 0, include = { hour: true, minute: true, second: false }) {
		if (include.hour && !include.minute && include.second) {
			console.warn("Including hours and seconds without minutes may result in an incorrect time format");
		}
		let hour = Math.floor(time / 60);
		let minute = Math.floor(time - hour * 60);
		let second = Math.floor((time - hour * 60 - minute) * 60);
		let ret = "";
		if (include.hour) {
			ret += `${hour}:`;
		}
		if (include.minute) {
			ret += `${minute < 10 ? "0" : ""}${minute}:`;
		}
		if (include.second) {
			ret += `${second < 10 ? "0" : ""}${second}:`;
		}
		if (ret.endsWith(":")) {
			ret = ret.slice(0, -1);
		}
		return ret;
	}
	static getPeriodsFromStrings(periods = [{ times: "12:00-12:00", id: 0 }]) {
		return periods.map(p => {
			if (!p.name) p.name = p.id.toString();
			return { id: p.id, start: TimeSheet.getTimeFromString(p.times.split("-")[0]), end: TimeSheet.getTimeFromString(p.times.split("-")[1]) };
		});
	}
}

export function createMiddleTimeSheet(periods = [{ id: 0, times: "12:00-12:00" }], lunchStart = 0, lunchEnd = 0, lunches = [0]) {
	var grades = [];
	var fixedPeriods = TimeSheet.getPeriodsFromStrings(periods);
	for (let lunch of lunches) {
		var grade = [];
		let i = 0;
		while (i < fixedPeriods.length) {
			let period = fixedPeriods[i];
			if (period.id < lunchStart || period.id > lunchEnd) {
				grade.push({ name: "" + period.id, start: period.start, end: period.end });
				i++;
			} else {
				if (period.id == lunch) {
					grade.push({ name: "Lunch", start: period.start, end: period.end });
					i++;
				} else {
					grade.push({ name: period.id + "-" + fixedPeriods[i + 1].id, start: period.start, end: fixedPeriods[i + 1].end });
					i += 2;
				}
			}
		}
		grades.push(grade);
	}
	return {
		schedules: grades.map(e => new TimeSheet(e)),
		grade: 0,
		get current() {
			return this.schedules[this.grade].getCurrentPeriod();
		}
	};
}

export function createHighTimeSheet(periods = [{ id: 0, times: "12:00-12:00" }], lunches = [{ id: "A", times: "12:00-12:00" }]) {
	var lunchSchedules = [];
	var fixedPeriods = TimeSheet.getPeriodsFromStrings(periods);
	var fixedLunches = TimeSheet.getPeriodsFromStrings(lunches.map((l, i) => ({ id: i, times: l.times }))).map(l => ({ start: l.start, end: l.end, id: lunches[l.id].id }));
	for (let lunch of fixedLunches) {
		var lunchSchedule = [];
		let i = 0;
		for (let period of fixedPeriods) {
			if (period.end <= lunch.start || period.start >= lunch.end) {
				lunchSchedule.push({ name: (i + 1).toString(), start: period.start, end: period.end });
				i++;
			} else {
				if (period.start < lunch.start) {
					lunchSchedule.push({ name: (i + 1).toString(), start: period.start, end: lunch.start });
				}
				lunchSchedule.push({ name: lunch.id + " Lunch", start: lunch.start, end: lunch.end });
				if (period.end > lunch.end) {
					lunchSchedule.push({ name: (i + 1).toString(), start: lunch.end, end: period.end });
				}
				i++;
			}
		}
		lunchSchedules.push(lunchSchedule);
	}
	return {
		schedules: lunchSchedules.map(e => new TimeSheet(e)),
		schedule: 0,
		get current() {
			return this.schedules[this.schedule].getCurrentPeriod();
		},
		async updateDay() {
			let day = (await (await fetch("https://hcpss.space/api/calendar/dayType")).json()).type;
			if (day == "") return;
			if (day == "A") return this.schedule = 0;
			if (day == "B") return this.schedule = 1;
		}
	};
}

export var middleTimeSheet = createMiddleTimeSheet([
	{ id: 1, times: "8:25-9:22" },
	{ id: 2, times: "9:25-10:15" },
	{ id: 3, times: "10:18-11:08" },
	{ id: 4, times: "11:11-11:41" },
	{ id: 5, times: "11:44-12:01" },
	{ id: 6, times: "12:04-12:34" },
	{ id: 7, times: "12:37-12:52" },
	{ id: 8, times: "12:55-1:27" },
	{ id: 9, times: "1:30-2:20" },
	{ id: 10, times: "2:23-3:15" }
], 4, 8, [4, 6, 8]);

export var highTimeSheet = createHighTimeSheet([
	{ id: 1, times: "7:50-8:45" },
	{ id: 2, times: "8:50-9:40" },
	{ id: 3, times: "9:45-10:40" },
	{ id: 4, times: "10:45-12:45" },
	{ id: 5, times: "12:50-1:40" },
	{ id: 6, times: "1:45-2:35" }
], [
	{ id: "A", times: "10:45-11:15" },
	{ id: "B", times: "11:15-11:45" },
	{ id: "C", times: "11:45-12:15" },
	{ id: "D", times: "12:15-12:45" }
]);
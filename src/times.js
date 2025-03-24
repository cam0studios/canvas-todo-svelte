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
		return (now.getHours() + 3) * 60 + now.getMinutes() + now.getSeconds() / 60;
	}
	static getTimeFromString(time = "12:00") {
		let hour = parseInt(time.split(":")[0]);
		let minute = parseInt(time.split(":")[1]);
		if (hour < 5) hour += 12;
		return hour * 60 + minute;
	}
	static formatTime(time = 0, include = { hour: true, minute: true, second: false }) {
		if (include.hour && !include.minute && include.second) {
			throw new Error("Cannot including hours and seconds without minutes");
		}
		let hour = include.hour ? Math.floor(time / 60) : 0;
		let minute = include.minute ? Math.floor(time - hour * 60) : 0;
		let second = include.second ? Math.floor((time - hour * 60 - minute) * 60) : 0;
		let ret = "";
		if (include.hour) {
			ret += `${hour}:`;
		}
		if (include.minute) {
			ret += `${include.hour && minute < 10 ? "0" : ""}${minute}:`;
		}
		if (include.second) {
			ret += `${include.minute && second < 10 ? "0" : ""}${second}:`;
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

export function createMiddleTimeSheet(schedules = [{ periods: [{ id: 0, times: "12:00-12:00" }], lunchStart: 0, lunchEnd: 0, lunches: [0] }]) {
	var fixedSchedules = [];
	for (let schedule of schedules) {
		var grades = [];
		var fixedPeriods = TimeSheet.getPeriodsFromStrings(schedule.periods);
		for (let lunch of schedule.lunches) {
			var grade = [];
			let i = 0;
			while (i < fixedPeriods.length) {
				let period = fixedPeriods[i];
				if (period.id < schedule.lunchStart || period.id > schedule.lunchEnd) {
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
		fixedSchedules.push(grades);
	}
	return {
		schedules: fixedSchedules.map(s => ({ periods: s.map(g => new TimeSheet(g)), ...s })),
		get schedule() {
			return parseInt(localStorage.getItem("middle-times-schedule")) || 0;
		},
		set schedule(val) {
			localStorage.setItem("middle-times-schedule", val.toString());
		},
		get grade() {
			return parseInt(localStorage.getItem("middle-times-grade")) || 0;
		},
		set grade(val) {
			localStorage.setItem("middle-times-grade", val.toString());
		},
		get current() {
			return this.schedules[this.schedule].periods[this.grade].getCurrentPeriod();
		},
	};
}

export function createHighTimeSheet(schedules = [{ periods: [{ id: 0, times: "12:00-12:00" }], lunches: [{ id: "A", times: "12:00-12:00" }] }]) {
	var fixedSchedules = [];
	for (let schedule of schedules) {
		var lunchSchedules = [];
		var fixedPeriods = TimeSheet.getPeriodsFromStrings(schedule.periods);
		var fixedLunches = TimeSheet.getPeriodsFromStrings(schedule.lunches.map((l, i) => ({ id: i, times: l.times }))).map(l => ({ start: l.start, end: l.end, id: schedule.lunches[l.id].id }));
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
		fixedSchedules.push(lunchSchedules);
	}
	return {
		schedules: fixedSchedules.map(s => ({ periods: s.map(g => new TimeSheet(g)), ...s })),
		get schedule() {
			return parseInt(localStorage.getItem("high-times-schedule")) || 0;
		},
		set schedule(val) {
			localStorage.setItem("high-times-schedule", val.toString());
		},
		get day() {
			return parseInt(localStorage.getItem("high-times-day")) || 0;
		},
		set day(val) {
			localStorage.setItem("high-times-day", val.toString());
		},
		get lunchDays() {
			return {
				get 0() {
					return parseInt(localStorage.getItem("high-times-lunch-0")) || 0;
				},
				get 1() {
					return parseInt(localStorage.getItem("high-times-lunch-1")) || 0;
				},
				set 0(val) {
					localStorage.setItem("high-times-lunch-0", val.toString());
				},
				set 1(val) {
					localStorage.setItem("high-times-lunch-1", val.toString());
				}
			};
		},
		set lunchDays(val) {
			this.lunchDays[0] = val[0];
			this.lunchDays[1] = val[1];
		},
		get current() {
			return this.schedules[this.schedule].periods[this.lunchDays[this.day]].getCurrentPeriod();
		},
		async updateDay() {
			try {
				let day = (await (await fetch("https://hcpss.space/api/calendar/dayType")).json()).type;
				if (day == "A") return this.day = 0;
				if (day == "B") return this.day = 1;
				return;
			} catch (err) {
				console.error(err);
				return err;
			}
		}
	};
}

export var middleTimeSheet = createMiddleTimeSheet([
	{
		periods: [
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
		], lunchStart: 4, lunchEnd: 8, lunches: [4, 6, 8]
	}
]);

export var highTimeSheet = createHighTimeSheet([{
	periods: [
		{ id: 1, times: "7:50-8:45" },
		{ id: 2, times: "8:50-9:40" },
		{ id: 3, times: "9:45-10:40" },
		{ id: 4, times: "10:45-12:45" },
		{ id: 5, times: "12:50-1:40" },
		{ id: 6, times: "1:45-2:35" }
	], lunches: [
		{ id: "A", times: "10:45-11:15" },
		{ id: "B", times: "11:15-11:45" },
		{ id: "C", times: "11:45-12:15" },
		{ id: "D", times: "12:15-12:45" }
	]
}]);
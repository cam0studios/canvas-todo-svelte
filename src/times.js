/**
 * @typedef {object} Period
 * @property {string} [name] - Name of the period
 * @property {string|number} [id] - ID of the period
 * @property {number} start - Start time of the period
 * @property {number} end - End time of the period
 *
 * @typedef {object} PeriodString
 * @property {string} times - Time string in the format "HH:MM-HH:MM"
 * @property {number} id - ID of the period
 * @property {string} [name] - Name of the period
 */

/**
 * Helper class for generating timesheets
 */
export class TimeSheet {
	/**
	 * Creates a new TimeSheet instance
	 * @param {Period[]} periods - Array of periods
	 */
	constructor(periods = [{ name: "1", start: 0, end: 0 }]) {
		this.periods = periods;
	}
	/**
	 * Gets the current period
	 * @returns {{period: Period, timeLeft: number} | null} - The current period and time left, or null if out of school hours
	 */
	getCurrentPeriod() {
		let currentTime = TimeSheet.currentTime;
		let periods = this.periods;
		if (
			currentTime > periods[periods.length - 1].end ||
			currentTime < periods[0].start
		) {
			return null;
		}
		for (let period of periods) {
			if (currentTime >= period.start && currentTime <= period.end) {
				return { period, timeLeft: period.end - currentTime };
			}
			if (currentTime < period.start) {
				return {
					period: {
						name: "Transition",
						start: periods[periods.indexOf(period)].end,
						end: period.start,
					},
					timeLeft: period.start - currentTime,
				};
			}
		}
		return null;
	}
	/**
	 * Gets the current time in minutes
	 * @returns {number} - The current time in minutes
	 */
	static get currentTime() {
		let now = new Date();
		return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
	}
	/**
	 * Converts a time string to minutes
	 * @param {string} time - Time string in the format "HH:MM"
	 * @returns {number} - The time in minutes
	 */
	static getTimeFromString(time = "12:00") {
		let hour = parseInt(time.split(":")[0]);
		let minute = parseInt(time.split(":")[1]);
		if (hour < 5) hour += 12;
		return hour * 60 + minute;
	}
	/**
	 * Formats a time in minutes to a string
	 * @param {number} time - Time in minutes
	 * @param {{hour: boolean, minute: boolean, second: boolean}} include - Whether to include hours, minutes, and seconds
	 * @returns {string} - The formatted time string
	 */
	static formatTime(
		time = 0,
		include = { hour: true, minute: true, second: false }
	) {
		if (include.hour && !include.minute && include.second) {
			throw new Error(
				"Cannot including hours and seconds without minutes"
			);
		}
		let hour = include.hour ? Math.floor(time / 60) : 0;
		let minute = include.minute ? Math.floor(time - hour * 60) : 0;
		let second = include.second
			? Math.floor((time - hour * 60 - minute) * 60)
			: 0;
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
	/**
	 * Converts an array of period strings to an array of period objects
	 * @param {PeriodString[]} periods - Array of period strings
	 * @returns {Period[]} - Array of period objects
	 */
	static getPeriodsFromStrings(periods = [{ times: "12:00-12:00", id: 0 }]) {
		return periods.map((p) => {
			if (!p.name) p.name = p.id.toString();
			return {
				id: p.id,
				start: TimeSheet.getTimeFromString(p.times.split("-")[0]),
				end: TimeSheet.getTimeFromString(p.times.split("-")[1]),
			};
		});
	}
}

/**
 * Creates a middle school time sheet
 * @param {object[]} schedules Schedules for the time sheet
 * @property {PeriodString[]} schedules[].periods - Array of period strings
 * @property {number} schedules[].lunchStart - Start period for lunch
 * @property {number} schedules[].lunchEnd - End period for lunch
 * @property {number[]} schedules[].lunches - Array of lunch periods
 * @property {{ from: number, to: string }[]} schedules[].replace - Array of objects to replace periods
 * @returns {{ schedules: TimeSheet[][], schedule: number, grade: number, current: { period: Period, timeLeft: number } }} - The time sheet object
 */
export function createMiddleTimeSheet(
	schedules = [
		{
			periods: [{ id: 0, times: "12:00-12:00" }],
			lunchStart: 0,
			lunchEnd: 0,
			lunches: [0],
			replace: [{ from: -1, to: "" }],
		},
	]
) {
	var fixedSchedules = [];
	for (let schedule of schedules) {
		var grades = [];
		var fixedPeriods = TimeSheet.getPeriodsFromStrings(schedule.periods);
		for (let lunch of schedule.lunches) {
			var grade = [];
			let i = 0;
			while (i < fixedPeriods.length) {
				let period = fixedPeriods[i];
				let periodName = period.id.toString();
				if (schedule.replace.map((e) => e.from).includes(period.id)) {
					periodName = schedule.replace.find(
						(e) => e.from == period.id
					).to;
				}
				if (
					period.id < schedule.lunchStart ||
					period.id > schedule.lunchEnd
				) {
					grade.push({
						name: periodName,
						start: period.start,
						end: period.end,
					});
					i++;
				} else {
					if (period.id == lunch) {
						grade.push({
							name: "Lunch",
							start: period.start,
							end: period.end,
						});
						i++;
					} else {
						grade.push({
							name: periodName + "-" + fixedPeriods[i + 1].id,
							start: period.start,
							end: fixedPeriods[i + 1].end,
						});
						i += 2;
					}
				}
			}
			grades.push(grade);
		}
		fixedSchedules.push(grades);
	}
	return {
		schedules: fixedSchedules.map((s) => s.map((g) => new TimeSheet(g))),
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
			return this.schedules[this.schedule][this.grade].getCurrentPeriod();
		},
	};
}

/**
 * Creates a high school time sheet
 * @param {object[]} schedules
 * @property {PeriodString[]} schedules[].periods - Array of period strings
 * @property {PeriodString[]} schedules[].lunches - Array of lunch period strings
 * @returns {{schedules: TimeSheet[][], schedule: number, day: number, lunchDays: {0: number, 1: number}, current: {period: Period, timeLeft: number}, updateDay: function}}
 */
export function createHighTimeSheet(
	schedules = [
		{
			periods: [{ id: "0", times: "12:00-12:00" }],
			lunches: [{ id: "A", times: "12:00-12:00" }],
		},
	]
) {
	var fixedSchedules = [];
	for (let schedule of schedules) {
		var lunchSchedules = [];
		var fixedPeriods = TimeSheet.getPeriodsFromStrings(
			schedule.periods.map((p, i) => ({ id: i, times: p.times }))
		).map((p) => ({
			start: p.start,
			end: p.end,
			id: schedule.periods[p.id].id,
		}));
		var fixedLunches = TimeSheet.getPeriodsFromStrings(
			schedule.lunches.map((l, i) => ({ id: i, times: l.times }))
		).map((l) => ({
			start: l.start,
			end: l.end,
			id: schedule.lunches[l.id].id,
		}));
		for (let lunch of fixedLunches) {
			var lunchSchedule = [];
			let i = 0;
			for (let period of fixedPeriods) {
				if (period.end <= lunch.start || period.start >= lunch.end) {
					lunchSchedule.push({
						name: period.id,
						start: period.start,
						end: period.end,
					});
					i++;
				} else {
					if (period.start < lunch.start) {
						lunchSchedule.push({
							name: period.id,
							start: period.start,
							end: lunch.start,
						});
					}
					lunchSchedule.push({
						name: lunch.id + " Lunch",
						start: lunch.start,
						end: lunch.end,
					});
					if (period.end > lunch.end) {
						lunchSchedule.push({
							name: period.id,
							start: lunch.end,
							end: period.end,
						});
					}
					i++;
				}
			}
			if (fixedPeriods[fixedPeriods.length - 1].end <= lunch.start) {
				lunchSchedule.push({
					name: lunch.id + " Lunch",
					start: lunch.start,
					end: lunch.end,
				});
			}
			lunchSchedules.push(lunchSchedule);
		}
		fixedSchedules.push(lunchSchedules);
	}
	return {
		schedules: fixedSchedules.map((s) => s.map((g) => new TimeSheet(g))),
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
					return (
						parseInt(localStorage.getItem("high-times-lunch-0")) ||
						0
					);
				},
				get 1() {
					return (
						parseInt(localStorage.getItem("high-times-lunch-1")) ||
						0
					);
				},
				set 0(val) {
					localStorage.setItem("high-times-lunch-0", val.toString());
				},
				set 1(val) {
					localStorage.setItem("high-times-lunch-1", val.toString());
				},
			};
		},
		set lunchDays(val) {
			this.lunchDays[0] = val[0];
			this.lunchDays[1] = val[1];
		},
		get current() {
			return this.schedules[this.schedule][
				this.lunchDays[this.day]
			].getCurrentPeriod();
		},
		/**
		 * Updates the A/B day
		 * @returns {Promise<number|void>} - If day changed, return the new day, otherwise undefined
		 */
		async updateDay() {
			try {
				let day = (
					await (
						await fetch("https://hcpss.space/api/calendar/dayType")
					).json()
				).type;
				if (day == "A") return (this.day = 0);
				if (day == "B") return (this.day = 1);
				return;
			} catch (err) {
				console.error(err);
				return err;
			}
		},
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
			{ id: 10, times: "2:23-3:15" },
		],
		lunchStart: 4,
		lunchEnd: 8,
		lunches: [4, 6, 8],
		replace: [],
	},
	{
		periods: [
			{ id: -1, times: "8:25-9:18" },
			{ id: 1, times: "9:21-10:04" },
			{ id: 2, times: "10:07-10:50" },
			{ id: 3, times: "10:53-11:36" },
			{ id: 4, times: "11:39-12:09" },
			{ id: 5, times: "12:12-12:22" },
			{ id: 6, times: "12:25-12:55" },
			{ id: 7, times: "12:58-1:08" },
			{ id: 8, times: "1:11-1:41" },
			{ id: 9, times: "1:44-2:27" },
			{ id: 10, times: "2:30-3:15" },
		],
		lunchStart: 4,
		lunchEnd: 8,
		lunches: [4, 6, 8],
		replace: [{ from: -1, to: "Eagle Time" }],
	},
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
			{ id: 10, times: "2:23-3:15" },
		],
		lunchStart: 4,
		lunchEnd: 8,
		lunches: [4, 6, 8],
		replace: [],
	},
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
			{ id: 10, times: "2:23-3:15" },
		],
		lunchStart: 4,
		lunchEnd: 8,
		lunches: [4, 6, 8],
		replace: [],
	},
]);

export var highTimeSheet = createHighTimeSheet([
	{
		periods: [
			{ id: "1", times: "7:50-8:45" },
			{ id: "2", times: "8:50-9:40" },
			{ id: "3", times: "9:45-10:40" },
			{ id: "4", times: "10:45-12:45" },
			{ id: "5", times: "12:50-1:40" },
			{ id: "6", times: "1:45-2:35" },
		],
		lunches: [
			{ id: "A", times: "10:45-11:15" },
			{ id: "B", times: "11:15-11:45" },
			{ id: "C", times: "11:45-12:15" },
			{ id: "D", times: "12:15-12:45" },
		],
	},
	{
		periods: [
			{ id: "1", times: "7:50-8:35" },
			{ id: "2", times: "8:40-9:25" },
			{ id: "Lions' Time", times: "9:30-9:55" },
			{ id: "3", times: "10:00-10:50" },
			{ id: "4", times: "10:55-12:55" },
			{ id: "5", times: "1:00-1:45" },
			{ id: "6", times: "1:50-2:35" },
		],
		lunches: [
			{ id: "A", times: "10:55-11:25" },
			{ id: "B", times: "11:25-11:55" },
			{ id: "C", times: "11:55-12:25" },
			{ id: "D", times: "12:25-12:55" },
		],
	},
	{
		periods: [
			{ id: "1", times: "7:50-8:20" },
			{ id: "2", times: "8:25-8:55" },
			{ id: "3", times: "9:00-9:35" },
			{ id: "4", times: "9:40-10:10" },
			{ id: "5", times: "10:15-10:45" },
			{ id: "6", times: "10:50-11:20" },
		],
		lunches: [{ id: "Grab n Go", times: "11:20-11:35" }],
	},
	{
		periods: [
			{ id: "1", times: "9:50-10:20" },
			{ id: "2", times: "10:25-10:55" },
			{ id: "3", times: "11:00-11:30" },
			{ id: "4", times: "11:35-1:35" },
			{ id: "5", times: "1:40-2:05" },
			{ id: "6", times: "2:10-2:35" },
		],
		lunches: [
			{ id: "A", times: "11:35-12:05" },
			{ id: "B", times: "12:05-12:35" },
			{ id: "C", times: "12:35-1:05" },
			{ id: "D", times: "1:05-1:35" },
		],
	},
]);

import { writable, get } from "svelte/store";

import { highTimeSheet, middleTimeSheet, TimeSheet } from "../times";

export var apiToken = localStorage.getItem("api-token") || "";
export const apiURLs = ["https://hcpss.space/api/canvas/v1", "https://corsanywhere.vercel.app/hcpss.instructure.com/api/v1"];
export var workingURL = -1;

export var logs = {
	todo: false,
	grade: false,
	announcement: false,
	inbox: false,
	fetch: false
};

export const todoStore = writable(null);
export const gradeStore = writable(null);
export const announcementStore = writable(null);
export const inboxStore = writable(null);

export var timesSchool = writable(parseInt(localStorage.getItem("times-school")) || 0);
timesSchool.subscribe(value => {
	localStorage.setItem("times-school", value.toString());
});

export function setToken(token) {
	apiToken = token;
	localStorage.setItem("api-token", token);
	updateStores();
}

updateStores();
export async function updateStores() {
	let stores = [todoStore, gradeStore, announcementStore, inboxStore];
	for (let store of stores) {
		store.set(null);
	}
	let funcs = [updateTodo, updateGrades, updateAnnouncements, updateInbox];
	funcs = funcs.map((func, i) => (async () => {
		let store = stores[i];
		let res = await func();
		store.set(res);
		return res;
	}));
	return await Promise.all(funcs.map(func => func()));
}
export async function updateTodo() {
	let res = await getAPI("users/self/todo");
	if (res?.errors?.length > 0) return { error: res.errors.map(e => e.message).join("<br>") };
	res.sort((a, b) => new Date(a.assignment.due_at).getTime() - new Date(b.assignment.due_at).getTime());
	return res;
}
export async function updateGrades() {
	let res = await getAPI("users/self/courses", "enrollment_state=active&per_page=100&include%5B%5D=total_scores&include%5B%5D=current_grading_period_scores&include%5B%5D=grading_periods");
	if (res?.errors?.length > 0) return { error: res.errors.map(e => e.message).join("<br>") };
	res = res
		.map((course) => ({ course, score: course.enrollments[0].current_period_computed_current_score }),)
		.map((course) => ({ course: course.course, score: typeof course.score == "number" ? course.score : -1 }),)
		.sort((a, b) => b.score - a.score)
		.map((data) => data.course);
	return res;
}
export async function updateAnnouncements() {
	let res = await getAPI("users/self/courses", "enrollment_state=active&per_page=20");
	if (res?.errors?.length > 0) return { error: res.errors.map(e => e.message).join("<br>") };
	let res2 = await getAPI("announcements", "per_page=20&" + res
		.map((course) => `context_codes[]=course_${course.id}`)
		.join("&"));
	if (res2?.errors?.length > 0) return { error: res2.errors.map(e => e.message).join("<br>") };
	return res2;
}
export async function updateInbox() {
	let res = await getAPI("conversations", "enrollment_state=active&per_page=20");
	if (res?.errors?.length > 0) return { error: res.errors.map(e => e.message).join("<br>") };
	return res;
}

export async function getAPI(endpoint = "", options = "") {
	try {
		await checkURLs();
		if (workingURL < 0) {
			console.error("No working URL found");
			return { errors: ["No working URL found"] };
		}
		if (options != "") options = `?${options}`;
		let res = await fetch(`${apiURLs[workingURL]}/${endpoint}${options}`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${apiToken}`,
				origin: location.origin
			},
		});
		let json = await res.json();
		if (logs.fetch) {
			console.log(json);
		}
		return json;
	} catch (err) {
		console.error(err);
		return { errors: [err] };
	}
}

async function checkURLs(n = 0) {
	if (workingURL >= 0) return true;
	if (n >= apiURLs.length) {
		console.error("All URLs failed");
		workingURL = -3;
		return false;
	}
	if (workingURL == -2 && n == 0) {
		await new Promise(resolve => setTimeout(resolve, 1000));
		return await checkURLs();
	}
	if (workingURL == -3) {
		return false;
	}
	workingURL = -2;
	try {
		let res = await fetch(`${apiURLs[n]}/users/self`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${apiToken}`,
				origin: location.origin
			},
		});
		if (res.ok) {
			console.log(`URL ${n} is working`);
			workingURL = n;
			return true;
		}
	} catch (err) {
		console.warn(`URL ${n} failed: ${err}`);
	}
	return await checkURLs(n + 1);
}

export const timeLeftStore = writable("...");
export const currentPeriodStore = writable({ name: "", start: 0, end: 0 });

setInterval(() => {
	let current = get(timesSchool) == 0 ? middleTimeSheet.current : highTimeSheet.current;
	if (current == null) {
		timeLeftStore.set("0:00");
		currentPeriodStore.set({ name: "none", start: 0, end: 0 });
	}
	timeLeftStore.set(TimeSheet.formatTime(current.timeLeft, { hour: current.timeLeft > 60, minute: true, second: true }));
	currentPeriodStore.set(current.period);
}, 1000);

// export function responseToData(response) {
//   // return response;
//   return response.map(todo => {
//     return {
//       courseName: todo.context_name,
//       name: todo.assignment.name,
//       due: new Date(todo.assignment.due_at),
//     };
//   });
// }


/*
IGNORE ASSIGNMENT
POST https://hcpss.instructure.com/api/v1/planner/overrides
{"id":null,"plannable_id":"<assignment-id>","plannable_type":"assignment","user_id":"<user-id>","marked_complete":true}
*/
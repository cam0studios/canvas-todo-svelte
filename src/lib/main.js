import { writable } from "svelte/store";

import { highTimeSheet, middleTimeSheet, TimeSheet } from "../times";

const apiToken = localStorage.getItem("api-token") || "";
const corsProxyURL = "https://hcpss.space/api/canvas";
const apiURL = "v1";

export { apiToken };

export var logs = {
	todo: false,
	grade: false,
	announcement: false,
	inbox: false,
	alert: false,
	fetch: false
};

export const todoStore = writable(null);
export const gradeStore = writable(null);
export const announcementStore = writable(null);
export const inboxStore = writable(null);

export async function updateStores() {
	let rets = await Promise.all([updateTodo(), updateGrades(), updateAnnouncements(), updateInbox()]);
	todoStore.set(rets[0]);
	gradeStore.set(rets[1]);
	announcementStore.set(rets[2]);
	inboxStore.set(rets[3]);
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
		if (options != "") options = `?${options}`;
		let res = await fetch(`${corsProxyURL}/${apiURL}/${endpoint}${options}`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${apiToken}`,
				origin: location.origin
			},
		});
		let json = await res.json();
		if (logs.fetch) {
			if (logs.alert) {
				alert(JSON.stringify(json));
			} else {
				console.log(json);
			}
		}
		return json;
	} catch (err) {
		console.error(err);
		if (logs.alert) alert(err);
		return null;
	}
}

setInterval(() => {
	document.querySelectorAll(".timeLeft").forEach(el => {
		el.innerHTML = TimeSheet.formatTime(TimeSheet.currentTime, { hour: false, minute: true, second: true });
	});
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
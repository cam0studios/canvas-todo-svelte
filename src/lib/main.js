import { writable, get } from "svelte/store";

import { highTimeSheet, middleTimeSheet, TimeSheet } from "../times";

export var apiToken = localStorage.getItem("api-token") || "";
export const apiURLs = [
	"https://hcpss.space/api/canvas/v1",
	"https://corsanywhere.vercel.app/hcpss.instructure.com/api/v1",
];
export var workingURL = -1;

export const todoStore = writable([]);
export const gradeStore = writable([]);
export const inboxStore = writable([]);

export var timesSchool = writable(
	parseInt(localStorage.getItem("times-school")) || 0
);
timesSchool.subscribe((value) => {
	localStorage.setItem("times-school", value.toString());
});

export function setToken(token) {
	apiToken = token;
	localStorage.setItem("api-token", token);
	updateStores();
}

updateStores();
export async function updateStores() {
	let stores = [todoStore, gradeStore, inboxStore, inboxStore];
	for (let store of stores) {
		store.set([]);
	}
	let funcs = [updateTodo, updateGrades, updateAnnouncements, updateInbox];
	funcs = funcs.map((func, i) => async () => {
		let store = stores[i];
		let current = get(store);
		current.push("loading");
		store.set(current);
		let res = await func();
		current = get(store);
		if (res?.error) {
			current = { error: res.error };
		} else if (!current?.error) {
			current.push(...res);
			if (current.includes("loading")) {
				current.splice(current.indexOf("loading"), 1);
			}
		}
		store.set(current);
		return res;
	});
	return await Promise.all(funcs.map((func) => func()));
}
export async function updateTodo() {
	let res = await getAPI("users/self/todo");
	if (res?.errors?.length > 0)
		return { error: res.errors.map((e) => e.message).join("<br>") };
	res.sort(
		(a, b) =>
			new Date(a.assignment.due_at).getTime() -
			new Date(b.assignment.due_at).getTime()
	);
	let data = res.map((element) => {
		let data = {
			due: new Date(element.assignment.due_at),
			name: element.assignment.name,
			className: element.context_name,
			url: element.html_url,
		};
		data.dueType = "";
		if (data.due.getTime() < new Date().getTime()) {
			data.dueType = "late";
		} else if (data.due.getDate() == new Date().getDate()) {
			data.dueType = "today";
		}
		return data;
	});
	return data;
}
export async function updateGrades() {
	let res = await getAPI(
		"users/self/courses",
		"enrollment_state=active&per_page=100&include%5B%5D=total_scores&include%5B%5D=current_grading_period_scores&include%5B%5D=grading_periods"
	);
	if (res?.errors?.length > 0)
		return { error: res.errors.map((e) => e.message).join("<br>") };
	res = res
		.map((course) => ({
			course,
			score: course.enrollments[0].current_period_computed_current_score,
		}))
		.map((course) => ({
			course: course.course,
			score: typeof course.score == "number" ? course.score : -1,
		}))
		.sort((a, b) => b.score - a.score)
		.map((data) => data.course);
	let data = res.map((element) => {
		let data = {
			grade: element.enrollments[0].current_period_computed_current_score,
			// grade: Math.round(Math.random() * 40 + 60),
			name: element.name,
			url: "https://hcpss.instructure.com/courses/" + element.id,
			gradeText: "",
			gradeType: "",
		};
		if (typeof data.grade != "number") {
			data.gradeText = "N/A";
		} else {
			data.gradeType = getGradeColor(data.grade);
			data.gradeText = data.grade + "%";
		}
		function getGradeColor(grade) {
			if (grade > 94.5) {
				return "reallygood";
			} else if (grade >= 89.5) {
				return "good";
			} else if (grade >= 79.5) {
				return "mid";
			} else if (grade >= 69.5) {
				return "bad";
			} else {
				return "reallybad";
			}
		}
		return data;
	});
	return data;
}
export async function updateAnnouncements() {
	let res = await getAPI(
		"users/self/courses",
		"enrollment_state=active&per_page=20"
	);
	if (res?.errors?.length > 0)
		return { error: res.errors.map((e) => e.message).join("<br>") };
	let res2 = await getAPI(
		"announcements",
		"per_page=20&" +
			res.map((course) => `context_codes[]=course_${course.id}`).join("&")
	);
	if (res2?.errors?.length > 0)
		return { error: res2.errors.map((e) => e.message).join("<br>") };
	let data = res2.map((element) => {
		let data = {
			type: "announcement",
			url: element.html_url,
			title: element.title,
			from: element.author.display_name,
			at: new Date(element.posted_at),
			shortMessage: element.message
				.replaceAll(/<[^>]*>/gi, " ")
				.replaceAll("&nbsp;", " ")
				.replaceAll("&amp;", "&")
				.replaceAll("↵", " ")
				.replaceAll("<br>", "\n")
				.replaceAll("<br/>", "\n")
				.trim(),
			message: element.message
				.replaceAll("<br>", "\n")
				.replaceAll("<br/>", "\n")
				.replaceAll(/<[^>]*>/gi, " ")
				.replaceAll("&nbsp;", " ")
				.replaceAll("&amp;", "&")
				.replaceAll("↵", "\n")
				.trim(),
		};
		if (data.shortMessage.length > 150) {
			data.shortMessage = data.shortMessage.substring(0, 150) + "...";
		}
		if (data.at.getTime() == 0) {
			data.at = new Date();
		}
		return data;
	});
	return data;
}
export async function updateInbox() {
	let res = await getAPI(
		"conversations",
		"enrollment_state=active&per_page=20"
	);
	if (res?.errors?.length > 0)
		return { error: res.errors.map((e) => e.message).join("<br>") };
	let data = res.map((element) => {
		let data = {
			type: "inbox",
			id: element.id,
			title: element.subject,
			from: element.context_name,
			at: new Date(element.last_message_at),
			shortMessage: element.last_message
				.replaceAll(/<[^>]*>/gi, " ")
				.replaceAll("&nbsp;", " ")
				.replaceAll("&amp;", "&")
				.replaceAll("↵", " ")
				.trim(),
		};
		if (data.shortMessage.length > 150) {
			data.shortMessage = data.shortMessage.substring(0, 150) + "...";
		}
		if (data.at.getTime() == 0) {
			data.at = new Date();
		}
		return data;
	});
	return data;
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
				origin: location.origin,
			},
		});
		let json = await res.json();
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
		await new Promise((resolve) => setTimeout(resolve, 1000));
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
				origin: location.origin,
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

highTimeSheet.updateDay();

setInterval(() => {
	let current =
		get(timesSchool) == 0 ? middleTimeSheet.current : highTimeSheet.current;
	if (current == null) {
		timeLeftStore.set("0:00");
		currentPeriodStore.set({ name: "none", start: 0, end: 0 });
		return;
	}
	timeLeftStore.set(
		TimeSheet.formatTime(current.timeLeft, {
			hour: current.timeLeft > 60,
			minute: true,
			second: true,
		})
	);
	currentPeriodStore.set(current.period);
}, 1000);

export const currentSectionStore = writable("none");
export const isMobile = writable(false);
let mobileMediaQuery = matchMedia("only screen and (max-width: 600px)");
if (mobileMediaQuery.matches) {
	isMobile.set(true);
} else {
	isMobile.set(false);
}
mobileMediaQuery.addEventListener("change", (e) => {
	isMobile.set(e.target.matches);
});
isMobile.subscribe((value) => {
	if (value && get(currentSectionStore) == "none") {
		currentSectionStore.set("todo");
	} else if (!value) {
		currentSectionStore.set("none");
	}
});

export const currentMessagesStore = writable({ subject: "", messages: [] });
export const currentAnnouncementStore = writable({ title: "", message: "" });

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

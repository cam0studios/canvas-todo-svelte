import { writable, get, derived } from "svelte/store";

import { highTimeSheet, middleTimeSheet, TimeSheet } from "../times";

if (window && location.href.includes("devtunnels") && location.href.includes("eruda") && !("eruda" in window)) {
	let script = document.createElement("script");
	script.src = "https://cdn.jsdelivr.net/npm/eruda";
	script.onload = () => {
		// @ts-ignore
		eruda.init();
	}
	document.head.appendChild(script);
}

export var apiToken = localStorage.getItem("api-token") || "";
export const apiURLs = [
	"https://hcpss.space/api/canvas/v1",
	"https://corsanywhere.vercel.app/hcpss.instructure.com/api/v1",
];
export var workingURL = -1;

export const todoStore = writable([]);
export const gradeStore = writable([]);
export const inboxStore = writable([]);

if ("Notification" in window && "setAppBadge" in navigator) {
	todoStore.subscribe((value) => {
		if (Array.isArray(value) && !value.includes("loading")) {
			if (localStorage.getItem("notification-badge") == "1") {
				navigator.setAppBadge(value.length);
			} else if (localStorage.getItem("notification-badge") == "2") {
				navigator.setAppBadge(value.filter((item) => item.dueType == "late").length);
			} else if (localStorage.getItem("notification-badge") == "3") {
				navigator.setAppBadge(value.filter((item) => item.dueType == "late" || item.dueType == "today").length);
			}
		} else {
			navigator.clearAppBadge();
		}
	});
} else {
	localStorage.setItem("notification-badge", "0");
}

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
			// @ts-ignore
			current = { error: res.error };
			// @ts-ignore
		} else if (!current?.error) {
			res.forEach(element => {
				if (current.find(e => e.id === element.id)) return;
				current.push(element);
			});
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
	let ret = await Promise.all(res.map(async (element) => {
		let res2 = await getAPI(`courses/${element.course_id}/assignments/${element.assignment.id}/submissions/self`);
		if (res2.grade > 0) return;

		let data = {
			due: new Date(element.assignment.due_at),
			name: element.assignment.name,
			className: element.context_name,
			url: element.html_url,
			id: element.assignment.id
		};
		data.dueType = "";
		if (data.due.getTime() < new Date().getTime()) {
			data.dueType = "late";
		} else if (data.due.getDate() == new Date().getDate()) {
			data.dueType = "today";
		}
		return data;
	}));
	ret = ret.filter((e) => e !== undefined);
	return ret;
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
			id: element.id
		};
		if (typeof data.grade != "number") {
			data.gradeText = "N/A";
		} else {
			data.gradeType = getGradeColor(data.grade);
			data.gradeText = data.grade + "%";
		}
		function getGradeColor(grade = 0) {
			if (grade >= 89.5) {
				return "green-grade";
			} else if (grade >= 79.5) {
				return "blue-grade";
			} else if (grade >= 69.5) {
				return "yellow-grade";
			} else if (grade >= 59.5) {
				return "orange-grade";
			} else {
				return "red-grade";
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
			title: element.title || "No title",
			from: element.author.display_name || "No sender",
			at: new Date(element.posted_at) || new Date(),
			shortMessage:
				element.message
					.replaceAll(/<[^>]*>/gi, " ")
					.replaceAll("&nbsp;", " ")
					.replaceAll("&amp;", "&")
					.replaceAll("↵", " ")
					.replaceAll("<br>", "\n")
					.replaceAll("<br/>", "\n")
					.trim() || "No message",
			message:
				element.message
					.replaceAll("<br>", "\n")
					.replaceAll("<br/>", "\n")
					.replaceAll(/<[^>]*>/gi, " ")
					.replaceAll("&nbsp;", " ")
					.replaceAll("&amp;", "&")
					.replaceAll("↵", "\n")
					.trim() || "No message",
			id: element.id
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
			title: element.subject || "No subject",
			from: element.context_name || "No sender",
			at: new Date(element.last_message_at) || new Date(),
			shortMessage:
				element.last_message
					.replaceAll(/<[^>]*>/gi, " ")
					.replaceAll("&nbsp;", " ")
					.replaceAll("&amp;", "&")
					.replaceAll("↵", " ")
					.trim() || "No message",
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
let lastTime = 0;
let updateTimeFunc = () => {
	if (Date.now() - lastTime < 250) {
		requestAnimationFrame(updateTimeFunc);
		return;
	}
	lastTime = Date.now();
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
	currentPeriodStore.set({
		name: current.period.name || "",
		...current.period,
	});
	requestAnimationFrame(updateTimeFunc);
}
updateTimeFunc();

export const currentSectionStore = writable("none");
export const isMobile = writable(false);
let mobileMediaQuery = matchMedia("only screen and (max-width: 600px)");
if (mobileMediaQuery.matches) {
	isMobile.set(true);
} else {
	isMobile.set(false);
}
mobileMediaQuery.addEventListener("change", (e) => {
	// @ts-ignore
	isMobile.set(e.target.matches);
});
isMobile.subscribe((value) => {
	if (value && get(currentSectionStore) == "none") {
		currentSectionStore.set("todo");
	} else if (!value) {
		currentSectionStore.set("none");
	}
});

export const timeLeftDetailedStore = derived([timeLeftStore, currentPeriodStore, isMobile], ([$timeLeftStore, $currentPeriodStore, $isMobile]) => {
	if ($isMobile) {
		if ($currentPeriodStore.name == "none") {
			return "No School";
		}
		return `${($currentPeriodStore.name.includes("Lunch") ? $currentPeriodStore.name.replace("Lunch", "") : $currentPeriodStore.name).trim()}-${$timeLeftStore}`;
	}
	if ($currentPeriodStore.name == "none") {
		return "Out of School";
	}
	return `${$timeLeftStore} left in ${$currentPeriodStore.name.includes("Lunch") ? $currentPeriodStore.name : `Period ${$currentPeriodStore.name}`}`;
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

// import { writable } from "svelte/store";

import { highTimeSheet, middleTimeSheet, TimeSheet } from "../times";

const apiToken = localStorage.getItem("api-token") || "";
// const corsProxyURL = "https://6ln2l6zp-8015.use.devtunnels.ms";
// const apiURL = "https://hcpss.instructure.com/api/v1";
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

// const todos = writable([]);

// function refreshTodos() {
//   getAPI("users/self/todo").then((data) => {
//     todos.set(data);
//   });
// }

export async function getSectionData(type = "") {
	if (type == "todo") {
		let res = await getAPI("users/self/todo");
		if (res?.errors?.length > 0) return { type: "error", message: res.errors.map(e => e.message).join("<br>") };
		return res.sort((a, b) => new Date(a.assignment.due_at).getTime() - new Date(b.assignment.due_at).getTime());
	}

	if (type == "grades") {
		let res = await getAPI("users/self/courses", "enrollment_state=active&per_page=100&include%5B%5D=total_scores&include%5B%5D=current_grading_period_scores&include%5B%5D=grading_periods");
		if (res?.errors?.length > 0) return { type: "error", message: res.errors.map(e => e.message).join("<br>") };
		return res
			.map((course) => ({ course, score: course.enrollments[0].current_period_computed_current_score }),)
			.map((course) => ({ course: course.course, score: typeof course.score == "number" ? course.score : -1 }),)
			.sort((a, b) => b.score - a.score)
			.map((data) => data.course);
	}

	if (type == "announcements") {
		let res = await getAPI("users/self/courses", "enrollment_state=active&per_page=100");
		if (res?.errors?.length > 0) return { type: "error", message: res.errors.map(e => e.message).join("<br>") };
		let res2 = await getAPI("announcements", "per_page=20&" + res
			.map((course) => `context_codes[]=course_${course.id}`)
			.join("&"));
		if (res2?.errors?.length > 0) return { type: "error", message: res2.errors.map(e => e.message).join("<br>") };
		return res2;
	}
	
	if (type == "inbox") {
		let res = await getAPI("conversations", "enrollment_state=active&per_page=100");
		if (res?.errors?.length > 0) return { type: "error", message: res.errors.map(e => e.message).join("<br>") };
		return res;
	}
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
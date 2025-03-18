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
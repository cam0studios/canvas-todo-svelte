<script>
	import { logs } from "../main";

	let { element } = $props();
	if (logs.todo) {
		if (logs.alert) {
			alert("todo\n" + JSON.stringify(element));
		} else {
			console.log("todo");
			console.log(element);
		}
	}
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
</script>

<a class="todo" href={data.url} target="_blank">
	<h3>{data.name}</h3>
	<p>{data.className}</p>
	<p class={data.dueType}>
		{data.due.toLocaleString(undefined, {
			timeStyle: "short",
			dateStyle: "full",
		})}
	</p>
</a>

<style>
	.todo {
		all: unset;
		& h3 {
			margin: 0;
			margin-bottom: 5px;
			font-size: 18px;
			font-weight: 600;
		}
		& p {
			margin: 0;
			margin-top: 3px;
			font-size: 15px;
		}
		& .late {
			color: rgb(220, 0, 0);
		}
		& .today {
			color: rgb(190, 160, 0);
		}
	}
</style>

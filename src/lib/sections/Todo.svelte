<script>
	import { logs } from "../main";

	let { element } = $props();
	if (logs.todo) {
		console.log("todo");
		console.log(element);
	}
</script>

<a class="todo" href={element.url} target="_blank">
	<h3>{element.name}</h3>
	<p>{element.className}</p>
	<p class={element.dueType}>
		{element.due.toLocaleString(undefined, {
			timeStyle: "short",
			dateStyle: "full",
		})}
	</p>
</a>

<style>
	.todo {
		all: unset;
		max-width: 100%;
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

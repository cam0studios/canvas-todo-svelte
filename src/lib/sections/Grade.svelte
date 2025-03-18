<script>
	import { logs } from "../main";

	let { element } = $props();
	if (logs.grade) {
		if (logs.alert) {
			alert("grade\n" + JSON.stringify(element));
		} else {
			console.log("grade");
			console.log(element);
		}
	}
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
</script>

<a class="grade" href={data.url + "/grades"} target="_blank">
	<h3>{data.name}</h3>
	<p class={data.gradeType}>{data.gradeText}</p>
	{#if typeof data.grade == "number"}
		<div class="outside">
			<div
				class="inside {data.gradeType}"
				style="width:{data.grade}%"
			></div>
		</div>
	{/if}
</a>

<style>
	.grade {
		--reallygood: rgb(30, 210, 20);
		--good: rgb(50, 150, 250);
		--mid: rgb(230, 210, 50);
		--bad: rgb(250, 120, 50);
		--reallybad: rgb(200, 0, 0);
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
			font-size: 16px;
			filter: brightness(0.5);
		}
		p.reallygood {
			color: var(--reallygood);
		}
		p.good {
			color: var(--good);
		}
		p.mid {
			color: var(--mid);
		}
		p.bad {
			color: var(--bad);
		}
		p.reallybad {
			color: var(--reallybad);
		}

		& .outside {
			width: 100%;
			height: 10px;
			background-color: rgb(230, 230, 230);
			border-radius: 10px;
			margin-top: 5px;
			display: block;
			padding: 0;
		}
		& .inside {
			height: 10px;
			margin: 0;
			border-radius: 10px;
		}
		.inside.reallygood {
			background-color: var(--reallygood);
		}
		.inside.good {
			background-color: var(--good);
		}
		.inside.mid {
			background-color: var(--mid);
		}
		.inside.bad {
			background-color: var(--bad);
		}
		.inside.reallybad {
			background-color: var(--reallybad);
		}
	}
</style>

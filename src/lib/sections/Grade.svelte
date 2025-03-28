<script>
	import { logs } from "../main";

	let { element } = $props();
	if (logs.grade) {
			console.log("grade");
			console.log(element);
	}
</script>

<a class="grade" href={element.url + "/grades"} target="_blank">
	<h3>{element.name}</h3>
	<p class={element.gradeType}>{element.gradeText}</p>
	{#if typeof element.grade == "number"}
		<progress class="progress progress-primary {element.gradeType}" max="100" value={element.grade}></progress>
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
		max-width: 100%;
		padding-bottom: 0;
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

		progress {
			margin-bottom: 0;
		}

		progress.reallygood {
			color: var(--reallygood);
		}
		progress.good {
			color: var(--good);
		}
		progress.mid {
			color: var(--mid);
		}
		progress.bad {
			color: var(--bad);
		}
		progress.reallybad {
			color: var(--reallybad);
		}
	}
</style>

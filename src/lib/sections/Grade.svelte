<script>
	let { element } = $props();
</script>

<a class="grade" href={element.url + "/grades"} target="_blank">
	<h3>{element.name}</h3>
	<p class={element.gradeType}>{element.gradeText}</p>
	{#if typeof element.grade == "number"}
		<progress
			class="progress progress-primary {element.gradeType}"
			max="100"
			value={element.grade}
		></progress>
	{/if}
</a>

<style>
	.grade {
		--green-grade: rgb(30, 210, 20);
		--blue-grade: rgb(50, 150, 250);
		--yellow-grade: rgb(230, 210, 50);
		--orange-grade: rgb(250, 120, 50);
		--red-grade: rgb(200, 0, 0);
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
		p.green-grade {
			color: var(--green-grade);
		}
		p.blue-grade {
			color: var(--blue-grade);
		}
		p.yellow-grade {
			color: var(--yellow-grade);
		}
		p.orange-grade {
			color: var(--orange-grade);
		}
		p.red-grade {
			color: var(--red-grade);
		}

		progress {
			margin-bottom: 0;
		}

		progress.green-grade {
			color: var(--green-grade);
		}
		progress.blue-grade {
			color: var(--blue-grade);
		}
		progress.yellow-grade {
			color: var(--yellow-grade);
		}
		progress.orange-grade {
			color: var(--orange-grade);
		}
		progress.red-grade {
			color: var(--red-grade);
		}
	}
</style>

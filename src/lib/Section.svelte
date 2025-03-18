<script>
	/**
	 * @typedef {Object} SectionProperties
	 * @property {String} api Path of API Request
	 * @property {String} type Type of section ("Todo", "Calendar", "Grades", etc.)
	 * @property {String} name Title of section
	 * @property {String} [options=""] Options for API Request
	 */

	/** @type {SectionProperties}*/
	let { api, type, name, options = "" } = $props();
	import { getAPI } from "./main";
	import Todo from "./sections/Todo.svelte";
	import Grade from "./sections/Grade.svelte";
	import Announcement from "./sections/Announcement.svelte";
	import Inbox from "./sections/Inbox.svelte";
</script>

<div class="section" id={type}>
	<h1>{name}</h1>
	{#await getAPI(api, options)}
		<p class="loading">Loading...</p>
	{:then data}
		{#if data?.errors?.length > 0}
			<p class="error">
				{data.errors.map((error) => error.message).join("<br>")}
			</p>
		{:else if type == "todo"}
			{#each data.sort((a, b) => new Date(a.assignment.due_at).getTime() - new Date(b.assignment.due_at).getTime()) as element}
				<div class="sectionItem"><Todo {element} /></div>
			{/each}
		{:else if type == "grades"}
			{#each data
				.map( (course) => ({ course, score: course.enrollments[0].current_period_computed_current_score }), )
				.map( (course) => ({ course: course.course, score: typeof course.score == "number" ? course.score : -1 }), )
				.sort((a, b) => b.score - a.score)
				.map((data) => data.course) as element}
				<div class="sectionItem"><Grade {element} /></div>
			{/each}
		{:else if type == "announcements"}
			{#await getAPI("announcements", "per_page=20&" + data
						.map((course) => `context_codes[]=course_${course.id}`)
						.join("&"))}
				<p class="loading">Loading...</p>
			{:then announcements}
				{#each announcements as element}
					<div class="sectionItem"><Announcement {element} /></div>
				{/each}
			{/await}
		{:else if type == "inbox"}
			{#each data as element}
				<div class="sectionItem"><Inbox {element} /></div>
			{/each}
		{:else}
			<p>Section not found</p>
		{/if}
	{:catch error}
		<p>Error: {error}</p>
	{/await}
</div>

<style>
	#todo {
		left: 0;
	}
	#grades {
		left: 25%;
	}
	#announcements {
		left: 50%;
	}
	#inbox {
		left: 75%;
	}
	.section {
		width: 25%;
		height: 100vh;
		background-color: transparent;
		position: absolute;
		margin: 0;
		box-sizing: border-box;
		overflow-y: scroll;
		overflow-x: hidden;
		border: none;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		& h1 {
			font-size: 35px;
			font-weight: 500;
			margin: 10px;
			margin-bottom: 5px;
		}
		/* &:nth-of-type(2),
		&:nth-of-type(4),
		&:nth-of-type(6),
		&:nth-of-type(8) {
			background-color: rgb(255, 255, 255);
		} */
	}
	.sectionItem {
		width: calc(100% - 10px);
		max-width: 300px;
		box-sizing: border-box;
		border: 1px solid black;
		border-radius: 5px;
		padding: 10px;
		margin: 5px;
		cursor: pointer;
		background-color: white;
		box-shadow: 0px 0px 5px rgb(0, 0, 0, 0.4);
		text-align: center;
		/* width: 100%; */
		&:hover {
			background-color: rgb(250, 250, 250);
			box-shadow: 0px 0px 10px rgb(0, 0, 0, 0.6);
		}
	}
	.error {
		color: rgb(240, 50, 0);
		font-size: 17px;
		font-weight: 500;
		padding: 20px;
	}
	.loading {
		padding: 20px;
	}
</style>

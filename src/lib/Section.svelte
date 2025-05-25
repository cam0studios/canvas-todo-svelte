<script>
	/**
	 * @typedef {Object} SectionProperties
	 * @property {String} type Type of section ("Todo", "Calendar", "Grades", etc.)
	 * @property {String} name Title of section
	 */

	/** @type {SectionProperties}*/
	let { type, name } = $props();
	import {
		todoStore,
		gradeStore,
		inboxStore,
		currentSectionStore,
	} from "./main";
	import Todo from "./sections/Todo.svelte";
	import Grade from "./sections/Grade.svelte";
	import Inbox from "./sections/Inbox.svelte";

	let click = (ev) => {
		if (!ev.isTrusted) return;
		ev.target.firstElementChild?.click();
	};
</script>

<div
	class="section {$currentSectionStore == type ? 'active' : 'inactive'}"
	id={type}
>
	<h1>{name}</h1>
	{#if type == "todo"}
		{#if $todoStore == null}
			<p class="loading">Loading...</p>
		{:else if $todoStore?.error}
			<p class="error">{$todoStore.error}</p>
		{:else}
			{#each $todoStore as element}
				{#if element == "loading"}
					<p class="loading">Loading...</p>
				{:else}
					<div class="sectionItem" onclick={click}>
						<Todo {element} />
					</div>
				{/if}
			{/each}
		{/if}
	{:else if type == "grades"}
		{#if $gradeStore == null}
			<p class="loading">Loading...</p>
		{:else if $gradeStore?.error}
			<p class="error">{$todoStore.error}</p>
		{:else}
			{#each $gradeStore as element}
				{#if element == "loading"}
					<p class="loading">Loading...</p>
				{:else}
					<div class="sectionItem" onclick={click}>
						<Grade {element} />
					</div>
				{/if}
			{/each}
		{/if}
	{:else if type == "inbox"}
		{#if $inboxStore == null}
			<p class="loading">Loading...</p>
		{:else if $inboxStore?.error}
			<p class="error">{$todoStore.error}</p>
		{:else}
			{#each $inboxStore.filter((e) => e == "loading")}
				<p class="loading">Loading...</p>
			{/each}
			{#each $inboxStore
				.filter((e) => e != "loading")
				.sort((a, b) => b.at.getTime() - a.at.getTime()) as element}
				<div class="sectionItem" onclick={click}>
					<Inbox {element} />
				</div>
			{/each}
		{/if}
	{:else}
		<p>Section not found</p>
	{/if}
</div>

<style>
	#todo {
		left: 0;
	}
	#grades {
		left: 33%;
	}
	#inbox {
		left: 66%;
	}
	.section {
		width: 33%;
		height: 100%;
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
		@media only screen and (max-width: 600px) {
			display: none;
			left: 0 !important;
			width: 100%;
  			padding-top: calc(env(safe-area-inset-top) * 0.7);
			&.active {
				display: flex;
			}
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
		max-width: 350px;
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
	.loading:nth-of-type(1) {
		padding: 20px;
		display: unset;
	}
	.loading {
		display: none;
	}
</style>

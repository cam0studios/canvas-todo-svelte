<script>
	/**
	 * @typedef {Object} SectionProperties
	 * @property {String} type Type of section ("Todo", "Calendar", "Grades", etc.)
	 * @property {String} name Title of section
	 */

	/** @type {SectionProperties}*/
	let { type, name } = $props();
	import {
		updateStores,
		todoStore,
		gradeStore,
		announcementStore,
		inboxStore,
	} from "./main";
	import Todo from "./sections/Todo.svelte";
	import Grade from "./sections/Grade.svelte";
	import Announcement from "./sections/Announcement.svelte";
	import Inbox from "./sections/Inbox.svelte";
</script>

<div class="section" id={type}>
	<h1>{name}</h1>
	{#if type == "todo"}
		{#if $todoStore == null}
			<p class="loading">Loading...</p>
		{:else if $todoStore?.error}
			<p class="error">{$todoStore.error}</p>
		{:else}
			{#each $todoStore as element}
				<div class="sectionItem"><Todo {element} /></div>
			{/each}
		{/if}
	{:else if type == "grades"}
		{#if $gradeStore == null}
			<p class="loading">Loading...</p>
		{:else if $gradeStore?.error}
			<p class="error">{$todoStore.error}</p>
		{:else}
			{#each $gradeStore as element}
				<div class="sectionItem"><Grade {element} /></div>
			{/each}
		{/if}
	{:else if type == "announcements"}
		{#if $announcementStore == null}
			<p class="loading">Loading...</p>
		{:else if $announcementStore?.error}
			<p class="error">{$todoStore.error}</p>
		{:else}
			{#each $announcementStore as element}
				<div class="sectionItem"><Announcement {element} /></div>
			{/each}
		{/if}
	{:else if type == "inbox"}
		{#if $inboxStore == null}
			<p class="loading">Loading...</p>
		{:else if $inboxStore?.error}
			<p class="error">{$todoStore.error}</p>
		{:else}
			{#each $inboxStore as element}
				<div class="sectionItem"><Inbox {element} /></div>
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

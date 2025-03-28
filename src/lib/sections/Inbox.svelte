<script>
	import { getAPI, logs } from "../main";

	let { element } = $props();
	if (logs.inbox) {
		console.log(element.type);
		console.log(element);
	}
</script>

{#snippet content()}
	<h3>{element.title}</h3>
	<p>{element.type == "inbox" ? "Inbox" : "Announcement"} - {element.from}</p>
	<p>{element.at.toLocaleString(undefined, {
		timeStyle: "short",
		dateStyle: "full",
	})}</p>
	<p>{element.shortMessage}</p>
{/snippet}

{#if element.type == "inbox"}
	<button
		class="inbox"
		onclick={async () => {
			getAPI("inbox");
		}}
	>
		{@render content()}
	</button>
{:else if element.type == "announcement"}
	<a href={element.url} class="inbox" target="_blank">
		{@render content()}
	</a>
{:else}
	<p>Unknown type</p>
{/if}

<style>
	.inbox {
		all: unset;
		max-width: 100%;
		word-wrap: break-word;
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
	}
</style>

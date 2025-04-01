<script>
    import { mount } from "svelte";
	import { currentMessagesStore, currentAnnouncementStore, getAPI, logs } from "../main";
    import Popup from "../Popup.svelte";
    import { get } from "svelte/store";

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
		currentMessagesStore.set({ subject: `Loading "${element.title}"...`, messages: [] });
			document.getElementById("view-messages").showModal();
			getAPI(`conversations/${element.id}`)
			.then(data => {
				let messages = data.messages
				.toReversed()
				.map(message => {
					return {
						body: message.body.replaceAll("<br>", "\n")
							.replaceAll("<br/>", "\n")
							.replaceAll(/<[^>]*>/gi, " ")
							.replaceAll("&nbsp;", " ")
							.replaceAll("&amp;", "&")
							.replaceAll("↵", "\n")
							.trim(),
						from: data.participants.find(e => e.id == message.author_id).name,
						at: new Date(message.created_at),
					};
				});
				currentMessagesStore.set({ subject: data.subject, messages });
			});
		}}
	>
		{@render content()}
	</button>
{:else if element.type == "announcement"}
	<!-- <a href={element.url} class="inbox" target="_blank"> -->
	 <button class="inbox" onclick={() => {
		currentAnnouncementStore.set({ title: element.title, message: element.message })
		document.getElementById("view-announcement").showModal();;
	 }}>
		{@render content()}
	</button>
	<!-- </a> -->
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

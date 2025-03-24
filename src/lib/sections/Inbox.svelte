<script>
    import { logs } from "../main";

	let { element } = $props();
	if (logs.inbox) {
			console.log("inbox");
			console.log(element);
	}
	let data = {
		title: element.subject,
		course: element.context_name,
		postedAt: new Date(element.last_message_at),
		shortMessage: element.last_message
			.replaceAll(/<[^>]*>/gi, " ")
			.replaceAll("&nbsp;", " ")
			.replaceAll("&amp;", "&")
			.replaceAll("↵", " ")
			.trim(),
	};
	if (data.shortMessage.length > 150) {
		data.shortMessage = data.shortMessage.substring(0, 150) + "...";
	}
</script>

<button
	class="inbox"
	onclick={() => {
		document.getElementById("dialog").showModal();
	}}
>
	<h3>{data.title}</h3>
	<p>{data.course}</p>
	<p>{data.shortMessage}</p>
</button>

<style>
	.inbox {
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
	}
</style>

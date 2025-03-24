<script>
    import { logs } from "../main";

	let { element } = $props();
	if (logs.announcement) {
			console.log("announcement");
			console.log(element);
	}
	let data = {
		url: element.html_url,
		title: element.title,
		postedBy: element.author.display_name,
		postedAt: new Date(element.posted_at),
		shortMessage: element.message
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

<a class="announcement" href={data.url} target="_blank">
	<h3>{data.title}</h3>
	<p>{data.postedBy}</p>
	<p>{data.shortMessage}</p>
</a>

<style>
	.announcement {
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

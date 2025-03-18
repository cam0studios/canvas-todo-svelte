<script>
	import Sidebar from "./lib/Sidebar.svelte";
	import Section from "./lib/Section.svelte";
	import Popup from "./lib/Popup.svelte";
</script>

<Sidebar />
<div id="content">
	<Section type="todo" name="To-Do"></Section>
	<Section
		type="grades"
		name="Grades"
	></Section>
	<Section
		type="announcements"
		name="Announcements"
	></Section>
	<Section
		type="inbox"
		name="Inbox"
	></Section>
	<Popup id="settings" title="Settings" type="settings"/>
</div>

<style>
	@import url("https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap");
	:root {
		font-family: "Nunito Sans";
	}
	#content {
		width: calc(100% - 60px);
		height: 100%;
		background-color: rgb(245, 245, 245);
		position: fixed;
		top: 0;
		right: 0;
		z-index: 2;
		box-sizing: border-box;
		padding: 0;
	}
</style>

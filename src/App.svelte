<script>
	import Sidebar from "./lib/Sidebar.svelte";
	import Section from "./lib/Section.svelte";
	import Popup from "./lib/Popup.svelte";
</script>

<Sidebar />
<div id="content">
	<Section api="users/self/todo" type="todo" name="To-Do"></Section>
	<Section
		api="users/self/courses"
		type="grades"
		name="Grades"
		options="enrollment_state=active&per_page=100&include%5B%5D=total_scores&include%5B%5D=current_grading_period_scores&include%5B%5D=grading_periods"
	></Section>
	<Section
		api="users/self/courses"
		type="announcements"
		name="Announcements"
		options="enrollment_state=active&per_page=100"
	></Section>
	<Section
		api="conversations"
		type="inbox"
		name="Inbox"
		options="enrollment_state=active&per_page=100"
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

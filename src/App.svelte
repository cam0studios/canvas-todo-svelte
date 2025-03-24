<script>
	import Sidebar from "./lib/Sidebar.svelte";
	import Section from "./lib/Section.svelte";
	import Popup from "./lib/Popup.svelte";
	import { setToken, timesSchool } from "./lib/main";
	import { highTimeSheet, middleTimeSheet } from "./times";
</script>

<Sidebar />
<div id="content">
	<Section type="todo" name="To-Do"></Section>
	<Section type="grades" name="Grades"></Section>
	<Section type="announcements" name="Announcements"></Section>
	<Section type="inbox" name="Inbox"></Section>
	<Popup id="settings" title="Settings">
		{#snippet content()}
			<fieldset class="fieldset">
				<legend class="fieldset-legend">API Key</legend>
				<input
					type="text"
					class="input"
					value={localStorage.getItem("api-token") || "API token"}
					oninput={(input) => {
						setToken(input.target.value);
					}}
				/>
				<p class="fieldset-label">
					Generate one
					<a
						href="https://hcpss.instructure.com/profile/settings"
						target="_blank"
						class="link">here</a
					>
				</p>
			</fieldset>
		{/snippet}
	</Popup>
	<Popup id="times" title="Times Settings">
		{#snippet content()}
			<fieldset class="fieldset">
				<legend class="fieldset-legend">School</legend>
				<select
					class="select"
					oninput={(input) => {
						timesSchool.set(input.target.value);
					}}
				>
					<option value={0} selected={$timesSchool == 0}
						>Middle</option
					>
					<option value={1} selected={$timesSchool == 1}>High</option>
				</select>
			</fieldset>
			{#if $timesSchool == 0}
				{@render middle()}
			{:else if $timesSchool == 1}
				{@render high()}
			{/if}
		{/snippet}
	</Popup>
</div>

{#snippet middle()}
	<fieldset class="fieldset">
		<legend class="fieldset-legend">Grade</legend>
		<select
			class="select"
			oninput={(input) => {
				middleTimeSheet.grade = input.target.value;
			}}
		>
			<option value={0}>6th</option>
			<option value={1}>7th</option>
			<option value={2}>8th</option>
		</select>
	</fieldset>
{/snippet}

{#snippet high()}
	<fieldset class="fieldset">
		<legend class="fieldset-legend">Day</legend>
		<select
			class="select"
			oninput={(input) => {
				highTimeSheet.day = input.target.value;
			}}
		>
			<option value={0} selected={highTimeSheet.day == 0}> A Day </option>
			<option value={1} selected={highTimeSheet.day == 1}> B Day </option>
		</select>
		<table class="table">
			<thead>
				<tr>
					<th>
						<legend class="fieldset-legend">A Day Lunch</legend>
					</th>
					<th>
						<legend class="fieldset-legend">B Day Lunch</legend>
					</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>
						<select
							class="select"
							oninput={(input) => {
								highTimeSheet.lunchDays[0] = input.target.value;
							}}
						>
							{@render highLunch(0, 0)}
							{@render highLunch(0, 1)}
							{@render highLunch(0, 2)}
							{@render highLunch(0, 3)}
						</select>
					</td>
					<td>
						<select
							class="select"
							oninput={(input) => {
								highTimeSheet.lunchDays[1] = input.target.value;
							}}
						>
							{@render highLunch(1, 0)}
							{@render highLunch(1, 1)}
							{@render highLunch(1, 2)}
							{@render highLunch(1, 3)}
						</select>
					</td>
				</tr>
			</tbody>
		</table>
	</fieldset>
{/snippet}

{#snippet highLunch(day, val)}
	<option value={val} selected={highTimeSheet.lunchDays[day] == val}>
		{["A", "B", "C", "D"][val] + " Lunch"}
	</option>
{/snippet}

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
	.table th {
		padding-bottom: 5px;
		& legend {
			padding-bottom: 0;
		}
	}
	legend {
		font-size: 13px;
		margin-left: 10px;
	}
</style>

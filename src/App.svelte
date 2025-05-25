<script>
	import Sidebar from "./lib/Sidebar.svelte";
	import Section from "./lib/Section.svelte";
	import Popup from "./lib/Popup.svelte";
	import {
		setToken,
		timesSchool,
		currentMessagesStore,
		currentAnnouncementStore,
        updateStores,
	} from "./lib/main";
	import { highTimeSheet, middleTimeSheet } from "./times";
</script>

<Sidebar />
<div id="content">
	<Section type="todo" name="To-Do"></Section>
	<Section type="grades" name="Grades"></Section>
	<Section type="inbox" name="Inbox"></Section>
	<Popup id="settings" title="Settings">
		{#snippet content()}
			<fieldset class="fieldset">
				<legend class="fieldset-legend">API Key</legend>
				<input
					type="text"
					class="input"
					value={localStorage.getItem("api-token") || ""}
					placeholder="API token"
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

				<legend class="fieldset-legend">Notification Badge</legend>
				<select name="notification-badge" id="notification-badge" class="select" disabled={!("Notification" in window) || Notification?.permission == "denied"} oninput={(input) => {
					if ((input.target.value != "0" && Notification?.permission !== "granted") || !("Notification" in window)) {
						Notification.requestPermission().then((permission) => {
							if (permission === "granted") {
								localStorage.setItem("notification-badge", input.target.value);
								updateStores();
							} else {
								localStorage.setItem("notification-badge", "0");
								document.querySelector("#notification-badge").value = "0";
							}
						});
					} else {
						localStorage.setItem("notification-badge", input.target.value);
						if (input.target.value == "0") {
							navigator.clearAppBadge();
						} else {
							updateStores();
						}
					}
				}}>
					<option value="0" selected={localStorage.getItem("notification-badge") == "0" || localStorage.getItem("notification-badge") == null}
						>None</option
					>
					<option value="1" selected={localStorage.getItem("notification-badge") == "1"}
						>Todo</option
					>
				</select>
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
	<Popup id="view-messages" title={$currentMessagesStore.subject}>
		{#snippet content()}
			{#each $currentMessagesStore.messages as message}
				<h2>
					{message.from} - {message.at.toLocaleString(undefined, {
						timeStyle: "short",
						dateStyle: "full",
					})}
				</h2>
				<div>
					{#each message.body.split("\n") as line}
						<p>{line}</p>
					{/each}
				</div>
			{/each}
			<style>
				h2 {
					margin-top: 10px;
					font-weight: 600;
				}
				p {
					padding-left: 10px;
				}
			</style>
		{/snippet}
	</Popup>
	<Popup id="view-announcement" title={$currentAnnouncementStore.title}>
		{#snippet content()}
			<div>
				{#each $currentAnnouncementStore.message.split("\n") as line}
					<p>{line}</p>
				{/each}
			</div>
			<style>
				h2 {
					margin-top: 10px;
					font-weight: 600;
				}
				p {
					padding-left: 10px;
				}
			</style>
		{/snippet}
	</Popup>
</div>

{#snippet middle()}
	<fieldset class="fieldset">
		<legend class="fieldset-legend">Schedule</legend>
		<select
			class="select"
			oninput={(input) => {
				middleTimeSheet.schedule = input.target.value;
			}}
		>
			<option value={0} selected={middleTimeSheet.schedule == 0}
				>Normal</option
			>
			<option value={1} selected={middleTimeSheet.schedule == 1}
				>Eagle Time</option
			>
			<option value={2} selected={middleTimeSheet.schedule == 2}
				>Half Day</option
			>
			<option value={3} selected={middleTimeSheet.schedule == 3}
				>2 Hour Delay</option
			>
		</select>
		<legend class="fieldset-legend">Grade</legend>
		<select
			class="select"
			oninput={(input) => {
				middleTimeSheet.grade = input.target.value;
			}}
		>
			<option value={0} selected={middleTimeSheet.grade == 0}>6th</option>
			<option value={1} selected={middleTimeSheet.grade == 1}>7th</option>
			<option value={2} selected={middleTimeSheet.grade == 2}>8th</option>
		</select>
	</fieldset>
{/snippet}

{#snippet high()}
	<fieldset class="fieldset">
		<legend class="fieldset-legend">Schedule</legend>
		<select
			class="select"
			oninput={(input) => {
				highTimeSheet.schedule = input.target.value;
			}}
		>
			<option value={0} selected={highTimeSheet.schedule == 0}
				>Normal</option
			>
			<option value={1} selected={highTimeSheet.schedule == 1}
				>Lions' Time</option
			>
			<option value={2} selected={highTimeSheet.schedule == 2}
				>Half Day</option
			>
			<option value={3} selected={highTimeSheet.schedule == 3}
				>2 Hour Delay</option
			>
		</select>
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
		min-height: calc(100% + env(safe-area-inset-top));
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
		@media only screen and (max-width: 600px) {
			width: 100%;
			height: calc(100% - 90px) !important;
		}
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

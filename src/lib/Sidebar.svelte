<script>
	import SidebarItem from "./SidebarItem.svelte";
	import { currentSectionStore } from "./main";

	const sidebarItems = [
		{
			hover: "Open Canvas",
			url: "https://hcpss.instructure.com",
			icon: "https://instructure-uploads.s3.amazonaws.com/account_31230000000000001/attachments/1943770/HCPSS-home2.png?AWSAccessKeyId=AKIAJFNFXH2V2O7RPCAA&Expires=1938068198&Signature=NmotABSeWKTiSUM4TdKOlqvPQrU%3D&response-cache-control=Cache-Control%3Amax-age%3D473364000.0%2C%20public&response-expires=473364000.0",
			iconType: "image",
		},
		{
			hover: "Settings",
			click: () => {
				// @ts-ignore
				document.querySelector("#settings").showModal();
			},
			icon: "nf nf-fa-gear",
			iconType: "icon",
		},
		{
			hover: "$timedata",
			click: () => {
				// @ts-ignore
				document.querySelector("#times").showModal();
			},
			icon: "nf nf-fa-clock",
			iconType: "icon",
		},
	];
	const dockItems = [
		...[
			{
				hover: "Todo",
				section: "todo",
				icon: "nf nf-fa-list",
				iconType: "icon",
			},
			{
				hover: "Grades",
				section: "grades",
				icon: "nf nf-md-file_certificate",
				iconType: "icon",
			},
			{
				hover: "Inbox",
				section: "inbox",
				icon: "nf nf-fa-inbox",
				iconType: "icon",
			},
		],
		...sidebarItems.filter((e) => !("url" in e)),
	];
</script>

<div id="sidebar">
	{#each sidebarItems as { hover, url, click, icon, iconType }}
		<SidebarItem {hover} {url} {click} {icon} {iconType} />
	{/each}
</div>
<div class="dock dock-sm">
	{#each dockItems as { hover, url, click, icon, iconType, section }}
		<SidebarItem
			{hover}
			{url}
			click={section ?
				() => {
					currentSectionStore.set(section);
				}
			:	click}
			{icon}
			{iconType}
			selected={$currentSectionStore == section}
		/>
	{/each}
</div>

<style>
	#sidebar {
		width: 60px;
		height: 100vh;
		background-color: rgb(57, 75, 88);
		position: fixed;
		top: 0;
		left: 0;
		z-index: 3;
		box-sizing: border-box;
		padding: 0;
		@media only screen and (max-width: 600px) {
			display: none;
		}
	}

	.dock {
		display: none;
		color: white;
		background-color: rgb(57, 75, 88);
		z-index: 1000;
		padding: 0;
		padding-bottom: calc(env(safe-area-inset-bottom) / 2);
		padding-left: calc(env(safe-area-inset-bottom) / 2);
		padding-right: calc(env(safe-area-inset-bottom) / 2);
		
		@media only screen and (max-width: 600px) {
			display: flex !important;
		}
	}
</style>

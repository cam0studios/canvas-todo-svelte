<script>
	import SidebarItem from "./SidebarItem.svelte";
	import { middleTimeSheet, highTimeSheet } from "../times";
    import { logs } from "./main";
    import Popup from "./Popup.svelte";

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
				document.querySelector("#settings").showModal();
			},
			icon: "nf nf-fa-gear",
			iconType: "icon",
		},
		{
			hover: "$timeLeft left in $period",
			click: () => {
				document.querySelector("#times").showModal();
			},
			icon: "nf nf-fa-clock",
			iconType: "icon",
		},
	];
</script>

<div id="sidebar">
	{#each sidebarItems as { hover, url, click, icon, iconType }}
		<SidebarItem {hover} {url} {click} {icon} {iconType} />
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
	}
</style>

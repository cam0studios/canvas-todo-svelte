<script>
	import { currentPeriodStore, isMobile, timeLeftStore } from "./main";

	let { hover, click, url, icon, iconType, selected = false } = $props();
</script>

{#snippet item(icon, iconType)}
	{#if iconType == "image"}
		<img src={icon} alt={icon} />
	{:else}
		<i class={icon}></i>
	{/if}
	{#if $isMobile}
		<p class="dock-label">
			{hover.replaceAll("$timedata", $timeLeftStore)}
		</p>
	{/if}
{/snippet}

<div class="sidebarItem {selected ? 'dock-active' : ''}" data-hover={hover}>
	{#if url}
		<a href={url} target="_blank">
			{@render item(icon, iconType)}
		</a>
	{:else}
		<button onclick={click}>
			{@render item(icon, iconType)}
		</button>
	{/if}
	<p>
		{hover.replaceAll("$timedata", `${$timeLeftStore} left in ${$currentPeriodStore.name.includes("Lunch") ? $currentPeriodStore.name : `Period ${$currentPeriodStore.name.replace("Lunch", "").trim()}`}`)}
	</p>
</div>

<style>
	.sidebarItem {
		all: none;
		appearance: none;
		display: flex;
		padding: 10px;
		padding-left: 0;
		padding-right: 0;
		cursor: pointer;
		width: 60px;
		height: 55px;
		align-items: center;
		justify-content: center;
		position: relative;
		z-index: 5;
		&:hover {
			background-color: rgba(0, 0, 0, 0.1);
			& > p {
				left: 70px;
				opacity: 1;
			}
		}
		&.dock-active {
			background-color: rgba(0, 0, 0, 0.1);
		}
		& .dock-label {
			font-size: 12px !important;
			padding: 0;
		}
		&:first-of-type {
			height: 85px;
		}
		& button,
		& a {
			all: inherit;
			background-color: transparent;
			width: 100%;
			padding: 0;
			@media only screen and (max-width: 600px) {
				margin: 0;
				height: 50px !important;
			}
		}
		& i {
			color: white;
			font-size: 25px;
			background-color: transparent;
		}
		& img {
			height: 40px;
			width: max-content;
			@media only screen and (max-width: 600px) {
				height: 30px;
				width: auto;
			}
		}
		& > p {
			position: absolute;
			width: max-content;
			left: -120px;
			transition: 0.2s;
			z-index: 2;
			background-color: rgb(40, 160, 255);
			padding: 10px;
			padding-bottom: 8px;
			border-radius: 7px;
			color: white;
			font-size: 15px;
			opacity: 0;

			@media only screen and (max-width: 600px) {
				display: none;
			}
		}

		@media only screen and (max-width: 600px) {
			margin: 0;
			height: 100% !important;
			width: 70px;
			padding: 0;
		}
	}
</style>

<script>
	let { hover, click, url, icon, iconType } = $props();
</script>

{#snippet item(icon, iconType)}
	{#if iconType == "image"}
		<img src={icon} alt={icon} />
	{:else}
		<i class={icon}></i>
	{/if}
{/snippet}

<div class="sidebarItem" data-hover={hover}>
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
		{hover}
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
		&:first-of-type {
			height: 85px;
		}
		& button,
		& a {
			all: inherit;
			background-color: transparent;
			width: 100%;
			padding: 0;
		}
		& i {
			color: white;
			font-size: 25px;
			background-color: transparent;
		}
		& img {
			height: 40px;
			width: max-content;
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
		}
	}
</style>

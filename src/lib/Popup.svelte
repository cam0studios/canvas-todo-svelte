<script>
	import { onMount } from "svelte";

	let { id, title, content, show = false } = $props();
	onMount(() => {
		const dialog = document.getElementById(id);
		if (show) {
			dialog.showModal();
		}
	});
</script>

<dialog {id} class="modal">
	<div class="modal-box">
		<form method="dialog">
			<button
				class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
				>✕</button
			>
		</form>
		<h3 class="text-lg font-bold">{title}</h3>
		<div class="modal-content">
			{@render content()}
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>

<style>
	.modal-content {
		word-wrap: break-word;
	}
	.modal-box {
		max-height: 90vh;
	}
</style>

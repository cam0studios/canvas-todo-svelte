<script>
	let { id, title, content } = $props();
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
		<div>
			{@render content()}
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>

<style>
</style>

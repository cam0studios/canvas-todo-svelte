<script>
	import { setToken } from "./main";

	let { id, title, type } = $props();
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
			{#if type == "settings"}
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
						Generate one <a
							href="https://hcpss.instructure.com/profile/settings"
							target="_blank">here</a
						>
					</p>
				</fieldset>
			{:else}
				<p>Popup</p>
			{/if}
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>

<style>
</style>

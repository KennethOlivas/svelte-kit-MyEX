<svelte:options accessors />

<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	export let btnName;
	export let icon;
	export let title;
	let modal = false;

	export const openModal = () => {
		modal = true;
	};

	export const closeModal = () => {
		modal = false;
		dispatch('closeModal');
	};

	const handleKeydown = (e) => {
		let code = e.keyCode;
		if (code === 27) {
			closeModal();
		}
	};
</script>

<svelte:window on:keydown={handleKeydown} />
<label
	for="my-modal-3"
	class="{btnName ? '' : 'hidden'} btn btn-info hover:bg-blue-600 my-4 mx-4 modal-button"
	><i class="{icon} mr-2 text-lg" />{btnName}</label
>
<input type="checkbox" bind:checked={modal} id="my-modal-3" class="modal-toggle" />
<div class="modal ">
	<div class="modal-box max-w-lg md:max-w-4xl lg:max-w-5xl overscroll-auto overflow-y-auto">
		<div class="flex justify-between">
			<p class="text-2xl text-center font-semibold">{title}</p>
			<div>
				<button on:click={closeModal} class="btn btn-outline btn-square btn-sm">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="inline-block w-6 h-6 stroke-current"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		</div>
		<slot />
	</div>
</div>

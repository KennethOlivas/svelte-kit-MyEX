<script>
	import CreateCheque from '../../components/check/CreateCheque.svelte';

	const optionComponent = [{ component: CreateCheque }];

	let selectedComponent = optionComponent[0];
</script>

<ul class="menu items-stretch shadow-lg bg-base-300 horizontal rounded-box mx-4 mt-4">
	<li>
		<button class="btn btn-ghost capitalize rounded-none"
			><i class="fas fa-file-invoice mr-2 text-xl" />
			<p class="hidden md:inline">Chequera</p>
		</button>
	</li>
	<li>
		<button class="btn btn-ghost capitalize rounded-none"
			><i class="fas fa-money-bill-wave mr-2 text-xl" />
			<p class="hidden md:inline">Depositos/Retiros</p>
		</button>
	</li>
</ul>

<svelte:component this={selectedComponent.component} />

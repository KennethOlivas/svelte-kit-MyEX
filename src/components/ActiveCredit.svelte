<script>
	import * as api from '../lib/api';
	import { onMount } from 'svelte';

	import { fade, fly } from 'svelte/transition';
	import Loader from './Loader.svelte';

	export let associate;
	let credit = [];
</script>

{#if associate}
	<div class="card shadow-lg">
		<div class="card-body">
			<h2 class="card-title">Credito Activo: {associate.associate.name} {associate.associate.lastname}</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
				<div class="w-full p-2 rounded font-semibold text-l text-gray-700">
					Estado: <div class="badge text-black  {associate.status ? 'badge-success' : 'badge-error'}">
						{associate.status ? 'Activo' : 'Cancelado'}
					</div>
				</div>
				<div class="w-full p-2 rounded font-semibold text-gray-700">
					Monto: <span class=" font-normal text-black">{associate.dollar? '$' : 'C$' }{associate.total_amount}</span>
				</div>
                <div class="w-full p-2 rounded font-semibold text-gray-700">
					Saldo Restante: <span class="font-normal text-black">{associate.dollar? '$' : 'C$' }{associate.remaining_amount}</span>
				</div>
                <div class="w-full p-2 rounded font-semibold text-gray-700">
					Tasa de interes: <span class="font-normal text-black">{associate.interest_rate}%</span>
				</div>
                <div class="w-full p-2 rounded font-semibold text-gray-700">
					Fecha: <span class="font-normal text-black">{associate.loan_date}</span>
				</div>
                <div class="w-full p-2 rounded font-semibold text-gray-700">
					Meses de pago: <span class="font-normal text-black">{associate.payment_deadline}</span>
				</div>
                <div class="w-full p-2 rounded font-semibold text-gray-700">
					Cuota cada: <span class="font-normal text-black">{associate.fee} dias</span>
				</div>

			</div>
		</div>
	</div>
{/if}

<script>
	import * as api from '../lib/api';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import Loader from './Loader.svelte';

	export let associate;
	let history;

	let promise = Promise.resolve([]);

	let page = 1;
	// limite de paginacion
	const limit = 12;

	onMount(async () => {
		try {
			promise = getCreditTransactions();
		} catch (error) {
			console.log(error);
		}
	});

	const getCreditTransactions = async () => {
		let res;
		const start = +page === 1 ? 0 : (+page - 1) * 12;
		try {
			res = await api
				.get(
					`/payment-credits?associate_credit_account.id_contains=${associate.id}&_sort=quote:ASC&_limit=${limit}&_start=${start}`
				)
				.then((response) => response.json());
			console.log(res);
		} catch (error) {
		} finally {
			history = [];
			history = [...res];
		}
	};

	const nextPage = async () => {
		history.length > limit - 1 ? page++ : (page = page);
		await getCreditTransactions();
	};

	const previusPage = async () => {
		page > 1 ? page-- : (page = 1);
		await getCreditTransactions();
	};
</script>

{#await promise}
	<Loader />
{:then}
	<div class="overflow-x-auto overflow--auto mt-8">
		<p class="text-neutral text-2xl font-semibold cursor-default">
			Historial de credito: {associate.associate.name}
			{associate.associate.lastname}
		</p>
		<table class="table w-full table-compact">
			<thead>
				<tr>
					<th>Cuota</th>
					<th>principal</th>
					<th>interes</th>
					<th>total</th>
					<th>Saldo</th>
					<th>Fecha de pago quota</th>
				</tr>
			</thead>
			<tbody>
				{#each history as data}
					<tr class="hover cursor-default" in:fly={{ y: 200, duration: 400 }}>
						<th> {data.quote}</th>
						<td>{associate.dolar ? '$ ' : 'C$ '} {data.principal}</td>
						<td>{associate.dolar ? '$ ' : 'C$ '} {data.interest}</td>
						<td>{associate.dolar ? '$ ' : 'C$ '} {data.total}</td>
						<td>{associate.dolar ? '$ ' : 'C$ '} {data.remaining_balance}</td>
						<td>{data.payment_date}</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<div class="btn-group mt-4 justify-end">
			<button class="btn px-8" on:click={previusPage}
				><i class="fas fa-arrow-left text-lg" /></button
			>
			<button class="btn px-8" on:click={nextPage}><i class="fas fa-arrow-right text-lg" /></button>
		</div>
	</div>
{/await}

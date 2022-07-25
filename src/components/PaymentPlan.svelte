<script>
	import * as api from '../lib/api';
	import { onMount } from 'svelte';
	import XLSX from 'xlsx';
	

	import { saveAs } from 'file-saver';
	import { fade, fly } from 'svelte/transition';
	import Loader from './Loader.svelte';

	export let associate;

	
	let excel = XLSX.utils.book_new();

	let page = 1;
	// limite de paginacion
	const limit = 12;
	let creditsTransactions = [];

	let promise = Promise.resolve([]);

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
					`/credits?associate_credit_account.id_contains=${associate.id}&_sort=quote:ASC&_limit=${limit}&_start=${start}`
				)
				.then((response) => response.json());
			console.log(res);
		} catch (error) {
		} finally {
			creditsTransactions = [];
			creditsTransactions = [...res];
		}
		console.log(creditsTransactions);
	};

	const nextPage = async () => {
		creditsTransactions.length > limit - 1 ? page++ : (page = page);
		await getCreditTransactions();
	};

	const previusPage = async () => {
		page > 1 ? page-- : (page = 1);

		await getCreditTransactions();
	};

	const exportExcel = async () => {
		let creditsTransactions;

		try {
			creditsTransactions = await api
				.get(`/credits?associate_credit_account.id_contains=${associate.id}&_sort=quote:ASC`)
				.then((response) => response.json());
		} catch (error) {}
		excel.Props = {
			Title: 'Test',
			Subject: 'Plan de pago',
			Author: 'Coperativa',
			CreatedDate: new Date(2021, 12, 19)
		};

		excel.SheetNames.push('Plan de pago');

		let head = [[`${associate.associate.name} ${associate.associate.lastname}`]];

		head.push(['Quota', 'Principal', 'interes', 'total', 'restante', 'Fecha de pago quota']);

		for (const data of creditsTransactions) {
			let array = [];
			array.push(data.quote);
			array.push(data.principal);
			array.push(data.interest);
			array.push(data.total);
			array.push(data.remaining_balance);
			array.push(data.limit_date);
			head.push(array);
		}

		let ws = XLSX.utils.aoa_to_sheet(head);

		ws['A1'].s = {
			font: {
				sz: 24,
				bold: true,
				color: {
					rgb: 'FFFFAA00'
				}
			}
		};
		const merge = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];
		ws['!merges'] = merge;
		
		excel.Sheets['Plan de pago'] = ws;

		let wbout = XLSX.write(excel, { bookType: 'xlsx', type: 'binary' });

		function s2ab(s) {
			var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
			var view = new Uint8Array(buf); //create uint8array as viewer
			for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff; //convert to octet
			return buf;
		}

		saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'Plan de.xlsx');
	};
</script>

{#await promise}
	<Loader />
{:then}
	<div class="overflow-x-auto overflow--auto mt-8">
		<p class="text-neutral text-2xl font-semibold cursor-default">
			{associate.associate.name}
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
				{#each creditsTransactions as data}
					<tr class="hover cursor-default" in:fly={{ y: 200, duration: 400 }}>
						<th> {data.quote}</th>
						<td>{associate.dolar ? '$ ' : 'C$ '} {data.principal}</td>
						<td>{associate.dolar ? '$ ' : 'C$ '} {data.interest}</td>
						<td>{associate.dolar ? '$ ' : 'C$ '} {data.total}</td>
						<td>{associate.dolar ? '$ ' : 'C$ '} {data.remaining_balance}</td>
						<td>{data.limit_date}</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<div class="btn-group mt-4 justify-end">
			<button class="btn" on:click={exportExcel}>Descargar</button>
			<button class="btn px-8" on:click={previusPage}
				><i class="fas fa-arrow-left text-lg" /></button
			>

			<button class="btn px-8" on:click={nextPage}><i class="fas fa-arrow-right text-lg" /></button>
		</div>
	</div>
{/await}

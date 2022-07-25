<script>
	import Loader from '../../components/Loader.svelte';
	import { onMount } from 'svelte';
	import * as api from '../../lib/api';
	import Table from '../../components/Table.svelte';


	let bankaccounts = [];
	let promise = Promise.resolve([]);
	let page = 1;
	let limit = 10;

	let body = [];

	onMount(async () => {
		promise = getbankaccounts();
	});

	//GET BANK ACCOUNTS and format json
	const getbankaccounts = async () => {
		let res;
		const start = +page === 1 ? 0 : (+page - 1) * 12;
		try {
			res = await api
				.get(`/bankaccounts`)
				.then((response) => response.json());
			console.log(res);
		} catch (error) {
		} finally {
			bankaccounts = [];
			bankaccounts = [...res];
		}
		loadTable();
	};


	const loadTable = () => {
		body = [];
		for (const data of bankaccounts) {
			body.push([data.id, data.back_name, data.number, data.type, data.balance]);
		}

	};
</script>

{#await promise}
	<Loader />
{:then}
	<Table
		body={body}
		columns={[
			{
				name: 'Bank Account',
				value: 'bankaccount',
			},]
		}
	/>
{/await}

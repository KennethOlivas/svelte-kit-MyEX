<script>
	import * as api from '../lib/api';
	import { onMount } from 'svelte';
	import moment from 'moment';

	import { fade, fly } from 'svelte/transition';
	import Loader from './Loader.svelte';

	export let associate;

	let page = 1;
	// limite de paginacion
	const limit = 12;
	let creditsTransactions = [];

	let resTransaction = false;

	let promise = Promise.resolve([]);

	//variables api
	let quote;
	let associate_credit_account;
	let payment_date;
	let principal;
	let payment_deadline;
	let interest;
	let total = 0;
	let late_fee = 0;
	let remaining_balance;
	let late_date_days = '';
	let late_fee_percentaje = '';
	let aux;

	let advanceDay;

	let payments = null;

	onMount(async () => {
		associate_credit_account = associate.id;
		promise = getPayments();
		if (payments !== null) {
			quote = 1;
			try {
				promise = getCreditTransactions();
			} catch (error) {
				console.log(error);
			}
		}
	});

	const getPayments = async () => {
		try {
			let res = await api
				.get(
					`/payment-credits?associate_credit_account.id_contains=${associate.id}&_sort=quote:DESC`
				)
				.then((response) => response.json());
			payments = res[0];
			principal = payments.principal;
			quote = payments.quote + 1;
			interest = ((payments.remaining_balance * (associate.interest_rate / 100)) / 12).toFixed(2);
			interest = parseFloat(interest);
			let resPlan = await api
				.get(`/credits?associate_credit_account.id_contains=${associate.id}&_sort=quote:ASC`)
				.then((response) => response.json());
			creditsTransactions = [];
			creditsTransactions = [...resPlan];
			payment_deadline = creditsTransactions[quote - 1].limit_date;
			aux = payments.remaining_balance;
			remaining_balance = 0
		} catch (error) {
			console.log(error);
		}
	};

	const getCreditTransactions = async () => {
		let res;

		try {
			res = await api
				.get(`/credits?associate_credit_account.id_contains=${associate.id}&_sort=quote:ASC`)
				.then((response) => response.json());
		} catch (error) {
			console.log(error);
		} finally {
			creditsTransactions = [];
			creditsTransactions = [...res];
			principal = creditsTransactions[0].principal;
			payment_deadline = creditsTransactions[quote - 1].limit_date;
			remaining_balance = creditsTransactions[0].remaining_balance + creditsTransactions[0].total;
			aux = remaining_balance;
		}

		interest = creditsTransactions[0].interest;
	};

	let data = {
		quote: 1,
		principal: 0,
		interest: 0,
		total: 0
	};

	const calculate = () => {
		late_fee = 0;
		let future = moment(payment_date);
		let start = moment(payment_deadline);
		let d = future.diff(start, 'days'); // 9

		if (d >= 0) {
			late_date_days = d;
		} else {
			advanceDay = late_date_days * -1;
			late_date_days = 0;
		}
		lateFeeCalculator();
	};

	const lateFeeCalculator = () => {
		late_fee = 0;
		if (late_date_days === 0 || late_fee_percentaje === '') {
			calculateTotal();
			return;
		}
		late_fee = (principal * (late_fee_percentaje / 100)) / 360;
		late_fee = (late_fee * late_date_days).toFixed(2);
		late_fee = parseFloat(late_fee);
		calculateTotal();
	};

	const calculateTotal = () => {
		total = 0;
		total = (late_fee + interest + principal).toFixed(2);
		total = parseFloat(total);
		remaining_balance = aux;
		remaining_balance -= (interest + principal).toFixed(2);
		remaining_balance = parseFloat(remaining_balance);
	};

	const clearData = () => {
		payment_date = '';
		late_date_days = 0
	};

	const post = async () => {
		let data = {
			quote,
			associate_credit_account,
			payment_deadline,
			payment_date,
			principal,
			interest,
			total,
			late_fee,
			remaining_balance,
			late_date_days,
			late_fee_percentaje
		};

		try {
			let res = await api.post(`/payment-credits`, data);
			if (res.ok) {
				let id = associate_credit_account;
				let data2 = {
					remaining_amount: remaining_balance
				};
				let res2 = await api.put(`/associate-credit-accounts/${id}`, data2);
				if (res2.ok) {
					resTransaction = true;
					payment_date = '';
				}
			}
		} catch (error) {
			console.log(error);
		} finally {
			await getPayments()
		}
		setTimeout(() => {
			resTransaction = false;
		}, 7000);
	};
</script>

{#await promise}
	<Loader />
{:then}
	<div>
		<div class="overflow-x-auto overflow--auto mt-8">
			<p class="text-neutral text-2xl font-semibold cursor-default">
				{associate.associate.name}
				{associate.associate.lastname}
			</p>

			<to class="flex my-5 space-x-8">
				<div>
					<strong>Fecha de pago: </strong>
					<input
						bind:value={payment_date}
						on:change={calculate}
						type="date"
						required
						placeholder="test"
						class="input input-ghost focus:placeholder-neutral hover:bg-gray-100 focus:bg-gray-100 cursor-pointer"
					/>
				</div>

				<div class="flex mt-3">
					<strong class="mr-2">Dias de mora: </strong>
					<p>{late_date_days}</p>
				</div>

				{#if late_date_days > 0}
					<div>
						<strong>Interes por mora: </strong>
						<input
							bind:value={late_fee_percentaje}
							on:change={lateFeeCalculator}
							type="number"
							required
							placeholder="%"
							class="mx-0 input input-ghost focus:placeholder-neutral hover:bg-gray-100 focus:bg-gray-100 cursor-pointer"
						/>
					</div>
				{/if}
			</to>
			{#if payment_date}
				<table class="table w-full table-compact" in:fly={{ y: 200, duration: 400 }}>
					<thead>
						<tr>
							<th>cuota</th>
							<th>Principal</th>
							<th>interes</th>
							<th>Mora</th>
							<th>total</th>
							<th>restante</th>
							<th>Fecha de pago quota (plan)</th>
						</tr>
					</thead>
					<tbody>
						<tr class="cursor-default">
							<th>{quote}</th>
							<td>{principal}</td>
							<td>{interest}</td>
							<td>{late_fee}</td>
							<td>{total}</td>
							<td>{remaining_balance}</td>
							<td>{payment_deadline}</td>
						</tr>
					</tbody>
				</table>
				<div class="flex justify-center w-full mt-8" in:fly={{ y: 200, duration: 400 }}>
					<button on:click={clearData} class="btn btn-error mx-2 btn-wide ">Cancelar </button>
					<button on:click={post} class="btn mx-2 btn-wide">Pagar </button>
				</div>
			{/if}
		</div>

		{#if resTransaction}
			<div
				class="alert alert-success w-full  bottom-0 right-0 my-4 cursor-pointer"
				on:click={() => {
					resTransaction = false;
				}}
				transition:fly={{ x: 200, duration: 400 }}
			>
				<div class="flex-1">
					<i class="fas fa-check text-2xl mr-2" />
					<p class="text-xl">Transaccion completada exitosamente</p>
				</div>
			</div>
		{/if}
	</div>
{/await}

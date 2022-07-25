<script>
	import Table from '../../components/Table.svelte';
	import Modal from '../../components/Modal.svelte';
	import * as api from '../../lib/api';
	import { onMount } from 'svelte';
	import Loader from '../../components/Loader.svelte';
	import { sleep } from '../../lib/utils';
	import ModalInfo from '../../components/ModalInfo.svelte';
	import Modal2 from '../../components/ModalSearch.svelte';
	import { fade, fly } from 'svelte/transition';
	import GuarantorSearch from '../../components/guarantorSearch.svelte';
	import ActiveCredit from '../../components/ActiveCredit.svelte';
	import PayCredit from '../../components/PayCredit.svelte';
	import PaymentPlan from '../../components/PaymentPlan.svelte';
	import PaymentCreditHistory from '../../components/PaymentCreditHistory.svelte';

	const optionComponent = [
		{ component: ActiveCredit },
		{ component: PayCredit },
		{ component: PaymentCreditHistory },
		{ component: PaymentPlan }
	];

	let selectedComponent = optionComponent[1];
	let props;
	//Variables de las tabla
	let head = [];
	let body = [];
	head = ['id', 'Socio', 'Credito Total', 'Credito restante', 'estado'];
	let tableControler;
	//Variables
	let associates = [];
	let loading = false;
	let id;
	let addOrEdit = true;
	$: btnSubmit = addOrEdit ? 'agregar' : 'editar';
	let modalController;
	let modalController2;
	let page = 1;
	// limite de paginacion
	const limit = 8;

	let modalAux = true;

	//Controladores del modal de infromacion
	let modalInfo;
	let dataModalInfo = [];
	let idModalInfo;

	let res = false;
	let titleModalTransction = 'Tipo de transaccion';

	//busqueda
	let searchData;
	let autofocusInput;
	let typeSearch = false;
	let resultAcount = [];
	let notResult = false;
	let inputSearch;
	let hasCredit = false;
	let hasCreditMessage;
	let associate;
	let stepTwoCredit = false;

	//variables api
	let total_amount;
	let dolar = false;
	let remaining_amount;
	let interest_rate;
	let now = new Date(),
		month,
		day,
		year;
	let loan_date;
	let payment_deadline;
	let type;
	let fee;
	let guarnators = [];
	let associateId;
	let selectedAssociate;

	let amount;

	let credits = [];
	let resultsAssociates = [];

	let seachAsociateInCredit;

	onMount(async () => {
		try {
			await getCreditsAcounts();
		} catch (error) {
		} finally {
			loading = true;
		}
		(month = '' + (now.getMonth() + 1)), (day = '' + now.getDate()), (year = now.getFullYear());

		if (month.length < 2) month = '0' + month;
		if (day.length < 2) day = '0' + day;

		loan_date = [year, month, day].join('-');
	});

	const getCreditsAcounts = async () => {
		let res;
		const start = +page === 1 ? 0 : (+page - 1) * 3;

		try {
			res = await api
				.get(`/associate-credit-accounts?_sort=id:DESC&_limit=${limit}&_start=${start}`)
				.then((response) => response.json());
		} catch (error) {
		} finally {
			credits = [];
			credits = [...res];
		}
	};

	const nextPage = async () => {
		associates.length > limit - 1 ? page++ : (page = page);
		await getCreditsAcounts();
		loaData();
	};

	const previusPage = async () => {
		page > 1 ? page-- : (page = 1);

		await getCreditsAcounts();
		loaData();
	};

	const loaData = async () => {
		body = [];
		for (const data of credits) {
			body.push([
				data.id,
				data.associate.name + ' ' + data.associate.lastname,
				data.dollar ? '$ ' : 'C$ ' + data.total_amount,
				data.dollar ? '$ ' : 'C$ ' + data.remaining_amount,
				data.status
			]);
		}
		await sleep(200);
	};

	const clearData = () => {
		inputSearch = '';
		resultsAssociates = [];
		hasCredit = false;
		resultsAssociates = [];
		hasCreditMessage = '';
		notResult = false;
		total_amount = '';
		dolar = false;
		remaining_amount = '';
		interest_rate = '';
		(now = new Date()), month, day, year;
		loan_date = '';
		payment_deadline = '';
		type = false;
		fee = '';
		guarnators = [];
		associateId = '';
		amount = '';
	};

	const search = async () => {
		let res;
		if (typeSearch) {
			try {
				res = await api
					.get(`/associate-credit-accounts?associate.identification_contains=${searchData}`)
					.then((response) => response.json());
			} catch (error) {
			} finally {
				credits = [];
				credits = [...res];
			}
		} else {
			try {
				res = await api
					.get(`/associate-credit-accounts?associate.name_contains=${searchData}`)
					.then((response) => response.json());
			} catch (error) {
			} finally {
				credits = [];
				credits = [...res];
			}
		}
		loaData();
	};

	const toOpenModalInfo = (e) => {
		let id = e.detail.id;
		selectedAssociate = credits.find((e) => e.id === id);
		modalInfo.openModal();
		selectedComponent = optionComponent[0];
		props = { associate: selectedAssociate };
	};

	const handleAcount = (acount) => {
		number = acount.number;
		id = acount.id;
		amount = acount.amount;
		modalInfo.closeModal();
		modalController.openModal();
	};

	const submit = async () => {
		if (!stepTwoCredit) {
			stepTwoCredit = true;
			return;
		}

		let guarnatorsId = [];
		for (const iterator of guarnators) {
			guarnatorsId.push(iterator.id);
		}
		let creditId;
		let data = {
			associate: associate.id,
			type,
			total_amount,
			guarnators: guarnatorsId,
			remaining_amount: total_amount,
			interest_rate,
			loan_date,
			payment_deadline,
			fee
		};

		(async () => {
			try {
				await api.post(`/associate-credit-accounts`, data);
				let getCreditsAcount = await api
					.get(`/associate-credit-accounts?associate.id=${associate.id}&status=true`)
					.then((response) => response.json());
				creditId = getCreditsAcount[0].id;
				await setUpCreditTransactions(creditId);
			} catch (error) {
				console.log(error);
			} finally {
				modalController2.closeModal();
				clearData();
				await getCreditsAcounts();
				loaData();
			}
		})();
	};

	const setUpCreditTransactions = async (associate_credit_account) => {
		let quantityQuote = (payment_deadline * 30) / fee;
		let principal = (total_amount / quantityQuote).toFixed(2);
		principal = parseFloat(principal);
		let quote;
		let interest;
		let total;
		let balance;
		let limit_date = new Date(loan_date);

		for (let i = 0; i < quantityQuote; i++) {
			quote = i + 1;
			limit_date.addDays(fee);
			if (i === 0) {
				interest = ((total_amount * (interest_rate / 100)) / 12).toFixed(2);
				interest = parseFloat(interest);
				total = principal + interest;
				balance = total_amount - principal;
				balance = parseFloat(balance);
			}
			if (i >= 1) {
				interest = ((balance * (interest_rate / 100)) / 12).toFixed(2);
				interest = parseFloat(interest);
				total = principal + interest;
				balance = (balance - principal).toFixed(2);
				balance = parseFloat(balance);
				if (balance < 0) {
					balance = 0;
				}
			}

			let data = {
				associate_credit_account,
				limit_date,
				quote,
				principal,
				interest,
				total,
				remaining_balance: balance
			};
			try {
				await api.post(`/credits`, data);
			} catch (error) {
				console.log(error);
			}
		}
	};

	Date.prototype.addDays = function (days) {
		this.setDate(this.getDate() + parseInt(days));
		return this;
	};

	const searchAssociate = async () => {
		hasCredit = false;
		let res;
		if (inputSearch.length === 0) {
			resultsAssociates = [];
			return;
		}
		if (!typeSearch) {
			try {
				res = await api
					.get(`/associates?name_contains=${inputSearch}`)
					.then((response) => response.json());
				resultsAssociates = [...res];
				resultsAssociates.length === 0 ? (notResult = true) : (notResult = false);
			} catch (error) {
				console.log(error);
			}
		} else {
			try {
				res = await api
					.get(`/associates?identification_contains=${inputSearch}`)
					.then((response) => response.json());
				resultsAssociates = [...res];
				resultsAssociates.length === 0 ? (notResult = true) : (notResult = false);
			} catch (error) {
				console.log(error);
			}
		}
	};

	const selectAssociate = async (data) => {
		try {
			res = await api
				.get(`/associate-credit-accounts?associate.id=${data.id}&status=true`)
				.then((response) => response.json());
		} catch (error) {
		} finally {
			if (res.length !== 0) {
				hasCredit = true;
				hasCreditMessage = `El socio ${data.name} ${data.lastname} ya tiene un credito abierto y activo`;
				return;
			}
			associate = data;
		}
		modalController.closeModal();
		modalController2.openModal();
	};

	const test = (e) => {
		guarnators = e.detail.data;
		console.table(guarnators);
	};

	const paymentTable = () => {
		let cuoteQuantityForMonth;
		let cuoteQuantity;
		fee < 30
			? (cuoteQuantityForMonth = 30 / fee)
			: (cuoteQuantityForMonth = payment_deadline * fee);
		cuoteQuantity = cuoteQuantityForMonth / payment_deadline;
		let principal = total_amount / cuoteQuantity;
		let interest = (total_amount * (interest_rate / 100)) / cuoteQuantityForMonth;
		let totalPayment = principal + interest;

		let cuoteQuantitys = [];

		for (let index = 0; index < cuoteQuantity; index++) {
			cuoteQuantitys.push(index + 1);
		}
		let date = new Date();
		console.log(fee, date);
		date = sumarDias(date, fee);

		console.log(date);
	};

	function sumarDias(fecha, dias) {
		fecha.setDate(fecha.getDate() + dias);
		return fecha;
	}
</script>

<svelte:head>
	<title>Creditos</title>
</svelte:head>

<div>
	<ModalInfo bind:this={modalInfo} title="Informacion del credito">
		<div class="flex justify-center">
			<ul
				class="menu items-stretch justify-around shadow-lg bg-base-100 horizontal rounded-box mt-4"
			>
				<li>
					<button
						class="btn btn-ghost capitalize rounded-none"
						on:click={() => {
							selectedComponent = optionComponent[0];
							props = { associate: selectedAssociate };
						}}
						><i class="fas fa-file-invoice mr-2 text-xl" />
						<p class="hidden md:inline">Credito Activo</p>
					</button>
				</li>
				<li>
					<button
						class="btn btn-ghost capitalize rounded-none"
						on:click={() => {
							selectedComponent = optionComponent[1];
							props = { associate: selectedAssociate };
						}}
						><i class="fas fa-money-bill-wave mr-2 text-xl" />
						<p class="hidden md:inline">Pagar Cuota</p>
					</button>
				</li>
				<li>
					<button
						class="btn btn-ghost capitalize rounded-none"
						on:click={() => {
							selectedComponent = optionComponent[2];
							props = { associate: selectedAssociate };
						}}
						><i class="fas fa-book mr-2 text-xl" />
						<p class="hidden md:inline">Historial</p>
					</button>
				</li>
				<li>
					<button
						class="btn btn-ghost capitalize rounded-none"
						on:click={() => {
							selectedComponent = optionComponent[3];
							props = { associate: selectedAssociate };
						}}
						><i class="fab fa-slideshare mr-2 text-xl" />
						<p class="hidden md:inline">Plan de pago</p>
					</button>
				</li>
			</ul>
		</div>
		<svelte:component this={selectedComponent.component} {...props} />
	</ModalInfo>
</div>

<h1 class="text-center text-2xl font-bold text-gray-700" transition:fade={{ duration: 100 }}>
	Creditos
</h1>
<div class="flex items-center justify-between" transition:fade={{ duration: 100 }}>
	<select bind:value={typeSearch} class="select select-info mx-2">
		<option value={false}>Nombre</option>
		<option value={true}>Cedula</option>
	</select>
	<input
		bind:this={autofocusInput}
		on:keyup={search}
		bind:value={searchData}
		type="text"
		required
		placeholder="Buscar Socio..."
		class="input input-primary input-bordered focus:placeholder-primary w-full my-4 mr-4"
	/>

	<Modal
		tilte="Credito de Socio"
		btnName="Crear Credito"
		icon="fas fa-plus"
		bind:this={modalController}
		on:closeModal={clearData}
	>
		<div class="relative mt-4 flex">
			<input
				bind:value={inputSearch}
				on:keyup={searchAssociate}
				type="text"
				required
				placeholder="Buscar socio"
				class="w-5/6 pr-16 input input-info input-bordered"
			/>
			<select bind:value={typeSearch} class="select select-info mx-2">
				<option value={false}>Nombre</option>
				<option value={true}>Cedula</option>
			</select>
		</div>

		{#if resultsAssociates.length !== 0}
			<div class="overflow-x-auto mt-4">
				<table class="table w-full">
					<thead>
						<tr>
							<th>Nombre</th>
							<th>Apellido</th>
							<th>Identificacion</th>
						</tr>
					</thead>
					<tbody>
						{#each resultsAssociates as data}
							<tr
								class="hover cursor-pointer"
								transition:fade={{ duration: 400 }}
								on:click={selectAssociate(data)}
							>
								<th>{data.name}</th>
								<td>{data.lastname}</td>
								<td>{data.identification}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

		<div class="alert alert-error mt-4 {notResult ? '' : 'hidden'}">
			<div class="flex-1">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="w-6 h-6 mx-2 stroke-current"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
					/>
				</svg>
				<p>Sin resultados</p>
			</div>
		</div>

		<div class="alert alert-error mt-4 {hasCredit ? '' : 'hidden'}">
			<div class="flex-1">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="w-6 h-6 mx-2 stroke-current"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
					/>
				</svg>
				<p>{hasCreditMessage}</p>
			</div>
		</div>
	</Modal>
</div>

<div>
	<Modal2
		bind:this={modalController2}
		tilte={`Credito para  ${associate ? associate.name + ' ' + associate.lastname : ''} `}
	>
		<form class="form-control " on:submit|preventDefault={submit}>
			{#if !stepTwoCredit}
				<label for="name" class="label">
					<span class="label-text">Fecha del Prestamo</span>
				</label>
				<input
					bind:value={loan_date}
					type="date"
					required
					placeholder=""
					class="input input-primary input-bordered focus:placeholder-primary"
				/>

				<label for="gender" class="label mt-2">
					<span class="label-text">Tipo de cuota</span>
				</label>
				<select bind:value={fee} class="select select-bordered select-info w-full" required>
					<option disabled="disabled" value="" selected="selected">Elija...</option>
					<option value="1">Diario</option>
					<option value="7">Semanal</option>
					<option value="15">Quincenal</option>
					<option value="30">Mensual</option>
					<option value="90">Trimestral</option>
					<option value="180">Semestral</option>
				</select>
				<div class="flex w-full">
					<div class="w-1/3">
						<label for="gender" class="label mt-2">
							<span class="label-text">Moneda</span>
						</label>
						<select bind:value={type} class="select select-bordered select-info w-full" required>
							<option disabled="disabled" value="" selected="selected">Elija...</option>
							<option value={false}>Cordobas</option>
							<option value={true}>Dolares</option>
						</select>
					</div>

					<div class="w-1/3 mx-2">
						<label for="name" class="label mt-2">
							<span class="label-text">Intereses</span>
						</label>
						<input
							bind:value={interest_rate}
							type="number"
							step="0.25"
							required
							placeholder="%"
							class="input input-primary input-bordered focus:placeholder-primary w-full"
						/>
					</div>
					<div class="w-1/3 mr-1">
						<label for="name" class="label mt-2">
							<span class="label-text">Monto del prestamo</span>
						</label>
						<input
							bind:value={total_amount}
							type="number"
							required
							step="0.01"
							placeholder=""
							class="input input-primary input-bordered focus:placeholder-primary w-full"
						/>
					</div>
				</div>
				<label for="name" class="label mt-2">
					<span class="label-text">Tiempo límite de pago</span>
				</label>
				<input
					bind:value={payment_deadline}
					type="number"
					min="1"
					required
					placeholder="Meses"
					class="input input-primary input-bordered focus:placeholder-primary w-full"
				/>
				<div class="flex justify-end">
					<button type="submit" class="btn btn-accent mt-4 w-1/2">Siguiente</button>
				</div>
			{:else}
				<GuarantorSearch {associate} on:exportData={test} />
				<div class="modal-action">
					<label
						for="my-modal-2"
						type="button"
						on:click={() => {
							stepTwoCredit = false;
						}}
						class="btn text-white w-1/2">Atras</label
					>
					<button class="btn btn-info w-1/2" type="button" on:click={paymentTable}
						>{btnSubmit}</button
					>
				</div>
			{/if}
		</form>
	</Modal2>
</div>
{#if loading}
	<Table
		bind:this={tableControler}
		{head}
		{body}
		ifFalse="No Activo"
		ifTrue="Activo"
		hiddenButton={true}
		on:handleTable={toOpenModalInfo}
		on:message={loaData}
		on:nextPage={nextPage}
		on:previusPage={previusPage}
	/>
{:else}
	<Loader />
{/if}

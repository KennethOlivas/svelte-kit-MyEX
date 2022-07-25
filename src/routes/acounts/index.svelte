<svelte:head>
	<title>Cuentas</title>
</svelte:head>

<script>
	import Table from '../../components/Table.svelte';
	import Modal from '../../components/Modal.svelte';
	import Modal2 from '../../components/ModalSearch.svelte';
	import * as api from '../../lib/api';
	import { onMount } from 'svelte';
	import Loader from '../../components/Loader.svelte';

	import { sleep } from '../../lib/utils';
	import ModalInfo from '../../components/ModalInfo.svelte';
	import { v4 as uuidv4 } from 'uuid';
	import { fade, fly } from 'svelte/transition';

	//Variables de las tabla
	let head = [];
	let body = [];
	head = ['id', 'Nombre', 'numero', 'estado', 'tipo'];
	let tableControler;
	//Variables
	let associates = [];
	let acounts = [];
	let loading = false;
	let id;
	let addOrEdit = true;
	$: btnSubmit = addOrEdit ? 'agregar' : 'editar';
	let modalController;
	let modalController2;
	let page = 1;
	// limite de paginacion
	const limit = 8;

	//Controladores del modal de infromacion
	let modalInfo;
	let dataModalInfo = [];
	let idModalInfo;

	//variables de informacion
	let name;

	//variables de la API
	let number;
	let amount;
	let dollar = false
	let associete;
	let associateId;

	//busqueda
	let searchData;
	let inputSearch;
	let typeSearch = false;
	let resultsAssociates = [];
	let notResult = false;

	onMount(async () => {
		try {
			await getAcounts();
		} catch (error) {
		} finally {
			loading = true;
		}
	});

	const getAcounts = async () => {
		let res;
		const start = +page === 1 ? 0 : (+page - 1) * 3;

		try {
			res = await api
				.get(`/associate-accounts?_sort=id:DESC&_limit=${limit}&_start=${start}`)
				.then((response) => response.json());
		} catch (error) {
		} finally {
			acounts = [];
			acounts = [...res];
			console.log(acounts);
		}
	};

	const loaData = async () => {
		body = [];
		for (const data of acounts) {
			let type 
			data.dollar ? type = "Dolares" : type = "Cordobas";
			body.push([
				data.id,
				data.associate.name + ' ' + data.associate.lastname,
				data.number,
				data.status,
				type
			]);

		}
	};

	const generateNumberAcount = () => {
		let uuid = uuidv4();
		let number = uuid.replace(/[^0-9\.]+/g, '');
		number = number.slice(0, 12);
		return number;
	};

	const toOpenModalInfo = (e) => {
		dataModalInfo = [];
		let id = e.detail.id;
		let data = acounts.find((e) => e.id === id);
		idModalInfo = data.id;
		dataModalInfo = data;
		console.log(dataModalInfo);
		modalInfo.openModal();
	};

	const search = async () => {
		let res;
		try {
			res = await api
				.get(`/associates?name_contains=${searchData}`)
				.then((response) => response.json());
			console.log(res);
		} catch (error) {
		} finally {
			associates = [];
			associates = [...res];
		}

		loaData();
	};

	const clearData = () => {
		inputSearch = '';
		amount = '';
		number = '';
		resultsAssociates = [];
	};

	const searchAssociate = async () => {
		let res;

		if (typeSearch) {
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

	const selectAssociate = (data) => {
		console.log(data);
		modalController.closeModal();
		modalController2.openModal();
		number = generateNumberAcount();
		name = `${data.name} ${data.lastname}`;
		associateId = data.id;
	};

	const submit = async () => {
		loading = false;
		let data = {
			amount,
			number,
			dollar,
			associate: associateId
		};
		let newDataAcount;
		(async () => {
			try {
				await api.post(`/associate-accounts`, data);
				newDataAcount = await api
					.get(`/associate-accounts?number_contains=${number}`)
					.then((response) => response.json());
				let associate_accounts = newDataAcount[0];
				await putNewAcount(associate_accounts, associateId);
			} catch (error) {
				console.log(error);
			} finally {
				await getAcounts();
			}
		})();
		modalController2.closeModal();
		await sleep(500);
		clearData();
		loading = true;
		loaData();
	};

	const putNewAcount = async (associate_accounts, id) => {
		let data;
		try {
			data = await api.get(`/associates/${id}`).then((response) => response.json());
		} catch (error) {
			console.log(error);
		}

		data.associate_accounts.push(associate_accounts);
		console.log(data);
		try {
			await api.put(`/associates/${id}`, data);
		} catch (error) {
			console.log(error);
		}
	};
</script>

<div>
	<ModalInfo bind:this={modalInfo} title="Informacion de cuenta">
		<div class="grid md:grid-cols-2  text-gray-700 mt-4">
			{#each Object.entries(dataModalInfo) as [key, value]}
				{#if key === 'associate'}
					<div class="grid grid-cols-2">
						<p class="py-2 px-0 font-semibold capitalize">{key}:</p>
						{#if value === null}
							<p class="py-2">No</p>
						{:else}
							<p class="py-2 truncate">{value.name} {value.lastname}</p>
						{/if}
					</div>
				{:else}
					<div class="grid grid-cols-2">
						<p class="py-2 px-0 font-semibold capitalize">{key}:</p>
						{#if value === null}
							<p class="py-2">No</p>
						{:else}
							<p class="py-2 truncate">{value}</p>
						{/if}
					</div>
				{/if}
			{/each}
		</div>
	</ModalInfo>
</div>

<h1 class="text-center text-2xl font-bold text-gray-700" transition:fade={{ duration: 100 }}>
	Cuentas
</h1>
<div class="flex items-center justify-between" transition:fade={{ duration: 100 }}>
	<input
		on:keyup={search}
		bind:value={searchData}
		type="text"
		required
		placeholder="Buscar Solicitud..."
		class="input input-primary input-bordered focus:placeholder-primary mx-4 w-full"
	/>
	<Modal
		tilte="Cuenta"
		btnName="Abrir nueva cuenta"
		icon="fas fa-file-invoice-dollar"
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
				<option value={false}>Cedula</option>
				<option value={true}>Nombre</option>
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
	</Modal>
</div>

<div>
	<Modal2 bind:this={modalController2} tilte="Cuenta">
		<form class="form-control " on:submit|preventDefault={submit}>
			<label for="name" class="label">
				<span class="label-text">Numero de cuenta</span>
			</label>
			<input
				bind:value={number}
				type="text"
				disabled
				required
				placeholder="Numero de cuenta"
				class="input input-disabled input-bordered focus:placeholder-primary w-full"
			/>

			<label for="name" class="label">
				<span class="label-text">Nombre del socio</span>
			</label>
			<input
				bind:value={name}
				type="text"
				disabled
				required
				placeholder=""
				class="input input-disabled input-bordered focus:placeholder-primary w-full"
			/>

			<label for="gender" class="label mt-2">
				<span class="label-text">Tipo de cuenta</span>
			</label>
			<select bind:value={dollar} class="select select-bordered select-info w-full" required>
				<option value={false}>Cordobas</option>
				<option value={true}>Dolares</option>
			</select>

			<label for="name" class="label">
				<span class="label-text">Cantidad</span>
			</label>
			<input
				bind:value={amount}
				type="number"
				required
				placeholder="Cantidad inicial"
				class="input input-primary input-bordered focus:placeholder-primary w-full"
			/>

			<div class="modal-action">
				<button class="btn btn-info w-1/2" type="submit">Aceptar</button>
				<label
					for="my-modal-2"
					type="button"
					class="btn btn-error text-white w-1/2"
					on:click={clearData}>Cancelar</label
				>
			</div>
		</form>
	</Modal2>
</div>
{#if loading}
	<Table
		bind:this={tableControler}
		{head}
		body={body}
		on:handleTable={toOpenModalInfo}
		ifFalse="Desactivada"
		ifTrue="Activo"
		hiddenButton={true}
		on:message={loaData}
	/>
{:else}
	<Loader />
{/if}

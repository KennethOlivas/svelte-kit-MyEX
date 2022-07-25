<svelte:head>
	<title>Transacciones</title>
</svelte:head>
<script>
	import Table from '../../components/Table.svelte';
	import Modal from '../../components/Modal.svelte';
	import * as api from '../../lib/api';
	import { onMount } from 'svelte';
	import Loader from '../../components/Loader.svelte';
	import { sleep } from '../../lib/utils';
	import ModalInfo from '../../components/ModalInfo.svelte';
	import { fade, fly } from 'svelte/transition';
	import Transacctions from '../../components/Transacctions.svelte';

	//Variables de las tabla
	let head = [];
	let body = [];
	head = ['id', 'nombre', 'identificacion', 'estado'];
	let tableControler;
	//Variables
	let associates = [];
	let loading = false;
	let id;
	let addOrEdit = true;
	$: btnSubmit = addOrEdit ? 'agregar' : 'editar';
	let modalController;
	let page = 1;
	// limite de paginacion
	const limit = 8;

	let modalAux = true;

	let transaccion = false

	//Controladores del modal de infromacion
	let modalInfo;
	let dataModalInfo = [];
	let idModalInfo;

	//variables del api
	let amount;
	let associate_accounts;
	let type;
	let valance = 0;
	let number;

	let res = false;
	let titleModalTransction = 'Tipo de transaccion';

	//busqueda
	let searchData;
	let autofocusInput
	let typeSearch = false;
	let resultAcount = [];

	onMount(async () => {
		try {
			await getTransaction();
		} catch (error) {
		} finally {
			loading = true;
		}
		autofocusInput.focus()
	});

	const getTransaction = async () => {
		let res;
		const start = +page === 1 ? 0 : (+page - 1) * 3;

		try {
			res = await api
				.get(`/associates?_sort=id:DESC&_limit=${limit}&_start=${start}`)
				.then((response) => response.json());
		} catch (error) {
		} finally {
			associates = [];
			associates = [...res];
		}
	};

	const nextPage = async () => {
		associates.length > limit - 1 ? page++ : (page = page);
		await getTransaction();
		loaData();
	};

	const previusPage = async () => {
		page > 1 ? page-- : (page = 1);

		await getTransaction();
		loaData();
	};

	const loaData = async () => {
		body = [];
		for (const data of associates) {
			body.push([data.id, data.name + ' ' + data.lastname, data.identification, data.status]);
		}
		await sleep(200);
		tableControler.addDataBody(body);
	};

	const clearData = () => {
		titleModalTransction = 'Tipo de transaccion';
		modalAux = true;
		valance = 0;
	};

	const search = async () => {
		let res;

		if (typeSearch) {
			try {
				res = await api
					.get(`/associates?identification_contains=${searchData}`)
					.then((response) => response.json());
			} catch (error) {
			} finally {
				associates = [];
				associates = [...res];
			}
		} else {
			try {
				res = await api
					.get(`/associates?name_contains=${searchData}`)
					.then((response) => response.json());
			} catch (error) {
			} finally {
				associates = [];
				associates = [...res];
			}
		}

		loaData();
	};

	const toOpenModalInfo = (e) => {
		dataModalInfo = [];
		resultAcount = [];
		let id = e.detail.id;
		let data = associates.find((e) => e.id === id);
		idModalInfo = data.id;
		dataModalInfo = data;
		resultAcount = dataModalInfo.associate_accounts;

		modalInfo.openModal();
	};

	const handleAcount = (acount) => {
		console.log(acount);
		number = acount.number;
		id = acount.id;
		amount = acount.amount;
		console.log(id);
		modalInfo.closeModal();
		modalController.openModal();
	};

	const typeTransction = (value) => {
		type = value;
		modalAux = false;
		type ? (titleModalTransction = 'Deposito') : (titleModalTransction = 'retiro ');
		console.log(modalAux);
	};

	const submit = async () => {
		if (type) {
			amount += valance;
		} else {
			amount -= valance;
		}

		let data = {
			id,
			amount
		};

		let dataTransaction = {
			associate_account: id,
			amount: valance,
			type,
			valance: amount
		};
		(async () => {
			try {
				let responseTransaccion = await api.post(`/transactions`, dataTransaction);
				
				let response = await api.put(`/associate-accounts/${id}`, data);
				if (response.ok && responseTransaccion.ok) res = true;
			} catch (error) {
			} finally {
				await getTransaction();
			}
			modalController.closeModal();
		})();

		await sleep(400);
		setTimeout(() => {
			res = false
		}, 7000);
	};
</script>

<div>
	<ModalInfo
		on:closeModal={() => transaccion = false}
		bind:this={modalInfo}
		title={dataModalInfo.name +
			' ' +
			dataModalInfo.lastname +
			'   //  ' +
			dataModalInfo.identification}
	>
		{#if !transaccion}
			<div class="overflow-x-auto mt-4">
				<table class="table w-full">
					<thead>
						<tr>
							<th>Numero de cuenta</th>
							<th>Tipo</th>
							<th>Monto</th>
							<th>Fecha de apertura</th>
						</tr>
					</thead>
					<tbody>
						{#each resultAcount as data}
							<tr
								class="hover cursor-pointer rounded-box"
								in:fade={{ duration: 400 }}
								on:click={handleAcount(data)}
							>
								<th>{data.number}</th>
								<th>{data.dollar ? 'Dolares' : 'Cordobas'}</th>
								<td>{data.dollar ? '$ ' : 'C$ '} {data.amount}</td>
								<td>{data.created_at}</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<button class="btn btn-block mt-8" on:click={() => transaccion = true}>Ver transacciones</button>
			</div>

		{:else}
			<Transacctions id={idModalInfo}/>
		{/if}
	</ModalInfo>
</div>

<div>
	<Modal bind:this={modalController} tilte={titleModalTransction} on:closeModal={clearData}>
		{#if modalAux}
			<div class="flex flex-row w-full mt-4" in:fade={{ duration: 200 }}>
				<div
					on:click={() => {
						typeTransction(false);
					}}
					class="grid flex-grow h-40 card  bg-red-400 text-white text-2xl font-semibold 
				rounded-box place-items-center shadow-sm cursor-pointer hover:bg-red-500 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
				>
					Retiro
				</div>
				<div class="divider divider-vertical">O</div>
				<div
					on:click={() => {
						typeTransction(true);
					}}
					class="grid flex-grow h-40 card bg-green-400 text-white text-2xl font-semibold 
				rounded-box place-items-center shadow-sm cursor-pointer hover:bg-green-500 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
				>
					Deposito
				</div>
			</div>
		{:else}
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
					<span class="label-text capitalize">{titleModalTransction}</span>
				</label>
				{#if !type}
					<input
						bind:value={valance}
						type="number"
						max={amount}
						min="50"
						required
						placeholder="Numero de cuenta"
						class="input input-primary input-bordered focus:placeholder-primary w-full"
					/>
				{:else}
					<input
						bind:value={valance}
						type="number"
						min="50"
						required
						placeholder="Numero de cuenta"
						class="input input-primary input-bordered focus:placeholder-primary w-full"
					/>
				{/if}

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
		{/if}
	</Modal>
</div>

<h1 class="text-center text-2xl font-bold text-gray-700" transition:fade={{ duration: 100 }}>
	Transacciones
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
</div>
{#if loading}
	<Table
		bind:this={tableControler}
		{head}
		ifFalse="No verificado"
		ifTrue="Verificado"
		hiddenButton={true}
		on:handleTable={toOpenModalInfo}
		on:message={loaData}
		on:nextPage={nextPage}
		on:previusPage={previusPage}
	/>
{:else}
	<Loader />
{/if}

{#if res}
	<div
		class="alert alert-success fixed bottom-0 right-0 mb-4 mr-2 cursor-pointer"
		on:click={() => {
			res = false;
		}}
		transition:fly={{ x: 200, duration: 400 }}
	>
		<div class="flex-1">
			<i class="fas fa-check text-2xl mr-2" />
			<p class="text-xl">Transaccion completada exitosamente</p>
		</div>
		
	</div>
{/if}

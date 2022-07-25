<svelte:head>
	<title>Solicitudes de Socios</title>
</svelte:head>
<script>
	import Table from '../../components/Table.svelte';
	import Modal from '../../components/Modal.svelte';
	import * as api from '../../lib/api';
	import { onMount } from 'svelte';
	import Loader from '../../components/Loader.svelte';
	import { countryList } from '../../lib/utils';
	import { sleep } from '../../lib/utils';
	import ModalInfo from '../../components/ModalInfo.svelte';
	import { fade } from 'svelte/transition';

	//Variables de las tabla
	let head = [];
	let body = [];
	head = ['id', 'nombre', 'identificacion', 'profesion'];
	let tableControler;
	//Variables de la api
	let associateRequests = [];
	let loading = false;
	let id;
	let addOrEdit = true;
	$: btnSubmit = addOrEdit ? 'agregar' : 'editar';
	let modalController;
	let page = 1;
	// limite de paginacion
	const limit = 8;
	let modalInfo;
	let dataModalInfo = [];

	//variables del api
	let name;
	let lastname;
	let birthday;
	let phone_number;
	let address;
	let gender;
	let identification;
	let profession;
	let academy_level;
	let observation;

	//busqueda
	let searchData;

	onMount(async () => {
		try {
			await getRequest();
		} catch (error) {
		} finally {
			loading = true;
		}
	});

	const edit = async () => {
		let data = {
			name,
			birthday,
			lastname,
			gender,
			identification,
			academy_level,
			observation,
			profession
		};
		(async () => {
			try {
				await api.put(`/associate-requests/${id}`, data);
			} catch (error) {
			} finally {
				await getRequest();
			}
			modalController.closeModal();
		})();
	};

	const post = async () => {
		let data = {
			name,
			lastname,
			birthday,
			gender,
			identification,
			academy_level,
			observation,
			profession
		};

		try {
			let res = await api.post('/associate-requests', data);
			if (res.ok) {
				try {
					res = await api
						.get(`/associate-requests?identification=${identification}`)
						.then((response) => response.json());

					let associate_requests = res[0];
					await postAssociate(associate_requests);
				} catch (error) {
					console.log(error);
				}
			}
		} catch (error) {
			console.log(error);
		} finally {
			await getRequest();
		}

		modalController.closeModal();
	};

	const postAssociate = async (associate_requests) => {
		let data = {
			name,
			lastname,
			birthday,
			gender,
			identification,
			academy_level,
			observation,
			profession,
			associate_request: associate_requests.id
		};
		console.log(data);
		try {
			let res = await api.post('/associates', data);
			console.log(res);
		} catch (error) {
			console.log(error);
		}
	};

	const getRequest = async () => {
		let res;
		const start = +page === 1 ? 0 : (+page - 1) * 3;

		try {
			res = await api
				.get(`/associate-requests?_sort=id:DESC&_limit=${limit}&_start=${start}`)
				.then((response) => response.json());
		} catch (error) {
		} finally {
			associateRequests = [];
			associateRequests = [...res];
		}
	};

	const nextPage = async () => {
		associateRequests.length > limit - 1 ? page++ : (page = page);
		await getRequest();
		loaData();
	};

	const previusPage = async () => {
		page > 1 ? page-- : (page = 1);

		console.log(page);
		await getRequest();
		loaData();
	};

	const setEdit = async (event) => {
		addOrEdit = false;
		id = event.detail.id;
		let data = associateRequests.find((e) => e.id === id);
		name = data.name;
		birthday = data.birthday;
		gender = data.gender;
		identification = data.identification;
		lastname = data.lastname;
		academy_level = data.academy_level;
		observation = data.observation;
		profession = data.profession;
		modalController.openModal();
	};

	const loaData = async () => {
		body = [];
		for (const data of associateRequests) {
			body.push([data.id, data.name + ' ' + data.lastname, data.identification, data.profession]);
		}
		await sleep(200);
		tableControler.addDataBody(body);
	};

	const deleteEmployee = async (event) => {
		loading = false;

		let id = event.detail.id;

		try {
			await api.DELETE(`/associate-requests/${id}`);
			await getRequest();
		} catch (error) {
			console.log(error);
		}

		loading = true;
		loaData();
	};

	const clearData = () => {
		name = '';
		birthday = '';
		gender = '';
		identification = '';
		profession = '';
		academy_level = '';
		lastname = '';
		addOrEdit = true;
	};

	const submit = async () => {
		loading = false;

		if (addOrEdit) {
			await post();
		} else {
			await edit();
		}
		await sleep(500);
		clearData();
		loading = true;
		loaData();
	};

	const search = async () => {
		let res;
		try {
			res = await api
				.get(`/associate-requests?name_contains=${searchData}`)
				.then((response) => response.json());
			console.log(res);
		} catch (error) {
		} finally {
			associateRequests = [];
			associateRequests = [...res];
		}
		console.log(searchData);
		loaData();
	};

	const toOpenModalInfo = (e) => {
		dataModalInfo = [];
		let id = e.detail.id;
		let data = associateRequests.find((e) => e.id === id);
		dataModalInfo = data;
		console.log(dataModalInfo);
		modalInfo.openModal();
	};
</script>

<div>
	<ModalInfo bind:this={modalInfo} title="Informacion de solicitud">
		<div class="grid md:grid-cols-2  text-gray-700 mt-4">
			{#each Object.entries(dataModalInfo) as [key, value]}
				{#if key !== 'Gender' && key !== 'nombre'}
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
	Solicitud de Socios
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
		tilte="Solicitud de Socio"
		btnName="Crear solicitud"
		icon="fas fa-plus"
		bind:this={modalController}
		on:closeModal={clearData}
	>
		<form class="form-control overflow-y-visible" on:submit|preventDefault={submit}>
			<div class="w-full flex">
				<div class="w-1/2 mr-2 ">
					<label for="name" class="label">
						<span class="label-text">Nombre</span>
					</label>
					<input
						bind:value={name}
						type="text"
						required
						placeholder="Nombre"
						class="input input-primary input-bordered focus:placeholder-primary w-full"
					/>
				</div>

				<div class="w-1/2 ml-2">
					<label for="name" class="label">
						<span class="label-text">Apellido</span>
					</label>
					<input
						bind:value={lastname}
						type="text"
						required
						placeholder="Apellido"
						class="input input-primary input-bordered focus:placeholder-primary w-full"
					/>
				</div>
			</div>
			<div class="w-full flex">
				<div class="w-1/2 mr-2">
					<label for="name" class="label">
						<span class="label-text">Numero de telefono</span>
					</label>
					<input
						bind:value={phone_number}
						type="text"
						required
						placeholder="Telefono"
						class="input input-primary input-bordered focus:placeholder-primary w-full"
					/>
				</div>

				<div class="w-1/2 ml-2">
					<label for="name" class="label">
						<span class="label-text">Direccion</span>
					</label>
					<input
						bind:value={address}
						type="text"
						required
						placeholder="Direccion"
						class="input input-primary input-bordered focus:placeholder-primary w-full"
					/>
				</div>
			</div>

			<div class="w-full flex">
				<div class="w-1/2 mr-2">
					<label for="name" class="label">
						<span class="label-text">Identificacion</span>
					</label>
					<input
						bind:value={identification}
						type="text"
						required
						placeholder="XXX-XXXXX-XXXX"
						class="input input-primary input-bordered focus:placeholder-primary w-full"
					/>
				</div>

				<div class="w-1/2 ml-2">
					<label for="name" class="label">
						<span class="label-text">Profession</span>
					</label>
					<input
						bind:value={profession}
						type="text"
						required
						placeholder=""
						class="input input-primary input-bordered focus:placeholder-primary w-full"
					/>
				</div>
			</div>

			<label for="name" class="label">
				<span class="label-text">Fecha de nacimiento</span>
			</label>
			<input
				bind:value={birthday}
				type="date"
				required
				placeholder=""
				class="input input-primary input-bordered focus:placeholder-primary"
			/>

			<label for="gender" class="label mt-2">
				<span class="label-text">Genero</span>
			</label>
			<select bind:value={gender} class="select select-bordered select-info w-full" required>
				<option disabled="disabled" value="" selected="selected">Elija...</option>
				<option value="Masculino">Masculino</option>
				<option value="Femenino">Femenino</option>
			</select>

			<label for="academy_level" class="label mt-2">
				<span class="label-text">Nivel academico</span>
			</label>
			<select bind:value={academy_level} class="select select-bordered select-info w-full" required>
				<option disabled="disabled" value="" selected="selected">Elija...</option>
				<option value="Primaria">Primaria</option>
				<option value="Secundaria">Secundaria</option>
				<option value="Universitario">Universitario</option>
				<option value="Licenciado">Licenciado</option>
				<option value="Master">Master</option>
				<option value="Doctorado">Doctorado</option>
			</select>

			<label for="observation" class="label mt-2">
				<span class="label-text">Observaciones</span>
			</label>
			<textarea
				bind:value={observation}
				class="textarea w-full textarea-bordered textarea-primary"
				placeholder="Observaciones"
			/>

			<div class="modal-action">
				<button class="btn btn-info w-1/2" type="submit">{btnSubmit}</button>
				<label
					for="my-modal-2"
					type="button"
					class="btn btn-error text-white w-1/2"
					on:click={clearData}>Cancelar</label
				>
			</div>
		</form>
	</Modal>
</div>
{#if loading}
	<Table
		bind:this={tableControler}
		{head}
		on:handleTable={toOpenModalInfo}
		on:message={loaData}
		on:deleteItem={deleteEmployee}
		on:editItem={setEdit}
		on:nextPage={nextPage}
		on:previusPage={previusPage}
	/>
{:else}
	<Loader />
{/if}

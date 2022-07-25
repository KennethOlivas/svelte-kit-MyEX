<svelte:head>
	<title>Empleados</title>
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

	let head = [];
	let body = [];
	head = ['id', 'nombre', 'nacionalidad', 'identificacion'];
	let tableControler;
	let employees = [];
	let loading = false;
	let id;
	let addOrEdit = true;
	$: btnSubmit = addOrEdit ? 'agregar' : 'editar';
	let modalController;
	let page = 1;
	const limit = 8;
	let modalInfo;
	let dataModalInfo = [];

	//variables del api
	let name;
	let birthday;
	let business_mail;
	let email;
	let gender;
	let identification;
	let marital_status;
	let nationality;
	let profession;

	//busqueda
	let searchData;

	onMount(async () => {
		try {
			await getEmployees();
		} catch (error) {
		} finally {
			loading = true;
		}
	});

	const edit = async () => {
		let data = {
			name,
			birthday,
			business_mail,
			email,
			gender,
			identification,
			marital_status,
			nationality,
			profession
		};
		(async () => {
			try {
				await api.put(`/employees/${id}`, data);
			} catch (error) {
			} finally {
				await getEmployees();
			}
			modalController.closeModal();
		})();
	};

	const post = async () => {
		let data = {
			name,
			birthday,
			business_mail,
			email,
			gender,
			identification,
			marital_status,
			nationality,
			profession
		};

		try {
			await api.post('/employees', data);
		} catch (error) {
			console.log(error);
		} finally {
			await getEmployees();
		}
		modalController.closeModal();
	};

	const getEmployees = async () => {
		let res;
		const start = +page === 1 ? 0 : (+page - 1) * 3;

		try {
			res = await api
				.get(`/employees?_sort=id:DESC&_limit=${limit}&_start=${start}`)
				.then((response) => response.json());
		} catch (error) {
		} finally {
			employees = [];
			employees = [...res];
		}
	};

	const nextPage = async () => {
		employees.length > limit - 1 ? page++ : (page = page);
		await getEmployees();
		loaData();
	};

	const previusPage = async () => {
		page > 1 ? page-- : (page = 1);

		console.log(page);
		await getEmployees();
		loaData();
	};

	const setEdit = async (event) => {
		addOrEdit = false;
		id = event.detail.id;
		let data = employees.find((e) => e.id === id);
		name = data.name;
		email = data.email;
		birthday = data.birthday;
		business_mail = data.business_mail;
		gender = data.gender;
		identification = data.identification;
		nationality = data.nationality;
		profession = data.profession;
		modalController.openModal();
	};

	const loaData = async () => {
		body = [];
		for (const data of employees) {
			body.push([data.id, data.name, data.nationality, data.identification]);
		}
		await sleep(200);
		tableControler.addDataBody(body);
	};

	const deleteEmployee = async (event) => {
		loading = false;

		let id = event.detail.id;

		try {
			await api.DELETE(`/employees/${id}`);
			await getEmployees();
		} catch (error) {
			console.log(error);
		}

		loading = true;
		loaData();
	};

	const clearData = () => {
		name = '';
		birthday = '';
		business_mail = '';
		email = '';
		gender = 'Elija...';
		identification = '';
		marital_status = '';
		nationality = 'Elija...';
		profession = '';
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
				.get(`/employees?name_contains=${searchData}`)
				.then((response) => response.json());
			console.log(res);
		} catch (error) {
		} finally {
			employees = [];
			employees = [...res];
		}
		console.log(searchData);
		loaData();
	};

	const toOpenModalInfo = (e) => {
		dataModalInfo = [];
		let id = e.detail.id;
		let data = employees.find((e) => e.id === id);
		dataModalInfo = data;
		console.log(dataModalInfo);
		modalInfo.openModal();
	};
</script>

<div>
	<ModalInfo bind:this={modalInfo} title="Informacion de empleado">
		<div class="grid md:grid-cols-2  text-gray-700 mt-4">
			{#each Object.entries(dataModalInfo) as [key, value]}
				<div class="grid grid-cols-2">
					<p class="py-2 px-0 font-semibold capitalize">{key}:</p>
					{#if value === null}
						<p class="py-2">No</p>
					{:else}
						<p class="py-2 truncate">{value}</p>
					{/if}
				</div>
			{/each}
		</div>
	</ModalInfo>
</div>

<h1 class="text-center text-2xl font-bold text-gray-700" transition:fade={{ duration: 100 }}>Empleados</h1>
<div class="flex items-center justify-between" transition:fade={{ duration: 100 }}>
	<input
		on:change={search}
		bind:value={searchData}
		type="text"
		required
		placeholder="Buscar empleado..."
		class="input input-primary input-bordered focus:placeholder-primary mx-4 w-full"
	/>
	<Modal
		tilte="Agregar empleado"
		btnName="Agregar"
		icon="fas fa-plus"
		bind:this={modalController}
		on:closeModal={clearData}
	>
		<form class="form-control " on:submit|preventDefault={submit}>
			<label for="name" class="label">
				<span class="label-text">Nombre de empleado </span>
			</label>
			<input
				bind:value={name}
				type="text"
				required
				placeholder="Nombre del empleado"
				class="input input-primary input-bordered focus:placeholder-primary"
			/>

			<div class="w-full flex">
				<div class="w-1/2 mr-2">
					<label for="name" class="label">
						<span class="label-text">Identificacion</span>
					</label>
					<input
						bind:value={identification}
						type="text"
						required
						placeholder=""
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
				<span class="label-text">Correo electronico personal</span>
			</label>
			<input
				bind:value={email}
				type="email"
				required
				placeholder="Email"
				class="input input-primary input-bordered focus:placeholder-primary"
			/>

			<label for="name" class="label">
				<span class="label-text">Correo electronico corporativo</span>
			</label>
			<input
				bind:value={business_mail}
				type="email"
				placeholder="Email"
				class="input input-primary input-bordered focus:placeholder-primary"
			/>

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

			<label for="na" class="label mt-2">
				<span class="label-text">nacionalidad</span>
			</label>
			<select bind:value={nationality} class="select select-bordered select-info w-full" required>
				<option disabled="disabled" value="" selected="selected">Elija...</option>
				{#each countryList as country}
					<option value={country}>{country}</option>
				{/each}
			</select>

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



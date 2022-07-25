<svelte:head>
	<title>Roles</title>
</svelte:head>
<script>
	import Table from '../../components/Table.svelte';
	import Modal from '../../components/Modal.svelte';
	import Loader from '../../components/Loader.svelte';
	import * as api from '../../lib/api';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	let roles = [];
	let loading = false;
	let head = ['id', 'nombre'];
	let body = [];

	let modalController;
	let tableControler;

	onMount(async () => {
		try {
			await getRole();
		} catch (error) {
			console.log(error);
		}
		loading = true;
	});

	const getRole = async () => {
		try {
			let res = await api.get('/users-permissions/roles').then((response) => response.json());

			roles = [];
			roles = [...res.roles];
			console.log(roles);
			loaData();
		} catch (error) {
			console.log(error);
		}
	};

	const loaData = () => {
		body = [];
		for (const data of roles) {
			body.push([data.id, data.name]);
		}
		tableControler.addDataBody(body);
	};
</script>

<h1 class="text-center text-2xl font-bold" transition:fade={{ duration: 100 }}>Roles</h1>

<div class="flex justify-end mx-2 mb-2" transition:fade={{ duration: 100 }}>
	<a
		href="https://young-ocean-73880.herokuapp.com/admin/settings/users-permissions/roles"
		target="_blank"
		class="btn btn-info"><i class="fas fa-toolbox mr-2 text-lg" />Administrar Roles</a
	>
</div>
{#if loading}
	<Table bind:this={tableControler} {head} on:message={loaData} hiddenButton={true} />
{:else}
	<Loader />
{/if}

<div class="alert alert-warning fixed bottom-0 w-full">
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
				d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
			/>
		</svg>
		<p>Por medidas de seguridad los roloes solo se puden editar desde el panel de control de la API!</p>
	</div>
</div>

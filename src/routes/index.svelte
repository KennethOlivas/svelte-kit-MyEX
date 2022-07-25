<script>
	import Loader from '../components/Loader.svelte';
	import { user } from '../store/session';
	import { onMount } from 'svelte';
	import * as api from '../lib/api';

	let employees;
	let associates;
	let credit;

	onMount(async () => {
		console.log($user);
		await getCountAssociate();
		await getCountEmployee();
		await getCredit();
	});

	const getCountEmployee = async () => {
		let res = await api.get(`/employees/count`).then((response) => response.json());
		console.log(res);
		employees = res;
	};

	const getCountAssociate = async () => {
		let res = await api.get(`/associates/count`).then((response) => response.json());
		console.log(res);
		associates = res;
	};
	const getCredit = async () => {
		let res = await api
			.get(`/associate-credit-accounts/count?status=true`)
			.then((response) => response.json());
		console.log(res);
		credit = res;
	};
</script>

<svelte:head>
	<title>Young Ocean</title>
</svelte:head>
<div class="hero">
	<div class="hero-overlay bg-opacity-60" />
	<div class="text-center hero-content text-neutral-content">
		<div class="max-w-md">
			<h1 class="mb-5 text-5xl font-bold capitalize">{$user.username}</h1>
			<p class="mb-5">Bienvenido</p>
		</div>
	</div>
</div>

<div class="w-full shadow stats mt-4 ">
	<div class="stat">
		<div class="stat-figure text-primary">
			<i class="fas fa-id-badge text-4xl" />
		</div>
		<div class="stat-title">Empleados</div>
		<div class="stat-value">{employees}</div>
	</div>
	<div class="stat">
		<div class="stat-figure text-primary">
			<i class="fas fa-user-tie text-4xl" />
		</div>
		<div class="stat-title">Socios</div>
		<div class="stat-value">{associates}</div>
	</div>
	<div class="stat">
		<div class="stat-figure text-primary">
			<i class="fas fa-dollar-sign text-4xl" />
		</div>
		<div class="stat-title">Creditos activos</div>
		<div class="stat-value">{credit}</div>
	</div>
</div>

<style>
</style>

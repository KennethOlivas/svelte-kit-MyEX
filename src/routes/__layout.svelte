<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import * as api from '../lib/api';
	import { user } from '../store/session';
	import { fly } from 'svelte/transition';
	import { access_token } from '../store/session';

	import '../styles/tailwind-output.css';

	let loading = false;

	onMount(async () => {
		if (!$access_token) {
			goto('/login');
		}
		let res = await api.get('/users/me').then((response) => response.json());
		if (res.statusCode === 401) {
			goto('/login');
			return;
		}
		if (res.role.id !== 3) {
			menu.splice(1, 1);
		}
		console.log(res);

		loading = true;
		let route = window.location.pathname;
		console.log(route);

		switch (route) {
			case '/role':
			case '/employees':
			case '/user':
				current = 2;
				break;
			case '/request':
			case '/associates':
			case '/acounts':
				current = 3;
				break;
			case '/transactions':
			case '/credit':
				current = 4;
				break;
			case '/check':
				current = 5;
				break;
			default:
				current = 1;
		}
	});
	let menu = [
		{
			id: 1,
			name: 'Home',
			icon: 'fas fa-home',
			route: '/'
		},
		{
			id: 2,
			name: 'Admin',
			icon: 'fas fa-users-cog',
			route: '',
			submenu: [
				{
					name: 'Usuarios',
					route: 'user'
				},
				{
					name: 'Roles',
					route: 'role'
				},
				{
					name: 'Empleados',
					route: 'employees'
				},
				{
					name: 'Cuentas bancarias',
					route: 'bankaccount'
				}
			]
		},
		{
			id: 3,
			name: 'Socios',
			icon: 'fas fa-users',
			route: '',
			submenu: [
				{
					name: 'Solicitudes',
					route: 'request'
				},
				{
					name: 'Socios',
					route: 'associates'
				},
				{
					name: 'Cuentas',
					route: 'acounts'
				}
			]
		},
		{
			id: 4,
			name: 'Transacciones',
			icon: 'fas fa-hand-holding-usd',
			route: '',
			submenu: [
				{
					name: 'Retiros y Depositos',
					route: 'transactions'
				},
				{
					name: 'Cretido',
					route: 'credit'
				}
			]
		},
		{
			id: 5,
			name: 'Cheques',
			icon: 'fas fa-money-check',
			route: '/check'
		}
	];

	let hambugerMenu = true;

	let current = 0;

	const logOut = () => {
		localStorage.removeItem('access_token');
		goto('/login');
	};

</script>

{#if loading}
	<main class="h-screen relative" in:fly={{ y: 500 }} out:fly={{ y: -500 }}>
		<div class="flex items-start justify-between shadow-2xl ">
			<div class="h-screen hidden md:block relative bg-base-content">
				<div class=" h-full ">
					<div class="flex items-center justify-start pt-6">
						<p class="font-bold text-white text-xl px-12 text-center {hambugerMenu ? 'hidden' : ''}">
							Young Ocean 
						</p>
					</div>	
					<nav class="transition-all duration-400 {hambugerMenu ? 'mt-2' : 'mt-6'}">
						<div>
							{#each menu as menuItems, i}
								<div
									class="my-2 mx-1 hover:bg-primary-focus rounded-box text-white cursor-pointer {menuItems.id ===
									current
										? 'bg-primary text-white'
										: ''} flex items-center transition-colors duration-200 "
								>
									{#if menuItems.submenu}
										<div class="dropdown dropdown-right w-full ">
											<div tabindex="0" class="py-2 px-4 my-2 {hambugerMenu ? 'text-center' : 'text-left'}">
												<span class="text-left ">
													<i class={menuItems.icon} />
												</span>
												<span class="mx-2 text-sm font-normal  {hambugerMenu ? 'hidden  ' : 'translate-x-0'}">
													{menuItems.name}
												</span>
											</div>
											<ul
												tabindex="0"
												class="p-2 shadow menu dropdown-content bg-primary rounded-box w-52 text-white ml-1"
											>
												{#each menuItems.submenu as submenu}
													<li>
														<a on:click={() => (current = menuItems.id)} href={submenu.route}
															>{submenu.name}</a
														>
													</li>
												{/each}
											</ul>
										</div>
									{:else}
										<a
											class="w-full  py-2 px-4 my-2 {hambugerMenu ? 'text-center' : 'text-left'}"
											href={menuItems.route}
											on:click={() => (current = menuItems.id)}
										>
											<span class="">
												<i class={menuItems.icon} />
											</span>
											<span class="mx-2 text-sm font-normal {hambugerMenu ? 'hidden' : ''}">
												{menuItems.name}
											</span>
										</a>
									{/if}
								</div>
							{/each}
						</div>
					</nav>
				</div>
			</div>
			<div class="flex flex-col w-full">
				<header class="w-full h-16 z-40 flex items-center justify-between">
					<div class="block md:hidden ml-6">
						<div class="dropdown">
							<div
								tabindex="0"
								class="flex p-2 items-center rounded-full bg-white shadow text-gray-500 text-md"
							>
								<svg
									width="20"
									height="20"
									class="text-gray-400"
									fill="currentColor"
									viewBox="0 0 1792 1792"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M1664 1344v128q0 26-19 45t-45 19h-1408q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1408q26 0 45 19t19 45zm0-512v128q0 26-19 45t-45 19h-1408q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1408q26 0 45 19t19 45zm0-512v128q0 26-19 45t-45 19h-1408q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1408q26 0 45 19t19 45z"
									/>
								</svg>
							</div>
							<ul tabindex="0" class="shadow menu dropdown-content bg-base-100 rounded-box w-96">
								{#each menu as menuItems, i}
									{#if menuItems.submenu}
										<li>
											<div class="collapse w-96 collapse-arrow">
												<input type="checkbox" />
												<p class="collapse-title mt-2">
													<span class="text-left mr-1">
														<i class={menuItems.icon} />
													</span>
													{menuItems.name}
												</p>
												<div class="collapse-content">
													{#each menuItems.submenu as submenu}
														<li>
															<a href={submenu.route} class="w-full pl-6 p-2 my-2">{submenu.name}</a
															>
														</li>
													{/each}
												</div>
											</div>
										</li>
									{:else}
										<li>
											<a
												class="w-full pl-6 p-2 my-2"
												href={menuItems.route}
												on:click={() => (current = menuItems.id)}
											>
												<span class="text-left">
													<i class={menuItems.icon} />
												</span>
												<span class="mx-2 text-sm font-normal">
													{menuItems.name}
												</span>
											</a>
										</li>
									{/if}
								{/each}
							</ul>
						</div>
					</div>
					<div class="relative z-20 flex flex-col justify-end h-full px-3 md:w-full">
						<div class="relative p-1 flex items-center w-full space-x-4 justify-between">
							<button
								class="mt-4 btn btn-ghost hidden md:block"
								on:click={() => {
									hambugerMenu = !hambugerMenu;
								}}><i class="fas fa-bars text-xl"></i></button
							>
							<div class="dropdown dropdown-end flex">
								<span class="w-1 h-8 rounded-lg bg-gray-200 mt-2 mr-2" />
								<div tabindex="0" class=" btn btn-ghost">
									<i class="fas fa-user-shield mr-2" />{$user.username ? $user.username : ''}
								</div>
								<ul
									tabindex="0"
									class="p-2 shadow menu dropdown-content bg-base-200 rounded-box w-52 mt-14"
								>
									<li>
										<a href="https://young-ocean-73880.herokuapp.com/admin" target="_blanck"
											><i class="fas fa-cubes mr-4" />Dashboard API</a
										>
										<!-- svelte-ignore a11y-missing-attribute -->
										<a on:click={logOut}><i class="fas fa-power-off  mr-4" />Logout</a>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</header>
				<slot />
			</div>
		</div>
	</main>
{/if}

<style>
</style>

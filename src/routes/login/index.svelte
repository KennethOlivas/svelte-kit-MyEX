<svelte:head>
	<title>Login</title>
</svelte:head>

<script>
	import { goto } from '$app/navigation';
	import Modal from '../../components/Modal.svelte';
	import { urlBase } from '../../lib/api';
	import { handleResponse } from '../../lib/utils';
	import { access_token, user } from '../../store/session';
	import { fly } from 'svelte/transition';

	let username;
	let password;
	let modal;
	let title;
	let bodyModal;

	const login = async () => {
		let headers = {};
		const body = JSON.stringify({ identifier: username, password });
		headers['Content-Type'] = 'application/json';

		try {
			await fetch(`${urlBase}/auth/local`, {
				method: 'POST',
				body,
				headers
			})
				.then(handleResponse)
				.then((data) => {
					access_token.reset(data.jwt);
					user.reset(data.user);
					goto('/');
				});
		} catch (error) {
			console.log(error.message[0].messages[0].message);
			title = 'Error al iniciar sesion';
			bodyModal = error.message[0].messages[0].message;
			modal.openModal();
		}
	};

	const handleKeyPress = (e) => {
		if (e.code === 'Enter') {
			login();
		}
	};
</script>

<div class="font-sans h-screen" in:fly={{ y: 500 }} out:fly={{ y: -500 }}>
	<div class="relative min-h-screen flex flex-col justify-center items-center bg-indigo-100">
		<div class="w-40 h-40 absolute bg-purple-300  rounded-full top-0 hidden md:block filter blur-sm animate-pulse " />
		<div
			class="w-20 h-40 absolute bg-blue-300  rounded-full bottom-10  transform rotate-45 hidden md:block filter blur-sm animate-pulse  "
		/>
		<div
			class="absolute w-60 h-60 rounded-xl bg-indigo-300 -left-16 z-0 transform rotate-45 hidden md:block filter blur-sm animate-pulse "
		/>
		<div
			class="absolute w-48 h-48 rounded-xl bg-indigo-300   right-10 transform rotate-12 hidden md:block filter blur-sm animate-pulse "
		/>
		<div class="relative max-w-sm sm:max-w-md md:max-w-lg  mx-8 w-full">
			<div
				class="card bg-primary shadow-lg  w-full h-full rounded-3xl absolute  transform -rotate-6 animate-pulse"
			/>
			<div
				class="card bg-indigo-600 shadow-lg  w-full h-full rounded-3xl absolute  transform rotate-6 animate-pulse"
			/>
			<div class="relative w-full rounded-3xl  px-6 py-4 bg-base-200  shadow-md">
				<label for="" class="block mt-3 text-2xl  text-center font-semibold"> Login </label>
				<form on:keypress={handleKeyPress} class="mt-10">
					<div>
						<input
							bind:value={username}
							type="text"
							placeholder="Nombre de usuario"
							class="mt-1 block w-full input input-primary"
						/>
					</div>

					<div class="mt-7">
						<input
							bind:value={password}
							type="password"
							placeholder="Contraseña"
							class="mt-1 block w-full input input-primary"
						/>
					</div>

					<div class="mt-7">
						<button on:click={login} type="button" class="btn btn-primary w-full text-white">
							Login
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</div>

<Modal bind:this={modal} tilte={title}>
	<p class="text-center mt-2">{bodyModal}</p>
	<div class="modal-action">
		<label for="my-modal-2" class="btn btn-error text-white w-full">Aceptar</label>
	</div>
</Modal>

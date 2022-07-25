<script>
	import { fade, fly } from 'svelte/transition';
	import * as api from '../lib/api';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	let typeSearch;
	let inputSearch;
	let notResult = false;
	let numberExceeded;
	let numberExceededMessage;
	let guarantors = [];
	export let associate;

	const search = () => {};

	let resultsAssociates = [];

	const searchAssociate = async () => {
		numberExceeded = false;
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
		let res;
		try {
			res = await api
				.get(`/guarantors?associate.id=${data.id}`)
				.then((response) => response.json());
		} catch (error) {
		} finally {
			if (res.length !== 0) {
				if (res[0].guarantor_number >= 2) {
					numberExceeded = true;
					numberExceededMessage = 'El fiador posee dos socios con creditos activos';
					return;
				}
			} else {
				let newGuarnator;
				newGuarnator = {
					associate: data.id,
					guarantor_number: 0
				};
				try {
					await api.post('/guarantors', newGuarnator);
				} catch (error) {
					console.log(error);
				}
			}
			notRepeat(data);
		}
	};

	const notRepeat = (data) => {
		let result = guarantors.find((guarantor) => guarantor.id === data.id);
		if (result || data.id === associate.id) {
			return;
		}
		guarantors.push(data);
		guarantors = [...guarantors];
		exportData();
	};

	const deleteListGuarantors = (id) => {
		guarantors = guarantors.filter((arr) => arr.id !== id);
		exportData()
	};

	const exportData = () => {
		dispatch('exportData', {
			data: guarantors
		});
	}
</script>

<div class="">
	<p class="text-xl text-center font-semibold mt-4">Buscar Fiador</p>
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
			<p class="mt-1 text-center text-neutral text-2xl font-semibold">Resultados de la busquedas</p>
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

	<div class="alert alert-error mt-4 {numberExceeded ? '' : 'hidden'}">
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
			<p>{numberExceededMessage}</p>
		</div>
	</div>
	{#if guarantors.length !== 0}
		<div class="overflow-x-auto mt-4">
			<p class="text-center text-lg font-semibold">Fiadores</p>
			<table class="table w-full">
				<tbody>
					{#each guarantors as data, i}
						<tr class="hover" transition:fade={{ duration: 400 }}>
							<th>{data.name}</th>
							<td>{data.lastname}</td>
							<td>{data.identification}</td>
							<td class="text-xl cursor-pointer group transition-color"
								><button
									type="button"
									on:click={() => {
										deleteListGuarantors(data.id);
									}}
									class="fas fa-times group-hover:text-red-600 "
								/></td
							>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

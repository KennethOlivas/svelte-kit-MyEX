<script>

	import Table from "../Table.svelte"
	

	

	let name;
	let number = 1;
	let concept;
	let date;
    let amount
    
    let detail = "Cheque"

</script>

<h2 class="font-semibold text-4xl text-gray-600 text-center mx-4 mt-4">Cheques</h2>
<div class="card bg-white rounded-2xl    shadow-lg p-4 px-4 md:p-8 mb-6 mx-4">
	<div class="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3">
		<div class="lg:col-span-3">
			<div class="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-6">
				<div class="md:col-span-3">
					<label for="full_name">Paguese a</label>
					<input
                        bind:value={name}
						type="text"
						name="full_name"
						id="full_name"
						class="h-10 border my-2 rounded px-4 w-full bg-gray-50 input input-primary"
					/>
				</div>
                <div class="md:col-span-2">
					<label for="date">Fecha de emision</label>
					<input
                        bind:value={date}
						type="date"
						name="date"
						id="date"
						class="h-10 border my-2 rounded px-4 w-full bg-gray-50 input input-primary"
					/>
				</div>
				
				<div class="md:col-span-1">
					<label for="number">Nº Cheque</label>
					<input
                        bind:value={number}
						type="number"
						name="number"
						class="h-10 border my-2 rounded px-4 w-full bg-gray-50 input input-disabled"
						disabled
					/>
				</div>

				<div class="md:col-span-4">
					<label for="concept">Concepto</label>
					<input
                        bind:value={concept}
						type="text"
						name="concept"
						class="h-10 border my-2 rounded px-4 w-full bg-gray-50 input input-primary"
					/>
				</div>
                <div class="md:col-span-2">
					<label for="amount">Monto</label>
					<input
                        bind:value={amount}
						type="number"
						name="amount"
						class="h-10 border my-2 rounded px-4 w-full bg-gray-50 input input-primary"
					/>
				</div>

                
				<div class="md:col-span-6 text-right">
					<div class="inline-flex items-end">
                        <p class="badge badge-primary mx-4 text-white p-4 font-semibold ">Saldo en la cuenta: </p>
						<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
							>Generar</button
						>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>


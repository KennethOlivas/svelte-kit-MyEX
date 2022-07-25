<script>

    import { onMount } from 'svelte';
    import * as api from '../lib/api';
    import { fade } from 'svelte/transition';


    export let id  
    let resultTrasaction = []

    let page = 1;
	// limite de paginacion
	const limit = 8;


    onMount(async () => {
        console.log(id);
        await getTransactions()
	});


    const getTransactions = async() => {

        let res;
		const start = +page === 1 ? 0 : (+page - 1) * 3;

		try {
			res = await api
				.get(`/transactions?associate_account.associate_contains=${id}&_sort=id:DESC&_limit=${limit}&_start=${start}`)
				.then((response) => response.json());
                console.log(res);
		} catch (error) {
		} finally {
			resultTrasaction = [];
			resultTrasaction = [...res];
		}
    }
 
    const nextPage = async () => {
		resultTrasaction.length > limit - 1 ? page++ : (page = page);
		await getTransactions();
		
	};

	const previusPage = async () => {
		page > 1 ? page-- : (page = 1);
		await getTransactions();
	};
</script>


<div class="overflow-x-auto mt-4">
    <table class="table w-full">
        <thead>
            <tr>
                <th>Numero de transaccion</th>
                <th>Numero de cuenta</th>
                <th>Tipo</th>
                <th>Monto</th>
                <th>Valance de cuenta</th>
                <th>Fecha de Transaccion</th>
            </tr>
        </thead>
        <tbody>
            {#each resultTrasaction as data}
                <tr
                    class=""
                    in:fade={{ duration: 400 }}
                >
                    <th>{data.id}</th>
                    <th>{data.associate_account.number}</th>
                    <th>{data.type ? 'Deposito' : 'Retiro'}</th>
                    <td>{data.associate_account.dollar ? '$ ' : 'C$ '} {data.amount}</td>
                    <td>{data.associate_account.dollar ? '$ ' : 'C$ '} {data.valance}</td>
                    <td>{data.created_at}</td>
                </tr>
            {/each}
        </tbody>
    </table>

    <div class="btn-group w-full mt-4">
        <button class="btn btn-outline w-1/2" on:click={previusPage}>
        	<i class="fas fa-arrow-left text-lg" />
        </button> 
        <button class="btn btn-outline w-1/2" on:click={nextPage}>
        	<i class="fas fa-arrow-right text-lg" />
        </button>
      </div>
</div>
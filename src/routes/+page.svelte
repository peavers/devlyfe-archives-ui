<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { format } from 'date-fns';
	import { authToken } from '$lib/stores/auth';
	import { messagesStore, type SortOrder } from '$lib/stores/messages';

	let observer: IntersectionObserver;
	let currentSort: SortOrder;

	$: ({ messages, loading, hasMore, searchTerm, sortOrder } = $messagesStore);

	function handleSearch() {
		messagesStore.setSearchTerm(searchTerm);
		messagesStore.reset();
		messagesStore.loadMessages();
	}

	function handleSortChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		messagesStore.setSortOrder(select.value as SortOrder);
		messagesStore.reset();
		messagesStore.loadMessages();
	}

	function handleLogout() {
		localStorage.removeItem('authToken');
		authToken.set('');
		window.location.reload();
	}

	onMount(() => {
		messagesStore.loadMessages();

		const sentinel = document.getElementById('scroll-sentinel');
		observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !loading && hasMore) {
					messagesStore.loadMessages();
				}
			},
			{ threshold: 0.1 }
		);

		if (sentinel) {
			observer.observe(sentinel);
		}
	});

	onDestroy(() => {
		observer?.disconnect();
	});
</script>

<div class="min-h-screen bg-gray-900 text-green-400 font-mono flex flex-col">
	<nav class="border-b border-green-700">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<div class="flex-shrink-0">
					<h1 class="text-xl font-bold tracking-tight">The Devlyfe Archives</h1>
				</div>
				<button
					on:click={handleLogout}
					class="border border-green-600 hover:bg-green-800 text-green-400 py-2 px-4 rounded-sm transition-colors duration-200"
				>
					Logout
				</button>
			</div>
		</div>
	</nav>

	<div class="mx-auto w-full max-w-7xl flex-1 py-6 sm:px-6 lg:px-8">
		<div class="px-4 py-6 sm:px-0">
			<div class="flex gap-4 mb-6">
				<div class="flex-1">
					<label for="search" class="block mb-2 text-sm text-green-500">
						Search:
					</label>
					<input
						id="search"
						type="text"
						bind:value={$messagesStore.searchTerm}
						on:input={handleSearch}
						placeholder="Search messages or users..."
						class="block w-full rounded-sm border border-green-600 bg-gray-800
                   px-3 py-2 text-sm leading-5 text-green-400 placeholder-green-600
                   focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400"
					/>
				</div>
				<div class="w-40">
					<label for="sort" class="block mb-2 text-sm text-green-500">
						Sort Order:
					</label>
					<select
						id="sort"
						value={sortOrder}
						on:change={handleSortChange}
						class="block w-full appearance-none rounded-sm border border-green-600 bg-gray-800
           px-3 py-2 text-sm leading-5 text-green-400 focus:border-green-400
           focus:outline-none focus:ring-1 focus:ring-green-400"
					>
						<option value="desc">Newest First</option>
						<option value="asc">Oldest First</option>
					</select>
				</div>
			</div>

			<div class="space-y-2">
				{#each messages as message}
					<div class="border-b border-green-800 pb-2">
						<div class="flex items-center justify-between text-sm">
							<div class="flex items-center gap-2">
								<img
									src={message.author?.avatar || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMwAAADACAMAAAB/Pny7AAAAOVBMVEX///+hoaGZmZmenp75+fmmpqbX19e3t7e/v7/t7e3n5+epqanNzc3KysqSkpL8/Pzf39/z8/OwsLBPkmpzAAAC40lEQVR4nO3a6W6rMBCGYbywmmDC/V9sTSAUEiASWGKQ3udXK3EQ3xmPF0qSAAAAAAAAAAAAAAAAAAAAAAAAAAAu4xNvY7o2TZZHVZRXhklNXNmFWbxSKmIUZeoLw1ildBVLWehLw4TKNPHu9iBMNIswYZ72/szdJIU5TUiYUBFbF0V9bpmQEiZpU2WUco8zdxMSJmlDkn7NUY/keNsICePNEEaptDp+NyFhska9FcfvJiRMod9ZTHf8bkLCdGYK447fTUiYx1QZdf/KVI1R6RBm/3F2j19CwiT5WBqT7j1u25m83J67hYTx3oXaKKPTnWdNWhdOLDtzt5Aw4afMGZM+9upSvqYJkz+3LhATJrSDfdq95d+O87euty6TE2Z3F9MfDTI1zt9ma6DJCfPjwtAw0+ydbmyu7xImKfP/pUgX621zlzD+Me0R+jTZ6pH0LmGmhhnTrLbNLcL4pHJaLbjnyoxxizDJs/jIovTainSLML7+zBL+Wft9ncgwtprPVmFWXjbMuNp8b3wkhql0o+fnzapbyRJOcV8DTWCYUpt+KZl+/26YcaB9tY24MN6613ayP9cMw2ilYcZJ4LNtxIWx46HTuHEpqdK1Qfa6RH1sBMSFad/vaUz+GkXzbcxXabrl/llWGJ+Us//4vm22GmZsm9rLDZPYWR1MmoVtjN4aZK9LmsW2RlYYXzfzR+3K7YYZL1F2VhtZYapm+ajdTsMMdG5lhvHPMLSWafbr0l+haz9NAqLC/KzDam3+20ZSmOxIlvmbNkFhykNZ+raRN8zs7wbZMJ0GxITxu6vjj9qMb2vEhDnWMAPjhhlNSphyd6X/WZrh77pCwnh3Jsu7bYSEOdEwY236tzUywrTN2Y+zdOeFVMam7jSVCQnzLCOoJITR8T43vTiM7Q+U0bhrP2v04XilY+kngivDJHkalTvx5c15ZRbVpVmiO/VZJAAAAAAAAAAAAAAAAAAAAAAAAABc4A+lUzEyY9gMcgAAAABJRU5ErkJggg=='}
									alt={message.author?.display_name || 'User avatar'}
									class="w-8 h-8 rounded-sm border border-green-600"

								/>
								<span class="font-bold text-green-300">
                    {message.author?.real_name || message.author?.display_name || 'Unknown User'}
                </span>
							</div>
							<span class="text-green-500">
                {format(new Date(message.ts.replace('+00:00', '')), 'PPpp')}
            </span>
						</div>
						<p class="mt-1 whitespace-pre-wrap text-green-400 break-all ml-10">
							{message.text}
						</p>
					</div>
				{/each}
			</div>

			{#if loading}
				<div class="flex justify-center my-4">
					<div class="h-8 w-8 animate-spin rounded-full border-4 border-green-400 border-t-transparent"></div>
				</div>
			{/if}

			<div id="scroll-sentinel" class="mt-2"></div>
		</div>
	</div>
</div>
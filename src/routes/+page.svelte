<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { format } from 'date-fns';
	import { messagesStore, loadMessages, resetMessages, authToken } from '$lib/stores';

	let observer: IntersectionObserver;

	$: ({ messages, loading, hasMore, searchTerm, sortOrder } = $messagesStore);

	function handleSearch() {
		resetMessages();
		loadMessages();
	}

	function handleSortChange() {
		resetMessages();
		loadMessages();
	}

	function handleLogout() {
		localStorage.removeItem('authToken');
		authToken.set('');
		window.location.reload();
	}

	onMount(() => {
		loadMessages();

		const sentinel = document.getElementById('scroll-sentinel');
		observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) {
				loadMessages();
			}
		}, {
			threshold: 0.1
		});

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
						bind:value={$messagesStore.sortOrder}
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
						<div class="flex justify-between text-sm">
                            <span class="font-bold text-green-300">
                                {message.user_name}
                            </span>
							<span class="text-green-500">
                                {format(new Date(message.datetime), 'PPpp')}
                            </span>
						</div>
						<p class="mt-1 whitespace-pre-wrap text-green-400 break-all">
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
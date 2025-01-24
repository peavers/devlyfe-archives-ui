<script lang="ts">
	import { onMount } from 'svelte';
	import { authToken } from '$lib/stores';

	let password = '';
	let isAuthenticated = false;
	let error = '';

	onMount(async () => {
		if ($authToken) {
			try {
				const response = await validateToken($authToken);
				if (response.ok) {
					isAuthenticated = true;
				} else {
					authToken.set('');
				}
			} catch (err) {
				authToken.set('');
			}
		}
	});

	async function validateToken(token: string) {
		return fetch(
			'https://dzv1rhjtsh.execute-api.us-west-2.amazonaws.com/prod/validate',
			{
				headers: {
					'Authorization': token
				}
			}
		);
	}

	async function handleSubmit() {
		try {
			const response = await validateToken(password);

			if (response.ok) {
				authToken.set(password);
				isAuthenticated = true;
				error = '';
			} else {
				error = 'Invalid password';
			}
		} catch (err) {
			error = 'Error validating password';
		}
	}
</script>

{#if !isAuthenticated}
	<div class="min-h-screen bg-gray-900 text-green-400 font-mono flex items-center justify-center">
		<div class="w-full max-w-md p-8 border border-green-700 rounded-sm">
			<h1 class="text-xl font-bold mb-6 text-center">Access Required</h1>

			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				<div>
					<label for="password" class="block mb-2 text-sm text-green-500">Password:</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						class="block w-full rounded-sm border border-green-600 bg-gray-800 px-3 py-2
                               text-green-400 placeholder-green-600 focus:border-green-400
                               focus:outline-none focus:ring-1 focus:ring-green-400"
					/>
				</div>

				{#if error}
					<p class="text-red-500 text-sm">{error}</p>
				{/if}

				<button
					type="submit"
					class="w-full bg-green-700 hover:bg-green-600 text-green-100 py-2 px-4 rounded-sm
                           transition-colors duration-200"
				>
					Enter
				</button>
			</form>
		</div>
	</div>
{:else}
	<slot />
{/if}
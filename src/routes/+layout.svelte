<script>
	import '../app.css';
	import PasswordProtection from '$lib/components/PasswordProtection.svelte';

	export const ssr = false;
</script>

<PasswordProtection>
	<slot />
</PasswordProtection>
<script>
	export let variant = 'primary'; // primary, secondary, outline, ghost, danger
	export let size = 'md'; // sm, md, lg
	export let disabled = false;
	export let loading = false;
	export let href = null;
	export let target = null;
	export let rel = null;
	
	$: baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
	
	$: variantClasses = {
		primary: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500',
		secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
		outline: 'border-2 border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600 focus:ring-blue-500',
		ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
		danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
	}[variant];
	
	$: sizeClasses = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2',
		lg: 'px-6 py-3 text-lg'
	}[size];
	
	$: classes = `${baseClasses} ${variantClasses} ${sizeClasses}`;
</script>

{#if href}
	<a 
		{href} 
		{target} 
		{rel}
		class={classes}
		class:opacity-50={loading}
	>
		{#if loading}
			<svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
		{/if}
		<slot />
	</a>
{:else}
	<button 
		class={classes}
		{disabled}
		class:opacity-50={loading}
		on:click
		on:mouseenter
		on:mouseleave
		on:focus
		on:blur
	>
		{#if loading}
			<svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
		{/if}
		<slot />
	</button>
{/if}

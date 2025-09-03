<script>
	export let type = 'text';
	export let value = '';
	export let placeholder = '';
	export let disabled = false;
	export let error = '';
	export let label = '';
	export let required = false;
	export let id = '';
	
	$: inputClasses = `
		w-full px-3 py-2 border rounded-lg transition-colors duration-200 
		focus:outline-none focus:ring-2 focus:ring-blue-500 
		disabled:bg-gray-50 disabled:cursor-not-allowed
		${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
	`;
</script>

<div class="space-y-1">
	{#if label}
		<label for={id} class="block text-sm font-medium text-gray-700">
			{label}
			{#if required}
				<span class="text-red-500">*</span>
			{/if}
		</label>
	{/if}
	
	<input
		{type}
		{id}
		{placeholder}
		{disabled}
		{required}
		bind:value
		class={inputClasses}
		on:input
		on:focus
		on:blur
		on:keydown
		on:keyup
		on:change
	/>
	
	{#if error}
		<p class="text-sm text-red-600">{error}</p>
	{/if}
</div>

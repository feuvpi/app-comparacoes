<script lang="ts">
	export let value: string = '';
	export let options: Array<{value: string, label: string}> = [];
	export let placeholder: string = 'Selecione uma opção';
	export let disabled: boolean = false;
	export let error: string = '';
	export let label: string = '';
	export let required: boolean = false;
	export let id: string = '';
	
	$: selectClasses = `
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
	
	<select
		{id}
		{disabled}
		{required}
		bind:value
		class={selectClasses}
		on:change
		on:focus
		on:blur
	>
		{#if placeholder}
			<option value="" disabled selected={!value}>{placeholder}</option>
		{/if}
		
		{#each options as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
	
	{#if error}
		<p class="text-sm text-red-600">{error}</p>
	{/if}
</div>

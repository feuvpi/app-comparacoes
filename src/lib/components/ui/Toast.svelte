<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-svelte';
	
	export let type: 'success' | 'error' | 'warning' | 'info' = 'info';
	export let title: string = '';
	export let message: string = '';
	export let dismissible: boolean = true;
	export let duration: number = 5000; // Auto-dismiss after 5 seconds
	
	const dispatch = createEventDispatcher();
	
	const icons = {
		success: CheckCircle,
		error: XCircle,
		warning: AlertCircle,
		info: Info
	} as const;
	
	const colorClasses = {
		success: 'bg-green-50 border-green-200 text-green-800',
		error: 'bg-red-50 border-red-200 text-red-800',
		warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
		info: 'bg-blue-50 border-blue-200 text-blue-800'
	} as const;
	
	const iconColors = {
		success: 'text-green-400',
		error: 'text-red-400',
		warning: 'text-yellow-400',
		info: 'text-blue-400'
	} as const;
	
	function dismiss() {
		dispatch('dismiss');
	}
	
	// Auto-dismiss
	if (duration > 0) {
		setTimeout(dismiss, duration);
	}
</script>

<div class="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto border {colorClasses[type]}">
	<div class="p-4">
		<div class="flex items-start">
			<div class="flex-shrink-0">
				<svelte:component this={icons[type]} class={iconColors[type]} size={20} />
			</div>
			
			<div class="ml-3 w-0 flex-1">
				{#if title}
					<p class="text-sm font-medium">
						{title}
					</p>
				{/if}
				
				{#if message}
					<p class="text-sm" class:mt-1={title}>
						{message}
					</p>
				{/if}
				
				<slot />
			</div>
			
			{#if dismissible}
				<div class="ml-4 flex-shrink-0 flex">
					<button
						onclick={dismiss}
						class="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
					>
						<X size={16} />
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>
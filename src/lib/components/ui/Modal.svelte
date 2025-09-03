<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { X } from 'lucide-svelte';
	
	export let open: boolean = false;
	export let title: string = '';
	export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let closable: boolean = true;
	
	const dispatch = createEventDispatcher();
	
	function closeModal() {
		if (closable) {
			open = false;
			dispatch('close');
		}
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && closable) {
			closeModal();
		}
	}
	
	function handleBackdropClick() {
		closeModal();
	}
	
	function handleBackdropKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			closeModal();
		}
	}
	
	$: sizeClasses = {
		sm: 'max-w-md',
		md: 'max-w-lg',
		lg: 'max-w-2xl',
		xl: 'max-w-4xl'
	}[size];
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- Backdrop -->
	<div 
		class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
		onclick={handleBackdropClick}
		onkeydown={handleBackdropKeydown}
		role="button"
		tabindex="0"
		aria-label="Close modal"
	>
		<!-- Modal Content -->
		<div 
			class="bg-white rounded-xl shadow-xl w-full {sizeClasses} max-h-[90vh] overflow-hidden"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			tabindex="-1"
			aria-modal="true"
			aria-labelledby={title ? 'modal-title' : undefined}
		>
			<!-- Header -->
			{#if title || closable}
				<div class="flex items-center justify-between p-6 border-b border-gray-200">
					<h3 id="modal-title" class="text-lg font-semibold text-gray-900">
						{title}
					</h3>
					
					{#if closable}
						<button
							onclick={closeModal}
							class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
							aria-label="Fechar modal"
						>
							<X size={24} />
						</button>
					{/if}
				</div>
			{/if}
			
			<!-- Body -->
			<div class="p-6 overflow-y-auto">
				<slot />
			</div>
			
			<!-- Footer -->
			<slot name="footer" />
		</div>
	</div>
{/if}

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Star, Heart, ExternalLink, Check } from 'lucide-svelte';
	
	export let product: any;
	export let selected: boolean = false;
	export let showCompareButton: boolean = true;
	
	const dispatch = createEventDispatcher();
	
	function handleToggleSelection() {
		dispatch('toggle', product);
	}
	
	function handleViewProduct() {
		dispatch('view', product);
	}
	
	function formatPrice(price: number): string {
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL'
		}).format(price);
	}
	
	function renderStars(rating: number) {
		const stars = [];
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 !== 0;
		
		for (let i = 0; i < 5; i++) {
			if (i < fullStars) {
				stars.push('full');
			} else if (i === fullStars && hasHalfStar) {
				stars.push('half');
			} else {
				stars.push('empty');
			}
		}
		return stars;
	}
</script>

<article 
	class="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
	class:ring-2={selected}
	class:ring-blue-500={selected}
	class:ring-opacity-50={selected}
>
	<!-- Selection Indicator -->
	{#if selected}
		<div class="absolute top-4 left-4 z-20 bg-blue-500 text-white rounded-full p-1">
			<Check size={16} />
		</div>
	{/if}
	
	<!-- Product Image -->
	<div class="relative overflow-hidden bg-gray-50 aspect-[4/3]">
		<img
			src={product.image || '/images/placeholder.jpg'}
			alt={product.name}
			class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
			loading="lazy"
		/>
		
		<!-- Overlay Badges -->
		<div class="absolute top-4 right-4 flex flex-col gap-2">
			{#if product.featured}
				<span class="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
					Destaque
				</span>
			{/if}
			
			{#if product.discount}
				<span class="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
					-{product.discount}%
				</span>
			{/if}
		</div>
		
		<!-- Wishlist Button -->
		<button
			class="absolute top-4 left-4 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors"
			aria-label="Adicionar aos favoritos"
		>
			<Heart size={18} class="text-gray-600 hover:text-red-500 transition-colors" />
		</button>
	</div>
	
	<!-- Product Info -->
	<div class="p-6">
		<!-- Brand & Model -->
		<div class="flex items-center justify-between mb-3">
			<span class="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
				{product.brand}
			</span>
			
			<!-- Rating -->
			{#if product.rating}
				<div class="flex items-center gap-1">
					<div class="flex">
						{#each renderStars(product.rating) as star}
							<Star 
								size={14} 
								class={star === 'full' ? 'text-yellow-400 fill-current' : 
								       star === 'half' ? 'text-yellow-400 fill-current opacity-50' : 
								       'text-gray-300'}
							/>
						{/each}
					</div>
					<span class="text-xs text-gray-600 ml-1">
						({product.rating})
					</span>
				</div>
			{/if}
		</div>
		
		<!-- Product Name -->
		<h3 class="font-semibold text-gray-900 text-lg leading-tight mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
			{product.name}
		</h3>
		
		<!-- Key Specs -->
		{#if product.key_specs}
			<div class="flex flex-wrap gap-2 mb-4">
				{#each product.key_specs.slice(0, 3) as spec}
					<span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
						{spec}
					</span>
				{/each}
			</div>
		{/if}
		
		<!-- Price -->
		<div class="mb-4">
			{#if product.original_price && product.original_price > product.price}
				<div class="flex items-center gap-2">
					<span class="text-sm text-gray-500 line-through">
						{formatPrice(product.original_price)}
					</span>
					<span class="text-lg font-bold text-green-600">
						{formatPrice(product.price)}
					</span>
				</div>
			{:else}
				<span class="text-xl font-bold text-gray-900">
					{formatPrice(product.price)}
				</span>
			{/if}
		</div>
		
		<!-- Action Buttons -->
		<div class="flex gap-2">
			<button
				on:click={handleViewProduct}
				class="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 group/btn"
			>
				<span>Ver Produto</span>
				<ExternalLink size={16} class="group-hover/btn:translate-x-0.5 transition-transform" />
			</button>
			
			{#if showCompareButton}
				<button
					on:click={handleToggleSelection}
					class="px-4 py-2.5 border-2 rounded-lg font-medium transition-all duration-200"
					class:border-blue-500={selected}
					class:bg-blue-50={selected}
					class:text-blue-600={selected}
					class:border-gray-300={!selected}
					class:text-gray-700={!selected}
					class:hover:border-blue-400={!selected}
					aria-label={selected ? 'Remover da comparação' : 'Adicionar à comparação'}
				>
					{selected ? 'Remover' : 'Comparar'}
				</button>
			{/if}
		</div>
	</div>
	
	<!-- Hover Effect Overlay -->
	<div class="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
</article>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
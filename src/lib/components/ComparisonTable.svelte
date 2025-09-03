<script lang="ts">
	import { Star, ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-svelte';
	
	export let products: any[] = [];
	export let comparisonFields: string[] = [];
	export let category: string = '';
	
	// Field display configuration
	const fieldConfig: Record<string, any> = {
		name: { label: 'Produto', type: 'text', sticky: true },
		brand: { label: 'Marca', type: 'text' },
		price: { label: 'Preço', type: 'currency', highlight: 'low' },
		rating: { label: 'Avaliação', type: 'stars', highlight: 'high' },
		screen_size: { label: 'Tamanho da Tela', type: 'text', suffix: '"' },
		resolution: { label: 'Resolução', type: 'text' },
		display_type: { label: 'Tipo de Display', type: 'text' },
		refresh_rate: { label: 'Taxa de Atualização', type: 'text', suffix: 'Hz' },
		battery_life: { label: 'Duração da Bateria', type: 'text', suffix: 'h' },
		connectivity: { label: 'Conectividade', type: 'array' },
		weight: { label: 'Peso', type: 'text', suffix: 'kg' },
		waterproof_rating: { label: 'Resistência à Água', type: 'text' },
		affiliate_link: { label: 'Ações', type: 'actions', sticky: true }
	};
	
	// Get visible fields based on what's available in products
	$: visibleFields = comparisonFields.filter(field => 
		products.some(product => product[field] !== undefined && product[field] !== null)
	);
	
	// Sort products by price for comparison highlighting
	$: sortedByPrice = [...products].sort((a, b) => (a.price || 0) - (b.price || 0));
	$: sortedByRating = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0));
	
	function formatValue(value: any, field: string): string {
		const config = fieldConfig[field];
		
		if (value === undefined || value === null) return '-';
		
		switch (config?.type) {
			case 'currency':
				return new Intl.NumberFormat('pt-BR', {
					style: 'currency',
					currency: 'BRL'
				}).format(value);
			
			case 'array':
				return Array.isArray(value) ? value.join(', ') : value.toString();
			
			default:
				return value.toString() + (config?.suffix || '');
		}
	}
	
	function getCellHighlight(product: any, field: string): string {
		const config = fieldConfig[field];
		if (!config?.highlight || !product[field]) return '';
		
		if (field === 'price' && config.highlight === 'low') {
			const minPrice = Math.min(...products.map(p => p.price || Infinity));
			return product.price === minPrice ? 'bg-green-50 text-green-800' : '';
		}
		
		if (field === 'rating' && config.highlight === 'high') {
			const maxRating = Math.max(...products.map(p => p.rating || 0));
			return product.rating === maxRating ? 'bg-blue-50 text-blue-800' : '';
		}
		
		return '';
	}
	
	function renderStars(rating: number): { type: string }[] {
		const stars = [];
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 !== 0;
		
		for (let i = 0; i < 5; i++) {
			if (i < fullStars) {
				stars.push({ type: 'full' });
			} else if (i === fullStars && hasHalfStar) {
				stars.push({ type: 'half' });
			} else {
				stars.push({ type: 'empty' });
			}
		}
		return stars;
	}
	
	function getComparisonIcon(product: any, field: string) {
		if (field === 'price') {
			const minPrice = Math.min(...products.map(p => p.price || Infinity));
			const maxPrice = Math.max(...products.map(p => p.price || 0));
			
			if (product.price === minPrice) return { icon: TrendingDown, color: 'text-green-600' };
			if (product.price === maxPrice) return { icon: TrendingUp, color: 'text-red-600' };
		}
		
		if (field === 'rating') {
			const maxRating = Math.max(...products.map(p => p.rating || 0));
			const minRating = Math.min(...products.map(p => p.rating || 5));
			
			if (product.rating === maxRating) return { icon: TrendingUp, color: 'text-green-600' };
			if (product.rating === minRating) return { icon: TrendingDown, color: 'text-red-600' };
		}
		
		return null;
	}
</script>

<div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
	<div class="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
		<h2 class="text-2xl font-bold text-gray-900 mb-2">
			Comparação de {products.length} {category.replace('-', ' ')}
		</h2>
		<p class="text-gray-600">
			Compare especificações, preços e avaliações lado a lado
		</p>
	</div>
	
	{#if products.length === 0}
		<div class="p-12 text-center text-gray-500">
			<div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
				<Minus size={24} />
			</div>
			<p class="text-lg font-medium">Nenhum produto para comparar</p>
			<p class="text-sm">Selecione produtos para ver a comparação</p>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-gray-50 border-b border-gray-200">
					<tr>
						<th class="sticky left-0 bg-gray-50 px-6 py-4 text-left text-sm font-semibold text-gray-900 border-r border-gray-200 min-w-[200px]">
							Especificação
						</th>
						{#each products as product, i}
							<th class="px-6 py-4 text-center min-w-[180px] border-r border-gray-100 last:border-r-0">
								<div class="flex flex-col items-center gap-2">
									<img
										src={product.image || '/images/placeholder.jpg'}
										alt={product.name}
										class="w-12 h-12 object-cover rounded-lg"
									/>
									<div class="text-sm font-medium text-gray-900 line-clamp-2">
										{product.name}
									</div>
									<div class="text-xs text-gray-500">
										{product.brand}
									</div>
								</div>
							</th>
						{/each}
					</tr>
				</thead>
				
				<tbody class="divide-y divide-gray-100">
					{#each visibleFields as field, fieldIndex}
						{@const config = fieldConfig[field] || { label: field, type: 'text' }}
						<tr class="hover:bg-gray-50/50 transition-colors">
							<td class="sticky left-0 bg-white px-6 py-4 font-medium text-gray-900 border-r border-gray-200">
								{config.label}
							</td>
							
							{#each products as product, productIndex}
								<td class="px-6 py-4 text-center border-r border-gray-100 last:border-r-0 {getCellHighlight(product, field)}">
									{#if field === 'rating' && product.rating}
										<div class="flex flex-col items-center gap-1">
											<div class="flex justify-center">
												{#each renderStars(product.rating) as star}
													<Star 
														size={16} 
														class={star.type === 'full' ? 'text-yellow-400 fill-current' : 
														       star.type === 'half' ? 'text-yellow-400 fill-current opacity-50' : 
														       'text-gray-300'}
													/>
												{/each}
											</div>
											<span class="text-sm text-gray-600">
												{product.rating}/5
											</span>
										</div>
									
									{:else if field === 'affiliate_link'}
										<a
											href={product.affiliate_link}
											target="_blank"
											rel="nofollow sponsored"
											class="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm"
										>
											<span>Ver Oferta</span>
											<ExternalLink size={14} />
										</a>
									
									{:else if field === 'price'}
										{@const icon = getComparisonIcon(product, field)}
										<div class="flex items-center justify-center gap-2">
											<span class="font-semibold text-lg">
												{formatValue(product[field], field)}
											</span>
											{#if icon}
												<svelte:component this={icon.icon} size={16} class={icon.color} />
											{/if}
										</div>
									
									{:else}
										{@const icon = getComparisonIcon(product, field)}
										<div class="flex items-center justify-center gap-2">
											<span class="text-gray-900">
												{formatValue(product[field], field)}
											</span>
											{#if icon}
												<svelte:component this={icon.icon} size={16} class={icon.color} />
											{/if}
										</div>
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		
		<!-- Summary Footer -->
		<div class="p-6 bg-gray-50 border-t border-gray-200">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
				<div class="flex items-center gap-2">
					<TrendingDown class="text-green-600" size={16} />
					<span class="text-gray-600">Melhor custo-benefício: 
						<strong class="text-gray-900">
							{sortedByPrice[0]?.name}
						</strong>
					</span>
				</div>
				
				<div class="flex items-center gap-2">
					<TrendingUp class="text-blue-600" size={16} />
					<span class="text-gray-600">Melhor avaliado: 
						<strong class="text-gray-900">
							{sortedByRating[0]?.name}
						</strong>
					</span>
				</div>
				
				<div class="text-gray-600">
					Comparando <strong class="text-gray-900">{products.length}</strong> produtos
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
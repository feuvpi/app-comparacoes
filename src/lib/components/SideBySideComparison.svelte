<script lang="ts">
	import { Star, ExternalLink, X, TrendingUp, TrendingDown, Award } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	
	export let products: any[] = [];
	export let comparisonFields: string[] = [];
	
	const dispatch = createEventDispatcher();
	
	// Maximum products to compare at once
	const MAX_PRODUCTS = 4;
	
	// Field configuration for better display
	const fieldConfig: Record<string, any> = {
		price: { label: 'Preço', type: 'currency', highlight: 'low', icon: '💰' },
		rating: { label: 'Avaliação', type: 'stars', highlight: 'high', icon: '⭐' },
		screen_size: { label: 'Tamanho da Tela', type: 'text', suffix: '"', icon: '📺' },
		resolution: { label: 'Resolução', type: 'text', icon: '🎯' },
		battery_life: { label: 'Bateria', type: 'text', suffix: 'h', icon: '🔋' },
		connectivity: { label: 'Conectividade', type: 'array', icon: '📶' },
		weight: { label: 'Peso', type: 'text', suffix: 'kg', icon: '⚖️' },
		brand: { label: 'Marca', type: 'text', icon: '🏷️' },
		waterproof_rating: { label: 'Resistência à Água', type: 'text', icon: '💧' }
	};
	
	// Filter products to maximum allowed
	$: displayProducts = products.slice(0, MAX_PRODUCTS);
	
	// Get comparison data
	$: comparisonData = getComparisonAnalysis(displayProducts);
	
	function removeProduct(productIndex: number) {
		dispatch('remove', { index: productIndex });
	}
	
	function formatValue(value: any, field: string): string {
		const config = fieldConfig[field];
		
		if (value === undefined || value === null) return 'N/A';
		
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
	
	function getComparisonAnalysis(products: any[]) {
		if (products.length === 0) return {};
		
		const analysis: Record<string, any> = {};
		
		// Analyze each field
		comparisonFields.forEach(field => {
			const values = products
				.map(p => p[field])
				.filter(v => v !== undefined && v !== null);
			
			if (values.length === 0) return;
			
			analysis[field] = {
				values: values,
				best: null,
				worst: null,
				winner: null
			};
			
			// Determine winner based on field type
			if (field === 'price') {
				const minPrice = Math.min(...values);
				analysis[field].winner = products.findIndex(p => p[field] === minPrice);
				analysis[field].best = minPrice;
				analysis[field].worst = Math.max(...values);
			} else if (field === 'rating') {
				const maxRating = Math.max(...values);
				analysis[field].winner = products.findIndex(p => p[field] === maxRating);
				analysis[field].best = maxRating;
				analysis[field].worst = Math.min(...values);
			} else if (typeof values[0] === 'number') {
				// For numeric fields, assume higher is better (except price)
				const maxValue = Math.max(...values);
				analysis[field].winner = products.findIndex(p => p[field] === maxValue);
				analysis[field].best = maxValue;
				analysis[field].worst = Math.min(...values);
			}
		});
		
		return analysis;
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
	
	function isWinner(productIndex: number, field: string): boolean {
		return comparisonData[field]?.winner === productIndex;
	}
	
	// Get visible fields that have at least one value
	$: visibleFields = comparisonFields.filter(field => 
		displayProducts.some(product => 
			product[field] !== undefined && 
			product[field] !== null && 
			product[field] !== ''
		)
	);
</script>

<div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
	<!-- Header -->
	<div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-2xl font-bold text-gray-900 mb-2">
					Comparação Detalhada
				</h2>
				<p class="text-gray-600">
					Compare {displayProducts.length} produtos lado a lado
				</p>
			</div>
			
			{#if products.length > MAX_PRODUCTS}
				<div class="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
					⚠️ Mostrando apenas {MAX_PRODUCTS} de {products.length} produtos
				</div>
			{/if}
		</div>
	</div>
	
	{#if displayProducts.length === 0}
		<div class="p-12 text-center">
			<div class="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
				<Award size={32} class="text-gray-400" />
			</div>
			<h3 class="text-lg font-semibold text-gray-900 mb-2">
				Nenhum produto selecionado
			</h3>
			<p class="text-gray-600 mb-4">
				Selecione ao menos 2 produtos para ver a comparação detalhada
			</p>
		</div>
	
	{:else if displayProducts.length === 1}
		<div class="p-12 text-center">
			<div class="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
				<Award size={32} class="text-blue-600" />
			</div>
			<h3 class="text-lg font-semibold text-gray-900 mb-2">
				Adicione mais produtos
			</h3>
			<p class="text-gray-600 mb-4">
				Selecione pelo menos mais um produto para ver a comparação
			</p>
		</div>
	
	{:else}
		<!-- Product Cards Grid -->
		<div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{#each displayProducts as product, index}
				<div class="relative bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow">
					<!-- Remove Button -->
					<button
						on:click={() => removeProduct(index)}
						class="absolute top-3 right-3 z-10 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
						aria-label="Remover da comparação"
					>
						<X size={14} />
					</button>
					
					<!-- Product Image -->
					<div class="aspect-square bg-white p-4">
						<img
							src={product.image || '/images/placeholder.jpg'}
							alt={product.name}
							class="w-full h-full object-cover rounded-lg"
						/>
					</div>
					
					<!-- Product Info -->
					<div class="p-4">
						<h3 class="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
							{product.name}
						</h3>
						
						<div class="text-xs text-gray-600 mb-3">
							{product.brand}
						</div>
						
						<!-- Price -->
						<div class="mb-4">
							<div class="flex items-center gap-2">
								{#if isWinner(index, 'price')}
									<Award size={14} class="text-green-600" />
								{/if}
								<span class="text-lg font-bold" 
									  class:text-green-600={isWinner(index, 'price')}>
									{formatValue(product.price, 'price')}
								</span>
							</div>
						</div>
						
						<!-- Rating -->
						{#if product.rating}
							<div class="flex items-center gap-2 mb-4">
								{#if isWinner(index, 'rating')}
									<Award size={14} class="text-blue-600" />
								{/if}
								<div class="flex">
									{#each renderStars(product.rating) as star}
										<Star 
											size={12} 
											class={star === 'full' ? 'text-yellow-400 fill-current' : 
											       star === 'half' ? 'text-yellow-400 fill-current opacity-50' : 
											       'text-gray-300'}
										/>
									{/each}
								</div>
								<span class="text-xs text-gray-600">({product.rating})</span>
							</div>
						{/if}
						
						<!-- CTA Button -->
						<a
							href={product.affiliate_link}
							target="_blank"
							rel="nofollow sponsored"
							class="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm"
						>
							<span>Ver Oferta</span>
							<ExternalLink size={12} />
						</a>
					</div>
				</div>
			{/each}
		</div>
		
		<!-- Detailed Specifications Comparison -->
		<div class="border-t border-gray-200">
			<div class="p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
					<Award size={20} class="text-blue-600" />
					Especificações Detalhadas
				</h3>
				
				<div class="space-y-4">
					{#each visibleFields as field}
						{@const config = fieldConfig[field] || { label: field, type: 'text' }}
						{@const analysis = comparisonData[field]}
						
						<div class="bg-gray-50 rounded-xl p-4">
							<div class="flex items-center gap-2 mb-3">
								<span class="text-lg">{config.icon || '📋'}</span>
								<h4 class="font-medium text-gray-900">{config.label}</h4>
								
								{#if analysis?.winner !== null && analysis.winner !== undefined}
									<div class="ml-auto flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
										<Award size={12} />
										<span>Vencedor: {displayProducts[analysis.winner].brand}</span>
									</div>
								{/if}
							</div>
							
							<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
								{#each displayProducts as product, index}
									<div class="bg-white rounded-lg p-3 border"
										 class:border-green-500={isWinner(index, field)}
										 class:bg-green-50={isWinner(index, field)}
										 class:border-gray-200={!isWinner(index, field)}>
										
										<div class="text-xs text-gray-600 mb-1 truncate">
											{product.name}
										</div>
										
										{#if field === 'rating' && product.rating}
											<div class="flex items-center gap-1">
												<div class="flex">
													{#each renderStars(product.rating) as star}
														<Star 
															size={12} 
															class={star === 'full' ? 'text-yellow-400 fill-current' : 
															       star === 'half' ? 'text-yellow-400 fill-current opacity-50' : 
															       'text-gray-300'}
														/>
													{/each}
												</div>
												<span class="text-xs text-gray-600">({product.rating})</span>
											</div>
										{:else}
											<div class="font-medium text-gray-900"
												 class:text-green-600={isWinner(index, field)}>
												{formatValue(product[field], field)}
											</div>
										{/if}
										
										{#if isWinner(index, field)}
											<div class="flex items-center gap-1 mt-1">
												<Award size={12} class="text-green-600" />
												<span class="text-xs text-green-600 font-medium">Melhor</span>
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
		
						<!-- Winner Summary -->
		{#if Object.keys(comparisonData).length > 0}
			{@const priceWinner = comparisonData.price?.winner}
			{@const ratingWinner = comparisonData.rating?.winner}
			<div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-t border-gray-200">
				<h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
					<TrendingUp size={20} class="text-blue-600" />
					Resumo da Comparação
				</h3>
				
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<!-- Best Overall Value -->
					{#if priceWinner !== null && priceWinner !== undefined}
						<div class="bg-green-50 border border-green-200 rounded-lg p-4">
							<div class="flex items-center gap-2 mb-2">
								<TrendingDown class="text-green-600" size={16} />
								<span class="font-medium text-green-800">Melhor Preço</span>
							</div>
							<div class="text-sm text-gray-700">
								<strong>{displayProducts[priceWinner].name}</strong>
								<br />
								<span class="text-green-600 font-semibold">
									{formatValue(displayProducts[priceWinner].price, 'price')}
								</span>
							</div>
						</div>
					{/if}
					
					<!-- Best Rated -->
					{#if ratingWinner !== null && ratingWinner !== undefined}
						<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<div class="flex items-center gap-2 mb-2">
								<Star class="text-blue-600 fill-current" size={16} />
								<span class="font-medium text-blue-800">Melhor Avaliado</span>
							</div>
							<div class="text-sm text-gray-700">
								<strong>{displayProducts[ratingWinner].name}</strong>
								<br />
								<span class="text-blue-600 font-semibold">
									{displayProducts[ratingWinner].rating}/5 estrelas
								</span>
							</div>
						</div>
					{/if}
					
					<!-- Comparison Count -->
					<div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
						<div class="flex items-center gap-2 mb-2">
							<Award class="text-gray-600" size={16} />
							<span class="font-medium text-gray-800">Comparação</span>
						</div>
						<div class="text-sm text-gray-700">
							<strong>{displayProducts.length}</strong> produtos comparados
							<br />
							<strong>{visibleFields.length}</strong> especificações analisadas
						</div>
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
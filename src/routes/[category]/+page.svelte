<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Grid, Table, GitCompare, SlidersHorizontal, Search, TrendingUp, Package } from 'lucide-svelte';
	
	// Import components
	import ProductCard from '$lib/components/ProductCard.svelte';
	import ComparisonTable from '$lib/components/ComparisonTable.svelte';
	import SideBySideComparison from '$lib/components/SideBySideComparison.svelte';
	
	// Import types
	import type { CategoryPageData, Product } from '$lib/utils/types.js';
	import type { PageData } from './$types';
	
	export let data: PageData;
	
	// Destructure data
	$: ({ 
		category, 
		categoryDisplayName, 
		products, 
		allProducts,
		comparisonFields, 
		filters, 
		stats, 
		meta,
		currentFilters 
	} = data);
	
	// Component state
	let viewMode: 'grid' | 'table' | 'comparison' = 'grid';
	let selectedProducts: Product[] = [];
	let showFilters = false;
	let searchQuery = currentFilters?.search || '';
	let sortBy = currentFilters?.sortBy || 'name';
	let sortOrder: 'asc' | 'desc' = (currentFilters?.sortOrder as 'asc' | 'desc') || 'asc';
	
	// Update URL when filters change
	function updateURL() {
		const url = new URL($page.url);
		const params = new URLSearchParams();
		
		if (searchQuery.trim()) params.set('search', searchQuery.trim());
		if (sortBy !== 'name') params.set('sort', sortBy);
		if (sortOrder !== 'asc') params.set('order', sortOrder);
		
		const newUrl = `${url.pathname}${params.toString() ? '?' + params.toString() : ''}`;
		goto(newUrl, { replaceState: true, noScroll: true });
	}
	
	// Handle product selection for comparison
	function toggleProductSelection(event: CustomEvent<Product>) {
		const product = event.detail;
		const index = selectedProducts.findIndex(p => p.slug === product.slug);
		
		if (index === -1) {
			// Add product (max 4)
			if (selectedProducts.length < 4) {
				selectedProducts = [...selectedProducts, product];
			}
		} else {
			// Remove product
			selectedProducts = selectedProducts.filter(p => p.slug !== product.slug);
		}
		
		// Auto-switch to comparison mode if 2+ products selected
		if (selectedProducts.length >= 2 && viewMode !== 'comparison') {
			viewMode = 'comparison';
		}
		
		// Switch back to grid if less than 2 products
		if (selectedProducts.length < 2 && viewMode === 'comparison') {
			viewMode = 'grid';
		}
	}
	
	function removeProductFromComparison(event: CustomEvent<{index: number}>) {
		const index = event.detail.index;
		selectedProducts = selectedProducts.filter((_, i) => i !== index);
	}
	
	function handleProductView(event: CustomEvent<Product>) {
		const product = event.detail;
		goto(`/${category}/${product.slug}`);
	}
	
	// Sort options
	const sortOptions = [
		{ value: 'name', label: 'Nome A-Z' },
		{ value: 'price', label: 'Menor Preço' },
		{ value: 'rating', label: 'Melhor Avaliação' },
		{ value: 'brand', label: 'Marca' }
	];
	
	// Get unique brands for filter
	$: uniqueBrands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))].sort();
	
	$: hasFiltersApplied = searchQuery || 
		currentFilters.brandFilter || 
		currentFilters.minPrice || 
		currentFilters.maxPrice;
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
	<meta name="keywords" content={meta.keywords.join(', ')} />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta property="og:image" content={meta.ogImage} />
	<link rel="canonical" href={meta.canonical} />
	
	{@html `<script type="application/ld+json">${JSON.stringify(meta.schema)}</script>`}
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
	<!-- Hero Section -->
	<section class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center">
				<h1 class="text-4xl md:text-5xl font-bold mb-4">
					Compare {categoryDisplayName}
				</h1>
				<p class="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
					{meta.description}
				</p>
				
				<!-- Stats -->
				<div class="flex flex-wrap justify-center gap-8 text-sm">
					<div class="flex items-center gap-2">
						<Package size={20} />
						<span><strong>{stats.productCount}</strong> produtos</span>
					</div>
					{#if stats.priceRange}
						<div class="flex items-center gap-2">
							<TrendingUp size={20} />
							<span>A partir de <strong>R$ {Math.floor(stats.priceRange.min)}</strong></span>
						</div>
					{/if}
					{#if stats.topBrands.length > 0}
						<div class="flex items-center gap-2">
							<span>Marcas: <strong>{stats.topBrands.slice(0, 3).map(b => b.brand).join(', ')}</strong></span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</section>
	
	<!-- Controls Section -->
	<section class="bg-white border-b sticky top-0 z-40 shadow-sm">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<div class="flex flex-wrap items-center justify-between gap-4">
				<!-- Search -->
				<div class="flex-1 min-w-64 max-w-md">
					<div class="relative">
						<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
						<input
							type="search"
							placeholder="Buscar produtos..."
							bind:value={searchQuery}
							on:keydown={(e) => e.key === 'Enter' && updateURL()}
							class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
				</div>
				
				<!-- View Controls -->
				<div class="flex items-center gap-2">
					<!-- Sort -->
					<select 
						bind:value={sortBy} 
						on:change={updateURL}
						class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
					>
						{#each sortOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
					
					<!-- View Mode Toggle -->
					<div class="flex bg-gray-100 rounded-lg p-1">
						<button
							class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
							class:bg-white={viewMode === 'grid'}
							class:shadow-sm={viewMode === 'grid'}
							class:text-blue-600={viewMode === 'grid'}
							class:text-gray-600={viewMode !== 'grid'}
							on:click={() => viewMode = 'grid'}
						>
							<Grid size={16} />
							<span class="hidden sm:inline">Grade</span>
						</button>
						
						<button
							class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
							class:bg-white={viewMode === 'table'}
							class:shadow-sm={viewMode === 'table'}
							class:text-blue-600={viewMode === 'table'}
							class:text-gray-600={viewMode !== 'table'}
							on:click={() => viewMode = 'table'}
						>
							<Table size={16} />
							<span class="hidden sm:inline">Tabela</span>
						</button>
						
						{#if selectedProducts.length >= 2}
							<button
								class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors relative"
								class:bg-white={viewMode === 'comparison'}
								class:shadow-sm={viewMode === 'comparison'}
								class:text-blue-600={viewMode === 'comparison'}
								class:text-gray-600={viewMode !== 'comparison'}
								on:click={() => viewMode = 'comparison'}
							>
								<GitCompare size={16} />
								<span class="hidden sm:inline">Comparar</span>
								<span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
									{selectedProducts.length}
								</span>
							</button>
						{/if}
					</div>
					
					<!-- Filters Toggle -->
					<button
						class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
						class:bg-blue-50={showFilters}
						class:border-blue-300={showFilters}
						class:text-blue-600={showFilters}
						on:click={() => showFilters = !showFilters}
					>
						<SlidersHorizontal size={16} />
						<span>Filtros</span>
						{#if hasFiltersApplied}
							<span class="bg-red-500 text-white text-xs rounded-full w-2 h-2"></span>
						{/if}
					</button>
				</div>
			</div>
			
			<!-- Results Info -->
			<div class="flex items-center justify-between mt-4 text-sm text-gray-600">
				<div>
					Mostrando <strong>{products.length}</strong> de <strong>{allProducts.length}</strong> produtos
					{#if hasFiltersApplied}
						<button 
							class="ml-2 text-blue-600 hover:text-blue-800 underline"
							on:click={() => goto(`/${category}`)}
						>
							Limpar filtros
						</button>
					{/if}
				</div>
				
				{#if selectedProducts.length > 0}
					<div class="text-blue-600">
						{selectedProducts.length} produto{selectedProducts.length === 1 ? '' : 's'} selecionado{selectedProducts.length === 1 ? '' : 's'} para comparação
					</div>
				{/if}
			</div>
		</div>
	</section>
	
	<!-- Filters Panel (Collapsible) -->
	{#if showFilters}
		<section class="bg-gray-50 border-b">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<!-- Brand Filter -->
					{#if uniqueBrands.length > 1}
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Marca</label>
							<select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
								<option value="">Todas as marcas</option>
								{#each uniqueBrands as brand}
									<option value={brand}>{brand}</option>
								{/each}
							</select>
						</div>
					{/if}
					
					<!-- Price Range Filter -->
					{#if stats.priceRange}
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">
								Faixa de Preço (R$ {Math.floor(stats.priceRange.min)} - R$ {Math.ceil(stats.priceRange.max)})
							</label>
							<div class="flex gap-2">
								<input
									type="number"
									placeholder="Mín"
									min={Math.floor(stats.priceRange.min)}
									max={Math.ceil(stats.priceRange.max)}
									class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								/>
								<input
									type="number"
									placeholder="Máx"
									min={Math.floor(stats.priceRange.min)}
									max={Math.ceil(stats.priceRange.max)}
									class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								/>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</section>
	{/if}
	
	<!-- Main Content -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if products.length === 0}
			<!-- Empty State -->
			<div class="text-center py-16">
				<div class="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
					<Search size={32} class="text-gray-400" />
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-2">Nenhum produto encontrado</h3>
				<p class="text-gray-600 mb-6">
					Não encontramos produtos que correspondam aos seus filtros.
				</p>
				<button 
					class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
					on:click={() => goto(`/${category}`)}
				>
					Ver todos os produtos
				</button>
			</div>
			
		{:else if viewMode === 'grid'}
			<!-- Product Grid -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{#each products as product}
					<ProductCard
						{product}
						selected={selectedProducts.some(p => p.slug === product.slug)}
						showCompareButton={true}
						on:toggle={toggleProductSelection}
						on:view={handleProductView}
					/>
				{/each}
			</div>
			
		{:else if viewMode === 'table'}
			<!-- Comparison Table -->
			<ComparisonTable
				{products}
				{comparisonFields}
				{category}
			/>
			
		{:else if viewMode === 'comparison'}
			<!-- Side-by-Side Comparison -->
			<SideBySideComparison
				products={selectedProducts}
				{comparisonFields}
				on:remove={removeProductFromComparison}
			/>
		{/if}
	</main>
</div>
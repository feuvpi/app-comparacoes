<script lang="ts">
	import { 
		getAllCategories, 
		loadProductsByCategory, 
		generateComparisonFields,
		type Product, 
		type ComparisonField 
	} from '$lib/utils/content';
	import { onMount } from 'svelte';
	
	export let products: Product[] = [];
	export let category: string = '';
	
	let displayProducts: Product[] = [];
	let availableCategories: string[] = [];
	let comparisonFields: ComparisonField[] = [];
	let isLoading = true;

	let scrollContainer: HTMLElement;
	let isScrolledLeft = true;
	let isScrolledRight = false;

	onMount(async () => {
		// Load categories and products
		try {
			availableCategories = await getAllCategories();
			console.log('Available categories:', availableCategories);
			
			// If no products are passed as props, load them based on category
			if (products.length === 0) {
				if (category && availableCategories.includes(category)) {
					displayProducts = await loadProductsByCategory(category);
				} else if (availableCategories.length > 0) {
					// Load products from the first category by default
					category = availableCategories[0];
					displayProducts = await loadProductsByCategory(category);
				}
			} else {
				displayProducts = products;
			}

			// Generate comparison fields dynamically
			if (displayProducts.length > 0) {
				comparisonFields = generateComparisonFields(displayProducts);
				console.log('Generated comparison fields:', comparisonFields);
			}
		} catch (error) {
			console.error('Error loading products:', error);
		} finally {
			isLoading = false;
		}

		if (scrollContainer) {
			scrollContainer.addEventListener('scroll', handleScroll);
			handleScroll();
		}
	});

	function handleScroll() {
		if (scrollContainer) {
			isScrolledLeft = scrollContainer.scrollLeft === 0;
			isScrolledRight = scrollContainer.scrollLeft >= 
				(scrollContainer.scrollWidth - scrollContainer.clientWidth - 10);
		}
	}

	function scrollLeft() {
		scrollContainer?.scrollBy({ left: -300, behavior: 'smooth' });
	}

	function scrollRight() {
		scrollContainer?.scrollBy({ left: 300, behavior: 'smooth' });
	}

	function formatPrice(price: number): string {
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL'
		}).format(price);
	}

	function renderStars(rating: number): string {
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 >= 0.5;
		const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
		
		return '★'.repeat(fullStars) + 
			   (hasHalfStar ? '☆' : '') + 
			   '☆'.repeat(emptyStars);
	}

	// Function to handle category change
	async function changeCategory(newCategory: string) {
		isLoading = true;
		try {
			category = newCategory;
			displayProducts = await loadProductsByCategory(newCategory);
			
			// Regenerate comparison fields for new category
			if (displayProducts.length > 0) {
				comparisonFields = generateComparisonFields(displayProducts);
			}
		} catch (error) {
			console.error('Error changing category:', error);
		} finally {
			isLoading = false;
		}
	}

	// Function to get product field value
	function getProductFieldValue(product: Product, field: ComparisonField): any {
		return product[field.key];
	}
</script>

<div class="comparison-wrapper">
	<!-- Header with title and controls -->
	<div class="comparison-header">
		<div class="header-content">
			<h1 class="comparison-title">
				{category ? `${category.charAt(0).toUpperCase() + category.slice(1)} ` : ''}
				Tabela de Comparação
			</h1>
			<div class="header-controls">
				<!-- Category selector -->
				{#if availableCategories.length > 1}
					<div class="category-selector">
						<select 
							value={category} 
							on:change={(e) => changeCategory(e.target.value)}
							class="category-dropdown"
						>
							{#each availableCategories as cat}
								<option value={cat}>
									{cat.charAt(0).toUpperCase() + cat.slice(1)}
								</option>
							{/each}
						</select>
					</div>
				{/if}
				
				<div class="filters-section">
					<button class="filter-btn active">
						<span class="filter-icon">🔍</span>
						Filtros
					</button>
					<button class="filter-btn">
						<span class="filter-icon">🗂️</span>
						Limpar filtros
					</button>
				</div>
				<div class="scroll-controls">
					<button 
						class="scroll-btn" 
						class:disabled={isScrolledLeft}
						on:click={scrollLeft}
					>
						←
					</button>
					<button 
						class="scroll-btn" 
						class:disabled={isScrolledRight}
						on:click={scrollRight}
					>
						→
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Loading state -->
	{#if isLoading}
		<div class="loading-state">
			<div class="loading-spinner"></div>
			<p>Carregando produtos...</p>
		</div>
	{:else if displayProducts.length === 0}
		<div class="empty-state">
			<p>Nenhum produto encontrado para esta categoria.</p>
			<p>Adicione arquivos JSON na pasta /src/content/{category}/</p>
		</div>
	{:else}
		<!-- Comparison table -->
		<div class="comparison-container">
			<div class="table-scroll" bind:this={scrollContainer}>
				<table class="comparison-table">
					<!-- Product headers -->
					<thead>
						<tr class="product-header">
							<th class="field-label sticky-column">
								<div class="field-content">
									<span class="field-name">Produtos</span>
								</div>
							</th>
							{#each displayProducts as product, index}
								<th class="product-column" class:featured={product.featured}>
									<div class="product-card">
										<div class="product-image-container">
											<img 
												src={product.image} 
												alt={product.name}
												class="product-image"
												loading="lazy"
											/>
											{#if product.featured}
												<span class="featured-badge">Destaque</span>
											{/if}
											{#if product.discount}
												<span class="discount-badge">-{product.discount}%</span>
											{/if}
										</div>
										<div class="product-info">
											<h3 class="product-name">{product.name}</h3>
											<p class="product-brand">{product.brand || ''}</p>
											{#if product.key_specs && Array.isArray(product.key_specs)}
												<div class="key-specs">
													{#each product.key_specs.slice(0, 3) as spec}
														<span class="spec-tag">{spec}</span>
													{/each}
												</div>
											{/if}
										</div>
									</div>
								</th>
							{/each}
						</tr>
					</thead>

					<!-- Comparison rows -->
					<tbody>
						{#each comparisonFields as field}
							<tr class="comparison-row" class:highlight={field.key === 'price' || field.key === 'rating'}>
								<td class="field-label sticky-column">
									<div class="field-content">
										<span class="field-name">{field.label}</span>
									</div>
								</td>
								{#each displayProducts as product}
									{@const fieldValue = getProductFieldValue(product, field)}
									<td class="product-cell" class:featured={product.featured}>
										<div class="cell-content">
											{#if field.type === 'rating' && fieldValue}
												<div class="rating-display">
													<div class="stars">{renderStars(fieldValue)}</div>
													<span class="rating-number">{fieldValue}</span>
												</div>
											{:else if field.type === 'price' && fieldValue}
												<div class="price-display">
													{#if product.original_price && product.original_price > fieldValue}
														<span class="original-price">{formatPrice(product.original_price)}</span>
													{/if}
													<span class="current-price">{formatPrice(fieldValue)}</span>
													<a 
														href={product.affiliate_link} 
														class="buy-btn"
														target="_blank"
														rel="noopener noreferrer"
													>
														MELHOR PREÇO
													</a>
												</div>
											{:else if field.type === 'array' && Array.isArray(fieldValue)}
												<div class="array-display">
													{#each fieldValue.slice(0, 3) as item}
														<span class="array-item">{item}</span>
													{/each}
													{#if fieldValue.length > 3}
														<span class="more-items">+{fieldValue.length - 3}</span>
													{/if}
												</div>
											{:else if fieldValue !== undefined && fieldValue !== null && fieldValue !== ''}
												<span class="text-value">
													{fieldValue}{field.suffix || ''}
												</span>
											{:else}
												<span class="empty-value">—</span>
											{/if}
										</div>
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

<style>
	.comparison-wrapper {
		width: 100%;
		background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
		min-height: 100vh;
		color: white;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.comparison-header {
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		padding: 2rem 0;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.header-content {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 2rem;
	}

	.comparison-title {
		font-size: 2.5rem;
		font-weight: 700;
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		margin: 0;
	}

	.header-controls {
		display: flex;
		align-items: center;
		gap: 2rem;
	}

	.category-selector {
		display: flex;
		align-items: center;
	}

	.category-dropdown {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 50px;
		font-weight: 500;
		cursor: pointer;
	}

	.category-dropdown option {
		background: #1a1a2e;
		color: white;
	}

	.filters-section {
		display: flex;
		gap: 1rem;
	}

	.filter-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 50px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.filter-btn:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: translateY(-2px);
	}

	.filter-btn.active {
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
		border-color: transparent;
	}

	.scroll-controls {
		display: flex;
		gap: 0.5rem;
	}

	.scroll-btn {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: white;
		font-size: 1.2rem;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.scroll-btn:hover:not(.disabled) {
		background: rgba(255, 255, 255, 0.2);
		transform: scale(1.1);
	}

	.scroll-btn.disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.loading-state, .empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		text-align: center;
	}

	.loading-spinner {
		width: 50px;
		height: 50px;
		border: 3px solid rgba(255, 255, 255, 0.1);
		border-top: 3px solid #4facfe;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.empty-state {
		color: rgba(255, 255, 255, 0.6);
	}

	.comparison-container {
		padding: 2rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.table-scroll {
		overflow-x: auto;
		border-radius: 20px;
		background: rgba(255, 255, 255, 0.03);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
	}

	.table-scroll::-webkit-scrollbar {
		height: 8px;
	}

	.table-scroll::-webkit-scrollbar-track {
		background: transparent;
	}

	.table-scroll::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.3);
		border-radius: 4px;
	}

	.comparison-table {
		width: 100%;
		border-collapse: collapse;
		min-width: 800px;
	}

	.sticky-column {
		position: sticky;
		left: 0;
		background: rgba(26, 26, 46, 0.95);
		backdrop-filter: blur(10px);
		z-index: 10;
		border-right: 1px solid rgba(255, 255, 255, 0.1);
	}

	.product-header th {
		padding: 0;
		vertical-align: top;
		position: relative;
	}

	.product-column {
		min-width: 280px;
		width: 280px;
		border-left: 1px solid rgba(255, 255, 255, 0.05);
	}

	.product-column.featured {
		background: linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%);
		border-left: 2px solid #4facfe;
		border-right: 2px solid #4facfe;
	}

	.product-card {
		padding: 1.5rem;
		text-align: center;
	}

	.product-image-container {
		position: relative;
		margin-bottom: 1rem;
	}

	.product-image {
		width: 120px;
		height: 120px;
		object-fit: cover;
		border-radius: 15px;
		border: 2px solid rgba(255, 255, 255, 0.1);
		transition: transform 0.3s ease;
	}

	.product-image:hover {
		transform: scale(1.05);
	}

	.featured-badge {
		position: absolute;
		top: -8px;
		left: 50%;
		transform: translateX(-50%);
		background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
		color: white;
		padding: 0.3rem 0.8rem;
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.discount-badge {
		position: absolute;
		top: 8px;
		right: 8px;
		background: #ff4757;
		color: white;
		padding: 0.3rem 0.6rem;
		border-radius: 8px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.product-info {
		text-align: center;
	}

	.product-name {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		line-height: 1.3;
		color: white;
	}

	.product-brand {
		color: rgba(255, 255, 255, 0.7);
		font-size: 1.1rem;
		margin: 0 0 1rem 0;
	}

	.key-specs {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.spec-tag {
		background: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.9);
		padding: 0.3rem 0.6rem;
		border-radius: 12px;
		font-size: 0.99rem;
		font-weight: 500;
	}

	.comparison-row {
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		transition: background-color 0.3s ease;
	}

	.comparison-row:hover {
		background: rgba(255, 255, 255, 0.02);
	}

	.comparison-row.highlight {
		background: rgba(79, 172, 254, 0.05);
	}

	.field-label {
		font-size: 1.5rem;
		width: 200px;
		min-width: 200px;
		padding: 1.5rem;
	
		align-self: center;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
		border-right: 1px solid rgba(255, 255, 255, 0.1);
	}

	.field-content {
		font-size: 1.5rem;
		display: flex;
		align-items: center;
		height: 100%;
	}

	.product-cell {
		padding: 1.5rem;
		text-align: center;
		border-left: 1px solid rgba(255, 255, 255, 0.05);
		vertical-align: middle;
	}

	.product-cell.featured {
		background: linear-gradient(135deg, rgba(79, 172, 254, 0.05) 0%, rgba(0, 242, 254, 0.05) 100%);
		border-left: 1px solid rgba(79, 172, 254, 0.2);
	}

	.cell-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60px;
	}

	.rating-display {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
	}

	.stars {
		font-size: 1.2rem;
		color: #ffd700;
		letter-spacing: 2px;
	}

	.rating-number {
		background: rgba(255, 215, 0, 0.2);
		color: #ffd700;
		padding: 0.3rem 0.6rem;
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: 600;
	}

	.price-display {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.original-price {
		color: rgba(255, 255, 255, 0.6);
		text-decoration: line-through;
		font-size: 0.95rem;
		font-weight: 500;
	}

	.current-price {
		font-size: 1.3rem;
		font-weight: 700;
		color: #4facfe;
	}

	.buy-btn {
		background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
		color: white;
		padding: 0.6rem 1.2rem;
		border-radius: 25px;
		text-decoration: none;
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		transition: all 0.3s ease;
		border: none;
		cursor: pointer;
	}

	.buy-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
	}

	.array-display {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.array-item {
		background: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.9);
		padding: 0.3rem 0.6rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.more-items {
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.75rem;
		font-style: italic;
	}

	.text-value {
		font-size: 1.5rem;
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.9rem;
	}

	.empty-value {
		color: rgba(255, 255, 255, 0.3);
		font-style: italic;
	}

	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			gap: 1rem;
		}

		.comparison-title {
			font-size: 1.8rem;
			text-align: center;
		}

		.header-controls {
			width: 100%;
			justify-content: space-between;
			flex-wrap: wrap;
			gap: 1rem;
		}

		.category-selector {
			width: 100%;
		}

		.category-dropdown {
			width: 100%;
		}

		.product-column {
			min-width: 240px;
			width: 240px;
		}

		.comparison-container {
			padding: 1rem;
		}
	}
</style>
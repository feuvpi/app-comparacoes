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
	<!-- Premium Header -->
	<div class="header-section">
		<div class="header-container">
			<div class="header-main">
				<div class="title-area">
					<h1 class="main-title">
						<span class="category-highlight">{category ? `${category.charAt(0).toUpperCase() + category.slice(1)}` : 'Produtos'}</span>
						<span class="title-separator">•</span>
						<span class="subtitle">Comparação Avançada</span>
					</h1>
					<p class="header-description">Compare especificações técnicas, preços e avaliações</p>
				</div>
				
				<div class="controls-cluster">
					{#if availableCategories.length > 1}
						<div class="category-control">
							<label class="control-label">Categoria</label>
							<div class="select-wrapper">
								<select 
									value={category} 
									on:change={(e) => changeCategory(e.target.value)}
									class="category-select"
								>
									{#each availableCategories as cat}
										<option value={cat}>
											{cat.charAt(0).toUpperCase() + cat.slice(1)}
										</option>
									{/each}
								</select>
							</div>
						</div>
					{/if}
					
					<div class="action-buttons">
						<button class="action-btn primary">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<circle cx="11" cy="11" r="8"></circle>
								<path d="m21 21-4.35-4.35"></path>
							</svg>
							Filtrar
						</button>
						<button class="action-btn secondary">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M3 6h18"></path>
								<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
								<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
							</svg>
							Limpar
						</button>
					</div>
				</div>
			</div>
			
			<div class="scroll-navigation">
				<button 
					class="nav-btn" 
					class:disabled={isScrolledLeft}
					on:click={scrollLeft}
					aria-label="Scroll left"
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="15,18 9,12 15,6"></polyline>
					</svg>
				</button>
				<button 
					class="nav-btn" 
					class:disabled={isScrolledRight}
					on:click={scrollRight}
					aria-label="Scroll right"
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="9,18 15,12 9,6"></polyline>
					</svg>
				</button>
			</div>
		</div>
	</div>

	<!-- Content Area -->
	<div class="content-area">
		{#if isLoading}
			<div class="loading-container">
				<div class="loading-animation">
					<div class="loading-dot"></div>
					<div class="loading-dot"></div>
					<div class="loading-dot"></div>
				</div>
				<p class="loading-text">Carregando produtos...</p>
			</div>
		{:else if displayProducts.length === 0}
			<div class="empty-container">
				<div class="empty-icon">
					<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
						<circle cx="9" cy="9" r="2"></circle>
						<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
					</svg>
				</div>
				<h3 class="empty-title">Nenhum produto encontrado</h3>
				<p class="empty-description">Adicione arquivos JSON na pasta /src/content/{category}/</p>
			</div>
		{:else}
			<!-- Premium Comparison Table -->
			<div class="table-container">
				<div class="table-scroll" bind:this={scrollContainer}>
					<table class="comparison-table">
						<!-- Enhanced Product Headers -->
						<thead class="table-header">
							<tr class="header-row">
								<th class="label-column">
									<div class="label-content">
										<span class="label-text">Especificações</span>
									</div>
								</th>
								{#each displayProducts as product}
									<th class="product-column" class:featured={product.featured}>
										<div class="product-header-card">
											<div class="product-badges">
												{#if product.featured}
													<span class="badge featured-badge">
														<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
															<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
														</svg>
														Destaque
													</span>
												{/if}
												{#if product.discount}
													<span class="badge discount-badge">-{product.discount}%</span>
												{/if}
											</div>
											
											<div class="product-image-wrapper">
												<img 
													src={product.image} 
													alt={product.name}
													class="product-image"
													loading="lazy"
												/>
											</div>
											
											<div class="product-details">
												<h3 class="product-title">{product.name}</h3>
												<p class="product-brand">{product.brand || ''}</p>
												
												{#if product.key_specs && Array.isArray(product.key_specs)}
													<div class="key-features">
														{#each product.key_specs.slice(0, 3) as spec}
															<span class="feature-tag">{spec}</span>
														{/each}
													</div>
												{/if}
											</div>
										</div>
									</th>
								{/each}
							</tr>
						</thead>

						<!-- Enhanced Comparison Rows -->
						<tbody class="table-body">
							{#each comparisonFields as field}
								<tr class="comparison-row" class:priority={field.key === 'price' || field.key === 'rating'}>
									<td class="label-cell">
										<div class="label-content">
											<span class="field-name">{field.label}</span>
										</div>
									</td>
									{#each displayProducts as product}
										{@const fieldValue = getProductFieldValue(product, field)}
										<td class="data-cell" class:featured={product.featured}>
											<div class="cell-wrapper">
												{#if field.type === 'rating' && fieldValue}
													<div class="rating-container">
														<div class="star-rating">{renderStars(fieldValue)}</div>
														<span class="rating-value">{fieldValue}/5</span>
													</div>
												{:else if field.type === 'price' && fieldValue}
													<div class="price-container">
														{#if product.original_price && product.original_price > fieldValue}
															<span class="original-price">{formatPrice(product.original_price)}</span>
														{/if}
														<span class="current-price">{formatPrice(fieldValue)}</span>
														<a 
															href={product.affiliate_link} 
															class="cta-button"
															target="_blank"
															rel="noopener noreferrer"
														>
															<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
																<circle cx="9" cy="21" r="1"></circle>
																<circle cx="20" cy="21" r="1"></circle>
																<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
															</svg>
															Comprar
														</a>
													</div>
												{:else if field.type === 'array' && Array.isArray(fieldValue)}
													<div class="tags-container">
														{#each fieldValue.slice(0, 3) as item}
															<span class="spec-tag">{item}</span>
														{/each}
														{#if fieldValue.length > 3}
															<span class="more-indicator">+{fieldValue.length - 3}</span>
														{/if}
													</div>
												{:else if fieldValue !== undefined && fieldValue !== null && fieldValue !== ''}
													<span class="text-content">
														{fieldValue}{field.suffix || ''}
													</span>
												{:else}
													<span class="empty-indicator">—</span>
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
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

	.comparison-wrapper {
		min-height: 100vh;
		background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
		color: white;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		font-feature-settings: 'cv01', 'cv03', 'cv04', 'cv11';
	}

	/* Premium Header Design */
	.header-section {
		background: rgba(255, 255, 255, 0.02);
		backdrop-filter: blur(20px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		position: sticky;
		top: 0;
		z-index: 100;
		padding: 2rem 0;
	}

	.header-container {
		max-width: 100%;
		margin: 0 auto;
		padding: 0 2rem;
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 3rem;
	}

	.header-main {
		flex: 1;
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 3rem;
	}

	.title-area {
		flex: 1;
	}

	.main-title {
		font-size: clamp(2rem, 4vw, 3.5rem);
		font-weight: 800;
		margin: 0 0 0.5rem 0;
		line-height: 1.1;
		letter-spacing: -0.02em;
	}

	.category-highlight {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.title-separator {
		color: rgba(255, 255, 255, 0.3);
		font-weight: 400;
		margin: 0 0.8rem;
	}

	.subtitle {
		color: rgba(255, 255, 255, 0.9);
	}

	.header-description {
		font-size: 1.1rem;
		color: rgba(255, 255, 255, 0.6);
		margin: 0;
		font-weight: 500;
		letter-spacing: -0.01em;
	}

	.controls-cluster {
		display: flex;
		align-items: flex-end;
		gap: 2rem;
	}

	.category-control {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.control-label {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.select-wrapper {
		position: relative;
	}

	.category-select {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: white;
		padding: 0.75rem 1.25rem;
		border-radius: 12px;
		font-weight: 600;
		font-size: 0.95rem;
		cursor: pointer;
		transition: all 0.3s ease;
		min-width: 140px;
	}

	.category-select:hover, .category-select:focus {
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(255, 255, 255, 0.2);
		outline: none;
	}

	.category-select option {
		background: #1a1a2e;
		color: white;
	}

	.action-buttons {
		display: flex;
		gap: 0.75rem;
	}

	.action-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		border-radius: 12px;
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.3s ease;
		border: none;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.action-btn.primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.action-btn.primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
	}

	.action-btn.secondary {
		background: rgba(255, 255, 255, 0.05);
		color: rgba(255, 255, 255, 0.8);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.action-btn.secondary:hover {
		background: rgba(255, 255, 255, 0.1);
		color: white;
	}

	.scroll-navigation {
		display: flex;
		gap: 0.5rem;
	}

	.nav-btn {
		width: 48px;
		height: 48px;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: white;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-btn:hover:not(.disabled) {
		background: rgba(255, 255, 255, 0.1);
		transform: scale(1.05);
	}

	.nav-btn.disabled {
		opacity: 0.3;
		cursor: not-allowed;
		transform: none !important;
	}

	/* Content Area */
	.content-area {
		flex: 1;
		padding: 0;
	}

	.loading-container, .empty-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 6rem 2rem;
		text-align: center;
	}

	.loading-animation {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 2rem;
	}

	.loading-dot {
		width: 12px;
		height: 12px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 50%;
		animation: loadingBounce 1.4s ease-in-out infinite both;
	}

	.loading-dot:nth-child(1) { animation-delay: -0.32s; }
	.loading-dot:nth-child(2) { animation-delay: -0.16s; }

	@keyframes loadingBounce {
		0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
		40% { transform: scale(1); opacity: 1; }
	}

	.loading-text {
		font-size: 1.1rem;
		color: rgba(255, 255, 255, 0.7);
		font-weight: 500;
	}

	.empty-container {
		color: rgba(255, 255, 255, 0.6);
	}

	.empty-icon {
		margin-bottom: 1.5rem;
		opacity: 0.5;
	}

	.empty-title {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: rgba(255, 255, 255, 0.8);
	}

	.empty-description {
		font-size: 1rem;
		margin: 0;
		color: rgba(255, 255, 255, 0.5);
	}

	/* Premium Table Design */
	.table-container {
		width: 100%;
		overflow: hidden;
	}

	.table-scroll {
		overflow-x: auto;
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
	}

	.table-scroll::-webkit-scrollbar {
		height: 8px;
	}

	.table-scroll::-webkit-scrollbar-track {
		background: transparent;
	}

	.table-scroll::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 4px;
	}

	.comparison-table {
		width: 100%;
		border-collapse: separate;
		border-spacing: 0;
		min-width: 800px;
	}

	.table-header {
		position: sticky;
		top: 0;
		z-index: 50;
	}

	.header-row {
		background: rgba(255, 255, 255, 0.02);
		backdrop-filter: blur(20px);
	}

	.label-column {
		width: 200px;
		min-width: 200px;
		position: sticky;
		left: 0;
		background: rgba(15, 15, 35, 0.95);
		backdrop-filter: blur(20px);
		z-index: 60;
		border-right: 1px solid rgba(255, 255, 255, 0.05);
	}

	.label-content {
		padding: 2rem 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		height: 100%;
	}

	.label-text {
		font-size: 1.1rem;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.9);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.product-column {
		width: 320px;
		min-width: 320px;
		padding: 0;
		border-left: 1px solid rgba(255, 255, 255, 0.05);
		position: relative;
	}

	.product-column.featured {
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
		border-left: 2px solid rgba(102, 126, 234, 0.5);
		border-right: 2px solid rgba(102, 126, 234, 0.5);
	}

	.product-header-card {
		padding: 2rem 1.5rem;
		text-align: center;
		position: relative;
		background: inherit;
	}

	.product-badges {
		position: absolute;
		top: 1rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 0.5rem;
		z-index: 10;
	}

	.badge {
		padding: 0.4rem 0.8rem;
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}

	.featured-badge {
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
		color: white;
	}

	.discount-badge {
		background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
		color: white;
	}

	.product-image-wrapper {
		margin: 2rem 0 1.5rem 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.product-image {
		width: 160px;
		height: 160px;
		object-fit: contain;
		border-radius: 16px;
		transition: transform 0.4s ease;
		background: rgba(255, 255, 255, 0.02);
		padding: 0.5rem;
	}

	.product-image:hover {
		transform: scale(1.05);
	}

	.product-details {
		text-align: center;
	}

	.product-title {
		font-size: 1.2rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		line-height: 1.3;
		color: white;
		letter-spacing: -0.01em;
	}

	.product-brand {
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.95rem;
		margin: 0 0 1.5rem 0;
		font-weight: 500;
	}

	.key-features {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.feature-tag {
		background: rgba(255, 255, 255, 0.08);
		color: rgba(255, 255, 255, 0.85);
		padding: 0.4rem 0.8rem;
		border-radius: 20px;
		font-size: 0.8rem;
		font-weight: 600;
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	/* Table Body */
	.table-body .comparison-row {
		border-bottom: 1px solid rgba(255, 255, 255, 0.03);
		transition: background-color 0.3s ease;
	}

	.table-body .comparison-row:hover {
		background: rgba(255, 255, 255, 0.02);
	}

	.table-body .comparison-row.priority {
		background: rgba(102, 126, 234, 0.02);
		border-bottom: 1px solid rgba(102, 126, 234, 0.1);
	}

	.label-cell {
		width: 200px;
		min-width: 200px;
		position: sticky;
		left: 0;
		background: rgba(15, 15, 35, 0.95);
		backdrop-filter: blur(20px);
		z-index: 20;
		border-right: 1px solid rgba(255, 255, 255, 0.05);
	}

	.field-name {
		font-size: 0.95rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.85);
		letter-spacing: -0.01em;
	}

	.data-cell {
		padding: 1.5rem;
		text-align: center;
		border-left: 1px solid rgba(255, 255, 255, 0.03);
		vertical-align: middle;
	}

	.data-cell.featured {
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
		border-left: 1px solid rgba(102, 126, 234, 0.1);
	}

	.cell-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60px;
	}

	/* Data Type Specific Styles */
	.rating-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.star-rating {
		font-size: 1.3rem;
		color: #fbbf24;
		letter-spacing: 2px;
	}

	.rating-value {
		background: rgba(251, 191, 36, 0.15);
		color: #fbbf24;
		padding: 0.4rem 0.8rem;
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: 700;
		border: 1px solid rgba(251, 191, 36, 0.2);
	}

	.price-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.8rem;
	}

	.original-price {
		color: rgba(255, 255, 255, 0.4);
		text-decoration: line-through;
		font-size: 0.9rem;
		font-weight: 500;
	}

	.current-price {
		font-size: 1.6rem;
		font-weight: 800;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		letter-spacing: -0.02em;
	}

	.cta-button {
		background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
		color: white;
		padding: 0.8rem 1.5rem;
		border-radius: 25px;
		text-decoration: none;
		font-size: 0.85rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		transition: all 0.4s ease;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		box-shadow: 0 4px 15px rgba(255, 65, 108, 0.3);
	}

	.cta-button:hover {
		transform: translateY(-3px);
		box-shadow: 0 8px 25px rgba(255, 65, 108, 0.5);
	}

	.tags-container {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		max-width: 100%;
	}

	.spec-tag {
		background: rgba(255, 255, 255, 0.08);
		color: rgba(255, 255, 255, 0.85);
		padding: 0.4rem 0.8rem;
		border-radius: 20px;
		font-size: 0.8rem;
		font-weight: 600;
		border: 1px solid rgba(255, 255, 255, 0.05);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.more-indicator {
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.8rem;
		font-style: italic;
		font-weight: 500;
		margin-top: 0.2rem;
	}

	.text-content {
		color: rgba(255, 255, 255, 0.85);
		font-size: 0.95rem;
		font-weight: 500;
		text-align: center;
		line-height: 1.4;
		letter-spacing: -0.01em;
	}

	.empty-indicator {
		color: rgba(255, 255, 255, 0.25);
		font-style: italic;
		font-size: 1rem;
		font-weight: 300;
	}

	/* Responsive Design */
	@media (max-width: 1200px) {
		.header-container {
			padding: 0 1.5rem;
		}
		
		.header-main {
			flex-direction: column;
			align-items: flex-start;
			gap: 2rem;
		}
		
		.controls-cluster {
			flex-direction: column;
			align-items: flex-start;
			gap: 1.5rem;
		}
		
		.action-buttons {
			width: 100%;
			justify-content: flex-start;
		}
	}

	@media (max-width: 768px) {
		.header-section {
			padding: 1.5rem 0;
		}
		
		.header-container {
			flex-direction: column;
			align-items: stretch;
			gap: 2rem;
			padding: 0 1rem;
		}
		
		.main-title {
			font-size: 2rem;
			text-align: center;
		}
		
		.header-description {
			text-align: center;
			font-size: 1rem;
		}
		
		.controls-cluster {
			width: 100%;
		}
		
		.category-select {
			width: 100%;
		}
		
		.action-buttons {
			width: 100%;
			justify-content: center;
		}
		
		.scroll-navigation {
			justify-content: center;
		}
		
		.product-column {
			width: 280px;
			min-width: 280px;
		}
		
		.product-header-card {
			padding: 1.5rem 1rem;
		}
		
		.product-image {
			width: 120px;
			height: 120px;
		}
		
		.label-column {
			width: 160px;
			min-width: 160px;
		}
		
		.label-content {
			padding: 1.5rem 1rem;
		}
		
		.label-text {
			font-size: 0.9rem;
		}
		
		.data-cell {
			padding: 1rem 0.75rem;
		}
	}

	@media (max-width: 480px) {
		.main-title {
			font-size: 1.5rem;
		}
		
		.action-buttons {
			flex-direction: column;
			gap: 0.5rem;
		}
		
		.action-btn {
			justify-content: center;
		}
		
		.product-column {
			width: 240px;
			min-width: 240px;
		}
		
		.product-image {
			width: 100px;
			height: 100px;
		}
		
		.current-price {
			font-size: 1.3rem;
		}
		
		.cta-button {
			padding: 0.7rem 1.2rem;
			font-size: 0.8rem;
		}
	}

	/* Premium Animations */
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.comparison-row {
		animation: fadeInUp 0.6s ease-out;
		animation-fill-mode: both;
	}

	.comparison-row:nth-child(1) { animation-delay: 0.1s; }
	.comparison-row:nth-child(2) { animation-delay: 0.15s; }
	.comparison-row:nth-child(3) { animation-delay: 0.2s; }
	.comparison-row:nth-child(4) { animation-delay: 0.25s; }
	.comparison-row:nth-child(5) { animation-delay: 0.3s; }

	/* Focus and Accessibility */
	.category-select:focus,
	.action-btn:focus,
	.nav-btn:focus,
	.cta-button:focus {
		outline: 2px solid rgba(102, 126, 234, 0.5);
		outline-offset: 2px;
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.comparison-wrapper {
			background: #000;
		}
		
		.header-section {
			background: rgba(255, 255, 255, 0.1);
		}
		
		.comparison-table {
			border: 1px solid rgba(255, 255, 255, 0.3);
		}
		
		.comparison-row {
			border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.product-image,
		.action-btn,
		.nav-btn,
		.cta-button {
			transition: none;
		}
		
		.comparison-row {
			animation: none;
		}
		
		.loading-dot {
			animation: none;
		}
	}
</style>
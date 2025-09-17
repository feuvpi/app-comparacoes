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
	let showFilters = false;

	let scrollContainer: HTMLElement;
	let specScrollContainer: HTMLElement;
	let isScrolledLeft = true;
	let isScrolledRight = false;

	onMount(async () => {
		try {
			availableCategories = await getAllCategories();
			console.log('Available categories:', availableCategories);
			
			if (products.length === 0) {
				if (category && availableCategories.includes(category)) {
					displayProducts = await loadProductsByCategory(category);
				} else if (availableCategories.length > 0) {
					category = availableCategories[0];
					displayProducts = await loadProductsByCategory(category);
				}
			} else {
				displayProducts = products;
			}

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
		scrollContainer?.scrollBy({ left: -320, behavior: 'smooth' });
	}

	function scrollRight() {
		scrollContainer?.scrollBy({ left: 320, behavior: 'smooth' });
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

	async function changeCategory(newCategory: string) {
		isLoading = true;
		try {
			category = newCategory;
			displayProducts = await loadProductsByCategory(newCategory);
			
			if (displayProducts.length > 0) {
				comparisonFields = generateComparisonFields(displayProducts);
			}
		} catch (error) {
			console.error('Error changing category:', error);
		} finally {
			isLoading = false;
		}
	}

	function getProductFieldValue(product: Product, field: ComparisonField): any {
		return product[field.key];
	}

	function toggleFilters() {
		showFilters = !showFilters;
	}

	function clearFilters() {
		// Implementation for clearing filters
		console.log('Clearing filters...');
	}

	// Synchronized scrolling function
	function syncScroll(event: Event) {
		const target = event.target as HTMLElement;
		const scrollTop = target.scrollTop;
		
		// Sync all scrollable content areas
		const allScrollables = document.querySelectorAll('.scrollable-content');
		allScrollables.forEach((el) => {
			if (el !== target) {
				(el as HTMLElement).scrollTop = scrollTop;
			}
		});
	}
</script>

<div class="comparison-app">
	<!-- Ultra-Modern Header -->
	<header class="app-header">
		<div class="header-content">
			<div class="brand-section">
				<div class="title-stack">
					<h1 class="app-title">
						<span class="category-name">{category ? `${category.charAt(0).toUpperCase() + category.slice(1)}` : 'Produtos'}</span>
						<span class="title-accent">Comparação</span>
					</h1>
					<p class="subtitle">Compare especificações, preços e encontre o produto perfeito</p>
				</div>
			</div>
			
			<div class="header-controls">
				{#if availableCategories.length > 1}
					<div class="control-group">
						<select 
							value={category} 
							on:change={(e) => changeCategory(e.target.value)}
							class="category-selector"
						>
							{#each availableCategories as cat}
								<option value={cat}>
									{cat.charAt(0).toUpperCase() + cat.slice(1)}
								</option>
							{/each}
						</select>
					</div>
				{/if}
				
				<div class="action-group">
					<button 
						class="control-btn {showFilters ? 'active' : ''}" 
						on:click={toggleFilters}
						aria-label="Toggle filters"
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"></polygon>
						</svg>
						Filtrar
					</button>
					<button class="control-btn secondary" on:click={clearFilters} aria-label="Clear filters">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
						</svg>
						Limpar
					</button>
				</div>
			</div>
		</div>
		
		<!-- Navigation Controls -->
		<div class="nav-controls">
			<button 
				class="nav-arrow {isScrolledLeft ? 'disabled' : ''}"
				on:click={scrollLeft}
				aria-label="Scroll left"
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<polyline points="15,18 9,12 15,6"></polyline>
				</svg>
			</button>
			<button 
				class="nav-arrow {isScrolledRight ? 'disabled' : ''}"
				on:click={scrollRight}
				aria-label="Scroll right"
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<polyline points="9,18 15,12 9,6"></polyline>
				</svg>
			</button>
		</div>
	</header>

	<!-- Main Content -->
	<main class="comparison-main">
		{#if isLoading}
			<div class="loading-state">
				<div class="loading-spinner">
					<div class="spinner-ring"></div>
					<div class="spinner-ring"></div>
					<div class="spinner-ring"></div>
				</div>
				<h3 class="loading-title">Carregando produtos</h3>
				<p class="loading-text">Preparando a comparação para você...</p>
			</div>
		{:else if displayProducts.length === 0}
			<div class="empty-state">
				<div class="empty-icon">
					<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
						<circle cx="9" cy="9" r="2"></circle>
						<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
					</svg>
				</div>
				<h3 class="empty-title">Nenhum produto encontrado</h3>
				<p class="empty-text">Adicione arquivos JSON na pasta <code>/src/content/{category}/</code></p>
			</div>
		{:else}
			<!-- Ultra-Sleek Comparison Interface -->
			<div class="comparison-container">
				<div class="comparison-scroll" bind:this={scrollContainer}>
					<div class="comparison-grid">
						<!-- Fixed Headers Row -->
						<div class="fixed-headers">
							<!-- Specs header -->
							<div class="specs-header-fixed">
								<h2 class="specs-title">Especificações</h2>
							</div>
							
							<!-- Product headers -->
							{#each displayProducts as product}
								<div class="product-header-fixed" class:featured={product.featured}>
									<div class="product-badges">
										{#if product.featured}
											<div class="badge featured">
												<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
													<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
												</svg>
												Destaque
											</div>
										{/if}
										{#if product.discount}
											<div class="badge discount">-{product.discount}%</div>
										{/if}
									</div>
									
									<div class="product-image-container">
										<img 
											src={product.image} 
											alt={product.name}
											class="product-image"
											loading="lazy"
										/>
									</div>
									
									<div class="product-info">
										<h3 class="product-name">{product.name}</h3>
										<p class="product-brand">{product.brand || ''}</p>
										
										{#if product.key_specs && Array.isArray(product.key_specs)}
											<div class="key-specs">
												{#each product.key_specs.slice(0, 2) as spec}
													<span class="spec-chip">{spec}</span>
												{/each}
											</div>
										{/if}
									</div>
								</div>
							{/each}
						</div>

						<!-- Scrollable Content Area -->
						<div class="scrollable-area">
							<!-- Specifications Column -->
							<div class="specs-column-scrollable">
								<div class="scrollable-content" on:scroll={syncScroll}>
									{#each comparisonFields as field}
										<div class="spec-row" class:highlight={field.key === 'price' || field.key === 'rating'}>
											<div class="spec-label">
												{field.label}
												{#if field.key === 'price'}
													<span class="spec-icon">💰</span>
												{:else if field.key === 'rating'}
													<span class="spec-icon">⭐</span>
												{/if}
											</div>
										</div>
									{/each}
								</div>
							</div>

							<!-- Products Data Columns -->
							{#each displayProducts as product}
								<div class="product-column-scrollable" class:featured={product.featured}>
									<div class="scrollable-content" on:scroll={syncScroll}>
										{#each comparisonFields as field}
											{@const fieldValue = getProductFieldValue(product, field)}
											<div class="data-row" class:highlight={field.key === 'price' || field.key === 'rating'}>
												<div class="data-cell">
													{#if field.type === 'rating' && fieldValue}
														<div class="rating-display">
															<div class="stars">{renderStars(fieldValue)}</div>
															<span class="rating-number">{fieldValue}</span>
														</div>
													{:else if field.type === 'price' && fieldValue}
														<div class="price-display">
															{#if product.original_price && product.original_price > fieldValue}
																<span class="price-old">{formatPrice(product.original_price)}</span>
															{/if}
															<span class="price-current">{formatPrice(fieldValue)}</span>
														</div>
													{:else if field.type === 'array' && Array.isArray(fieldValue)}
														<div class="tags-display">
															{#each fieldValue.slice(0, 2) as item}
																<span class="tag">{item}</span>
															{/each}
															{#if fieldValue.length > 2}
																<span class="tag-more">+{fieldValue.length - 2}</span>
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
											</div>
										{/each}
									</div>
								</div>
							{/each}
						</div>

						<!-- Fixed Footer Row -->
						<div class="fixed-footer">
							<!-- Empty space for specs column -->
							<div class="specs-footer-fixed"></div>
							
							<!-- Product footers with ratings, price and buy buttons -->
							{#each displayProducts as product}
								<div class="product-footer-fixed" class:featured={product.featured}>
									<!-- Rating -->
									{#if product.rating}
										<div class="rating-display">
											<div class="stars">{renderStars(product.rating)}</div>
											<span class="rating-number">{product.rating}</span>
										</div>
									{/if}
									
									<!-- Price -->
									<div class="price-display">
										{#if product.original_price && product.original_price > product.price}
											<span class="price-old">{formatPrice(product.original_price)}</span>
										{/if}
										<span class="price-current">{formatPrice(product.price)}</span>
									</div>
									
									<!-- Buy Button -->
									<a 
										href={product.affiliate_link} 
										class="buy-button"
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
							{/each}
						</div>
					</div>
				</div>
			</div>
		{/if}
	</main>
</div>

<style>
	/* Modern CSS Variables */
	:root {
		--bg-primary: #0a0a0f;
		--bg-secondary: #141420;
		--bg-tertiary: #1c1c2e;
		--bg-glass: rgba(255, 255, 255, 0.02);
		--bg-glass-hover: rgba(255, 255, 255, 0.05);
		
		--text-primary: #ffffff;
		--text-secondary: rgba(255, 255, 255, 0.7);
		--text-tertiary: rgba(255, 255, 255, 0.5);
		--text-muted: rgba(255, 255, 255, 0.3);
		
		--accent-primary: #6366f1;
		--accent-secondary: #8b5cf6;
		--accent-success: #10b981;
		--accent-warning: #f59e0b;
		--accent-danger: #ef4444;
		
		--border-subtle: rgba(255, 255, 255, 0.05);
		--border-soft: rgba(255, 255, 255, 0.1);
		--border-medium: rgba(255, 255, 255, 0.15);
		
		--shadow-soft: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
		--shadow-medium: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		--shadow-large: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
		
		--radius-sm: 8px;
		--radius-md: 12px;
		--radius-lg: 16px;
		--radius-xl: 24px;
		
		--spacing-xs: 0.25rem;
		--spacing-sm: 0.5rem;
		--spacing-md: 1rem;
		--spacing-lg: 1.5rem;
		--spacing-xl: 2rem;
		--spacing-2xl: 3rem;
		
		--font-size-xs: 0.75rem;
		--font-size-sm: 0.875rem;
		--font-size-base: 1rem;
		--font-size-lg: 1.125rem;
		--font-size-xl: 1.25rem;
		--font-size-2xl: 1.5rem;
		--font-size-3xl: 1.875rem;
		--font-size-4xl: 2.25rem;
		
		--font-weight-normal: 400;
		--font-weight-medium: 500;
		--font-weight-semibold: 600;
		--font-weight-bold: 700;
		--font-weight-extrabold: 800;
	}

	* {
		box-sizing: border-box;
	}

	.comparison-app {
		min-height: 100vh;
		background: var(--bg-primary);
		color: var(--text-primary);
		font-family: 'Inter', system-ui, -apple-system, sans-serif;
		font-feature-settings: 'cv01', 'cv03', 'cv04', 'cv11';
		line-height: 1.5;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	/* Ultra-Modern Header */
	.app-header {
		position: sticky;
		top: 0;
		z-index: 100;
		background: rgba(10, 10, 15, 0.8);
		backdrop-filter: blur(24px);
		border-bottom: 1px solid var(--border-subtle);
		padding: var(--spacing-lg) 0;
	}

	.header-content {
		max-width: 100%;
		margin: 0 auto;
		padding: 0 var(--spacing-xl);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-2xl);
	}

	.brand-section {
		flex: 1;
		min-width: 0;
	}

	.title-stack {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.app-title {
		font-size: var(--font-size-3xl);
		font-weight: var(--font-weight-extrabold);
		margin: 0;
		line-height: 1.1;
		letter-spacing: -0.025em;
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}

	.category-name {
		background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.title-accent {
		color: var(--text-secondary);
		font-weight: var(--font-weight-medium);
	}

	.subtitle {
		font-size: var(--font-size-base);
		color: var(--text-tertiary);
		margin: 0;
		font-weight: var(--font-weight-medium);
	}

	.header-controls {
		display: flex;
		align-items: center;
		gap: var(--spacing-lg);
	}

	.control-group,
	.action-group {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.category-selector {
		background: var(--bg-glass);
		border: 1px solid var(--border-soft);
		color: var(--text-primary);
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--radius-md);
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: 140px;
	}

	.category-selector:hover,
	.category-selector:focus {
		background: var(--bg-glass-hover);
		border-color: var(--border-medium);
		outline: none;
	}

	.category-selector option {
		background: var(--bg-secondary);
		color: var(--text-primary);
	}

	.control-btn {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--radius-md);
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: all 0.2s ease;
		border: 1px solid var(--border-soft);
		background: var(--bg-glass);
		color: var(--text-secondary);
	}

	.control-btn:hover,
	.control-btn.active {
		background: var(--bg-glass-hover);
		color: var(--text-primary);
		border-color: var(--border-medium);
	}

	.control-btn.secondary {
		color: var(--text-tertiary);
	}

	.control-btn.secondary:hover {
		color: var(--text-secondary);
	}

	.nav-controls {
		position: absolute;
		right: var(--spacing-xl);
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		gap: var(--spacing-xs);
	}

	.nav-arrow {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-md);
		background: var(--bg-glass);
		border: 1px solid var(--border-soft);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-arrow:hover:not(.disabled) {
		background: var(--bg-glass-hover);
		color: var(--text-primary);
		transform: scale(1.05);
	}

	.nav-arrow.disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	/* Main Content */
	.comparison-main {
		flex: 1;
		padding: 0;
	}

	/* Loading State */
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-2xl) var(--spacing-xl);
		text-align: center;
		min-height: 60vh;
	}

	.loading-spinner {
		position: relative;
		width: 60px;
		height: 60px;
		margin-bottom: var(--spacing-lg);
	}

	.spinner-ring {
		display: block;
		position: absolute;
		width: 48px;
		height: 48px;
		margin: 6px;
		border: 3px solid transparent;
		border-top: 3px solid var(--accent-primary);
		border-radius: 50%;
		animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
	}

	.spinner-ring:nth-child(1) { animation-delay: -0.45s; }
	.spinner-ring:nth-child(2) { animation-delay: -0.3s; }
	.spinner-ring:nth-child(3) { animation-delay: -0.15s; }

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.loading-title {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		margin: 0 0 var(--spacing-sm) 0;
		color: var(--text-primary);
	}

	.loading-text {
		font-size: var(--font-size-base);
		color: var(--text-tertiary);
		margin: 0;
	}

	/* Empty State */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-2xl) var(--spacing-xl);
		text-align: center;
		min-height: 60vh;
		color: var(--text-tertiary);
	}

	.empty-icon {
		margin-bottom: var(--spacing-lg);
		opacity: 0.5;
	}

	.empty-title {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		margin: 0 0 var(--spacing-sm) 0;
		color: var(--text-secondary);
	}

	.empty-text {
		font-size: var(--font-size-base);
		margin: 0;
	}

	.empty-text code {
		background: var(--bg-glass);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--radius-sm);
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: var(--font-size-sm);
	}

	/* New Improved Comparison Interface */
	.comparison-container {
		width: 100%;
		height: calc(100vh - 120px);
		overflow: hidden;
	}

	.comparison-scroll {
		width: 100%;
		height: 100%;
		overflow-x: auto;
		overflow-y: hidden;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.comparison-scroll::-webkit-scrollbar {
		display: none;
	}

	.comparison-grid {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-width: max-content;
	}

	/* Fixed Headers */
	.fixed-headers {
		display: flex;
		background: var(--bg-secondary);
		border-bottom: 2px solid var(--border-medium);
		position: sticky;
		top: 0;
		z-index: 90;
	}

	.specs-header-fixed {
		width: 240px;
		min-width: 240px;
		padding: var(--spacing-xl);
		background: var(--bg-tertiary);
		border-right: 1px solid var(--border-subtle);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.specs-title {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		margin: 0;
		color: var(--text-primary);
		text-align: center;
	}

	.product-header-fixed {
		width: 300px;
		min-width: 300px;
		padding: var(--spacing-xl) var(--spacing-lg);
		border-right: 1px solid var(--border-subtle);
		text-align: center;
		background: var(--bg-primary);
		position: relative;
	}

	.product-header-fixed.featured {
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%);
		border-left: 2px solid var(--accent-primary);
		border-right: 2px solid var(--accent-primary);
	}

	.product-badges {
		position: absolute;
		top: var(--spacing-md);
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: var(--spacing-xs);
		z-index: 10;
	}

	.badge {
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--radius-xl);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.badge.featured {
		background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
		color: white;
	}

	.badge.discount {
		background: linear-gradient(135deg, var(--accent-danger) 0%, #ff6b6b 100%);
		color: white;
	}

	.product-image-container {
		margin: var(--spacing-xl) 0 var(--spacing-lg) 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.product-image {
		width: 140px;
		height: 140px;
		object-fit: contain;
		border-radius: var(--radius-lg);
		transition: transform 0.3s ease;
		background: var(--bg-glass);
		padding: var(--spacing-sm);
	}

	.product-image:hover {
		transform: scale(1.05);
	}

	.product-info {
		text-align: center;
	}

	.product-name {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		margin: 0 0 var(--spacing-xs) 0;
		line-height: 1.3;
		color: var(--text-primary);
		letter-spacing: -0.01em;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.product-brand {
		color: var(--text-tertiary);
		font-size: var(--font-size-sm);
		margin: 0 0 var(--spacing-md) 0;
		font-weight: var(--font-weight-medium);
	}

	.key-specs {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.spec-chip {
		background: var(--bg-glass);
		color: var(--text-secondary);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--radius-xl);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		border: 1px solid var(--border-subtle);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Scrollable Area */
	.scrollable-area {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.specs-column-scrollable {
		width: 240px;
		min-width: 240px;
		background: var(--bg-secondary);
		border-right: 1px solid var(--border-subtle);
	}

	.product-column-scrollable {
		width: 300px;
		min-width: 300px;
		background: var(--bg-primary);
		border-right: 1px solid var(--border-subtle);
	}

	.product-column-scrollable.featured {
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%);
		border-left: 2px solid var(--accent-primary);
		border-right: 2px solid var(--accent-primary);
	}

	.scrollable-content {
		height: 100%;
		overflow-y: auto;
		overflow-x: hidden;
		scrollbar-width: thin;
		scrollbar-color: var(--border-medium) transparent;
	}

	.scrollable-content::-webkit-scrollbar {
		width: 6px;
	}

	.scrollable-content::-webkit-scrollbar-track {
		background: transparent;
	}

	.scrollable-content::-webkit-scrollbar-thumb {
		background: var(--border-medium);
		border-radius: var(--radius-sm);
	}

	.scrollable-content::-webkit-scrollbar-thumb:hover {
		background: var(--border-soft);
	}

	.spec-row {
		padding: var(--spacing-lg) var(--spacing-xl);
		border-bottom: 1px solid var(--border-subtle);
		transition: all 0.2s ease;
		min-height: 80px;
		display: flex;
		align-items: center;
	}

	.spec-row:hover {
		background: var(--bg-glass);
	}

	.spec-row.highlight {
		background: rgba(99, 102, 241, 0.05);
		border-color: rgba(99, 102, 241, 0.1);
	}

	.spec-label {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--text-secondary);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-sm);
		width: 100%;
	}

	.spec-icon {
		font-size: var(--font-size-xs);
		opacity: 0.7;
	}

	.data-row {
		padding: var(--spacing-lg);
		border-bottom: 1px solid var(--border-subtle);
		transition: all 0.2s ease;
		min-height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.data-row:hover {
		background: var(--bg-glass);
	}

	.data-row.highlight {
		background: rgba(99, 102, 241, 0.03);
		border-color: rgba(99, 102, 241, 0.1);
	}

	.data-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		text-align: center;
	}

	/* Fixed Footer */
	.fixed-footer {
		display: flex;
		background: var(--bg-secondary);
		border-top: 2px solid var(--border-medium);
		position: sticky;
		bottom: 0;
		z-index: 90;
	}

	.specs-footer-fixed {
		width: 240px;
		min-width: 240px;
		background: var(--bg-tertiary);
		border-right: 1px solid var(--border-subtle);
	}

	.product-footer-fixed {
		width: 300px;
		min-width: 300px;
		padding: var(--spacing-xl) var(--spacing-lg);
		border-right: 1px solid var(--border-subtle);
		background: var(--bg-primary);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-md);
	}

	.product-footer-fixed.featured {
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%);
		border-left: 2px solid var(--accent-primary);
		border-right: 2px solid var(--accent-primary);
	}

	/* Data Type Specific Styles */
	.rating-display {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.stars {
		font-size: var(--font-size-lg);
		color: var(--accent-warning);
		letter-spacing: 2px;
		line-height: 1;
	}

	.rating-number {
		background: rgba(245, 158, 11, 0.1);
		color: var(--accent-warning);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--radius-xl);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-bold);
		border: 1px solid rgba(245, 158, 11, 0.2);
	}

	.price-display {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-sm);
		width: 100%;
	}

	.price-old {
		color: var(--text-muted);
		text-decoration: line-through;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
	}

	.price-current {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-extrabold);
		background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		letter-spacing: -0.02em;
		line-height: 1;
	}

	.buy-button {
		background: linear-gradient(135deg, var(--accent-success) 0%, #16a34a 100%);
		color: white;
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--radius-xl);
		text-decoration: none;
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		transition: all 0.3s ease;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		box-shadow: var(--shadow-medium);
		width: 100%;
		justify-content: center;
	}

	.buy-button:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-large);
		background: linear-gradient(135deg, #059669 0%, #15803d 100%);
	}

	.tags-display {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
		width: 100%;
		max-width: 100%;
	}

	.tag {
		background: var(--bg-glass);
		color: var(--text-secondary);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--radius-xl);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		border: 1px solid var(--border-subtle);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		text-align: center;
	}

	.tag-more {
		color: var(--text-muted);
		font-size: var(--font-size-xs);
		font-style: italic;
		font-weight: var(--font-weight-medium);
		text-align: center;
	}

	.text-value {
		color: var(--text-secondary);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		text-align: center;
		line-height: 1.4;
		letter-spacing: -0.01em;
	}

	.empty-value {
		color: var(--text-muted);
		font-style: italic;
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-normal);
	}

	/* Responsive Design */
	@media (max-width: 1200px) {
		.header-content {
			padding: 0 var(--spacing-lg);
			flex-direction: column;
			align-items: stretch;
			gap: var(--spacing-lg);
		}
		
		.brand-section {
			text-align: center;
		}
		
		.header-controls {
			justify-content: center;
			flex-wrap: wrap;
		}
		
		.nav-controls {
			position: relative;
			right: auto;
			top: auto;
			transform: none;
			justify-content: center;
		}
	}

	@media (max-width: 768px) {
		.app-header {
			padding: var(--spacing-md) 0;
		}
		
		.header-content {
			padding: 0 var(--spacing-md);
		}
		
		.app-title {
			font-size: var(--font-size-2xl);
			flex-direction: column;
			gap: var(--spacing-xs);
			text-align: center;
		}
		
		.subtitle {
			text-align: center;
			font-size: var(--font-size-sm);
		}
		
		.header-controls {
			flex-direction: column;
			gap: var(--spacing-md);
		}
		
		.category-selector {
			width: 100%;
		}
		
		.action-group {
			width: 100%;
			justify-content: center;
		}
		
		.specs-header-fixed,
		.specs-column-scrollable,
		.specs-footer-fixed {
			width: 180px;
			min-width: 180px;
		}
		
		.specs-header-fixed {
			padding: var(--spacing-lg);
		}
		
		.specs-title {
			font-size: var(--font-size-base);
		}
		
		.spec-row {
			padding: var(--spacing-md) var(--spacing-lg);
		}
		
		.spec-label {
			font-size: var(--font-size-xs);
		}
		
		.product-header-fixed,
		.product-column-scrollable,
		.product-footer-fixed {
			width: 260px;
			min-width: 260px;
		}
		
		.product-header-fixed,
		.product-footer-fixed {
			padding: var(--spacing-lg) var(--spacing-md);
		}
		
		.product-image {
			width: 100px;
			height: 100px;
		}
		
		.product-name {
			font-size: var(--font-size-base);
		}
		
		.data-row {
			padding: var(--spacing-md);
			min-height: 60px;
		}
		
		.price-current {
			font-size: var(--font-size-xl);
		}
		
		.buy-button {
			padding: var(--spacing-xs) var(--spacing-sm);
		}
	}

	@media (max-width: 480px) {
		.comparison-container {
			height: calc(100vh - 160px);
		}
		
		.app-title {
			font-size: var(--font-size-xl);
		}
		
		.action-group {
			flex-direction: column;
			width: 100%;
		}
		
		.control-btn {
			justify-content: center;
			width: 100%;
		}
		
		.specs-header-fixed,
		.specs-column-scrollable,
		.specs-footer-fixed {
			width: 140px;
			min-width: 140px;
		}
		
		.specs-header-fixed {
			padding: var(--spacing-md);
		}
		
		.specs-title {
			font-size: var(--font-size-sm);
		}
		
		.spec-row {
			padding: var(--spacing-sm) var(--spacing-md);
		}
		
		.product-header-fixed,
		.product-column-scrollable,
		.product-footer-fixed {
			width: 220px;
			min-width: 220px;
		}
		
		.fixed-footer {
			min-height: 140px;
		}
		
		.product-footer-fixed {
			min-height: 140px;
		}
		
		.product-image {
			width: 80px;
			height: 80px;
		}
		
		.price-current {
			font-size: var(--font-size-lg);
		}
	}

	/* Premium Animations */
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes slideInLeft {
		from {
			opacity: 0;
			transform: translateX(-20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.product-header-fixed,
	.product-column-scrollable,
	.product-footer-fixed {
		animation: fadeInUp 0.6s ease-out;
		animation-fill-mode: both;
	}

	.product-header-fixed:nth-child(2) { animation-delay: 0.1s; }
	.product-header-fixed:nth-child(3) { animation-delay: 0.2s; }
	.product-header-fixed:nth-child(4) { animation-delay: 0.3s; }
	.product-header-fixed:nth-child(5) { animation-delay: 0.4s; }
	.product-header-fixed:nth-child(6) { animation-delay: 0.5s; }

	.spec-row {
		animation: slideInLeft 0.4s ease-out;
		animation-fill-mode: both;
	}

	.spec-row:nth-child(1) { animation-delay: 0.05s; }
	.spec-row:nth-child(2) { animation-delay: 0.1s; }
	.spec-row:nth-child(3) { animation-delay: 0.15s; }
	.spec-row:nth-child(4) { animation-delay: 0.2s; }
	.spec-row:nth-child(5) { animation-delay: 0.25s; }

	/* Focus and Accessibility */
	.category-selector:focus,
	.control-btn:focus,
	.nav-arrow:focus,
	.buy-button:focus {
		outline: 2px solid var(--accent-primary);
		outline-offset: 2px;
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		:root {
			--bg-primary: #000000;
			--bg-secondary: #1a1a1a;
			--bg-tertiary: #333333;
			--text-primary: #ffffff;
			--text-secondary: #cccccc;
			--border-subtle: #555555;
			--border-soft: #777777;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.product-image,
		.control-btn,
		.nav-arrow,
		.buy-button,
		.data-row,
		.spec-row {
			transition: none;
		}
		
		.product-header-fixed,
		.product-column-scrollable,
		.product-footer-fixed,
		.spec-row {
			animation: none;
		}
		
		.spinner-ring {
			animation: none;
		}
	}

	/* Enhanced focus states for better accessibility */
	.category-selector:focus-visible,
	.control-btn:focus-visible,
	.nav-arrow:focus-visible,
	.buy-button:focus-visible {
		outline: 2px solid var(--accent-primary);
		outline-offset: 2px;
	}

	/* Print styles */
	@media print {
		.app-header {
			position: static;
			background: white;
			color: black;
		}
		
		.comparison-container {
			height: auto;
			overflow: visible;
		}
		
		.comparison-scroll {
			overflow: visible;
		}
		
		.nav-controls {
			display: none;
		}
		
		.buy-button {
			display: none;
		}
	}

	</style>
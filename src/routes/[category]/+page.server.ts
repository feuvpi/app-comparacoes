import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { 
	getAllCategories, 
	loadProductsByCategory, 
	generateComparisonSchema, 
	generateFilterOptions,
	getCategoryStats 
} from '$lib/utils/content.js';

export const load: PageServerLoad = async ({ params, url }) => {
	const { category: category } = params;
	console.log(`Loading category page for: ${category}`);
	// Validate category exists
	const availableCategories = await getAllCategories();
	console.log(`Available categories: ${availableCategories.join(', ')}`);
	if (!availableCategories.includes(category)) {
throw error(404, `Categoria "${category}" não encontrada. Disponíveis: ${availableCategories.join(', ')}`);

	}
	
	// Load all products for this category
	const products = await loadProductsByCategory(category);
	
	if (products.length === 0) {
		throw error(404, `A categoria "${category}" não possui produtos cadastrados.`);

	}
	
	// Generate comparison schema and filters
	const comparisonSchema = generateComparisonSchema(products);
	const comparisonFields = Object.keys(comparisonSchema).filter(field => 
		comparisonSchema[field].hasValues && 
		!['slug', 'content', 'category'].includes(field)
	);
	
	const filters = generateFilterOptions(products, comparisonSchema);
	
	// Get category statistics
	const stats = await getCategoryStats(category);
	
	// Parse URL parameters for filtering and sorting
	const searchParams = url.searchParams;
	const sortBy = searchParams.get('sort') || 'name';
	const sortOrder = searchParams.get('order') || 'asc';
	const minPrice = searchParams.get('min_price') ? parseInt(searchParams.get('min_price')) : null;
	const maxPrice = searchParams.get('max_price') ? parseInt(searchParams.get('max_price')) : null;
	const brandFilter = searchParams.get('brand') || null;
	const search = searchParams.get('search') || '';
	
	// Apply filters
	let filteredProducts = [...products];
	
	// Search filter
	if (search) {
		const searchTerm = search.toLowerCase();
		filteredProducts = filteredProducts.filter(product => 
			product.name?.toLowerCase().includes(searchTerm) ||
			product.brand?.toLowerCase().includes(searchTerm) ||
			product.model?.toLowerCase().includes(searchTerm) ||
			(Array.isArray(product.key_specs) && 
			 product.key_specs.some(spec => spec.toLowerCase().includes(searchTerm)))
		);
	}
	
	// Price range filter
	if (minPrice !== null || maxPrice !== null) {
		filteredProducts = filteredProducts.filter(product => {
			const price = product.price || 0;
			return (minPrice === null || price >= minPrice) && 
			       (maxPrice === null || price <= maxPrice);
		});
	}
	
	// Brand filter
	if (brandFilter) {
		filteredProducts = filteredProducts.filter(product => 
			product.brand?.toLowerCase() === brandFilter.toLowerCase()
		);
	}
	
	// Apply additional URL filters dynamically
	Object.keys(filters).forEach(filterKey => {
		const filterValue = searchParams.get(filterKey);
		if (filterValue && filterValue !== '') {
			const filter = filters[filterKey];
			
			if (filter.type === 'range') {
				// Handle range filters
				const [min, max] = filterValue.split(',').map(Number);
				if (!isNaN(min) || !isNaN(max)) {
					filteredProducts = filteredProducts.filter(product => {
						const value = product[filterKey];
						if (typeof value !== 'number') return true;
						return (!isNaN(min) ? value >= min : true) && 
						       (!isNaN(max) ? value <= max : true);
					});
				}
			} else if (filter.type === 'select') {
				// Handle select filters
				filteredProducts = filteredProducts.filter(product => 
					product[filterKey] === filterValue
				);
			} else if (filter.type === 'multiselect') {
				// Handle multiselect filters
				const selectedValues = filterValue.split(',');
				filteredProducts = filteredProducts.filter(product => {
					if (Array.isArray(product[filterKey])) {
						return product[filterKey].some(value => selectedValues.includes(value));
					}
					return selectedValues.includes(product[filterKey]);
				});
			}
		}
	});
	
	// Apply sorting
	filteredProducts.sort((a, b) => {
		let aValue = a[sortBy];
		let bValue = b[sortBy];
		
		// Handle different data types
		if (typeof aValue === 'string') {
			aValue = aValue.toLowerCase();
		}
		if (typeof bValue === 'string') {
			bValue = bValue.toLowerCase();
		}
		
		// Handle null/undefined values
		if (aValue == null) aValue = sortBy === 'price' ? Infinity : '';
		if (bValue == null) bValue = sortBy === 'price' ? Infinity : '';
		
		let comparison = 0;
		if (aValue < bValue) comparison = -1;
		if (aValue > bValue) comparison = 1;
		
		return sortOrder === 'desc' ? -comparison : comparison;
	});
	
	// Generate SEO meta information
	const categoryDisplayName = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
	const priceInfo = stats.priceRange ? 
		` a partir de R$ ${Math.floor(stats.priceRange.min)}` : '';
	
	const meta = {
		title: `Melhor ${categoryDisplayName} 2024 - Compare ${stats.productCount} Modelos${priceInfo}`,
		description: `Compare ${stats.productCount} ${categoryDisplayName.toLowerCase()} com especificações detalhadas, preços e avaliações. Encontre o modelo ideal com nossa ferramenta de comparação completa.`,
		keywords: [
			categoryDisplayName,
			'comparação',
			'preços',
			'avaliações',
			'especificações',
			...stats.topBrands.slice(0, 3).map(brand => brand.brand)
		],
		ogImage: `/images/${category}/category-hero.jpg`,
		canonical: `/${category}`,
		schema: {
			'@context': 'https://schema.org',
			'@type': 'CollectionPage',
			name: `${categoryDisplayName} - Comparação`,
			description: `Compare os melhores ${categoryDisplayName.toLowerCase()} do mercado`,
			numberOfItems: filteredProducts.length,
			about: {
				'@type': 'ProductGroup',
				name: categoryDisplayName,
				description: `Produtos da categoria ${categoryDisplayName.toLowerCase()}`
			}
		}
	};
	
	return {
		category,
		categoryDisplayName,
		products: filteredProducts,
		allProducts: products,
		comparisonFields,
		comparisonSchema,
		filters,
		stats,
		meta,
		currentFilters: {
			search,
			sortBy,
			sortOrder,
			minPrice,
			maxPrice,
			brandFilter
		},
		pagination: {
			total: filteredProducts.length,
			page: 1,
			perPage: filteredProducts.length // Show all for now, can implement pagination later
		}
	};
};
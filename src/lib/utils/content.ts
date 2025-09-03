/**
 * Content loading utilities for the comparison site
 * Handles markdown file processing and category management
 */

export interface Product {
	name: string;
	brand?: string;
	model?: string;
	price: number;
	original_price?: number;
	affiliate_link: string;
	rating?: number;
	image: string;
	slug: string;
	content: any;
	category: string;
	key_specs?: string[];
	pros?: string[];
	cons?: string[];
	featured?: boolean;
	discount?: number;
	[key: string]: unknown; // Allow for category-specific fields
}

export interface ComparisonSchema {
	[field: string]: {
		type: string;
		values: any[];
		isNumeric: boolean;
		isArray: boolean;
		hasValues: boolean;
		uniqueCount: number;
	};
}

export interface FilterConfig {
	type: 'range' | 'select' | 'multiselect';
	label: string;
	min?: number;
	max?: number;
	step?: number;
	suffix?: string;
	options?: any[];
}

export interface CategoryStats {
	productCount: number;
	priceRange: {
		min: number;
		max: number;
		average: number;
	} | null;
	averageRating: number | null;
	topBrands: Array<{ brand: string; count: number }>;
}

/**
 * Get all available categories by scanning content folders
 */
export async function getAllCategories(): Promise<string[]> {
	const modules = import.meta.glob('/src/content/**/*.md');
	const categories = new Set<string>();
	
	Object.keys(modules).forEach(path => {
		// Extract category from path: /src/content/tvs/product.md -> tvs
		const pathParts = path.split('/');
		const categoryIndex = pathParts.findIndex(part => part === 'content') + 1;
		
		if (categoryIndex > 0 && categoryIndex < pathParts.length - 1) {
			const category = pathParts[categoryIndex];
			categories.add(category);
			console.log(`Found category: ${category}`);
		}
	});
	
	return Array.from(categories).sort();
}

/**
 * Load all products for a specific category
 */
export async function loadProductsByCategory(category: string): Promise<Product[]> {
	const modules = import.meta.glob('/src/content/**/*.md');
	const products: Product[] = [];
	console.log(`Loading products for category: ${category}`);
	for (const path in modules) {
		if (path.includes(`/content/${category}/`)) {
			try {
				const module: any = await modules[path]();
				const slug = path.split('/').pop()?.replace('.md', '') || '';
				
				// Ensure we have the required fields
				const product: Product = {
					...module.metadata,
					slug,
					content: '',
					category,
					// Add default values for missing fields
					price: module.metadata?.price || 0,
					rating: module.metadata?.rating || null,
					image: module.metadata?.image || `/images/${category}/placeholder.jpg`,
					affiliate_link: module.metadata?.affiliate_link || '#'
				};
				
				products.push(product);
			} catch (error) {
				console.error(`Error loading product from ${path}:`, error);
			}
		}
	}
	console.log(`Loaded ${products.length} products for category: ${category}`);
	// Sort products by name for consistent ordering
	return products.sort((a, b) => a.name?.localeCompare(b.name) || 0);
}

/**
 * Load a single product by category and slug
 */
export async function loadProduct(category: string, slug: string): Promise<Product | null> {
	try {
		const module: any = await import(`/src/content/${category}/${slug}.md`);
		
		return {
			...module.metadata,
			slug,
			content: module.default,
			category,
			// Add default values
			price: module.metadata?.price || 0,
			rating: module.metadata?.rating || null,
			image: module.metadata?.image || `/images/${category}/placeholder.jpg`,
			affiliate_link: module.metadata?.affiliate_link || '#'
		};
	} catch (error) {
		console.error(`Error loading product ${category}/${slug}:`, error);
		return null;
	}
}

/**
 * Generate comparison schema from products
 * Analyzes all products to determine available fields and their types
 */
export function generateComparisonSchema(products: Product[]): ComparisonSchema {
	const schema: ComparisonSchema = {};
	
	products.forEach(product => {
		Object.entries(product).forEach(([key, value]) => {
			// Skip internal fields
			if (['slug', 'content', 'category'].includes(key)) return;
			
			if (!schema[key]) {
				schema[key] = {
					type: typeof value,
					values: [],
					isNumeric: typeof value === 'number',
					isArray: Array.isArray(value),
					hasValues: false,
					uniqueCount: 0
				};
			}
			
			// Track unique values
			if (value !== undefined && value !== null && value !== '') {
				if (!schema[key].values.includes(value)) {
					schema[key].values.push(value);
				}
				schema[key].hasValues = true;
			}
		});
	});
	
	// Calculate unique counts
	Object.keys(schema).forEach(key => {
		schema[key].uniqueCount = schema[key].values.length;
	});
	
	return schema;
}

/**
 * Generate filter options based on product data
 */
export function generateFilterOptions(products: Product[], schema: ComparisonSchema): Record<string, FilterConfig> {
	const filters: Record<string, FilterConfig> = {};
	
	Object.entries(schema).forEach(([field, config]) => {
		// Skip fields that shouldn't be filterable
		if (['name', 'content', 'slug', 'image', 'affiliate_link'].includes(field)) {
			return;
		}
		
		// Only create filters for fields with multiple values
		if (config.uniqueCount <= 1) return;
		
		if (config.isNumeric && config.hasValues) {
			// Numeric fields get range filters
			const numericValues = config.values
				.filter((v: any) => typeof v === 'number' && !isNaN(v))
				.sort((a: number, b: number) => a - b);
			
			if (numericValues.length > 0) {
				filters[field] = {
					type: 'range',
					label: getFieldLabel(field),
					min: numericValues[0],
					max: numericValues[numericValues.length - 1],
					step: field === 'price' ? 50 : 1,
					suffix: getFieldSuffix(field)
				};
			}
		} else if (config.isArray) {
			// Array fields get multi-select filters
			const allValues = new Set<string>();
			products.forEach(product => {
				if (Array.isArray(product[field])) {
					product[field].forEach((value: any) => allValues.add(value));
				}
			});
			
			if (allValues.size > 1) {
				filters[field] = {
					type: 'multiselect',
					label: getFieldLabel(field),
					options: Array.from(allValues).sort()
				};
			}
		} else if (config.uniqueCount > 1 && config.uniqueCount <= 10) {
			// Categorical fields with few options get select filters
			filters[field] = {
				type: 'select',
				label: getFieldLabel(field),
				options: config.values.sort()
			};
		}
	});
	
	return filters;
}

/**
 * Get human-readable label for a field
 */
function getFieldLabel(field: string): string {
	const labels: Record<string, string> = {
		price: 'Preço',
		rating: 'Avaliação',
		brand: 'Marca',
		screen_size: 'Tamanho da Tela',
		resolution: 'Resolução',
		display_type: 'Tipo de Display',
		refresh_rate: 'Taxa de Atualização',
		battery_life: 'Duração da Bateria',
		connectivity: 'Conectividade',
		weight: 'Peso',
		waterproof_rating: 'Resistência à Água',
		smart_platform: 'Sistema Smart',
		hdr_support: 'Suporte HDR',
		gaming_features: 'Recursos para Jogos'
	};
	
	return labels[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Get suffix for a field (units, symbols)
 */
function getFieldSuffix(field: string): string {
	const suffixes: Record<string, string> = {
		price: '',
		screen_size: '"',
		refresh_rate: 'Hz',
		battery_life: 'h',
		weight: 'kg'
	};
	
	return suffixes[field] || '';
}

/**
 * Get related products (same category, excluding current)
 */
export async function getRelatedProducts(category: string, currentSlug: string, limit: number = 4): Promise<Product[]> {
	const allProducts = await loadProductsByCategory(category);
	
	return allProducts
		.filter(product => product.slug !== currentSlug)
		.sort(() => Math.random() - 0.5) // Randomize
		.slice(0, limit);
}

/**
 * Search products across all categories or within a specific category
 */
export async function searchProducts(query: string, category: string | null = null): Promise<Product[]> {
	const searchTerm = query.toLowerCase();
	let products: Product[] = [];
	
	if (category) {
		products = await loadProductsByCategory(category);
	} else {
		const categories = await getAllCategories();
		for (const cat of categories) {
			const catProducts = await loadProductsByCategory(cat);
			products.push(...catProducts);
		}
	}
	
	return products.filter(product => {
		const searchableText = [
			product.name,
			product.brand,
			product.model,
			...(Array.isArray(product.key_specs) ? product.key_specs : []),
			product.content // Search in content too
		].join(' ').toLowerCase();
		
		return searchableText.includes(searchTerm);
	});
}

/**
 * Get category statistics
 */
export async function getCategoryStats(category: string): Promise<CategoryStats> {
	const products = await loadProductsByCategory(category);
	
	if (products.length === 0) {
		return {
			productCount: 0,
			priceRange: null,
			averageRating: null,
			topBrands: []
		};
	}
	
	const prices = products.map(p => p.price).filter(p => p > 0);
	const ratings = products.map(p => p.rating).filter(r => r !== null && r > 0) as number[];
	const brands = products.map(p => p.brand).filter(Boolean) as string[];
	
	// Count brand frequency
	const brandCounts: Record<string, number> = brands.reduce((acc, brand) => {
		acc[brand] = (acc[brand] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);
	
	const topBrands = Object.entries(brandCounts)
		.sort(([,a], [,b]) => b - a)
		.slice(0, 5)
		.map(([brand, count]) => ({ brand, count }));
	
	return {
		productCount: products.length,
		priceRange: prices.length > 0 ? {
			min: Math.min(...prices),
			max: Math.max(...prices),
			average: prices.reduce((a, b) => a + b, 0) / prices.length
		} : null,
		averageRating: ratings.length > 0 ? 
			ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
		topBrands
	};
}
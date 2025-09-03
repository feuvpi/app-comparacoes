<script>
	export let padding = 'default'; // none, sm, default, lg
	export let shadow = 'default'; // none, sm, default, lg, xl
	export let rounded = 'default'; // none, sm, default, lg, xl
	export let hover = false;
	
	$: paddingClasses = {
		none: '',
		sm: 'p-4',
		default: 'p-6',
		lg: 'p-8'
	}[padding];
	
	$: shadowClasses = {
		none: '',
		sm: 'shadow-sm',
		default: 'shadow-md',
		lg: 'shadow-lg',
		xl: 'shadow-xl'
	}[shadow];
	
	$: roundedClasses = {
		none: '',
		sm: 'rounded-sm',
		default: 'rounded-lg',
		lg: 'rounded-xl',
		xl: 'rounded-2xl'
	}[rounded];
	
	$: hoverClasses = hover ? 'hover:shadow-lg transition-shadow duration-200' : '';
	
	$: classes = `bg-white border border-gray-200 ${paddingClasses} ${shadowClasses} ${roundedClasses} ${hoverClasses}`;
</script>

<div class={classes}>
	<slot />
</div>

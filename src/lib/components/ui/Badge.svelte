<script>
	export let variant = 'default'; // default, primary, secondary, success, warning, danger
	export let size = 'md'; // sm, md, lg
	
	$: baseClasses = 'inline-flex items-center font-medium rounded-full';
	
	$: variantClasses = {
		default: 'bg-gray-100 text-gray-800',
		primary: 'bg-blue-100 text-blue-800',
		secondary: 'bg-purple-100 text-purple-800',
		success: 'bg-green-100 text-green-800',
		warning: 'bg-yellow-100 text-yellow-800',
		danger: 'bg-red-100 text-red-800'
	}[variant];
	
	$: sizeClasses = {
		sm: 'px-2 py-0.5 text-xs',
		md: 'px-2.5 py-1 text-sm',
		lg: 'px-3 py-1.5 text-base'
	}[size];
	
	$: classes = `${baseClasses} ${variantClasses} ${sizeClasses}`;
</script>

<span class={classes}>
	<slot />
</span>

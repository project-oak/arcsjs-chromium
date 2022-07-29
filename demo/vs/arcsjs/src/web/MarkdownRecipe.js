const MarkdownRecipe = {
	$meta: {
		description: 'Test'
	},
	$stores: {
		markdown: {
			$type: 'String'
		},
		html: {
			$type: 'String'
		}
	},
	main: {
		$kind: `MarkdownParticle`,
		$inputs: [{
			markdown: 'markdown'
		}],
		$outputs: [{
			html: 'html',
		}]
	}
};

MarkdownRecipe;

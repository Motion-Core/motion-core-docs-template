<script lang="ts">
	import { fromAction } from 'svelte/attachments';
	import Pre from './markdown/Pre.svelte';

	type Props = {
		code: string;
		htmlLight: string;
		htmlDark?: string;
		lang?: string;
		class?: string;
		unstyled?: boolean;
	};

	let { code, htmlLight, htmlDark, lang, class: className, unstyled = false }: Props = $props();
	const normalizedHtmlLight = $derived(htmlLight.replace(/\s+tabindex="0"/g, ''));
	const normalizedHtmlDark = $derived((htmlDark ?? htmlLight).replace(/\s+tabindex="0"/g, ''));

	function setInnerHtml(node: HTMLDivElement, html: string) {
		node.innerHTML = html;

		return {
			update(nextHtml: string) {
				node.innerHTML = nextHtml;
			},
			destroy() {
				node.innerHTML = '';
			}
		};
	}
</script>

<Pre {code} class={className} data-language={lang} {unstyled}>
	<div class="shiki-theme-light" {@attach fromAction(setInnerHtml, () => normalizedHtmlLight)}></div>
	<div class="shiki-theme-dark" {@attach fromAction(setInnerHtml, () => normalizedHtmlDark)}></div>
</Pre>

<style>
	.shiki-theme-dark {
		display: none;
	}

	:global(.dark) :global(.shiki-theme-light) {
		display: none;
	}

	:global(.dark) :global(.shiki-theme-dark) {
		display: block;
	}
</style>

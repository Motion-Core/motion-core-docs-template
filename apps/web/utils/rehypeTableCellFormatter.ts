type NodeType = 'root' | 'element' | 'text';

type UnknownNode = {
	type: string;
	[key: string]: unknown;
};

type ParentNode = {
	type: 'root' | 'element';
	children: AstNode[];
};

type RootNode = ParentNode & {
	type: 'root';
};

type ElementNode = ParentNode & {
	type: 'element';
	tagName: string;
	properties?: Record<string, unknown>;
};

type TextNode = {
	type: 'text';
	value: string;
};

type AstNode = RootNode | ElementNode | TextNode | UnknownNode;

const isObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

const hasType = (
	node: unknown,
	type: NodeType
): node is Record<string, unknown> & { type: NodeType } => isObject(node) && node.type === type;

const isRootNode = (node: unknown): node is RootNode =>
	hasType(node, 'root') && Array.isArray(node.children);

const isElementNode = (node: unknown): node is ElementNode =>
	hasType(node, 'element') && typeof node.tagName === 'string' && Array.isArray(node.children);

const isTextNode = (node: unknown): node is TextNode =>
	hasType(node, 'text') && typeof node.value === 'string';

const isParentNode = (node: unknown): node is ParentNode => isRootNode(node) || isElementNode(node);

export const tableCellFormatter = () => {
	return (tree: unknown): void => {
		if (!isRootNode(tree)) {
			return;
		}

		const ancestors: ElementNode[] = [];

		const visit = (node: AstNode, parent: ParentNode | null = null, index = 0): void => {
			if (!node || !isObject(node) || typeof node.type !== 'string') {
				return;
			}

			const isElement = isElementNode(node);

			if (isElement) {
				ancestors.push(node);
			}

			if (isTextNode(node) && node.value.includes('\\|')) {
				const directParent = ancestors[ancestors.length - 1];
				const grandParent = ancestors[ancestors.length - 2];
				const isCodeBlock = directParent?.tagName === 'code' && grandParent?.tagName === 'pre';

				if (!isCodeBlock) {
					node.value = node.value.replace(/\\\|/g, '|');
				}
			}

			if (
				isElement &&
				node.tagName === 'code' &&
				node.children.length === 1 &&
				isTextNode(node.children[0])
			) {
				const parentNode = ancestors[ancestors.length - 2];
				const isBlockCode = parentNode?.tagName === 'pre';
				const insideTableCell = ancestors.some(
					(ancestor) =>
						ancestor !== node && (ancestor.tagName === 'td' || ancestor.tagName === 'th')
				);

				let raw = node.children[0].value;
				if (raw.includes('\\|')) {
					raw = raw.replace(/\\\|/g, '|');
					node.children[0].value = raw;
				}

				if (!isBlockCode && insideTableCell && raw.includes('|') && parent) {
					const segments = raw.split('|').map((segment) => segment.trim());
					if (segments.length > 1) {
						const replacements = segments.flatMap(
							(segment, segmentIndex): Array<ElementNode | TextNode> => {
								const codeNode: ElementNode = {
									type: 'element',
									tagName: 'code',
									properties: node.properties ?? {},
									children: [
										{
											type: 'text',
											value: segment
										}
									]
								};

								if (segmentIndex === segments.length - 1) {
									return [codeNode];
								}

								return [codeNode, { type: 'text', value: ' ' }];
							}
						);

						parent.children.splice(index, 1, ...replacements);
						ancestors.pop();
						replacements.forEach((child, childIndex) => visit(child, parent, index + childIndex));
						return;
					}
				}
			}

			if (isParentNode(node)) {
				for (let i = 0; i < node.children.length; i += 1) {
					visit(node.children[i], node, i);
				}
			}

			if (isElement) {
				ancestors.pop();
			}
		};

		visit(tree);
	};
};

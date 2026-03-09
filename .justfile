generate:
    tree-sitter generate

parse src:
    tree-sitter parse {{ src }}

highlight src:
    tree-sitter highlight {{ src }}

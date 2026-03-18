/**
 * @file Pl grammar for tree-sitter
 * @author OkaniYoshiii <dragut31620@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "pl",

  extras: ($) => [
    /\s/,
  ],

  reserved: {
    global: $ => [
      'fn', 'return', 'if', 'package',
      'struct', 'var', 'const', 'union',
    ]
  },

  conflicts: $ => [
    [$._boolean_expression, $.constant],
  ],

  rules: {
    source_file: ($) =>
      repeat(
        choice(
          seq($._statement, $._terminator),
          seq($._definition, $._terminator),
        ),
      ),

    _definition: ($) => choice(
      $.function_definition,
      $.union_definition,
      $.struct_definition,
      $.package_definition,
    ),
    // MAIN LANGUAGE CONSTRUCTS
    _statement: ($) =>
      choice(
        $.var_statement,
        $.const_statement,
        $.return_statement,
        $.if_statement
      ),
    block: ($) =>
      seq("{", repeat($._statement), "}"),
    type: ($) => choice("i32", "f32", "string"),
    identifier: ($) => /[a-zA-Z]+/,
    expression: ($) => choice($._boolean_expression),

    // LITTERALS
    string: ($) => /"(.*?)"/,
    int: ($) => /\d+/,
    true: ($) => 'true',
    false: ($) => 'false',

    // KEYWORDS
    fn_keyword: ($) => "fn",
    return_keyword: ($) => "return",
    var_keyword: ($) => "var",
    const_keyword: ($) => "const",
    union_keyword: ($) => "union",
    struct_keyword: ($) => "struct",
    package_keyword: ($) => "package",
    if_keyword: ($) => "if",
    else_keyword: ($) => "else",

    // OPERATORS
    _comparison_operator: ($) =>
      choice($.greater_than_operator, $.less_than_operator, $.greater_or_equal_than_operator, $.less_or_equal_than_operator, $.equality_operator),
    greater_or_equal_than_operator: ($) => ">=",
    less_or_equal_than_operator: ($) => "<=",
    greater_than_operator: ($) => ">",
    less_than_operator: ($) => "<",
    equality_operator: ($) => "==",

    // DEFINTIONS
    function_definition: ($) =>
      seq($.fn_keyword, " ", $.identifier, "(", optional($.parameters), ") ", $.type, " ", $.block),
    struct_definition: ($) =>
      seq($.struct_keyword, " ", $.identifier, " {", repeat($.struct_field), "}"),
    union_definition: ($) =>
      seq($.union_keyword, " ", $.identifier, " {", repeat($.struct_field), "}"),
    package_definition: ($) =>
      seq($.package_keyword, " ", $.identifier),

    // EXPRESSIONS
    _boolean_expression: ($) =>
      choice(
        $.true,
        $.false,
        $._comparison_expression,
      ),
    _comparison_expression: ($) =>
      seq($._simple_expression, ' ', $._comparison_operator, ' ', $._simple_expression),
    _simple_expression: ($) =>
      choice($.identifier, $.constant),

    // STATEMENTS
    const_statement: ($) =>
    seq($.const_keyword, " ", $.identifier, " = ", choice($.identifier, $.expression, $.constant)),
    var_statement: ($) =>
    seq($.var_keyword, " ", $.identifier, " = ", choice($.identifier, $.expression, $.constant)),
    return_statement: ($) =>
    seq($.return_keyword, " ", optional(choice($.identifier, $.constant))),
    if_statement: ($) =>
    seq($.if_keyword, ' ', field('condition', $.expression), ' ', $.block),

    // OTHERS
    constant: ($) => choice($.int, $.string, $.true, $.false),
    parameter: ($) => seq($.identifier, " ", $.type),
    parameters: ($) => seq(repeat(seq($.parameter, ", ")), $.parameter),
    struct_fields: ($) =>
      seq($.struct_field),
    struct_field: ($) =>
    seq($.identifier, repeat(" "), $.type, ','),

    // HELPERS
    _indentation: ($) => /[\t\s]+/,
    _terminator: ($) => choice('\n', ';'),
  },
});

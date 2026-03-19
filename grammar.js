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

  conflicts: $ => [],

  rules: {
    source_file: ($) =>
      seq(
        repeat(
          choice(
            seq($._statement, $._terminator),
            seq($._definition, $._terminator),
          ),
        ),
        optional(choice($._statement, $._definition)),
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
    expression: ($) => prec(1, choice($.identifier, $._boolean_expression, $.constant_expression)),

    // LITTERALS
    _string: ($) => /"(.*?)"/,
    _int: ($) => /\d+/,
    _true: ($) => 'true',
    _false: ($) => 'false',

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
    constant_expression: ($) => prec(1, choice($._int, $._string, $._true, $._false)),
    _boolean_expression: ($) =>
      choice(
        $._true,
        $._false,
        $._comparison_expression,
      ),
    _comparison_expression: ($) =>
      seq($._simple_expression, ' ', $._comparison_operator, ' ', $._simple_expression),
    _simple_expression: ($) =>
      choice($.identifier, $.constant_expression),

    // STATEMENTS
    const_statement: ($) =>
    seq($.const_keyword, " ", $.identifier, " = ", choice($.identifier, $.expression, $.constant_expression)),
    var_statement: ($) =>
    seq($.var_keyword, " ", $.identifier, " = ", choice($.identifier, $.expression, $.constant_expression)),
    return_statement: ($) =>
    seq($.return_keyword, " ", optional($.expression)),
    if_statement: ($) =>
    seq($.if_keyword, ' ', field('condition', $.expression), ' ', $.block),

    // OTHERS
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

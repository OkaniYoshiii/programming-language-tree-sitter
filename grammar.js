/**
 * @file Pl grammar for tree-sitter
 * @author OkaniYoshiii <dragut31620@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "pl",

  extras: ($) => [],

  rules: {
    source_file: ($) =>
      repeat(
        choice(
          $.function_definition,
          $.union_definition,
          $.struct_definition,
          $.var_statement,
          $.const_statement,
          $._new_line,
        ),
      ),

    // MAIN LANGUAGE CONSTRUCTS
    statement: ($) =>
      choice($.var_statement, $.const_statement, $.return_statement),
    block: ($) =>
      seq("{", $._new_line, repeat(seq(optional($._indentation), $.statement)), "}"),
    type: ($) => choice("i32", "f32", "string"),
    identifier: ($) => /[a-zA-Z]+/,
    expression: ($) => "TODO",

    // LITTERALS
    string: ($) => /"(.*?)"/,
    int: ($) => /\d+/,

    // KEYWORDS
    fn_keyword: ($) => token(prec(1, "fn")),
    return_keyword: ($) => token(prec(1, "return")),
    var_keyword: ($) => token(prec(1, "var")),
    const_keyword: ($) => token(prec(1, "const")),
    union_keyword: ($) => token(prec(1, "union")),
    struct_keyword: ($) => token(prec(1, "struct")),

    // DEFINTIONS
    function_definition: ($) =>
      seq($.fn_keyword, " ", $.identifier, "(", optional($.parameters), ") ", $.type, " ", $.block, $._new_line),
    struct_definition: ($) =>
      seq($.struct_keyword, " ", $.identifier, " {", $._new_line, repeat($.struct_field), "}"),
    union_definition: ($) =>
      seq($.union_keyword, " ", $.identifier, " {", $._new_line, repeat($.struct_field), "}"),

    // STATEMENTS
    const_statement: ($) =>
      seq($.const_keyword, " ", $.identifier, " = ", choice($.identifier, $.expression, $.constant), $._new_line),
    var_statement: ($) =>
      seq($.var_keyword, " ", $.identifier, " = ", choice($.identifier, $.expression, $.constant), $._new_line),
    return_statement: ($) =>
      seq($.return_keyword, " ", optional(choice($.identifier, $.constant))),

    // OTHERS
    constant: ($) => choice($.int, $.string),
    parameter: ($) => seq($.identifier, " ", $.type),
    parameters: ($) => seq(repeat(seq($.parameter, ", ")), $.parameter),
    struct_fields: ($) =>
      seq($.struct_field),
    struct_field: ($) =>
      seq(repeat($._indentation), $.identifier, repeat(" "), $.type, ',', $._new_line),

    // HELPERS
    _new_line: ($) => choice("\r\n", "\n", "\r"),
    _indentation: ($) => /[\t\s]+/,
  },
});

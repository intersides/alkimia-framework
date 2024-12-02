import stylisticJs from '@stylistic/eslint-plugin-js'

export default [
  {
    files: ["**/*.js", "**/*.jsx", "**/*.json"],
    ignores: ["node_modules/**", "dist/**", "build/**"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module"
    },
    plugins: {
      '@stylistic/js': stylisticJs
    },
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "double"],
      indent: ["error", 2, {
        SwitchCase: 1,
        VariableDeclarator: { var: 2, let: 2, const: 3 },
        outerIIFEBody: 1,
        MemberExpression: 1,
        FunctionDeclaration: { parameters: 1, body: 1 },
        FunctionExpression: { parameters: 1, body: 1 },
        CallExpression: { arguments: 1 },
        ArrayExpression: 1,
        ObjectExpression: 1,
        ImportDeclaration: 1,
        flatTernaryExpressions: false,
        ignoreComments: false,
      }],
      "comma-dangle": ["error", "never"],
      "eol-last": ["error", "always"],
      "brace-style": ["error", "stroustrup"],
      // "space-before-blocks": ["error", "never"],
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "space-before-function-paren": ["error", "never"],
      // "space-before-function-paren": ["error", {
      //   "anonymous": "always",
      //   "named": "never",
      //   "asyncArrow": "always"
      // }],
      "padding-line-between-statements": ["error",
        { blankLine: "always", prev: "var", next: "return" }
      ],
      "require-await": "warn",
      "no-unused-vars": ["warn", { vars: "all", args: "after-used", ignoreRestSiblings: false }],
      // "no-trailing-spaces": "error",
      "no-redeclare": "error",
      "no-var": "warn",
      "prefer-const": "warn",
      "comma-spacing": "warn",
      'no-multi-spaces': ['error'],

      // '@stylistic/js/no-multiple-empty-lines': ['max', 2],
      '@stylistic/js/no-multiple-empty-lines': ["error", { "max": 2, "maxEOF": 0 }]
      // "arrow-spacing": ["error", { before: true, after: true }],
      // "keyword-spacing": ["warn", { "before": false, "after": false }],
      // "space-in-parens": ["warn", "never"],
      // "promise/always-return": "warn",
      // "promise/no-return-wrap": "error",
      // "promise/param-names": "error",
      // "promise/catch-or-return": "error",
      // "promise/no-new-statics": "error",
      // "promise/no-return-in-finally": "error"
      // Add more rules as needed
    }
  }
];

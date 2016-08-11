# parsecss

Convert CSS Stylesheets into a simple JSON structure.

`parsecss` was written to support critical css inlining on dynamic pages. The
JSON structure it produces is optimized for figuring out which CSS rules should
be applied to a given page. We use [postcss](https://github.com/postcss/postcss)
to do most of the heavy lifting but instead of an AST, the JSON output makes it
easier to use directly for certain use cases.

[![Hex.pm](https://img.shields.io/hexpm/l/plug.svg)](LICENSE)

## Installation

```
npm install -g parsecss
```

## Usage

To use `parsecss` you simply pass it the contents of a CSS stylesheet (or path).

```bash
parsecss -f path/to/file.css

// via stdin
cat path/to/file.css | parsecss
```

You can also use `parsecss` programatically in node:

```js
var parseCSS = require('parsecss');
var output = parseCSS(css);
```

## JSON Structure

`parsecss` was written to support critical css inlining on dynamic pages. As
such, the JSON structure it produces is optimized for figuring out which CSS
rules should be applied to a given page.

### Terminology:

1. Rules - A CSS Rules refers to its selector + its declarations
2. Selectors - For each rule, the selectors define which elements are affected.

We consider each rule in an `@media querie` as its own rule to ensure that all we
don't miss out on any rules that should be included.

### Global Rules

We consider all rules with selectors that don't contain class names to be
Global. Since we don't use IDs in our CSS selectors, this effectively means that
all rules that directly affect tags (eg. html, body, a) are global.

### Class List Pairs

For each non global rule, we parse the class names that are contained in it
(accounting for pseudo selectors).

Eg. `.home .link.a {}` => `['home', 'link']`

### `@font-face` Rules

These rules are split into their own section since they are almost always
critical and required to fetch the fonts as soon as possible.

### Keyframes

Keyframe rules are parsed so that they are keyed by their names to allow for
conditional inclusion of certain critical keyframes on the page.

## Sample Output

Each rule in the output is minified using `cssmin`.

```json
{
    "globalCss": ["footer{display:none}", "a{text-decoration:underline}"],
    "fontfaceCss": ["@font-face{...}"],
    "keyframesCss":[
        ["fadeOut","@keyframes fadeOut{from{opacity:1}to{opacity:0}}"],
        ["fadeInUp","@-webkit-keyframes fadeInUp{}"]
    ],
    "classListCssPairs": [
        [["Button","Topic"],".Button.Topic{border:0}"],
        [["NavHeader","link"],"@media screen and (max-width:434px){.NavHeader .link{...}}"],
    ]
}
```

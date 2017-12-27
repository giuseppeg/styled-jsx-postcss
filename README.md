# styled-jsx-postcss

[![Build Status](https://travis-ci.org/giuseppeg/styled-jsx-postcss.svg?branch=master)](https://travis-ci.org/giuseppeg/styled-jsx-postcss)
[![npm](https://img.shields.io/npm/v/styled-jsx-postcss.svg)](https://www.npmjs.com/package/styled-jsx-postcss)

Use [PostCSS](https://github.com/postcss/postcss) with [styled-jsx](https://github.com/zeit/styled-jsx) 💥

### 🎉 styled-jsx now supports plugins 🎉
If you are using styled-jsx 2+, please direct your attention to https://github.com/giuseppeg/styled-jsx-plugin-postcss

### ⚠️ Development is frozen ⚠️
Due to the lack of time I am not able to maintain this project anymore therefore this project would likely lock you to `styled-jsx ^0.5.7`. As always contributions are more than welcome and I can provide support! FWIW I submitted a proposal to make styled-jsx itself pluggable see ~~zeit/styled-jsx/pull/190~~ https://github.com/zeit/styled-jsx/pull/291

## Usage

Install the package first.

```bash
npm install --save styled-jsx-postcss
```

Next, add `styled-jsx-postcss/babel` to `plugins` in your babel configuration:

```json
{
  "plugins": [
    "styled-jsx-postcss/babel"
  ]
}
```

#### Notes

`styled-jsx-postcss` extends `styled-jsx` therefore you don't need to include both – just add `styled-jsx-postcss` and you're ready to rock!

Also keep in mind that the PostCSS transformations run on `styled-jsx` transformed code.

If you're already using `styled-jsx` and don't want to rename all the `import` and/or `require` you can define an alias with webpack (and other module bundlers I believe) like so:

```js
module.exports = {
  resolve: {
    alias: {
      'styled-jsx': 'styled-jsx-postcss'
    }
  },
  // ...
}
```

## Plugins

`styled-jsx-postcss` uses [`postcss-load-plugins`](https://www.npmjs.com/package/postcss-load-plugins) therefore you may want to refer to their docs to learn more about [adding plugins](https://www.npmjs.com/package/postcss-load-plugins#packagejson)

## styled-jsx api

`styled-jsx-postcss` exports all of the modules from `styled-jsx`.

This mean that you can include `styled-jsx-postcss/server` or `styled-jsx-postcss/style` like you would do with Zeit's `styled-jsx`!

Read [the styled-jsx docs](https://github.com/zeit/styled-jsx#readme).

## Credits

<3 goes to

* the [Zeit](https://zeit.co) team and the [authors of `styled-jsx`](https://github.com/zeit/styled-jsx/#authors).
* the [PostCSS](https://github.com/postcss/postcss) authors, org and community
* [Michael Ciniawsky](https://github.com/michael-ciniawsky) for making postcss-load-plugins

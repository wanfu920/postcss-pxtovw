const postcss = require("postcss");

// excluding regex trick: http://www.rexegg.com/regex-best-trick.html

// Not anything inside double quotes
// Not anything inside single quotes
// Not anything inside url()
// Any digit followed by px
// !singlequotes|!doublequotes|!url()|pixelunit
const pxRegex = /"[^"]+"|'[^']+'|url\([^)]+\)|var\([^)]+\)|(\d*\.?\d+)px/g;

const defaults = {
  designWidth: 750,
  unitPrecision: 5,
  exclude: null,
};

module.exports = postcss.plugin("postcss-plugin-pxtovw", (options = {}) => {
  const opts = Object.assign({}, defaults, options);

  return (css) => {
    const exclude = opts.exclude;
    const filePath = css.source.input.file;
    if (
      exclude &&
      ((typeof exclude === "function" && exclude(filePath)) ||
        (typeof exclude === "string" && filePath.indexOf(exclude) !== -1) ||
        filePath.match(exclude) !== null)
    ) {
      return;
    }

    const pxReplace = createPxReplace(opts.designWidth, opts.unitPrecision);

    css.walkDecls((decl) => {
      if (decl.value.indexOf("px") === -1) return;

      decl.value = decl.value.replace(pxRegex, pxReplace);
    });
  };
});

function createPxReplace(designWidth, unitPrecision) {
  return (m, $1) => {
    if (!$1) return m;
    const pixels = parseFloat($1);
    if (pixels < 0) return m;
    const fixedVal = ((pixels / designWidth) * 100).toPrecision(unitPrecision);
    return fixedVal === 0 ? "0" : fixedVal + "vw";
  };
}

'use strict';

// Protect inline math $...$ from hexo-renderer-kramed treating _ as italic.
// Only applies to posts with katex: true or mathjax: true in front-matter.
// Formulas containing \, ^, _, {, } are pre-converted to <script type="math/tex">
// tags before kramed sees them, so the special chars can't be misinterpreted.
hexo.extend.filter.register('before_post_render', function(data) {
  if (!data.katex && !data.mathjax) return data;

  data.content = data.content.replace(
    /\$([^\$\n]*?[\\\^_{}][^\$\n]*?)\$/g,
    '<script type="math/tex">$1</script>'
  );

  return data;
});

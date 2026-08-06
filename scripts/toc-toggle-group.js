'use strict'

/**
 * [TocToggleGroup] 目录 hideToggle 折叠分组
 *
 * 覆盖 Hexo 内置 toc 助手：渲染文章目录时检测 hideToggle 标签插件生成的
 * <details class="toggle"> 块，把块内标题归入一个可折叠目录项（原生 details），
 * 折叠项名称取 <summary class="toggle-button"> 的文字。
 *
 * - 未包含 hideToggle 的页面输出与内置助手保持一致（同层级、同编号、同 class）。
 * - 折叠目录组的 summary 不使用 .toc-link，保证主题 main.js 滚动高亮按
 *   “文章标题序号 == .toc-link 序号”的映射不被破坏。
 * - 解析失败时回退内置 toc 助手。
 */

const { Parser, DomHandler, DomUtils } = require('htmlparser2')
const { escapeHTML, encodeURL } = require('hexo-util')

// 内置助手在 scripts/ 加载前已注册，先取出作为回退
const originalToc = hexo.extend.helper.get('toc')

const nonWord = /^\s*[^a-zA-Z0-9]\s*$/

const parseHtml = html => {
  const handler = new DomHandler(null, {})
  new Parser(handler, {}).end(html)
  return handler.dom
}

// 与 hexo-util tocObj 一致：取元素自身 id，否则沿父级向上取
const getId = ({ attribs = {}, parent }) => attribs.id || (!parent ? '' : getId(parent))

const hasClass = (el, name) => (el.attribs.class || '').split(/\s+/).includes(name)

const isToggleDetails = el =>
  el && el.type === 'tag' && el.name === 'details' && hasClass(el, 'toggle')

// 标题所属的最近 hideToggle 块（沿父级向上）
const getToggleDetails = el => {
  let node = el.parent
  while (node) {
    if (isToggleDetails(node)) return node
    node = node.parent
  }
  return null
}

// hideToggle 标题文字：直接子级 summary.toggle-button 的纯文本（转义后用于 HTML 输出）
const getToggleTitle = details => {
  const summary = (details.children || []).find(
    el => el.type === 'tag' && el.name === 'summary' && hasClass(el, 'toggle-button')
  )
  if (!summary) return ''
  return escapeHTML(DomUtils.textContent(summary).trim())
}

// 与 hexo-util tocObj 一致的标题文字提取（跳过 permalink 锚点）
const getHeadingText = el => {
  let text = ''
  for (const element of el.children) {
    const elText = DomUtils.textContent(element)
    if (!('name' in element) || element.name !== 'a' || !nonWord.test(elText)) {
      text += escapeHTML(elText)
    }
  }
  if (!text) text = escapeHTML(DomUtils.textContent(el))
  return text
}

// 提取扁平标题序列（文档序），并标记所属 hideToggle 块
const collectHeadings = (str, minDepth, maxDepth) => {
  const selector = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].slice(minDepth - 1, maxDepth)
  const headings = DomUtils.find(
    el => 'tagName' in el && selector.includes(el.tagName),
    parseHtml(str),
    true,
    Infinity
  )
  return headings.map(el => {
    const item = {
      level: +el.name[1],
      id: getId(el),
      text: getHeadingText(el),
      toggle: getToggleDetails(el)
    }
    if ((el.attribs || {})['data-toc-unnumbered'] === 'true') item.unnumbered = true
    return item
  })
}

// 与内置 getAndTruncateTocObj 一致的 max_items 截断
const truncateItems = (data, maxItems) => {
  if (data.length === 0 || maxItems < 1 || maxItems === Infinity) return data
  const levels = data.map(item => item.level)
  const min = Math.min(...levels)
  const max = Math.max(...levels)
  for (let currentLevel = max; data.length > maxItems && currentLevel > min; currentLevel--) {
    data = data.filter(item => item.level < currentLevel)
  }
  return data.slice(0, maxItems)
}

// 与内置助手一致的编号计数器（基于完整文档序扁平列表，折叠组不改变编号）
const assignNumbers = (data, listNumber) => {
  const lastNumber = [0, 0, 0, 0, 0, 0]
  const firstLevel = data[0].level
  for (const el of data) {
    if (!el.unnumbered) lastNumber[el.level - 1]++
    for (let i = el.level; i <= 5; i++) lastNumber[i] = 0
    el.number = ''
    if (listNumber && !el.unnumbered) {
      let number = ''
      for (let i = firstLevel - 1; i < el.level; i++) number += `${lastNumber[i]}.`
      el.number = number
    }
  }
}

// 同一 hideToggle 块内的标题在文档序上必然连续，折叠成分组节点
const groupByToggle = data => {
  const nodes = []
  const titles = new Map()
  for (const item of data) {
    const prev = nodes[nodes.length - 1]
    if (item.toggle && prev && prev.type === 'toggle' && prev.toggle === item.toggle) {
      prev.items.push(item)
      continue
    }
    if (item.toggle) {
      if (!titles.has(item.toggle)) titles.set(item.toggle, getToggleTitle(item.toggle))
      nodes.push({
        type: 'toggle',
        toggle: item.toggle,
        title: titles.get(item.toggle),
        level: item.level,
        items: [item]
      })
    } else {
      nodes.push({ type: 'heading', item })
    }
  }
  return nodes
}

function tocToggleGroupHelper(str, options = {}) {
  options = Object.assign({
    min_depth: 1,
    max_depth: 6,
    max_items: Infinity,
    class: 'toc',
    class_item: '',
    class_link: '',
    class_text: '',
    class_child: '',
    class_number: '',
    class_level: '',
    list_number: true
  }, options)

  const className = escapeHTML(options.class)
  const itemClass = escapeHTML(options.class_item || options.class + '-item')
  const linkClass = escapeHTML(options.class_link || options.class + '-link')
  const textClass = escapeHTML(options.class_text || options.class + '-text')
  const childClass = escapeHTML(options.class_child || options.class + '-child')
  const numberClass = escapeHTML(options.class_number || options.class + '-number')
  const levelClass = escapeHTML(options.class_level || options.class + '-level')

  // 与内置助手相同的流式层级算法；units 的 html 均为未闭合的 <li> 起始片段
  const renderUnits = (units, rootClass) => {
    let result = `<ol class="${rootClass}">`
    let firstLevel = 0
    let lastLevel = 0
    for (const unit of units) {
      const { level } = unit
      if (firstLevel) {
        for (let i = level; i < lastLevel; i++) result += '</li></ol>'
        result += level > lastLevel ? `<ol class="${childClass}">` : '</li>'
      } else {
        firstLevel = level
      }
      result += unit.html
      lastLevel = level
    }
    for (let i = firstLevel - 1; i < lastLevel; i++) result += '</li></ol>'
    return result
  }

  const headingUnit = el => {
    const href = el.id ? `#${encodeURL(el.id)}` : null
    let html = `<li class="${itemClass} ${levelClass}-${el.level}">`
    html += href ? `<a class="${linkClass}" href="${href}">` : `<a class="${linkClass}">`
    if (el.number) html += `<span class="${numberClass}">${el.number}</span> `
    html += `<span class="${textClass}">${el.text}</span></a>`
    return { level: el.level, html }
  }

  const toggleUnit = node => {
    const title = node.title || '折叠内容'
    let html = `<li class="${itemClass} ${levelClass}-${node.level} toc-toggle-item">`
    html += `<details class="toc-toggle"><summary class="toc-toggle-summary">`
    html += `<span class="${textClass}">${title}</span></summary>`
    html += renderUnits(node.items.map(headingUnit), `${childClass} toc-toggle-child`)
    html += '</details>'
    return { level: node.level, html }
  }

  try {
    let data = collectHeadings(str, options.min_depth, options.max_depth)
    if (!data.length) return ''
    data = truncateItems(data, options.max_items)
    if (!data.length) return ''
    assignNumbers(data, options.list_number)
    const units = groupByToggle(data).map(node =>
      node.type === 'toggle' ? toggleUnit(node) : headingUnit(node.item)
    )
    return renderUnits(units, className)
  } catch (err) {
    hexo.log.warn('[TocToggleGroup] 目录折叠分组解析失败，回退内置 toc 助手：', err)
    return originalToc.call(this, str, options)
  }
}

hexo.extend.helper.register('toc', tocToggleGroupHelper)

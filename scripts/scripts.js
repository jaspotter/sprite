/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global window, navigator, document, fetch */

function toClassName(name) {
    return (name.toLowerCase().replace(/[^0-9a-z]/gi, '-'));
  }
  
  function createTag(name, attrs) {
    const el = document.createElement(name);
    if (typeof attrs === 'object') {
      for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
      }
    }
    return el;
  }
  
  function wrapSections(element) {
    document.querySelectorAll(element).forEach(($div) => {
      if (!$div.id) {
        const $wrapper = createTag('div', { class: 'section-wrapper' });
        $div.parentNode.appendChild($wrapper);
        $wrapper.appendChild($div);
      }
    });
  }
  
  function tableToDivs($table, cols) {
    const $rows = $table.querySelectorAll('tbody tr');
    const $cards = createTag('div', { class: `${cols.join('-')} block` });
    $rows.forEach(($tr) => {
      const $card = createTag('div');
      $tr.querySelectorAll('td').forEach(($td, i) => {
        const $div = createTag('div', cols.length > 1 ? { class: cols[i] } : {});
        $div.innerHTML = $td.innerHTML;
        $div.childNodes.forEach(($child) => {
          if ($child.nodeName === '#text') {
            const $p = createTag('p');
            $p.innerHTML = $child.nodeValue;
            $child.parentElement.replaceChild($p, $child);
          }
        });
        $card.append($div);
      });
      $cards.append($card);
    });
    return ($cards);
  }
  
  function decorateTables() {
    document.querySelectorAll('main div>table').forEach(($table) => {
      const $cols = $table.querySelectorAll('thead tr th');
      let cols = Array.from($cols).map((e) => toClassName(e.textContent)).filter((e) => (!!e));
      let $div = {};
      /* workaround for import */
      if (cols.length === 0) cols = ['template-list'];
      $div = tableToDivs($table, cols);
      $table.parentNode.replaceChild($div, $table);
    });
  }
      
  function decoratePictures() {
    if (!document.querySelector('picture')) {
      const helixImages = document.querySelectorAll('main img[src^="/hlx_"');
      helixImages.forEach(($img) => {
        const $pic = createTag('picture');
        const $parent = $img.parentNode;
        $pic.appendChild($img);
        $parent.appendChild($pic);
      });
    }
  }
  
  
  function decorateBlocks() {
    document.querySelectorAll('div.block').forEach(($block) => {
      const classes = Array.from($block.classList.values());
      const blockName = classes[0];
      const $section = $block.closest('.section-wrapper');
      if ($section) {
        $section.classList.add(`${blockName}-container`);
      }
      const blocksWithOptions = ['checker-board'];
      blocksWithOptions.forEach((b) => {
        if (blockName.startsWith(`${b}-`)) {
          const options = blockName.substring(b.length + 1).split('-');
          $block.classList.add(b);
          $block.classList.add(...options);
        }
      });
    });
  }
  
  
  /**
   * Loads a CSS file.
   * @param {string} href The path to the CSS file
   */
  function loadCSS(href) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', href);
    link.onload = () => {
    };
    link.onerror = () => {
    };
    document.head.appendChild(link);
  }
  
  function loadScript(url, callback) {
    const $head = document.querySelector('head');
    const $script = createTag('script', { src: url });
    $head.append($script);
    $script.onload = callback;
  }
  
  
  function readBlockConfig($block) {
    const config = {};
    $block.querySelectorAll(':scope>div').forEach(($row) => {
      if ($row.children && $row.children[1]) {
        const name = toClassName($row.children[0].textContent);
        const $a = $row.children[1].querySelector('a');
        let value = '';
        if ($a) value = $a.href;
        else value = $row.children[1].textContent;
        config[name] = value;
      }
    });
    return config;
  }
    
  function postLCP() {
    loadCSS('/styles/lazy-styles.css');
  }
    
  
  async function decoratePage() {
    decoratePictures();
    decorateTables();
    wrapSections('main>div');
    decorateBlocks();
  }
  
  decoratePage();
  
  export { loadScript as default };
  
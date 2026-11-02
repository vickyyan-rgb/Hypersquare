const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../dist/workspace/index.html'), 'utf8');
function harness(editable = true) {
  let cursor = 0, hooks = [], saves = [];
  const sandbox = {
    html(strings, ...values) { return {strings, values}; }, Icon() {},
    useState(initial) { const i = cursor++; if (!(i in hooks)) hooks[i] = initial; return [hooks[i], value => { hooks[i] = typeof value === 'function' ? value(hooks[i]) : value; }]; },
    useRef(initial) { const i = cursor++; if (!(i in hooks)) hooks[i] = {current:initial}; return hooks[i]; }
  };
  vm.createContext(sandbox);
  vm.runInContext(source.slice(source.indexOf('var KW ='), source.indexOf('/* ---------------- data')), sandbox);
  const props = {editable, file:'sample.cbl', lines:[[415,'READ ACCOUNT'], [416,'    END-READ.']], hl:[[416,416]], onSave:r => saves.push(r)};
  return {saves, render() { cursor = 0; return sandbox.Code(props); }};
}
function templates(tree) { return tree?.strings ? [tree, ...tree.values.flatMap(v => Array.isArray(v) ? v.flatMap(templates) : templates(v))] : []; }
function elements(tree) {
  return templates(tree).flatMap(t => {
    const raw = t.strings.map((s,i) => s + (i < t.values.length ? `§${i}§` : '')).join('');
    return [...raw.matchAll(/<([a-z][\w-]*)\b([^>]*)>/g)].map(m => {
      const attrs = {};
      for (const a of m[2].matchAll(/([\w-]+)=§(\d+)§/g)) attrs[a[1]] = t.values[+a[2]];
      for (const a of m[2].matchAll(/([\w-]+)="([^"]*)"/g)) attrs[a[1]] = a[2];
      return {tag:m[1], attrs, after:raw.slice(m.index + m[0].length)};
    });
  });
}
const body = tree => elements(tree).find(e => e.attrs.className?.split(' ').includes('code-b'));
const input = (tree,n) => elements(tree).find(e => e.tag === 'input' && e.attrs['aria-label'] === 'Line ' + n);
const button = (tree,label) => elements(tree).find(e => e.tag === 'button' && e.after.split('</button>')[0].includes(label));
function clickCode(tree, line) {
  const area = body(tree);
  assert.equal(typeof area.attrs.onClick, 'function', 'Clicking the code must enter edit mode');
  area.attrs.onClick({target:{closest:() => line ? {dataset:{line:String(line)}} : null}});
}
const editor = harness(); let tree = editor.render();
clickCode(tree, 415); tree = editor.render();
assert.equal(input(tree,415).attrs.autoFocus, true, 'Focus the clicked code line');
assert.equal(input(tree,415).attrs.value, 'READ ACCOUNT');
input(tree,415).attrs.onInput({target:{value:'READ VERIFIED-ACCOUNT'}}); tree = editor.render();
assert(!body(tree).attrs.onClick, 'Clicks during editing must not reset the draft');
button(tree,'Save change').attrs.onClick(); tree = editor.render();
assert.equal(editor.saves[0].count, 1);
clickCode(tree,415); tree = editor.render();
assert.equal(input(tree,415).attrs.value, 'READ VERIFIED-ACCOUNT', 'Reopening must preserve the saved edit');
input(tree,415).attrs.onInput({target:{value:'UNSAVED'}}); tree = editor.render();
button(tree,'Cancel').attrs.onClick(); tree = editor.render();
clickCode(tree,415); tree = editor.render();
assert.equal(input(tree,415).attrs.value, 'READ VERIFIED-ACCOUNT', 'Cancel must restore saved code');
const keyboard = harness(); tree = keyboard.render(); let prevented = false;
assert.equal(body(tree).attrs.tabIndex, 0);
body(tree).attrs.onKeyDown({key:'Enter',preventDefault(){prevented = true;}});
assert(prevented); tree = keyboard.render();
assert.equal(input(tree,416).attrs.autoFocus, true, 'Keyboard entry should focus a highlighted line');
const reader = harness(false); tree = reader.render();
assert(!body(tree).attrs.onClick, 'Read-only code must remain read-only');
assert(!input(tree,415));
console.log('Passed: click-to-edit, clicked-line focus, saved edits, cancellation, keyboard access, and read-only code.');

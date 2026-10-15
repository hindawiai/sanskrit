const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
class Element {
  constructor(id='') { this.id=id; this.tagName=id; this.listeners={}; this.children=[]; this.dataset={}; this.value=''; this.textContent=''; }
  addEventListener(name, fn) { this.listeners[name]=fn; }
  setAttribute(k,v) { this[k]=v; }
  appendChild(c) { this.children.push(c); }
  replaceChildren() { this.children=[]; }
  click() { this.listeners.click?.(); }
}
const ids=['logo-source','logo-output','logo-canvas','logo-run','logo-clear','logo-square','logo-star'];
const elements=Object.fromEntries(ids.map(id=>[id,new Element(id)]));
elements['logo-source'].value='REPEAT 4 [ FORWARD 100 RIGHT 90 ]';
const document={
  getElementById:id=>elements[id],
  createElementNS:(_ns,tag)=>new Element(tag)
};
vm.runInNewContext(fs.readFileSync('docs/shaili-robot.js','utf8'), {document, console, Math, Number, String, Error});
elements['logo-run'].click();
assert(elements['logo-output'].textContent.startsWith('Completed successfully.'), elements['logo-output'].textContent);
assert.equal(elements['logo-canvas'].children.filter(x=>x.tagName==='line').length,4);
elements['logo-source'].value='SETPENCOLOR RED FORWARD 10';
elements['logo-run'].click();
assert(elements['logo-output'].textContent.startsWith('Completed successfully.'), elements['logo-output'].textContent);
elements['logo-source'].value='REPEAT 2 [ FORWARD 20 RIGHT 90 ]';
elements['logo-run'].click();
assert(elements['logo-output'].textContent.startsWith('Completed successfully.'));
assert.equal(elements['logo-canvas'].children.filter(x=>x.tagName==='line').length,2);
elements['logo-source'].value='FORWARD nope';
elements['logo-run'].click();
assert(elements['logo-output'].textContent.startsWith('Program stopped:'));
elements['logo-source'].value='REPEAT 2 [ FORWARD 10';
elements['logo-run'].click();
assert(elements['logo-output'].textContent.includes('Missing closing ]'));
elements['logo-source'].value='SETHEADING 90 FORWARD 10';
elements['logo-run'].click();
assert(elements['logo-output'].textContent.startsWith('Completed successfully.'));
console.log('Shaili Robot static tests: PASS (square, nested parser, color, invalid argument, unmatched bracket, heading)');

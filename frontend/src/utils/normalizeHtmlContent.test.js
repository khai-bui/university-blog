import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeHtmlContent } from './normalizeHtmlContent.js';

test('normalizes escaped HTML so tags render as markup', () => {
  const input = 'Intro:&lt;div&gt;&lt;span style="font-family: inherit;"&gt;Hello&lt;/span&gt;&lt;/div&gt;';
  const output = normalizeHtmlContent(input);

  assert.equal(output, 'Intro:<div><span style="font-family: inherit;">Hello</span></div>');
});

test('keeps already valid HTML intact', () => {
  const input = 'Intro:<div><span style="font-family: inherit;">Hello</span></div>';
  const output = normalizeHtmlContent(input);

  assert.equal(output, input);
});

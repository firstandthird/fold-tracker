/* eslint-disable */
import GATrackFold from '../index';
import test from 'tape-rollup';

//ga stub
window._gaq = {
  data: [],
  clear: () => {
    window._gaq.data = [];
  },
  push: (arr) => {
    window._gaq.data.push(arr);
  }
};

test('tracks the pixel ratio', assert => {
  window._gaq.clear();

  GATrackFold.trackPixelRatio();

  const data = window._gaq.data;
  assert.equal(data.length, 1);
  assert.equal(data[0][0], '_trackEvent');
  assert.equal(data[0][1], 'Viewport');
  assert.equal(data[0][2], 'Pixel Ratio');
  assert.end();
});

test('tracks the viewport dimensions', assert => {
  window._gaq.clear();

  GATrackFold.trackViewportDimensions();

  const data = window._gaq.data;
  assert.equal(data.length, 3);
  assert.equal(data[0][0], '_trackEvent');
  assert.equal(data[0][1], 'Viewport');
  assert.equal(data[0][2], 'Width');
  assert.equal(data[1][0], '_trackEvent');
  assert.equal(data[1][1], 'Viewport');
  assert.equal(data[1][2], 'Height');
  assert.equal(data[2][0], '_trackEvent');
  assert.equal(data[2][1], 'Viewport');
  assert.equal(data[2][2], 'Size');
  assert.end();
});

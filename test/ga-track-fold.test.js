import GATrackFold from '../index';
import test from 'tape-rollup';

//ga stub
window._gaq = { // eslint-disable-line no-underscore-dangle
  data: [],
  clear: () => {
    window._gaq.data = []; // eslint-disable-line no-underscore-dangle
  },
  push: (arr) => {
    window._gaq.data.push(arr); // eslint-disable-line no-underscore-dangle
  }
};

test('tracks the pixel ratio', assert => {
  window._gaq.clear(); // eslint-disable-line no-underscore-dangle

  GATrackFold.trackPixelRatio();

  const data = window._gaq.data; // eslint-disable-line no-underscore-dangle
  assert.equal(data.length, 1);
  assert.equal(data[0][0], '_trackEvent');
  assert.equal(data[0][1], 'Viewport');
  assert.equal(data[0][2], 'Pixel Ratio');
});

test('tracks the viewport dimensions', assert => {
  window._gaq.clear(); // eslint-disable-line no-underscore-dangle

  GATrackFold.trackViewportDimensions();

  const data = window._gaq.data; // eslint-disable-line no-underscore-dangle
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
});

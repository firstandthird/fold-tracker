/* eslint-env browser */
import GATrack from 'ga-track';
import { ready } from 'domassist';
import Cookies from 'js-cookie';

const GATrackFold = {
  trackPixelRatio() {
    const pixelRatio = window.devicePixelRatio || 1;
    GATrack.sendEvent('Viewport', 'Pixel Ratio', pixelRatio);
  },

  trackViewportDimensions() {
    let viewWidth = window.innerWidth || 0;
    let viewHeight = window.innerHeight || 0;
    viewWidth = Math.ceil(viewWidth / 100) * 100;
    viewHeight = Math.ceil(viewHeight / 100) * 100;

    GATrack.sendEvent('Viewport', 'Width', viewWidth);
    GATrack.sendEvent('Viewport', 'Height', viewHeight);
    GATrack.sendEvent('Viewport', 'Size', `${viewWidth}x${viewHeight}!`);
  }
};

ready(() => {
  if (Cookies.get('gaTrackFold') === undefined) {
    GATrackFold.trackPixelRatio();
    GATrackFold.trackViewportDimensions();
    Cookies.set('gaTrackFold', 1);
  }
});

export default GATrackFold;

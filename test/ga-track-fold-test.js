//ga stub
window._gaq = {
  data: [],
  clear: function() {
    this.data = [];
  },
  push: function(arr) {
    this.data.push(arr);
  }
};

var gaData = [];
window.ga = function() {
  gaData = arguments;
};


suite('ga-track', function() {

  setup(function() {
    window._gaq.clear();
  });

  test('api exists', function() {
    assert.equal(typeof $.gaTrackFold, 'function');
  });

  test('it pushes the correct values to gaTrack', function() {
    // Setup
    window._gaq.clear();

    // Perform
    $.gaTrackFold();
    
    // Test
    var data = window._gaq.data;
    assert.equal(data.length, 4);
    
    assert.equal(data[0][0], '_trackEvent');
    assert.equal(data[0][1], 'Viewport');
    assert.equal(data[0][2], 'Pixel Ratio');

    assert.equal(data[1][0], '_trackEvent');
    assert.equal(data[1][1], 'Viewport');
    assert.equal(data[1][2], 'Width');

    assert.equal(data[2][0], '_trackEvent');
    assert.equal(data[2][1], 'Viewport');
    assert.equal(data[2][2], 'Height');

    assert.equal(data[3][0], '_trackEvent');
    assert.equal(data[3][1], 'Viewport');
    assert.equal(data[3][2], 'Size');
  });

  test('it sets the proper cookie',function() {
    assert.equal(typeof monster, 'object');
    assert.equal(typeof monster.get, 'function');
    
    assert.equal(monster.get('gaTrackCookie'), 1);
  });

});
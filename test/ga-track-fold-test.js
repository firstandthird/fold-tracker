//ga stub
window._gaq = {
  data: null,
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

});
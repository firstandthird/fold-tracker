module.exports = function(grunt) {

  require('load-grunt-config')(grunt, {
    config: {
      info: grunt.file.readJSON('bower.json'),
      name: 'ga-track-fold'
    }
  });

};
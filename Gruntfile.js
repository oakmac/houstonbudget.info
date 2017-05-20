module.exports = function(grunt) {
  'use strict'

  grunt.initConfig({
    less: {
      options: {
        compress: true
      },

      watch: {
        files: {
          'public/css/main.min.css': 'less/000-main.less'
        }
      }
    },

    watch: {
      options: {
        atBegin: true
      },

      less: {
        files: 'less/*.less',
        tasks: 'less:watch'
      }
    }
  })

  // load tasks from npm
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', 'watch');
}

module.exports = function(grunt) {
  'use strict'

  grunt.initConfig({
    concat: {
      js: {
        src: ['src-js/*.js'],
        dest: 'public/js/app.js'
      }
    },

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
      },

      js: {
        files: 'src-js/*.js',
        tasks: 'concat:js'
      }
    }
  })

  // load tasks from npm
  grunt.loadNpmTasks('grunt-contrib-less')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-concat')

  grunt.registerTask('default', 'watch')
}

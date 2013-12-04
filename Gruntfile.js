/*global module:false*/
module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),
		// Task configuration.
		uglify: {
			coverflow: {
				options: {
					enclose: { 
						'window,document': 'window,document'
					}
				},
				files: {
					'coverflow.js': [
						'src/main.js',
						'src/*.js'
					]
				}
			}
		},
		sass: {
			all: {
				files: {
					'coverflow.css': 'scss/coverflow.scss'
				}
			}
		},
		watch: {
			css: {
				files: 'scss/**/*.scss',
				tasks: ['sass']
			},
			coverflow: {
				files: ['src/**/*.js'],
				tasks: ['uglify:coverflow']
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Default task.
	grunt.registerTask('default', ['uglify', 'sass']);
};

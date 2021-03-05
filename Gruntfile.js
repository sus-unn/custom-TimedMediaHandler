/* eslint-env node, es6 */
module.exports = function ( grunt ) {
	var conf = grunt.file.readJSON( 'extension.json' );

	grunt.loadNpmTasks( 'grunt-banana-checker' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-eslint' );
	grunt.loadNpmTasks( 'grunt-exec' );
	grunt.loadNpmTasks( 'grunt-patcher' );
	grunt.loadNpmTasks( 'grunt-stylelint' );

	grunt.initConfig( {
		eslint: {
			options: {
				cache: true
			},
			all: [
				'**/*.{js,json}',
				'!resources/mw-info-button/**',
				// Third party resources
				'!resources/mwembed/**',
				'!resources/videojs*/**',
				'!node_modules/**',
				'!vendor/**'
			]
		},
		stylelint: {
			options: {
				syntax: 'less'
			},
			all: [
				'**/*.{css,less}',
				'!resources/mw-info-button/**',
				// Third party resources
				'!resources/mwembed/**',
				'!resources/videojs*/**',
				'!node_modules/**',
				'!vendor/**'
			]
		},
		banana: {
			options: {
				requireLowerCase: false
			},
			all: conf.MessagesDirs.TimedMediaHandler
		},
		exec: {
			'npm-update-videojs': {
				cmd: 'npm update ogv video.js videojs-resolution-switcher-v6',
				callback: function ( error, stdout, stderr ) {
					grunt.log.write( stdout );
					if ( stderr ) {
						grunt.log.write( 'Error: ' + stderr );
					}

					if ( error !== null ) {
						grunt.log.error( 'update error: ' + error );
					}
				}
			}
		},
		copy: {
			'ogv.js': {
				expand: true,
				cwd: 'node_modules/ogv/dist/',
				src: [
					'**'
				],
				dest: 'resources/mwembed/lib/binPlayers/ogv.js/'
			},
			'video.js': {
				expand: true,
				cwd: 'node_modules/video.js/dist/',
				src: [
					'**',
					'!video.js',
					'!alt/video.core.js',
					'!alt/*.css',
					'!alt/*.novtt.js',
					'!alt/*.novtt.min.js',
					'!examples/**',
					'!*.zip',
					'!*.swf',
					'!*.min.js',
					'!**/*.min.css',
					'!**/*.js.map',
					'!**/*.cjs.js',
					'!**/*.es.js',
					'!ie8/**'
				],
				dest: 'resources/videojs/'
			}
		}
	} );

	grunt.registerTask( 'update-videojs', [
		'exec:npm-update-videojs',
		'copy:video.js'
	] );
	grunt.registerTask( 'update-ogvjs', [ 'exec:npm-update-videojs', 'copy:ogv.js' ] );
	grunt.registerTask( 'test', [ 'eslint', 'stylelint', 'banana' ] );
	grunt.registerTask( 'default', 'test' );
};

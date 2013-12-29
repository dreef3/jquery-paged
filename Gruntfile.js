module.exports = function(grunt) {

	grunt.initConfig({

		// Import package manifest
		pkg: grunt.file.readJSON("paged.jquery.json"),

		// Banner definitions
		meta: {
			banner: "/*\n" +
				" *  <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n" +
				" *  <%= pkg.description %>\n" +
				" *  <%= pkg.homepage %>\n" +
				" *\n" +
				" *  Made by <%= pkg.author.name %>\n" +
				" *  Under <%= pkg.licenses[0].type %> License\n" +
				" */\n"
		},

		// Concat definitions
		concat: {
			dist: {
				src: ["src/jquery.paged.js"],
				dest: "dist/jquery.paged.js"
			},
			options: {
				banner: "<%= meta.banner %>"
			}
		},

		// Lint definitions
		jshint: {
			files: ["src/jquery.paged.js"],
			options: {
				jshintrc: ".jshintrc"
			}
		},

		// Minify definitions
		uglify: {
			my_target: {
				src: ["dist/jquery.paged.js"],
				dest: "dist/jquery.paged.min.js"
			},
			options: {
				banner: "<%= meta.banner %>"
			}
		},

        watch: {
            options: {
                livereload: true
            },
            files: ['src/**/*'],
            tasks: ['default']
        },

        qunit: {
            all: {
                 options: {
                          urls: [
                                'http://localhost:8000/test/local.html'
                          ]
                 }
            }
        },

        connect: {
            server: {
                options: {
                    port: 8000,
                    base: './src/'
                }
            }
        }

	});

	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask("default", ["concat", "uglify"]);
	grunt.registerTask("travis", ["jshint"]);
    grunt.registerTask("test", ["connect"]);

};

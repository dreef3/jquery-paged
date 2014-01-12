module.exports = function(grunt) {

	grunt.initConfig({

		// Import package manifest
		pkg: grunt.file.readJSON("pagination.jquery.json"),

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

		// Lint definitions
		jshint: {
			files: ["src/**/*.js"],
			options: {
				jshintrc: ".jshintrc"
			}
		},

		// Minify definitions
		uglify: {
			minimized: {
                files: {
                    'dist/js/pagination.min.js': 'src/js/pagination.js',
                    'dist/js/pagination.list.min.js': 'src/js/pagination.list.js',
                    'dist/js/pagination.slider.min.js': 'src/js/pagination.slider.js'
                }
			},
			options: {
				banner: "<%= meta.banner %>"
			}
		},

        less: {
            production: {
                options: {
                    cleancss: true
                },
                files: [{
                    expand: true,
                    cwd: "src/less",
                    src: "*.less",
                    dest: "dist/css/",
                    ext: ".css"
                }]
            }
        },

        watch: {
            options: {
                livereload: true
            },
            files: ["src/**/*"],
            tasks: ["default"]
        }
	});

	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-less");

	grunt.registerTask("default", ["uglify", "less"]);
	grunt.registerTask("travis", ["jshint"]);

};

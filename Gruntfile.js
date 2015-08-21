module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        typescript: {
            build: {
                src: ['src/main/ts/**/*.ts', 'src/main/d.ts/**/*.d.ts'],
                dest: 'build/out.js',
                options: {
                    module: 'amd', //or commonjs
                    target: 'es5', //or es3
                    rootDir: 'src/main/ts',
                    sourceMap: true,
                    declaration: true
                }
            }
        },
        clean: {
            all: ["build", "dist", "dist.zip"],
            dist: ["dist"]
        },
        uglify: {
            options: {
                mangle: false,
                compress: false
            },
            dist: {
                files: {
                    'dist/out.min.js': ['build/out.js']
                }
            }
        },
        htmlmin: {                                     
            options: {
                removeComments: true,
                collapseWhitespace: true,
                minifyJS: true,
                removeAttributeQuotes: true
            },
            dist: {
                files: {                               
                    'dist/index.html': 'index.html'
                }
            }
        },
        cssmin: {
            options: {
            },
            dist: {
                files: {
                    'dist/app.css': ['app.css']
                }
            }
        },
        copy: {
            dist: {
                files: [
                    { expand: true, src: ['lib/*.min.js'], dest: 'dist/' },
                    { expand: true, src: ['res/**/*'], dest: 'dist/' }
                ]
            }
        },
        replace: {
            dist: {
                src: ['dist/*.html'],
                overwrite: true,                 // overwrite matched source files
                replacements: [{
                    from: /build\/out/g,
                    to: "out"
                }, {
                    from: /.js/g,
                    to: ".min.js"
                }]
            }
        },
        zip: {
            dist: {
                router: function (filepath) {
                    // Route each file to all/{{filename}}
                    var s = 'dist/';
                    var index = filepath.indexOf(s);
                    var result;
                    if (index == 0) {
                        result = filepath.substring(s.length + index);
                    } else {
                        result = filepath;
                    }
                    return result;
                },
                src: ['dist/**'],
                dest: 'dist.zip',
                compression: 'DEFLATE'
            }
        }
    });

    // clean
    grunt.loadNpmTasks('grunt-contrib-clean');
    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    // load the plugin that provides the htmlmin task
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    // load the plugin that provides the cssmin task
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    // Load the plugin that provides the "TS" task.
    grunt.loadNpmTasks('grunt-typescript');
    // zip
    grunt.loadNpmTasks('grunt-zip');
    // copy
    grunt.loadNpmTasks('grunt-contrib-copy');
    // replace text in file
    grunt.loadNpmTasks('grunt-text-replace');

    // Default task(s).
    grunt.registerTask('reset', ['clean:all']);
    grunt.registerTask('dist_', ['typescript', 'uglify', 'htmlmin', 'cssmin', 'copy', 'replace', 'zip']);
    grunt.registerTask('dist', ['dist_', 'clean:dist']);
    grunt.registerTask('default', ['typescript']);

};
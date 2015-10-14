module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ts: {
            build: {
                src: ['src/main/ts/**/*.ts', 'src/main/d.ts/**/*.d.ts'],
                out: 'build/out.js',
                reference: 'reference.ts',
                options: {
                    module: 'amd', //or commonjs
                    target: 'es5', //or es3
                    basePath: 'src/main/ts',
                    sourceMap: true,
                    declaration: false
                }
            }
        },
        clean: {
            all: ["build", "dist", "dist.zip"],
            dist: ["dist"],
            js: ["dist/*.js"]
        },
        uglify: {
            options: {
                mangle: true,
                compress: true,
                drop_console: true
            },
            dist: {
                files: {
                    //'dist/out.min.js': ['build/out.js'],
                    'dist/lib/analytics.min.js': ['lib/analytics.js']
                }
            }
        },
        'closure-compiler': {
            dist: {
                closurePath: 'libbuild/closure-compiler',
                js: 'build/out.js',
                jsOutputFile: 'dist/out.min.js',
                maxBuffer: 500,
                reportFile: 'closure.txt',
                options: {
                    compilation_level: 'ADVANCED_OPTIMIZATIONS',
                    language_in: 'ECMASCRIPT5'
                }
            }
        },
        inline: {
            js: {
                src: 'dist/index.html',
                dest: 'dist/index.html'
            }
        },
        htmlmin: {                                     
            options: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                minifyCSS: true
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
                    { expand: true, src: ['lib/*.min.js'], dest: 'dist/' }
                    //{ expand: true, src: ['res/**/*'], dest: 'dist/' }
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
            },
            js13k: {
                src: ['dist/*.html'],
                overwrite: true,
                replacements: [{
                    from: "</canvas></body></html>",
                    to: ""
                }, {
                    from: "</head>",
                    to: ""
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
            },
            js13k: {
                cwd: 'dist/',
                src: ['dist/*', 'dist/lib/**'],
                dest: 'js13k.zip',
                compression: 'DEFLATE'
            }

        }
    });

    // clean
    grunt.loadNpmTasks('grunt-contrib-clean');
    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    // load the plugin that provides the closure compiler
    grunt.loadNpmTasks('grunt-closure-compiler');
    // load the plugin that provides the htmlmin task
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    // load the plugin that provides the cssmin task
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    // Load the plugin that provides the "TS" task.
    grunt.loadNpmTasks('grunt-ts');
    // zip
    grunt.loadNpmTasks('grunt-zip');
    // copy
    grunt.loadNpmTasks('grunt-contrib-copy');
    // replace text in file
    grunt.loadNpmTasks('grunt-text-replace');
    // inline js 
    grunt.loadNpmTasks('grunt-inline');

    // Default task(s).
    grunt.registerTask('reset', ['clean:all']);
    grunt.registerTask('prod', ['ts', 'closure-compiler', 'htmlmin', 'copy', 'replace:dist',  'replace:js13k', 'uglify', 'inline']);
    grunt.registerTask('dist', ['prod', 'clean:js', 'zip:dist', 'clean:dist']);
    grunt.registerTask('js13k', ['prod', 'replace:js13k', 'clean:js', 'zip:js13k', 'clean:dist']);
    grunt.registerTask('default', ['ts']);

};
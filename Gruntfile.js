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
                    'dist/out.min.js': ['build/out.js'],
                    'dist/lib/analytics.min.js': ['lib/analytics.js']
                }
            }
        },
        copy: {
            dist: {
                files: [
                    { expand: true, src: ['lib/*.min.js'], dest: 'dist/' },
                    { expand: true, src: ['res/**/*'], dest: 'dist/' },
                    { expand: true, src: ['*.css'], dest: 'dist/' },
                    { expand: true, src: ['*.html'], dest: 'dist/' }
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
    grunt.registerTask('dist', ['typescript', 'uglify', 'copy', 'replace', 'zip', 'clean:dist']);
    grunt.registerTask('default', ['typescript']);

};
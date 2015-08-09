module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-handlebars');

    grunt.initConfig({
        bower: {
            install: {
                options: {
                    targetDir: 'public/vendor',
                    install: true,
                    cleanTargetDir: true,
                    layout: 'byComponent',
                    verbose: true
                }
            }
        },

        handlebars: {
            compile: {
                files: {
                    "public/js/templates.js" : ["templates/*.hbs"]
                }
            }
        }
    });

    grunt.registerTask('default', ['bower:install', 'handlebars']);
};
// Grunt tasks

module.exports = function(grunt)
{
    "use strict";

    // require('./Gruntfile_custom_tasks.js')(grunt);
    require('time-grunt')(grunt);

    require('load-grunt-config')(grunt);
    require('load-grunt-tasks')(grunt);

    // Making grunt default to force in order not to break the project if something fail.
    grunt.option('force', true);
};

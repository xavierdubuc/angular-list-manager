module.exports = {
    options: {
        report: 'min'
    },
    base: {
        src: ['dist/<%= pkg.name %>.js'],
        dest: 'dist/<%= pkg.name %>.min.js'
    }
};

module.exports = {
    base: {
        src: [
            'src/*.module.js',
            'src/controllers/*.js',
            'src/directives/*.js',
            'src/services/*.js'
        ],
        dest: 'dist/<%= pkg.name %>.js'
    }
};

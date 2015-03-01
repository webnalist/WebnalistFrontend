'use strict';
var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    header = require('gulp-header'),
    pkg = require('./package.json');

var paths = {
    src: 'src'
};

gulp.task('js:webnalist-frontend', function () {
    var scripts = [
            paths.src + '/plugins/closest.legacy.js',
            paths.src + '/plugins/ajax.js',
            paths.src + '/webnalist.js'
        ],
        banner = ['/*',
            '<%= pkg.homepage %>',
            'v<%= pkg.version %>',
            '<%= pkg.license %>',
            '*/\n'
        ].join(' | ');

    gulp
        .src(scripts)
        .pipe(concat('webnalist.js'))
        .pipe(header(banner, {pkg: pkg}))
        .pipe(gulp.dest(''));

    var stream = gulp
        .src('webnalist.js')
        .pipe(concat('webnalist.min.js'))
        .pipe(uglify({
            mangle: true
        }))
        .pipe(header(banner, {pkg: pkg}));

    return stream.pipe(gulp.dest(''));
});


gulp.task('default', [], function () {
    gulp.start(
        'js:webnalist-frontend'
    );
});

gulp.task('watch', function () {
    gulp.watch(paths.src + '/*').on('change', function () {
        gulp.start('js:webnalist-frontend');
    });
});

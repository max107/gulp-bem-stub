var gulp = require('gulp');
var bem = require('gulp-bem');
var bh = require('gulp-bh');
var concat = require('gulp-concat');
var del = require('del');
var debug = require('gulp-bem-debug');
var argv = require('yargs').alias('d', 'debug').boolean('d').argv;
var buildBranch = require('buildbranch');

var deps;
var levels = [
    'libs/base',
    'libs/bootstrap/levels/normalize',
    'libs/bootstrap/levels/print',
    'libs/bootstrap/levels/glyphicons',
    'libs/bootstrap/levels/scaffolding',
    'libs/bootstrap/levels/core',
    'blocks',
    'pages/index'
];

gulp.task('deps', function (done) {
    var tree = bem(levels);

    deps = tree.deps('pages/index/page');

    if (argv.debug) { deps.pipe(debug()); }

    done();
});

gulp.task('css', ['deps'], function () {
    return deps
        .pipe(bem.src('{bem}.css'))
        .pipe(concat('index.css'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('html', ['deps'], function () {
    delete require.cache[require.resolve('./pages/index/page/page.bemjson.js')];
    return deps
        .pipe(bem.src('{bem}.bh.js'))
        .pipe(bh(require('./pages/index/page/page.bemjson.js'), 'index.html'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('build', ['clean'], function () {
    gulp.start(['html', 'css']);
});

gulp.task('clean', function () {
    del(['./dist']);
});

gulp.task('watch', ['build'], function() {
    return gulp.watch([
        '{blocks,pages}/**/*.css',
        '{blocks,pages}/**/*.deps.js',
        '{blocks,pages}/**/*.bh.js',
        '{blocks,pages}/**/*.bemjson.js'
    ], ['build']);
});

gulp.task('gh', ['build'], function(done) {
    buildBranch({ folder: 'dist', ignore: ['libs'] }, done);
});

gulp.task('default', ['watch']);

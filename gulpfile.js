var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    complexity = require('gulp-complexity'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    replace = require('gulp-replace'),
    karma = require('gulp-karma'),
    concat = require('gulp-concat'),
    fs = require('fs'),
    source = 'jasmine-scope-check.js',
    sourceMin = 'jasmine-scope-check.min.js',
    dependencies = [
      'node_modules/deep-diff/index.js',
      'node_modules/lodash/lodash.js'
    ],
    specs = 'test/spec/*.spec.js',
    karmaConf = 'test/karma.conf',
    distDir = 'dist/';

gulp.task('lint', function () {
  return gulp.src([source, specs])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('gpa', function () {
  return gulp.src([source, specs])
    .pipe(complexity({
      cyclomatic: [8],
      halstead: [20],
      maintainability: [100]
    }));
});

gulp.task('test', function () {
  return gulp.src(dependencies.concat([source, specs]))
    .pipe(karma({
      configFile: karmaConf + '.js'
    }));
});

gulp.task('min', function () {
  return gulp.src(dependencies.concat([source]))
    .pipe(concat(sourceMin))
    .pipe(uglify({
      outSourceMap: true
    }))
    .pipe(gulp.dest(distDir));
});

gulp.task('build', function () {
  return gulp.src(dependencies.concat([source]))
    .pipe(concat(source))
    .pipe(gulp.dest(distDir));
});


gulp.task('test-min', ['min'], function () {
  return gulp.src(dependencies.concat([distDir + sourceMin, specs]))
    .pipe(karma({
      configFile: karmaConf + '.js',
      reporters: ['dots']
    }));
});

gulp.task('default', ['lint', 'gpa', 'test', 'test-min', 'build']);

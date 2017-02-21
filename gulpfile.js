var gulp = require("gulp");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var clean = require("gulp-clean");

/**
 * Remove dist directory
 */
gulp.task("clean", function () {
  return gulp.src("dist", {read: false}).pipe(clean());
});

/**
 * Build non minified version
 */
gulp.task("main", ["clean"], function () {
  return gulp.src("src/**/*")
    .pipe(gulp.dest("dist/"));
});

/**
 * Build minified version
 */
gulp.task("uglify", ["main"], function () {
  return gulp.src("dist/**/*.js")
    .pipe(uglify({preserveComments: "some"}))
    .pipe(rename({extname: ".min.js"}))
    .pipe(gulp.dest("dist/"));
});

/**
 * Full process to create distributable package
 */
gulp.task("default", ["uglify"]);
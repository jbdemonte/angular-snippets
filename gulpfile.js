var gulp = require("gulp"),
  uglify = require("gulp-uglify"),
  rename = require("gulp-rename");

/**
 * Build non minified version
 */
gulp.task("main", function() {
  return gulp.src("src/**/*")
    .pipe(gulp.dest("dist/"));
});

/**
 * Build minified version
 */
gulp.task("uglify", ["main"], function() {
  return gulp.src("dist/**/*.js")
    .pipe(uglify({preserveComments: "some"}))
    .pipe(rename({extname: ".min.js"}))
    .pipe(gulp.dest("dist/"));
});

/**
 * Full process to create distributable package
 */
gulp.task("default", ["uglify"]);
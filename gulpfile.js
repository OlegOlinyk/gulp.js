"use strict";

const gulp = require('gulp');
const concatCss = require('gulp-concat-css');//Соединение стилей
const cleanCSS = require('gulp-clean-css');//Минификацыя стилей
const rename = require("gulp-rename");//Переименованиие файлов
const notify = require("gulp-notify");//Вывод ошибок или успешной роботы
const livereload = require('gulp-livereload');//Презагрузка в реальном времени
const connect = require('gulp-connect');//Соединение с локальным сервером
const sass = require('gulp-sass');//Конвертацыя sass
const autoprefixer = require('gulp-autoprefixer');//Автоматически устанавливает префиксы
const uncss = require('gulp-uncss');//Удаление ненужных файлов
const rev = require('gulp-rev');//Создфет новые файлы кеша
const revCollector = require('gulp-rev-collector');//Переписывает пути к новым файлам кеша
const gutil           = require('gulp-util');//Модуль для outdated
const rimraf          = require('rimraf');//Модуль для outdated
const revOutdated     = require('gulp-rev-outdated');//Удаляет старые файлы кеша
const path            = require('path');//Модуль для outdated
const through         = require('through2');//Модуль для outdated

// gulp.task('build', ['connect', 'watch', 'html', 'style', 'collector', 'clean',]);
gulp.task('default', ['connect', 'watch', 'html', 'style',]);
// conect server
gulp.task('connect', function() {
    connect.server({
        root: 'build',//Папка за которой следит релоад
        livereload: true
    });
});


// style
gulp.task('style', function() {
    return gulp.src('src/style/*.scss')//Путь к стилям
        .pipe(sass().on('error', sass.logError))//sass
        // .pipe(uncss({
        //     html: ['src/**/*.html']
        // }))//Удаляет  не нужные стили
        .pipe(concatCss('bundle.css'))//Название готового файла
        .pipe(autoprefixer())//Автопрефиксер
        .pipe(cleanCSS(''))//Минификацыя
        .pipe(rename("bundle.min.css"))//Переименование файла
        .pipe(rev())//создает новые файлы с кешом
        .pipe(gulp.dest('build/style'))//Путь куда положить готовый файл
        .pipe(rev.manifest())//Сохраняет пути к новым файлам кеша
        .pipe(gulp.dest('src/manifest'))//Путь для файла манифеста
        .pipe(connect.reload())//Релоад
        .pipe(notify("Hello Gulp!"))//Сообщение об успешной роботе
});
//collector
gulp.task('collector',  function () {
    return gulp.src(['src/manifest/*.json', 'build/**/*.html'])
        .pipe( revCollector({
            replaceReved: true,
        }) )
        .pipe( gulp.dest('build') );
});
//outdated
function cleaner() {
    return through.obj(function(file, enc, cb){
        rimraf( path.resolve( (file.cwd || process.cwd()), file.path), function (err) {
            if (err) {
                this.emit('error', new gutil.PluginError('Cleanup old files', err));
            }
            this.push(file);
            cb();
        }.bind(this));
    });
}

gulp.task('clean', ['collector'],  function() {
    gulp.src( ['build/**/*.*'], {read: false})//Путь к директории с файлами для чистки
        .pipe( revOutdated(1) ) // leave 1 latest asset file for every file name prefix.
        .pipe( cleaner() );

    return;
});


//html
gulp.task('html', function() {
    gulp.src('src/index.html')
        .pipe(gulp.dest('build'))
        .pipe(connect.reload());//Релоад
});

//watch
gulp.task('watch', function() {
    gulp.watch('src/style/*.scss', ['style'])
    gulp.watch('src/index.html', ['html'])
    gulp.watch('build/**/*.html', ['collector'])
    gulp.watch('build/style/**/*.css', ['clean'])
});

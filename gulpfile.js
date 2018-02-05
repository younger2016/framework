/**
 * @Author: Xiao Feng Wang  <xf>
 * @Date:   2017-07-19T09:20:29+08:00
 * @Email:  wangxiaofeng@hualala.com
 * @Filename: gulpfile.js
 * @Last modified by:   xf
 * @Last modified time: 2017-07-19T15:14:39+08:00
 * @Copyright: Copyright(c) 2017-present Hualala Co.,Ltd.
 */

const gulp = require('gulp')
const fs = require('fs')
const Rename = require('gulp-rename')
const util = require('gulp-util')
const watch = require('gulp-watch')
const Path = require('path')
const gulpif = require('gulp-if')
const Stream = require('stream')
const del = require('del')
const jeditor = require('gulp-json-editor')
const exec = require('child_process')
const Shell = require('gulp-shell')

/**
* Helper Functions & Variables
*/
const stateColor = util.colors.gray
const fileColor = util.colors.underline
const log = (msg) => {
  util.log(`[BuildResource]: ${msg}`)
}


class BuildResource extends Object {

  constructor(option) {
    super(option)
    const combineOpt = option; //Object.assign({}, ...option)
    log(`${stateColor('params:', JSON.stringify(combineOpt, null, 4))}`)

    const defaultOption = {
      // the source directory
      srcDir: './',
      // the destination directory; if null, will use 'srcDir' instead
      dstDir: null,
      // will find the file with this extension
      ext: '.*',
      // if not null, will replace the matched files with this extension
      newExt: null,
      // if true, read all files in the sub-directories
      withSubDirs: true,
      // will find the files with this matched prefix and remove it
      trmPrefix: '',
      // will find the files with this matched suffix and remove it
      trmSuffix: '',
      // add new prefix to matched files
      newPrefix: '',
      // add new suffix to matched files
      newSuffix: '',
      // enable live reload by running a node.js server
      isLiveReload: false,
    }

    const opt = Object.assign({}, defaultOption, combineOpt)
    opt.dstDir = opt.dstDir ? opt.dstDir : opt.srcDir
    opt.srcGlob = this.srcGlob(opt)
    opt.dstGlob = this.dstGlob(opt)

    this.props = opt
  }

  relativePath(path) {
    const relPath = Path.relative('./', path);
    return relPath.startsWith('./') ? relPath : `./${relPath}`;
  }

  globPattern(pathElems, nameElems, ext) {
    // extension for stupid js
    function isArray(obj) {
      return (Object.prototype.toString.call(obj) === '[object Array]');
    }
    const path = Path.format({
      dir: isArray(pathElems) ? Path.join(...pathElems) : Path.join(pathElems),
      name: isArray(nameElems) ? nameElems.join('') : nameElems,
      ext,
    });
    // Show the path as relative to current directory
    return this.relativePath(path);
  }

  srcGlob(opt) {
    const subDirs = (opt.withSubDirs) ? '/**' : '/';
    return this.globPattern([opt.srcDir, subDirs], [opt.trmPrefix, '*', opt.trmSuffix], opt.ext)
  }

  dstGlob(opt) {
    const subDirs = (opt.withSubDirs) ? '/**' : '/';
    const dstExt = (opt.newExt ? opt.newExt : opt.ext);
    return this.globPattern(
      [opt.dstDir, subDirs],
      [opt.newPrefix, '*', opt.newSuffix],
      dstExt
    );
  }

  bindFunctions(...func) {
    func.forEach((f) => {
      f.bind(this);
    });
  }

  renameResources() {
    return Rename((path) => {
      const renamed = this.targetPath(path.basename, path.extname);
      Object.assign(path, renamed);
    });
  }

  targetPath(basename, extname) {
    const props = this.props;
    const trimmedBasename = basename.slice(props.trmPrefix.length, -props.trmSuffix.length);
    return {
      basename: props.newPrefix + trimmedBasename + props.newSuffix,
      extname: (props.newExt ? props.newExt : extname),
    }
  }

  liveReloadStream() {
    // @see: https://www.npmjs.com/package/gulp-watch#options
    return watch(this.props.srcGlob, { ignoreInitial: false });
  }

  logRenameProcess() {
    const stream = new Stream.Transform({ objectMode: true });

    stream._transform = (file, unused, callback) => {
      const event = file.event;
      const oriPath = this.relativePath(file.history[0]);
      const dstPath = this.relativePath(file.history[1]);

      if (event === 'unlink') {
        log(`(delete) ${fileColor.gray(oriPath)} has been deleted; you should delete \
        ${fileColor.gray(dstPath)} by yourself manually, or run 'gulp clean-build.'`);
      } else {
        log(`(${event}) ${fileColor.yellow(oriPath)} => ${fileColor.green(dstPath)}`);
      }

      callback(null, file);
    }
    return stream;
  }

  handleFileIO() {
    return gulpif((file) => {
      return !(file.event === 'unlink');
    }, gulp.dest(this.props.dstDir));
  }

  /* public methods */

  // Start to find files matching the glob, and replace the filename for build.
  start() {
    const props = this.props;

    log(`build pattern: ${fileColor.magenta(props.srcGlob)} => ${fileColor.magenta(props.dstGlob)}`);

    if (!props.trmPrefix && !props.trmSuffix && !props.newPrefix && !props.newSuffix) {
      throw new Error(`No valid rename param: one of trmPrefix, trmSuffix, newPrefix, or newSuffix should be assigned.`);
    }

    const srcStream = props.isLiveReload ? this.liveReloadStream() : gulp.src(props.srcGlob);

    return (srcStream
      .pipe(this.renameResources())
      .pipe(this.logRenameProcess())
      .pipe(this.handleFileIO())
    );
  }

  // Clean the build files made by `start()`
  cleanBuild() {
    const props = this.props;
    return del(props.dstGlob).then((paths) => {
      const relativePaths = paths.map((path) => {
        return this.relativePath(path);
      })
      log(`clean pattern: ${fileColor.magenta(props.dstGlob)}`);
      log(`clean paths: ${JSON.stringify(relativePaths, null, 2)}`);
    });
  }
}

/**
  Sub Gulp Tasks
*/
/* Update Bundle Info */
function updateBundleInfo(config, json) {
  function liveReloadStream() {
    // @see: https://www.npmjs.com/package/gulp-watch#options
    return watch(config.src, {
      ignoreInitial: false,
    })
  }

  const srcStream = config.isLiveReload ? liveReloadStream() : gulp.src(config.src)

  return (
    srcStream
    .pipe(jeditor(json))
    .on('error', ((error) => {
      util.log(util.colors.red(`[Update build info]: An error occurs when read/write a json file.\
         It's probably caused by a wrong .json file format. Please check the file '${fileInfo.src}'.`
      ))
      util.log(util.colors.red(`[Update build info]: Error: ${error}`));
    }))
    .pipe(gulpif((file) => {
      const content = file.contents.toString('utf8')
      util.log(`[Update build info]: ${util.colors.yellow(content)}`)
      return config.rename
    }, Rename(config.rename)))
    .pipe(gulp.dest(config.dst))
  )
}

// Get .bundle_info.config.json

const bundleInfoConfig = (...opt) => {
  const defaultValue = {
    src: './bundle_info.config.json',
    rename: 'bundle_info.json',
    dst: './',
  }

  return Object.assign({}, defaultValue, ...opt)
}

const bundleInfoUpdater = (...json) => {
  function shellCmdReturn(cmd) {
    const results = exec.execSync(cmd).toString()
    return (results.endsWith('\n')) ? results.slice(0, -1) : results;
  }

  const defaultValue = {
    'buildNumber': shellCmdReturn('git rev-list --count HEAD'),
    'commit': shellCmdReturn('git rev-parse --short HEAD'),
    'branch': shellCmdReturn('git rev-parse --abbrev-ref HEAD'),
    'buildContamination': shellCmdReturn('git status --porcelain'),
  }

  return Object.assign({}, defaultValue, ...json)
}


// ## NPM start a node.js ##
gulp.task('npm-start', Shell.task([
  'npm start -- -- reset cache',
]))

gulp.task('update-build-info/staging', () => {
  updateBundleInfo(bundleInfoConfig({
    isLiveReload: true,
  }), bundleInfoUpdater({
    mode: 'PRODUCTION',
  }))
})

// update app's git info. it's used as the bundle info
gulp.task('update-build-info/staging:live', () => {
  updateBundleInfo(bundleInfoConfig({
    isLiveReload: true,
  }), bundleInfoUpdater({
    mode: 'PRODUCTION',
  }))
})

/**
  Build Resources
*/
function buildResources(...option) {
  const build = new BuildResource(...option)
  return build.start()
}

function cleanBuild(...option) {
  const build = new BuildResource(...option)
  return build.cleanBuild()
}

// 自动打包 *.staging.* 或 *.production.* 为 *_build_*
const buildConfig = {
  srcDir: 'app',
  newSuffix: '._build_',
}

const buildTypes = {
  production: Object.assign({}, buildConfig, {
    trmSuffix: '.production',
  }),
  staging: Object.assign({}, buildConfig, {
    trmSuffix: '.staging',
  }),
}

gulp.task('build-resources/production', () => {
  buildResources(buildTypes.production)
})

gulp.task('build-resources/staging', () => {
  buildResources(buildTypes.staging)
})

gulp.task('build-resources/staging:live', () => {
  buildResources(buildTypes.staging, { isLiveReload: true })
})

/**
  Public Gulp Tasks
  */
function prebuild(mode) {
  exec.execSync(`gulp clean-build`, { stdio: [0, 1, 2] })
  // exec.execSync(`gulp update-build-info/${mode}`, { stdio: [0, 1, 2] })
  exec.execSync(`gulp build-resources/${mode}`, { stdio: [0, 1, 2] })
}

gulp.task('clean-build', () => {
  cleanBuild(buildConfig)
})

gulp.task('publish-production', () => {
  prebuild('production')
  exec.execSync(`fastlane publish_to_pgyer_production`, { stdio: [0, 1, 2] })
})

gulp.task('publish-staging', () => {
  prebuild('staging')
  exec.execSync(`fastlane publish_to_pgyer_staging`, { stdio: [0, 1, 2] })
})


gulp.task('publish-development', () => {
  prebuild('staging')
  exec.execSync(`fastlane publish_to_pgyer_development`, { stdio: [0, 1, 2] })
})

gulp.task('staging', ['update-build-info/staging:live', 'build-resources/staging:live', 'npm-start'], () => {

})

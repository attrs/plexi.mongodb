var path = require('path');
var fs = require('fs');
var http = require('http');
var chalk = require('chalk');
var Download = require('download');
var progress = require('download-status');
var fse = require('fs-extra');
var os = require('os');

function geturl(version) {
  var arch = process.arch;
  var base = 'http://downloads.mongodb.org';
  var url, filename;
  
  switch( process.platform ) {
    case 'win32':
      switch( process.arch ) {
        case 'x64':
          arch = 'x86_64';
          break;
        case 'ia32':
          arch = 'i386';
          break;
        case 'x86':
          arch = 'i386';
          break;
      }
  
      filename = 'mongodb-win32-' + arch + '-2008plus-' + version + '.zip';
      url = base + '/win32/' + filename;
      break;
    case 'darwin':
      filename = 'mongodb-osx-x86_64-' + version + '.tgz';
      url = base + '/osx/' + filename;
      break;
    case 'linux':
      switch( process.arch ) {
        case 'x64':
          arch = 'x86_64';
          break;
        case 'ia32':
          arch = 'i686';
          break;
        case 'x86':
          arch = 'i686';
          break;
      }
  
      filename = 'mongodb-linux-' + arch + '-' + version + '.tgz';
      url = base + '/linux/' + filename;
      break;
    case 'sunos':
      filename = 'mongodb-sunos5-' + arch + '-' + version + '.tgz';
      url = base + '/sunos5/' + filename;
      break;
  }
  
  return url;
}


/*
 * Mongodb Install Automatically
 * 
 * options
 *   version: mongodb version (string/선택/기본값 3.0.15)
 *   url: binary download url (string/선택/version 과 함께 입력시 주어진 url 로 다운로드 사용)
 *   path: path to install binary (string/선택/기본값 ~/.plexi/mongodb/)
 * 
 * callback
 *   err: 에러
 *   info: 설치정보 (object)
 *     home: installed path (ex: ~/.mongolauncher/mongodb/mongodb-osx-x86_64-3.0.15)
 *     bin: bin directory path (ex: ~/.mongolauncher/mongodb/mongodb-osx-x86_64-3.0.15/bin/ )
 *   
 */
function ensureInstall(options, callback) {
  if( arguments.length === 1 && typeof options === 'function' ) callback = options;
  if( typeof callback !== 'function' ) throw new TypeError('illegal callback:' + callback);
  
  options = options || {};
  var version = options.version = options.version || '3.0.15';
  var dir = options.path = options.path || path.resolve(os.homedir(), '.mongolauncher', 'mongodb');
  var url = geturl(options.version);
  var filename = url.substring(url.lastIndexOf('/') + 1);
  var dest = path.resolve(dir, filename);
  
  fse.ensureDirSync(dir);
  
  if( !fs.existsSync(dest) ) {
    new Download({ extract: true, strip: 1, mode: '755' })
        .get(url)
        .dest(dest)
      .use(function(instance, url) {
        process.stdout.write(chalk.green('Download\n'));
      })
      .use(progress())
      .run(function (err, files, stream) {
        if( err ) return callback(err);
        callback(null, {
          home: dest,
          bin: path.resolve(dest, 'bin')
        });
      }
    );
  } else {
    callback(null, {
      dir: dest,
      version: version,
      bin: path.resolve(dest, 'bin')
    });
  }
}

module.exports = {  
  ensureInstall: ensureInstall
};

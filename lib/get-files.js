var Promise   = require('bluebird');
var glob      = require('glob');
var async     = require('async');
var _         = require('lodash');

module.exports = function(opts, cb) {

  opts = _.defaults(opts || {}, {
    globs: [],
    ignores: [],
    // not implemented yet
    includeMetaXML: false
  });

  return new Promise(function(resolve, reject) {

    var iterator = function(g, cb) {
      glob(g, {
        matchBase: true,
        nodir: true,
        noglobstar: false,
        nomount: true,
        ignore: opts.ignores
      }, cb);
    };

    // fixes #21 by removing meta-xml files. Probably not the long
    // term solution
    const globs = _(opts.globs)
      .map(g => g.replace(/\-meta\.xml$/i, ''))
      .uniq()
      .value();

    async.concat(globs, iterator, function(err, files) {
      if(err) return cb(err);

      if(!files || files.length < 1) {
        return reject(new Error('no files found'));
      }

      files = _(files)
        .uniq()
        // remove meta xml files
        .filter(function(f) {
          return (/\-meta\.xml$/.test(f) === false);
        })
        // remove base meta directories
        .filter(function(f) {
          return f.split('/').length > 2;
        })
        .value();

      resolve(files);
    });

  });
};

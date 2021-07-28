/*
 * Copyright (c) 2015-2021 Snowflake Computing Inc. All rights reserved.
 */

var fs = require('fs');
var path = require('path');
var shell = require('shelljs');
const expandTilde = require('expand-tilde');
const resultStatus = require('./file_util').resultStatus;

/**
 * Creates a local utility object.
 *
 * @returns {Object}
 * @constructor
 */
function local_util()
{
  this.createClient = function (stageInfo, useAccelerateEndpoint)
  {
    return null;
  }

  /**
  * Write file to upload.
  *
  * @param {Object} meta
  *
  * @returns {null}
  */
  this.uploadOneFileWithRetry = async function (meta)
  {
    await new Promise(function (resolve)
    {
      console.log("testPutDebug upload start");

      // Create stream object for reader and writer
      var reader = fs.createReadStream(meta['realSrcFilePath']);
      // Create directory if doesn't exist
      if (!fs.existsSync(meta['stageInfo']['location']))
      {
        shell.mkdir('-p', (meta['stageInfo']['location']));
        //fs.mkdirSync(meta['stageInfo']['location'], { recursive: true });
        console.log("testPutDebug create directory");
      }

      var output = path.join(meta['stageInfo']['location'], meta['dstFileName']);

      // expand '~' and '~user' expressions
      if (process.platform !== "win32")
      {
        output = expandTilde(output);
      }

      var writer = fs.createWriteStream(output);
      // Write file
      console.log("testPutDebug write start");
      var result = reader.pipe(writer);
      result.on('finish', function ()
      {
        console.log("testPutDebug write finish");
        resolve();
      });
    });

    meta['dstFileSize'] = meta['uploadSize'];
    meta['resultStatus'] = resultStatus.UPLOADED;

    console.log("testPutDebug upload end");
  }
}

exports.local_util = local_util;
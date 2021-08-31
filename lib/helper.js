"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _core = require("@babel/core");

class Helper {
  static fileFilter(filename) {
    return typeof filename === 'string' && filename.indexOf('node_modules') == -1;
  }

  static buildPreInject(path, filename, row, isAsync) {
    const temp = `
      const FILENAME = {
        fileName: '${filename}',
        row: ${row},
        isAsync: ${isAsync},
        time: Date.now()
      };
    `;
    const temp1 = `
      console.info({
        fileName: '${filename}',
        row: ${row},
        isAsync: ${isAsync},
        time: Date.now()
      });
    `;
    return (0, _core.template)(temp1)({
      FILENAME: path.scope.generateUidIdentifier('_sfdInfo')
    });
  }

}

exports.default = Helper;
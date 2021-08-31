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

  static buildPreInject(varName, filename, row, column, isAsync, funcName) {
    const temp = `
      const SDFINFO = {
        fileName: '${filename}',
        row: ${row},
        column: ${column},
        isAsync: ${isAsync},
        funcName: '${funcName}',
        time: Date.now()
      };
    `;
    return (0, _core.template)(temp)({
      SDFINFO: varName
    });
  }

  static buildPostInject(path, varName, runDuration) {
    const temp = `
      const ENDTIME = Date.now();
      if (ENDTIME - SDFINFO.time > ${runDuration}) {
        console.info('time: ' + String(ENDTIME - SDFINFO.time) + ' path: ' + SDFINFO.fileName + ':' + SDFINFO.row + ':' + SDFINFO.column + ' funcName: ' + SDFINFO.funcName);
      }
    `;
    return (0, _core.template)(temp)({
      SDFINFO: varName,
      ENDTIME: path.scope.generateUidIdentifierBasedOnNode(path.node, '_endTime')
    });
  }

}

exports.default = Helper;
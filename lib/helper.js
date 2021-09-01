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

  static buildPreInject(varName, path, state, funcName) {
    var _path$node$loc, _path$node$loc2;

    const temp = `
      const SDFINFO = {
        fileName: '${state.file.opts.filename}',
        row: ${(_path$node$loc = path.node.loc) === null || _path$node$loc === void 0 ? void 0 : _path$node$loc.start.line},
        column: ${(_path$node$loc2 = path.node.loc) === null || _path$node$loc2 === void 0 ? void 0 : _path$node$loc2.start.column},
        isAsync: ${path.node.async === true},
        isGenerator: ${path.node.generator === true},
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
        console.info('SFD: ' + String(ENDTIME - SDFINFO.time) + ' path: ' + SDFINFO.fileName + ':' + SDFINFO.row + ':' + SDFINFO.column + ' funcName: ' + SDFINFO.funcName + ' ayc: ' + SDFINFO.isAsync + ' genrt: ' + SDFINFO.isGenerator);
      }
    `;
    return (0, _core.template)(temp)({
      SDFINFO: varName,
      ENDTIME: path.scope.generateUidIdentifierBasedOnNode(path.node, '_endTime')
    });
  }

  static printTransformInfo(path, state, funcName) {
    var _path$node$loc3, _path$node$loc4;

    const filename = state.file.opts.filename;
    const row = (_path$node$loc3 = path.node.loc) === null || _path$node$loc3 === void 0 ? void 0 : _path$node$loc3.start.line;
    const column = (_path$node$loc4 = path.node.loc) === null || _path$node$loc4 === void 0 ? void 0 : _path$node$loc4.start.column;
    const isAsync = path.node.async === true;
    const isGenerator = path.node.generator === true;
    console.info(`SFDTransf: ${path.node.type}: ${filename}:${row}:${column} funcName: ${funcName} ayc: ${isAsync} genrt: ${isGenerator}`);
  }

}

exports.default = Helper;
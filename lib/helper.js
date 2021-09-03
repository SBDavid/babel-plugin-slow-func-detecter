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

  static buildPreInject(varName, path, state, basedir, funcName) {
    try {
      var _state$file$opts$file, _path$node$loc, _path$node$loc2;

      const temp = `
      const _sfd_collector = require('babel-plugin-transform-slow-func-detecter/lib/eventCollecter').default;
      const SDFINFO = {
        fileName: '${(_state$file$opts$file = state.file.opts.filename) === null || _state$file$opts$file === void 0 ? void 0 : _state$file$opts$file.replace(basedir + '/', '')}',
        row: ${(_path$node$loc = path.node.loc) === null || _path$node$loc === void 0 ? void 0 : _path$node$loc.start.line},
        column: ${(_path$node$loc2 = path.node.loc) === null || _path$node$loc2 === void 0 ? void 0 : _path$node$loc2.start.column},
        isAsync: ${path.node.async === true},
        isGenerator: ${path.node.generator === true},
        funcName: '${funcName}',
        time: Date.now(),
        startSeq: _sfd_collector.startSeq++
      };
    `;
      return (0, _core.template)(temp)({
        SDFINFO: varName
      });
    } catch (e) {
      console.error('buildPreInject error', Helper.getFilePath(path, state, basedir));
      console.error(e);
    }

    return [];
  }

  static buildPostInject(varName) {
    const temp = `
      // const _sfd_collector = require('babel-plugin-transform-slow-func-detecter/lib/eventCollecter').default;
      if (SDFINFO !== undefined) {
        _sfd_collector.receiveEvent({
          fileName: SDFINFO.fileName + ':' + SDFINFO.row + ':' + SDFINFO.column,
          row: SDFINFO.row,
          column: SDFINFO.column,
          isAsync: SDFINFO.isAsync,
          isGenerator: SDFINFO.isGenerator,
          funcName: SDFINFO.funcName,
          time: SDFINFO.time,
          endTime: Date.now(),
          startSeq: SDFINFO.startSeq,
          endSeq: _sfd_collector.endSeq++,
        });
      }
    `;
    return (0, _core.template)(temp)({
      SDFINFO: varName
    });
  }

  static printTransformInfo(path, state, opt, basedir, funcName) {
    if (opt.printTransformInfo === true) {
      var _path$node$loc3, _path$node$loc4;

      const filename = state.file.opts.filename;
      const row = (_path$node$loc3 = path.node.loc) === null || _path$node$loc3 === void 0 ? void 0 : _path$node$loc3.start.line;
      const column = (_path$node$loc4 = path.node.loc) === null || _path$node$loc4 === void 0 ? void 0 : _path$node$loc4.start.column;
      const isAsync = path.node.async === true;
      const isGenerator = path.node.generator === true;
      console.info(`${path.node.type}: ${filename === null || filename === void 0 ? void 0 : filename.replace(basedir + '/', "")}:${row}:${column} funcName: ${funcName} ayc: ${isAsync} genrt: ${isGenerator}`);
    }
  }

  static getFilePath(path, state, basedir) {
    var _state$file$opts$file2, _path$node$loc5, _path$node$loc6;

    return `${(_state$file$opts$file2 = state.file.opts.filename) === null || _state$file$opts$file2 === void 0 ? void 0 : _state$file$opts$file2.replace(basedir + '/', '')}:${(_path$node$loc5 = path.node.loc) === null || _path$node$loc5 === void 0 ? void 0 : _path$node$loc5.start.line}:${(_path$node$loc6 = path.node.loc) === null || _path$node$loc6 === void 0 ? void 0 : _path$node$loc6.start.column}`;
  }

}

exports.default = Helper;
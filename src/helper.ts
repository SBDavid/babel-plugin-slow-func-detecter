import type { NodePath, PluginPass } from '@babel/core';

import type { Function, Statement, Identifier } from "@babel/types";
import { template } from "@babel/core";

export default class Helper {
  static fileFilter(filename: string | null | undefined) {
    return  typeof filename === 'string' && filename.indexOf('node_modules') == -1;
  }

  static buildPreInject(varName: Identifier, path: NodePath<Function>, state: PluginPass, basedir: String, funcName?: String): Statement{

    const temp = `
      const SDFINFO = {
        fileName: '${state.file.opts.filename?.replace(basedir+'/', '')}',
        row: ${path.node.loc?.start.line},
        column: ${path.node.loc?.start.column},
        isAsync: ${path.node.async === true},
        isGenerator: ${path.node.generator === true},
        funcName: '${funcName}',
        time: Date.now()
      };
    `;

    return template(temp)({
      SDFINFO: varName
    }) as Statement;
  }

  static buildPostInject(varName: Identifier): Statement[]{

    const temp = `
      const _sfd_collector = require('babel-plugin-transform-slow-func-detecter/lib/eventCollecter').default;
      _sfd_collector.receiveEvent({
        fileName: SDFINFO.fileName + ':' + SDFINFO.row + ':' + SDFINFO.column,
        row: SDFINFO.row,
        column: SDFINFO.column,
        isAsync: SDFINFO.isAsync,
        isGenerator: SDFINFO.isGenerator,
        funcName: SDFINFO.funcName,
        time: SDFINFO.time,
        endTime: Date.now()
      });
    `;

    return template(temp)({
      SDFINFO: varName
    }) as Statement[];
  }

  static printTransformInfo(path: NodePath<Function>, state: PluginPass, opt: any, basedir: String,funcName?: String) {
    if (opt.printTransformInfo === true) {
      const filename = state.file.opts.filename;
      const row = path.node.loc?.start.line;
      const column = path.node.loc?.start.column;
      const isAsync = path.node.async === true;
      const isGenerator = path.node.generator === true;
      console.info(`${path.node.type}: ${filename?.replace(basedir+'/', "")}:${row}:${column} funcName: ${funcName} ayc: ${isAsync} genrt: ${isGenerator}`);
    }
  }
}

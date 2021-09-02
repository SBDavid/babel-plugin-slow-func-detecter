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

  static buildPostInject(path: NodePath<Function>, varName: Identifier, runDuration: number): Statement[]{

    const temp = `
      const ENDTIME = Date.now();
      if (ENDTIME - SDFINFO.time > ${runDuration}) {
        console.info('SFD: ' + String(ENDTIME - SDFINFO.time) + ' path: ' + SDFINFO.fileName + ':' + SDFINFO.row + ':' + SDFINFO.column + ' funcName: ' + SDFINFO.funcName + ' ayc: ' + SDFINFO.isAsync + ' genrt: ' + SDFINFO.isGenerator);
      }
    `;

    return template(temp)({
      SDFINFO: varName,
      ENDTIME: path.scope.generateUidIdentifierBasedOnNode(path.node, '_endTime')
    }) as Statement[];
  }

  static printTransformInfo(path: NodePath<Function>, state: PluginPass, basedir: String,funcName?: String) {
    const filename = state.file.opts.filename;
    const row = path.node.loc?.start.line;
    const column = path.node.loc?.start.column;
    const isAsync = path.node.async === true;
    const isGenerator = path.node.generator === true;
    console.info(`${path.node.type}: ${filename?.replace(basedir+'/', "")}:${row}:${column} funcName: ${funcName} ayc: ${isAsync} genrt: ${isGenerator}`);
  }
}

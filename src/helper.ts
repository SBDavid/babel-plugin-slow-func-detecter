import type {NodePath} from '@babel/core';

import type { Function, Statement, Identifier } from "@babel/types";
import { template } from "@babel/core";

export default class Helper {
  static fileFilter(filename: string | null | undefined) {
    return  typeof filename === 'string' && filename.indexOf('node_modules') == -1;
  }

  static buildPreInject(varName: Identifier, filename: string, row: string, column: string, isAsync: string, funcName?: String): Statement{

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

    return template(temp)({
      SDFINFO: varName
    }) as Statement;
  }

  static buildPostInject(path: NodePath<Function>, varName: Identifier, runDuration: number): Statement[]{

    const temp = `
      const ENDTIME = Date.now();
      if (ENDTIME - SDFINFO.time > ${runDuration}) {
        console.info('time: ' + String(ENDTIME - SDFINFO.time) + ' path: ' + SDFINFO.fileName + ':' + SDFINFO.row + ':' + SDFINFO.column + ' funcName: ' + SDFINFO.funcName);
      }
    `;

    return template(temp)({
      SDFINFO: varName,
      ENDTIME: path.scope.generateUidIdentifierBasedOnNode(path.node, '_endTime')
    }) as Statement[];
  }
}

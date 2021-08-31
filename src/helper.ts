import type { NodePath } from "@babel/core";
import { template } from '@babel/core';
import type { Function, Statement } from "@babel/types";

export default class Helper {
  static fileFilter(filename: string | null | undefined) {
    return  typeof filename === 'string' && filename.indexOf('node_modules') == -1;
  }

  static buildPreInject(path: NodePath<Function>, filename: string, row: string, isAsync: string): Statement{

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

    return template(temp1)({
      FILENAME: path.scope.generateUidIdentifier('_sfdInfo')
    }) as Statement;
  }
}
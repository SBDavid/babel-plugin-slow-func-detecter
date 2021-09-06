import type { NodePath, PluginPass, Visitor } from "@babel/core";
import Helper from './helper';
import type { ArrowFunctionExpression, ClassMethod, Function, FunctionDeclaration, ObjectMethod } from "@babel/types";

// 在方法开头结尾注入代码方案，已经放弃
// 判断返回点过于复杂
// 有些方法定义方式不支持，例如用表达式定义箭头方法
export const CodeInject: Visitor<PluginPass> = {
  Function(path: NodePath<Function>, state: PluginPass) {
    // @ts-ignore
    const filename = state.file.opts.filename;
    console.info("filename", filename);
    let name = "未知";
    // 行号
    const row = path.node.loc?.start.line;
    const isAsync = path.node.async === true;

    // ArrowFunctionExpression
    if (path.type === 'ArrowFunctionExpression') {
      // @ts-ignore
      const arrowFunctionExpression: NodePath<ArrowFunctionExpression> = path;
      name = arrowFunctionExpression.type;
    }
    
    // FunctionDeclaration
    else if (path.type === 'FunctionDeclaration') {
      // @ts-ignore
      const functionDeclaration: NodePath<FunctionDeclaration> = path;
      name = functionDeclaration.node.id ? functionDeclaration.node.id.name : "无名方法";
    }
    
    // ClassMethod
    else if (path.type === 'ClassMethod') {
      // @ts-ignore
      const classMethod: NodePath<ClassMethod> = path;
      name = classMethod.key.toString();
    }
    
    // ObjectMethod
    else if (path.type === 'ObjectMethod') {
      // @ts-ignore
      const objectMethod: NodePath<ObjectMethod> = path;
      if (typeof objectMethod.node.key === 'string') {
        name = objectMethod.node.key;
      } else if (typeof objectMethod.node.key === 'number') {
        name = String(objectMethod.node.key);
      } else if (typeof objectMethod.node.key === 'object') {
        // @ts-ignore
        name = String(objectMethod.node.key.name);
      }
    }

    console.info(`name: ${name} row: ${row} isAsync: ${isAsync}`);

    // 插入代码
    if (path.get('body').type === 'Identifier') {
      return;
    }
    path.get('body').unshiftContainer(['body'], Helper.buildPreInject(path, String(filename)));
  }
};

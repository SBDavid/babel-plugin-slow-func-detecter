import type { NodePath, PluginPass, Visitor } from "@babel/core";
import * as t from '@babel/types';
import {declare} from "@babel/helper-plugin-utils";
import Helper from './helper';
import type { ArrowFunctionExpression, ClassMethod, Function, FunctionDeclaration, ObjectMethod, FunctionExpression, Identifier } from "@babel/types";

export default declare(() => {

  // 统计方法的数量
  // let funcAmount = 0;

  return {
    pre() {
      // console.info(t, tpl);
    },
    visitor: {
      // FunctionDeclaration(path, state) {
      //   try {
      //     console.info("out", state.file.opts.filename);
      //     console.info("name", path.node.id.name);
      //   } catch (err) {
      //     console.info('FunctionDeclaration', err);
      //   }
      // },

      // 首先过滤文件，并排除node_modules
      Program(path, state) {
        try {
          // 文件过滤
          if (!Helper.fileFilter(state.file.opts.filename)) {
            return;
          }

          // 代码注入
          path.traverse<PluginPass>(CodeDecorator, state);
          
        } catch (err) {
          console.info('Program', err);
        }
      }
    }
  };
});

// decorator方案，使用新的方法包裹原来的方法
const CodeDecorator: Visitor<PluginPass> = {
  ArrowFunctionExpression:  {
    exit(path: NodePath<ArrowFunctionExpression>, state: PluginPass) {
      // @ts-ignore
      const filename = state.file.opts.filename;
      const row = path.node.loc?.start.line;
      const isAsync = path.node.async === true;
      console.info(`ArrowFunctionExpression: ${filename} row: ${row} isAsync: ${isAsync}`);

      // 头部插入
      const pre = Helper.buildPreInject(path, String(filename), String(row), String(isAsync));
      // 函数体
      // 函数变量
      const funcName = path.scope.generateUidIdentifier('_funcName');
      const funcDecl = t.variableDeclaration('const', [
        t.variableDeclarator(funcName, path.node),
      ]);
      // 方法调用
      const funcCall = t.callExpression(funcName, []);
      const resId = path.scope.generateUidIdentifier('_res');
      const resDecl = t.variableDeclaration('const', [
        t.variableDeclarator(resId, funcCall)
      ]);
      // 返回值
      const ret = t.returnStatement(resId);

      var arrayFunc = t.arrowFunctionExpression(path.node.params, t.blockStatement([pre, funcDecl, resDecl, ret]), path.node.async);
      path.replaceWith(arrayFunc);
      path.skip();
    }
  },
  FunctionDeclaration: {
    exit(path: NodePath<FunctionDeclaration>, state: PluginPass) {
      const filename = state.file.opts.filename;
      const row = path.node.loc?.start.line;
      const isAsync = path.node.async === true;
      console.info(`FunctionDeclaration: ${filename} row: ${row} isAsync: ${isAsync}`);

      // 头部插入
      const pre = Helper.buildPreInject(path, String(filename), String(row), String(isAsync));

      // 函数体
      // 函数变量
      const funcName = path.scope.generateUidIdentifier('_funcName');
      const originFuncDecl = t.functionDeclaration(funcName, path.node.params, path.node.body, path.node.async);

      // 方法调用
      const funcCall = t.callExpression(funcName, []);
      const resId = path.scope.generateUidIdentifier('_res');
      const resDecl = t.variableDeclaration('const', [
        t.variableDeclarator(resId, funcCall)
      ]);
      // 返回值
      const ret = t.returnStatement(resId);

      var funcDecl = t.functionDeclaration(path.node.id, path.node.params, t.blockStatement([pre, originFuncDecl, resDecl, ret]), path.node.async);
      path.replaceWith(funcDecl);
      path.skip();
    }
  },
  FunctionExpression: {
    exit(path: NodePath<FunctionExpression>, state: PluginPass) {
      const filename = state.file.opts.filename;
      const row = path.node.loc?.start.line;
      const isAsync = path.node.async === true;
      console.info(`FunctionExpression: ${filename} row: ${row} isAsync: ${isAsync}`);

      // 头部插入
      const pre = Helper.buildPreInject(path, String(filename), String(row), String(isAsync));

      // 函数体
      t.callExpression(path.node, []);


      var functionExpression = t.functionExpression(path.node.id, path.node.params, t.blockStatement([pre]), path.node.generator, path.node.async);
      path.replaceWith(functionExpression);
      path.skip();
    }
  }
}

// 在方法开头结尾注入代码方案，已经放弃
// 判断返回点过于复杂
// 有些方法定义方式不支持，例如用表达式定义箭头方法
const CodeInject: Visitor<PluginPass> = {
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

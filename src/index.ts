import type { NodePath, PluginPass, Visitor } from "@babel/core";
import * as t from '@babel/types';
import {declare} from "@babel/helper-plugin-utils";
import Helper from './helper';
import type { ArrowFunctionExpression, ClassMethod, Function, FunctionDeclaration, ObjectMethod, FunctionExpression } from "@babel/types";

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

      if (path.node.generator) {
        path.skip();
        return;
      }

      const filename = state.file.opts.filename;
      const row = path.node.loc?.start.line;
      const column = path.node.loc?.start.column;
      const isAsync = path.node.async === true;
      const funcName = 'ArrowFunctionExpression';
      console.info(`ArrowFunctionExpression: ${filename}:${row}:${column} funcName: ${funcName} isAsync: ${isAsync}`);

      // 头部插入
      const varName = path.scope.generateUidIdentifierBasedOnNode(path.node, '_sdfinfo');
      const pre = Helper.buildPreInject(varName, String(filename), String(row), String(column), String(isAsync), funcName);
      // 原函数
      const originArrayFunc = t.arrowFunctionExpression([], path.node.body, path.node.async);
      // 方法调用
      const funcCall = t.callExpression(originArrayFunc, []);
      const resId = path.scope.generateUidIdentifier('_res');
      const resDecl = t.variableDeclaration('const', [
        t.variableDeclarator(resId, funcCall)
      ]);
      // 尾部插入
      const post = Helper.buildPostInject(path, varName, 0);
      // 返回值
      const ret = t.returnStatement(resId);

      var arrayFunc = t.arrowFunctionExpression(path.node.params, t.blockStatement([pre, resDecl, ...post, ret]), path.node.async);
      path.replaceWith(arrayFunc);
      path.skip();
    }
  },
  FunctionDeclaration: {
    exit(path: NodePath<FunctionDeclaration>, state: PluginPass) {

      if (path.node.generator) {
        path.skip();
        return;
      }

      const filename = state.file.opts.filename;
      const row = path.node.loc?.start.line;
      const column = path.node.loc?.start.column;
      const isAsync = path.node.async === true;
      const funcName = path.node.id?.name;
      console.info(`FunctionDeclaration: ${filename}:${row}:${column} funcName: ${funcName} isAsync: ${isAsync}`);

      // 头部插入
      const varName = path.scope.generateUidIdentifierBasedOnNode(path.node, '_sdfinfo');
      const pre = Helper.buildPreInject(varName, String(filename), String(row), String(column), String(isAsync), funcName);
      // 原函数体
      const originFuncDecl = t.arrowFunctionExpression([], path.node.body, path.node.async);
      // 方法调用
      const funcCall = t.callExpression(originFuncDecl, []);
      const resId = path.scope.generateUidIdentifier('_res');
      const resDecl = t.variableDeclaration('const', [
        t.variableDeclarator(resId, funcCall)
      ]);
      // 尾部插入
      const post = Helper.buildPostInject(path, varName, 0);
      // 返回值
      const ret = t.returnStatement(resId);

      var funcDecl = t.functionDeclaration(
        path.node.id, path.node.params,
        t.blockStatement([pre, resDecl, ...post, ret]),
        path.node.generator,
        path.node.async
        );
      path.replaceWith(funcDecl);
      path.skip();
    }
  },
  FunctionExpression: {
    exit(path: NodePath<FunctionExpression>, state: PluginPass) {

      if (path.node.generator) {
        path.skip();
        return;
      }

      const filename = state.file.opts.filename;
      const row = path.node.loc?.start.line;
      const column = path.node.loc?.start.column;
      const isAsync = path.node.async === true;
      const funcName = path.node.id?.name;
      console.info(`FunctionExpression: ${filename}:${row}:${column} funcName: ${funcName} isAsync: ${isAsync}`);

      // 头部插入
      const varName = path.scope.generateUidIdentifierBasedOnNode(path.node, '_sdfinfo');
      const pre = Helper.buildPreInject(varName, String(filename), String(row), String(column), String(isAsync), funcName);

      // 原函数
      const originFunc = t.arrowFunctionExpression([], path.node.body, path.node.async);
      // 方法调用
      const funcCall = t.callExpression(originFunc, []);
      const resId = path.scope.generateUidIdentifier('_res');
      const resDecl = t.variableDeclaration('const', [
        t.variableDeclarator(resId, funcCall)
      ]);
      // 尾部插入
      const post = Helper.buildPostInject(path, varName, 0);
      // 返回值
      const ret = t.returnStatement(resId);

      const functionExpression = t.functionExpression(
        path.node.id, path.node.params,
        t.blockStatement([pre, ...post,resDecl, ret]),
        path.node.generator,
        path.node.async);
      path.replaceWith(functionExpression);
      path.skip();
    }
  },
  ObjectMethod: {
    exit(path: NodePath<ObjectMethod>, state: PluginPass) {
      if (path.node.generator) {
        // path.skip();
        // return;
      }
      if (path.node.kind !== 'method') {
        path.skip();
        return;
      }
      const filename = state.file.opts.filename;
      const row = path.node.loc?.start.line;
      const column = path.node.loc?.start.column;
      const isAsync = path.node.async === true;
      let funcName = "ObjectMethod";
      if (path.node.key.type === 'Identifier') {
        funcName = path.node.key.name;
      } else if (path.node.key.type === 'StringLiteral' || path.node.key.type === 'NumericLiteral') {
        funcName = String(path.node.key.value);
      }
      console.info(`ObjectMethod: ${filename}:${row}:${column} funcName: ${funcName} isAsync: ${isAsync}`);

      // 头部插入
      const varName = path.scope.generateUidIdentifierBasedOnNode(path.node, '_sdfinfo');
      const pre = Helper.buildPreInject(varName, String(filename), String(row), String(column), String(isAsync), funcName);
      // 原函数
      const originFunc = t.functionExpression(null, [], path.node.body, path.node.generator, path.node.async);
      // 方法调用
      const funcCall =  t.callExpression(originFunc, []);
      const resId = path.scope.generateUidIdentifier('_res');
      const resDecl = t.variableDeclaration('const', [
        t.variableDeclarator(resId, funcCall)
      ]);
      // 尾部插入
      const post = Helper.buildPostInject(path, varName, 0);
      // 返回值
      const ret = t.returnStatement(resId);

      const objectMethod = t.objectMethod(
        path.node.kind,
        path.node.key,
        path.node.params,
        t.blockStatement([pre, resDecl, ...post, ret]),
        path.node.computed,
        path.node.generator,
        path.node.async,
      );
      path.replaceWith(objectMethod);
      path.skip();
    }
  },
  ClassMethod: {
    exit(path: NodePath<ClassMethod>, state: PluginPass) {
      if (path.node.generator) {
        path.skip();
        return;
      }
      if (path.node.kind !== 'method') {
        path.skip();
        return;
      }

      const filename = state.file.opts.filename;
      const row = path.node.loc?.start.line;
      const column = path.node.loc?.start.column;
      const isAsync = path.node.async === true;
      let funcName = "ClassMethod";
      if (path.node.key.type === 'Identifier') {
        funcName = path.node.key.name;
      } else if (path.node.key.type === 'StringLiteral' || path.node.key.type === 'NumericLiteral') {
        funcName = String(path.node.key.value);
      }
      console.info(`ClassMethod: ${filename}:${row}:${column} funcName: ${funcName} isAsync: ${isAsync}`);
      // 头部插入
      const varName = path.scope.generateUidIdentifierBasedOnNode(path.node, '_sdfinfo');
      const pre = Helper.buildPreInject(varName, String(filename), String(row), String(column), String(isAsync), funcName);
      // 原函数
      const originFunc = t.arrowFunctionExpression([], path.node.body, path.node.async);
      // 方法调用
      const funcCall = t.callExpression(originFunc, []);
      const resId = path.scope.generateUidIdentifier('_res');
      const resDecl = t.variableDeclaration('const', [
        t.variableDeclarator(resId, funcCall)
      ]);
      // 尾部插入
      const post = Helper.buildPostInject(path, varName, 0);
      // 返回值
      const ret = t.returnStatement(resId);

      const classMethod = t.classMethod(
        path.node.kind,
        path.node.key,
        path.node.params,
        t.blockStatement([pre, resDecl, ...post, ret]),
        path.node.computed,
        path.node.static,
        path.node.generator,
        path.node.async,
      );
      path.replaceWith(classMethod);
      path.skip();
    }
  }
}

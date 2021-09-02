import type { NodePath, PluginPass, Visitor } from "@babel/core";
import * as t from '@babel/types';
import {declare} from "@babel/helper-plugin-utils";
import Helper from './helper';
import type { ArrowFunctionExpression, ClassMethod, FunctionDeclaration, ObjectMethod, FunctionExpression } from "@babel/types";

export default declare((api, opt, dir) => {

  // decorator方案，使用新的方法包裹原来的方法
  const CodeDecorator: Visitor<PluginPass> = {
    ArrowFunctionExpression:  {
      exit(path: NodePath<ArrowFunctionExpression>, state: PluginPass) {

        if (path.node.generator) {
          path.skip();
          return;
        }

        const funcName = 'ArrowFunctionExpression';
        Helper.printTransformInfo(path, state, opt ,dir, funcName);

        // 头部插入
        const varName = path.scope.generateUidIdentifierBasedOnNode(path.node, '_sdfinfo');
        const pre = Helper.buildPreInject(varName, path, state, dir,funcName);
        // 原函数
        const originArrayFunc = t.arrowFunctionExpression([], path.node.body, path.node.async);
        // 方法调用
        const funcCall = path.node.async === true ? t.awaitExpression(t.callExpression(originArrayFunc, [])) : t.callExpression(originArrayFunc, []);
        const resId = path.scope.generateUidIdentifier('_res');
        const resDecl = t.variableDeclaration('const', [
          t.variableDeclarator(resId, funcCall)
        ]);
        // 尾部插入
        const post = Helper.buildPostInject(varName);
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

        const funcName = path.node.id?.name;
        Helper.printTransformInfo(path, state, opt ,dir, funcName);

        // 头部插入
        const varName = path.scope.generateUidIdentifierBasedOnNode(path.node, '_sdfinfo');
        const pre = Helper.buildPreInject(varName, path, state, dir, funcName);
        // 原函数体
        const originFuncDecl = t.arrowFunctionExpression([], path.node.body, path.node.async);
        // 方法调用
        const funcCall = path.node.async === true ? t.awaitExpression(t.callExpression(originFuncDecl, [])) : t.callExpression(originFuncDecl, []);
        const resId = path.scope.generateUidIdentifier('_res');
        const resDecl = t.variableDeclaration('const', [
          t.variableDeclarator(resId, funcCall)
        ]);
        // 尾部插入
        const post = Helper.buildPostInject(varName);
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

        const funcName = path.node.id?.name;
        Helper.printTransformInfo(path, state, opt ,dir, funcName);

        // 头部插入
        const varName = path.scope.generateUidIdentifierBasedOnNode(path.node, '_sdfinfo');
        const pre = Helper.buildPreInject(varName, path, state, dir, funcName);

        // 原函数
        const originFunc = t.arrowFunctionExpression([], path.node.body, path.node.async);
        // 方法调用
        const funcCall = path.node.async === true ? t.awaitExpression(t.callExpression(originFunc, [])) : t.callExpression(originFunc, []);
        const resId = path.scope.generateUidIdentifier('_res');
        const resDecl = t.variableDeclaration('const', [
          t.variableDeclarator(resId, funcCall)
        ]);
        // 尾部插入
        const post = Helper.buildPostInject(varName);
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

        let funcName = "ObjectMethod";
        if (path.node.key.type === 'Identifier') {
          funcName = path.node.key.name;
        } else if (path.node.key.type === 'StringLiteral' || path.node.key.type === 'NumericLiteral') {
          funcName = String(path.node.key.value);
        }
        Helper.printTransformInfo(path, state, opt ,dir, funcName);

        // 头部插入
        const varName = path.scope.generateUidIdentifierBasedOnNode(path.node, '_sdfinfo');
        const pre = Helper.buildPreInject(varName, path, state, dir, funcName);
        // 原函数
        const originFunc = t.functionExpression(null, [], path.node.body, path.node.generator, path.node.async);
        if (!path.node.generator) {
          // 方法调用
          const funcCall = path.node.async === true ? t.awaitExpression(t.callExpression(originFunc, [])) : t.callExpression(originFunc, []);
          const resId = path.scope.generateUidIdentifier('_res');
          const resDecl = t.variableDeclaration('const', [
            t.variableDeclarator(resId, funcCall)
          ]);
          // 尾部插入
          const post = Helper.buildPostInject(varName);
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
        } else {
          // 方法调用
          const funcCall = t.yieldExpression(t.callExpression(originFunc, []), true);
          const resId = path.scope.generateUidIdentifier('_res');
          const resDecl = t.variableDeclaration('const', [
            t.variableDeclarator(resId, funcCall)
          ]);
          // 尾部插入
          const post = Helper.buildPostInject(varName);
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
        }
        
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

        let funcName = "ClassMethod";
        if (path.node.key.type === 'Identifier') {
          funcName = path.node.key.name;
        } else if (path.node.key.type === 'StringLiteral' || path.node.key.type === 'NumericLiteral') {
          funcName = String(path.node.key.value);
        }
        Helper.printTransformInfo(path, state, opt ,dir, funcName);
        // 头部插入
        const varName = path.scope.generateUidIdentifierBasedOnNode(path.node, '_sdfinfo');
        const pre = Helper.buildPreInject(varName, path, state, dir, funcName);
        // 原函数
        const originFunc = t.arrowFunctionExpression([], path.node.body, path.node.async);
        // 方法调用
        const funcCall = path.node.async === true ? t.awaitExpression(t.callExpression(originFunc, [])) : t.callExpression(originFunc, []);
        const resId = path.scope.generateUidIdentifier('_res');
        const resDecl = t.variableDeclaration('const', [
          t.variableDeclarator(resId, funcCall)
        ]);
        // 尾部插入
        const post = Helper.buildPostInject(varName);
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

  return {
    visitor: {
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

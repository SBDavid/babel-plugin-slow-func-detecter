"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var t = _interopRequireWildcard(require("@babel/types"));

var _helperPluginUtils = require("@babel/helper-plugin-utils");

var _helper = _interopRequireDefault(require("./helper"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var _default = (0, _helperPluginUtils.declare)(() => {
  // 统计方法的数量
  // let funcAmount = 0;
  return {
    pre() {// console.info(t, tpl);
    },

    visitor: {
      // 首先过滤文件，并排除node_modules
      Program(path, state) {
        try {
          // 文件过滤
          if (!_helper.default.fileFilter(state.file.opts.filename)) {
            return;
          } // 代码注入


          path.traverse(CodeDecorator, state);
        } catch (err) {
          console.info('Program', err);
        }
      }

    }
  };
}); // decorator方案，使用新的方法包裹原来的方法


exports.default = _default;
const CodeDecorator = {
  ArrowFunctionExpression: {
    exit(path, state) {
      if (path.node.generator) {
        path.skip();
        return;
      }

      const funcName = 'ArrowFunctionExpression';

      _helper.default.printTransformInfo(path, state, funcName); // 头部插入


      const varName = path.scope.generateUidIdentifierBasedOnNode(path.node, '_sdfinfo');

      const pre = _helper.default.buildPreInject(varName, path, state, funcName); // 原函数


      const originArrayFunc = t.arrowFunctionExpression([], path.node.body, path.node.async); // 方法调用

      const funcCall = path.node.async === true ? t.awaitExpression(t.callExpression(originArrayFunc, [])) : t.callExpression(originArrayFunc, []);
      const resId = path.scope.generateUidIdentifier('_res');
      const resDecl = t.variableDeclaration('const', [t.variableDeclarator(resId, funcCall)]); // 尾部插入

      const post = _helper.default.buildPostInject(path, varName, 1); // 返回值


      const ret = t.returnStatement(resId);
      var arrayFunc = t.arrowFunctionExpression(path.node.params, t.blockStatement([pre, resDecl, ...post, ret]), path.node.async);
      path.replaceWith(arrayFunc);
      path.skip();
    }

  },
  FunctionDeclaration: {
    exit(path, state) {
      var _path$node$id;

      if (path.node.generator) {
        path.skip();
        return;
      }

      const funcName = (_path$node$id = path.node.id) === null || _path$node$id === void 0 ? void 0 : _path$node$id.name;

      _helper.default.printTransformInfo(path, state, funcName); // 头部插入


      const varName = path.scope.generateUidIdentifierBasedOnNode(path.node, '_sdfinfo');

      const pre = _helper.default.buildPreInject(varName, path, state, funcName); // 原函数体


      const originFuncDecl = t.arrowFunctionExpression([], path.node.body, path.node.async); // 方法调用

      const funcCall = path.node.async === true ? t.awaitExpression(t.callExpression(originFuncDecl, [])) : t.callExpression(originFuncDecl, []);
      const resId = path.scope.generateUidIdentifier('_res');
      const resDecl = t.variableDeclaration('const', [t.variableDeclarator(resId, funcCall)]); // 尾部插入

      const post = _helper.default.buildPostInject(path, varName, 1); // 返回值


      const ret = t.returnStatement(resId);
      var funcDecl = t.functionDeclaration(path.node.id, path.node.params, t.blockStatement([pre, resDecl, ...post, ret]), path.node.generator, path.node.async);
      path.replaceWith(funcDecl);
      path.skip();
    }

  },
  FunctionExpression: {
    exit(path, state) {
      var _path$node$id2;

      if (path.node.generator) {
        path.skip();
        return;
      }

      const funcName = (_path$node$id2 = path.node.id) === null || _path$node$id2 === void 0 ? void 0 : _path$node$id2.name;

      _helper.default.printTransformInfo(path, state, funcName); // 头部插入


      const varName = path.scope.generateUidIdentifierBasedOnNode(path.node, '_sdfinfo');

      const pre = _helper.default.buildPreInject(varName, path, state, funcName); // 原函数


      const originFunc = t.arrowFunctionExpression([], path.node.body, path.node.async); // 方法调用

      const funcCall = path.node.async === true ? t.awaitExpression(t.callExpression(originFunc, [])) : t.callExpression(originFunc, []);
      const resId = path.scope.generateUidIdentifier('_res');
      const resDecl = t.variableDeclaration('const', [t.variableDeclarator(resId, funcCall)]); // 尾部插入

      const post = _helper.default.buildPostInject(path, varName, 1); // 返回值


      const ret = t.returnStatement(resId);
      const functionExpression = t.functionExpression(path.node.id, path.node.params, t.blockStatement([pre, ...post, resDecl, ret]), path.node.generator, path.node.async);
      path.replaceWith(functionExpression);
      path.skip();
    }

  },
  ObjectMethod: {
    exit(path, state) {
      if (path.node.generator) {// path.skip();
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

      _helper.default.printTransformInfo(path, state, funcName); // 头部插入


      const varName = path.scope.generateUidIdentifierBasedOnNode(path.node, '_sdfinfo');

      const pre = _helper.default.buildPreInject(varName, path, state, funcName); // 原函数


      const originFunc = t.functionExpression(null, [], path.node.body, path.node.generator, path.node.async);

      if (!path.node.generator) {
        // 方法调用
        const funcCall = path.node.async === true ? t.awaitExpression(t.callExpression(originFunc, [])) : t.callExpression(originFunc, []);
        const resId = path.scope.generateUidIdentifier('_res');
        const resDecl = t.variableDeclaration('const', [t.variableDeclarator(resId, funcCall)]); // 尾部插入

        const post = _helper.default.buildPostInject(path, varName, 1); // 返回值


        const ret = t.returnStatement(resId);
        const objectMethod = t.objectMethod(path.node.kind, path.node.key, path.node.params, t.blockStatement([pre, resDecl, ...post, ret]), path.node.computed, path.node.generator, path.node.async);
        path.replaceWith(objectMethod);
      } else {
        // 方法调用
        const funcCall = t.yieldExpression(t.callExpression(originFunc, []), true);
        const resId = path.scope.generateUidIdentifier('_res');
        const resDecl = t.variableDeclaration('const', [t.variableDeclarator(resId, funcCall)]); // 尾部插入

        const post = _helper.default.buildPostInject(path, varName, 1); // 返回值


        const ret = t.returnStatement(resId);
        const objectMethod = t.objectMethod(path.node.kind, path.node.key, path.node.params, t.blockStatement([pre, resDecl, ...post, ret]), path.node.computed, path.node.generator, path.node.async);
        path.replaceWith(objectMethod);
      }

      path.skip();
    }

  },
  ClassMethod: {
    exit(path, state) {
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

      _helper.default.printTransformInfo(path, state, funcName); // 头部插入


      const varName = path.scope.generateUidIdentifierBasedOnNode(path.node, '_sdfinfo');

      const pre = _helper.default.buildPreInject(varName, path, state, funcName); // 原函数


      const originFunc = t.arrowFunctionExpression([], path.node.body, path.node.async); // 方法调用

      const funcCall = path.node.async === true ? t.awaitExpression(t.callExpression(originFunc, [])) : t.callExpression(originFunc, []);
      const resId = path.scope.generateUidIdentifier('_res');
      const resDecl = t.variableDeclaration('const', [t.variableDeclarator(resId, funcCall)]); // 尾部插入

      const post = _helper.default.buildPostInject(path, varName, 1); // 返回值


      const ret = t.returnStatement(resId);
      const classMethod = t.classMethod(path.node.kind, path.node.key, path.node.params, t.blockStatement([pre, resDecl, ...post, ret]), path.node.computed, path.node.static, path.node.generator, path.node.async);
      path.replaceWith(classMethod);
      path.skip();
    }

  }
};
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
      var _path$node$loc, _path$node$loc2;

      if (path.node.generator) {
        path.skip();
        return;
      }

      const filename = state.file.opts.filename;
      const row = (_path$node$loc = path.node.loc) === null || _path$node$loc === void 0 ? void 0 : _path$node$loc.start.line;
      const column = (_path$node$loc2 = path.node.loc) === null || _path$node$loc2 === void 0 ? void 0 : _path$node$loc2.start.column;
      const isAsync = path.node.async === true;
      const funcName = 'ArrowFunctionExpression';
      console.info(`ArrowFunctionExpression: ${filename}:${row}:${column} funcName: ${funcName} isAsync: ${isAsync}`); // 头部插入

      const varName = path.scope.generateUidIdentifierBasedOnNode(path.node, '_sdfinfo');

      const pre = _helper.default.buildPreInject(varName, String(filename), String(row), String(column), String(isAsync), funcName); // 原函数


      const originArrayFunc = t.arrowFunctionExpression([], path.node.body, path.node.async); // 方法调用

      const funcCall = t.callExpression(originArrayFunc, []);
      const resId = path.scope.generateUidIdentifier('_res');
      const resDecl = t.variableDeclaration('const', [t.variableDeclarator(resId, funcCall)]); // 尾部插入

      const post = _helper.default.buildPostInject(path, varName, 0); // 返回值


      const ret = t.returnStatement(resId);
      var arrayFunc = t.arrowFunctionExpression(path.node.params, t.blockStatement([pre, resDecl, ...post, ret]), path.node.async);
      path.replaceWith(arrayFunc);
      path.skip();
    }

  },
  FunctionDeclaration: {
    exit(path, state) {
      var _path$node$loc3, _path$node$loc4, _path$node$id;

      if (path.node.generator) {
        path.skip();
        return;
      }

      const filename = state.file.opts.filename;
      const row = (_path$node$loc3 = path.node.loc) === null || _path$node$loc3 === void 0 ? void 0 : _path$node$loc3.start.line;
      const column = (_path$node$loc4 = path.node.loc) === null || _path$node$loc4 === void 0 ? void 0 : _path$node$loc4.start.column;
      const isAsync = path.node.async === true;
      const funcName = (_path$node$id = path.node.id) === null || _path$node$id === void 0 ? void 0 : _path$node$id.name;
      console.info(`FunctionDeclaration: ${filename}:${row}:${column} funcName: ${funcName} isAsync: ${isAsync}`); // 头部插入

      const varName = path.scope.generateUidIdentifierBasedOnNode(path.node, '_sdfinfo');

      const pre = _helper.default.buildPreInject(varName, String(filename), String(row), String(column), String(isAsync), funcName); // 原函数体


      const originFuncDecl = t.arrowFunctionExpression([], path.node.body, path.node.async); // 方法调用

      const funcCall = t.callExpression(originFuncDecl, []);
      const resId = path.scope.generateUidIdentifier('_res');
      const resDecl = t.variableDeclaration('const', [t.variableDeclarator(resId, funcCall)]); // 尾部插入

      const post = _helper.default.buildPostInject(path, varName, 0); // 返回值


      const ret = t.returnStatement(resId);
      var funcDecl = t.functionDeclaration(path.node.id, path.node.params, t.blockStatement([pre, resDecl, ...post, ret]), path.node.generator, path.node.async);
      path.replaceWith(funcDecl);
      path.skip();
    }

  },
  FunctionExpression: {
    exit(path, state) {
      var _path$node$loc5, _path$node$loc6, _path$node$id2;

      if (path.node.generator) {
        path.skip();
        return;
      }

      const filename = state.file.opts.filename;
      const row = (_path$node$loc5 = path.node.loc) === null || _path$node$loc5 === void 0 ? void 0 : _path$node$loc5.start.line;
      const column = (_path$node$loc6 = path.node.loc) === null || _path$node$loc6 === void 0 ? void 0 : _path$node$loc6.start.column;
      const isAsync = path.node.async === true;
      const funcName = (_path$node$id2 = path.node.id) === null || _path$node$id2 === void 0 ? void 0 : _path$node$id2.name;
      console.info(`FunctionExpression: ${filename}:${row}:${column} funcName: ${funcName} isAsync: ${isAsync}`); // 头部插入

      const varName = path.scope.generateUidIdentifierBasedOnNode(path.node, '_sdfinfo');

      const pre = _helper.default.buildPreInject(varName, String(filename), String(row), String(column), String(isAsync), funcName); // 原函数


      const originFunc = t.arrowFunctionExpression([], path.node.body, path.node.async); // 方法调用

      const funcCall = t.callExpression(originFunc, []);
      const resId = path.scope.generateUidIdentifier('_res');
      const resDecl = t.variableDeclaration('const', [t.variableDeclarator(resId, funcCall)]); // 尾部插入

      const post = _helper.default.buildPostInject(path, varName, 0); // 返回值


      const ret = t.returnStatement(resId);
      const functionExpression = t.functionExpression(path.node.id, path.node.params, t.blockStatement([pre, ...post, resDecl, ret]), path.node.generator, path.node.async);
      path.replaceWith(functionExpression);
      path.skip();
    }

  },
  ObjectMethod: {
    exit(path, state) {
      var _path$node$loc7, _path$node$loc8;

      if (path.node.generator) {// path.skip();
        // return;
      }

      if (path.node.kind !== 'method') {
        path.skip();
        return;
      }

      const filename = state.file.opts.filename;
      const row = (_path$node$loc7 = path.node.loc) === null || _path$node$loc7 === void 0 ? void 0 : _path$node$loc7.start.line;
      const column = (_path$node$loc8 = path.node.loc) === null || _path$node$loc8 === void 0 ? void 0 : _path$node$loc8.start.column;
      const isAsync = path.node.async === true;
      let funcName = "ObjectMethod";

      if (path.node.key.type === 'Identifier') {
        funcName = path.node.key.name;
      } else if (path.node.key.type === 'StringLiteral' || path.node.key.type === 'NumericLiteral') {
        funcName = String(path.node.key.value);
      }

      console.info(`ObjectMethod: ${filename}:${row}:${column} funcName: ${funcName} isAsync: ${isAsync}`); // 头部插入

      const varName = path.scope.generateUidIdentifierBasedOnNode(path.node, '_sdfinfo');

      const pre = _helper.default.buildPreInject(varName, String(filename), String(row), String(column), String(isAsync), funcName); // 原函数


      const originFunc = t.functionExpression(null, [], path.node.body, path.node.generator, path.node.async); // 方法调用

      const funcCall = t.callExpression(originFunc, []);
      const resId = path.scope.generateUidIdentifier('_res');
      const resDecl = t.variableDeclaration('const', [t.variableDeclarator(resId, funcCall)]); // 尾部插入

      const post = _helper.default.buildPostInject(path, varName, 0); // 返回值


      const ret = t.returnStatement(resId);
      const objectMethod = t.objectMethod(path.node.kind, path.node.key, path.node.params, t.blockStatement([pre, resDecl, ...post, ret]), path.node.computed, path.node.generator, path.node.async);
      path.replaceWith(objectMethod);
      path.skip();
    }

  },
  ClassMethod: {
    exit(path, state) {
      var _path$node$loc9, _path$node$loc10;

      if (path.node.generator) {
        path.skip();
        return;
      }

      if (path.node.kind !== 'method') {
        path.skip();
        return;
      }

      const filename = state.file.opts.filename;
      const row = (_path$node$loc9 = path.node.loc) === null || _path$node$loc9 === void 0 ? void 0 : _path$node$loc9.start.line;
      const column = (_path$node$loc10 = path.node.loc) === null || _path$node$loc10 === void 0 ? void 0 : _path$node$loc10.start.column;
      const isAsync = path.node.async === true;
      let funcName = "ClassMethod";

      if (path.node.key.type === 'Identifier') {
        funcName = path.node.key.name;
      } else if (path.node.key.type === 'StringLiteral' || path.node.key.type === 'NumericLiteral') {
        funcName = String(path.node.key.value);
      }

      console.info(`ClassMethod: ${filename}:${row}:${column} funcName: ${funcName} isAsync: ${isAsync}`); // 头部插入

      const varName = path.scope.generateUidIdentifierBasedOnNode(path.node, '_sdfinfo');

      const pre = _helper.default.buildPreInject(varName, String(filename), String(row), String(column), String(isAsync), funcName); // 原函数


      const originFunc = t.arrowFunctionExpression([], path.node.body, path.node.async); // 方法调用

      const funcCall = t.callExpression(originFunc, []);
      const resId = path.scope.generateUidIdentifier('_res');
      const resDecl = t.variableDeclaration('const', [t.variableDeclarator(resId, funcCall)]); // 尾部插入

      const post = _helper.default.buildPostInject(path, varName, 0); // 返回值


      const ret = t.returnStatement(resId);
      const classMethod = t.classMethod(path.node.kind, path.node.key, path.node.params, t.blockStatement([pre, resDecl, ...post, ret]), path.node.computed, path.node.static, path.node.generator, path.node.async);
      path.replaceWith(classMethod);
      path.skip();
    }

  }
};
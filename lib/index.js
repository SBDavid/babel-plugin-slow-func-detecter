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
      var _path$node$loc;

      // @ts-ignore
      const filename = state.file.opts.filename;
      const row = (_path$node$loc = path.node.loc) === null || _path$node$loc === void 0 ? void 0 : _path$node$loc.start.line;
      const isAsync = path.node.async === true;
      console.info(`ArrowFunctionExpression: ${filename} row: ${row} isAsync: ${isAsync}`); // 头部插入

      const pre = _helper.default.buildPreInject(path, String(filename), String(row), String(isAsync)); // 函数体
      // 函数变量


      const funcName = path.scope.generateUidIdentifier('_funcName');
      const funcDecl = t.variableDeclaration('const', [t.variableDeclarator(funcName, path.node)]); // 方法调用

      const funcCall = t.callExpression(funcName, []);
      const resId = path.scope.generateUidIdentifier('_res');
      const resDecl = t.variableDeclaration('const', [t.variableDeclarator(resId, funcCall)]); // 返回值

      const ret = t.returnStatement(resId);
      var arrayFunc = t.arrowFunctionExpression(path.node.params, t.blockStatement([pre, funcDecl, resDecl, ret]), path.node.async);
      path.replaceWith(arrayFunc);
      path.skip();
    }

  },
  FunctionDeclaration: {
    exit(path, state) {
      var _path$node$loc2;

      const filename = state.file.opts.filename;
      const row = (_path$node$loc2 = path.node.loc) === null || _path$node$loc2 === void 0 ? void 0 : _path$node$loc2.start.line;
      const isAsync = path.node.async === true;
      console.info(`FunctionDeclaration: ${filename} row: ${row} isAsync: ${isAsync}`); // 头部插入

      const pre = _helper.default.buildPreInject(path, String(filename), String(row), String(isAsync)); // 函数体
      // 函数变量


      const funcName = path.scope.generateUidIdentifier('_funcName');
      const originFuncDecl = t.functionDeclaration(funcName, path.node.params, path.node.body, path.node.async); // 方法调用

      const funcCall = t.callExpression(funcName, []);
      const resId = path.scope.generateUidIdentifier('_res');
      const resDecl = t.variableDeclaration('const', [t.variableDeclarator(resId, funcCall)]); // 返回值

      const ret = t.returnStatement(resId);
      var funcDecl = t.functionDeclaration(path.node.id, path.node.params, t.blockStatement([pre, originFuncDecl, resDecl, ret]), path.node.async);
      path.replaceWith(funcDecl);
      path.skip();
    }

  },
  FunctionExpression: {
    exit(path, state) {
      var _path$node$loc3;

      const filename = state.file.opts.filename;
      const row = (_path$node$loc3 = path.node.loc) === null || _path$node$loc3 === void 0 ? void 0 : _path$node$loc3.start.line;
      const isAsync = path.node.async === true;
      console.info(`FunctionExpression: ${filename} row: ${row} isAsync: ${isAsync}`); // 头部插入

      const pre = _helper.default.buildPreInject(path, String(filename), String(row), String(isAsync)); // 函数体


      t.callExpression(path.node, []);
      var functionExpression = t.functionExpression(path.node.id, path.node.params, t.blockStatement([pre]), path.node.generator, path.node.async);
      path.replaceWith(functionExpression);
      path.skip();
    }

  }
}; // 在方法开头结尾注入代码方案，已经放弃
// 判断返回点过于复杂
// 有些方法定义方式不支持，例如用表达式定义箭头方法

const CodeInject = {
  Function(path, state) {
    var _path$node$loc4;

    // @ts-ignore
    const filename = state.file.opts.filename;
    console.info("filename", filename);
    let name = "未知"; // 行号

    const row = (_path$node$loc4 = path.node.loc) === null || _path$node$loc4 === void 0 ? void 0 : _path$node$loc4.start.line;
    const isAsync = path.node.async === true; // ArrowFunctionExpression

    if (path.type === 'ArrowFunctionExpression') {
      // @ts-ignore
      const arrowFunctionExpression = path;
      name = arrowFunctionExpression.type;
    } // FunctionDeclaration
    else if (path.type === 'FunctionDeclaration') {
      // @ts-ignore
      const functionDeclaration = path;
      name = functionDeclaration.node.id ? functionDeclaration.node.id.name : "无名方法";
    } // ClassMethod
    else if (path.type === 'ClassMethod') {
      // @ts-ignore
      const classMethod = path;
      name = classMethod.key.toString();
    } // ObjectMethod
    else if (path.type === 'ObjectMethod') {
      // @ts-ignore
      const objectMethod = path;

      if (typeof objectMethod.node.key === 'string') {
        name = objectMethod.node.key;
      } else if (typeof objectMethod.node.key === 'number') {
        name = String(objectMethod.node.key);
      } else if (typeof objectMethod.node.key === 'object') {
        // @ts-ignore
        name = String(objectMethod.node.key.name);
      }
    }

    console.info(`name: ${name} row: ${row} isAsync: ${isAsync}`); // 插入代码

    if (path.get('body').type === 'Identifier') {
      return;
    }

    path.get('body').unshiftContainer(['body'], _helper.default.buildPreInject(path, String(filename)));
  }

};
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CodeInject = void 0;

var _helper = _interopRequireDefault(require("./helper"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 在方法开头结尾注入代码方案，已经放弃
// 判断返回点过于复杂
// 有些方法定义方式不支持，例如用表达式定义箭头方法
const CodeInject = {
  Function(path, state) {
    var _path$node$loc;

    // @ts-ignore
    const filename = state.file.opts.filename;
    console.info("filename", filename);
    let name = "未知"; // 行号

    const row = (_path$node$loc = path.node.loc) === null || _path$node$loc === void 0 ? void 0 : _path$node$loc.start.line;
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
exports.CodeInject = CodeInject;
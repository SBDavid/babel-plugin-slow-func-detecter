## babel-plugin-transform-slow-func-detecter

这个插件用于分析js运行过程中是否存在慢方法，仅在开发环境中使用，请勿在线上使用。

已实现功能
- 目前支持 react-native, web, node 平台
- 分析同步方法运行时长
- 分析 async 方法运行时长
- 设置报警
  - 限制最大执行时长
  - 限制最大调用次数

### 1. 安装

```shell
yarn add --save babel-plugin-transform-slow-func-detecter
```

babel 配置
```js
module.exports = {
  plugins: [
    [
      'babel-plugin-transform-slow-func-detecter',
      {
        printTransformInfo: false, // 是否打印编译阶段的日志
      },
    ],
  ],
};
```

### 2. 初始化（可选）

```js
import sdf from 'babel-plugin-transform-slow-func-detecter/lib/eventCollecter';

// 参数一（必选）：最大执行时长，范围 >= 0
// 参数二（必选）：最大调用次数，范围 >= 0
// 参数三（可选）：报警事件回调
sdf.init(1, 2, (e) => {
  console.info(e);
});
```

### 3. 通过日志查看慢函数
通过在 init 方法中设置过滤参数，超出阈值的函数调用会在控制台输出日志

### 4. 报警事件参数说明

```js
type SfdEvent = {
  fileName: String;           // 文件地址
  row: number;                // 方法所在行
  column: number;             // 方法所在列
  isAsync: Boolean;           // 是否是异步方法
  isGenerator: Boolean;       // Generator方法
  funcName: String;           // 方法名称
  time: number;               // 开始时间
  endTime: number;            // 结束时间
  duration: number;           // 时长
  timeFromInitTime: number;   // 方法开始时间 - 应用启动时间
  endTimeFromInitTime: number;// 方法结束时间 - 应用启动时间
  count: number;              // 方法调用次数
  startSeq: number;           // 开始次序
  endSeq: number;             // 结束次序
};
```
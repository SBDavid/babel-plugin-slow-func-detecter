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

export default class EventCollecter {

  // 防止堆栈溢出
  static isReporting = false;

  static maxDuration = 0;
  static maxCount = 0

  static init(maxDuration: number, maxCount: number, onReport: (e: SfdEvent) => void) {
    EventCollecter.maxDuration = maxDuration;
    EventCollecter.maxCount = maxCount;
    if (onReport !== undefined) {
      EventCollecter.onReport = onReport;
    }
  }

  static onReport(e: SfdEvent) {
    console.info(`SDF: 时长[${e.duration}] 开始时间[${e.timeFromInitTime}] 调用测试[${e.count}] 开始结束次序[${e.startSeq}-${e.endSeq}] 异步[${e.isAsync || e.isGenerator}] 方法名[${e.funcName}] 文件名 ${e.fileName}`)
  }

  static initTime = 0;
  static startSeq = 0;
  static endSeq = 0;

  static counter: Map<String, number> = new Map();

  // 接受事件
  static receiveEvent(e: SfdEvent) {

    if (EventCollecter.isReporting) {
      return;
    }

    // 设置时间比较基准
    if (EventCollecter.initTime === 0) {
      EventCollecter.initTime = e.time;
    }

    e.duration = e.endTime - e.time;
    e.timeFromInitTime = e.time - EventCollecter.initTime;
    e.endTimeFromInitTime = e.endTime - EventCollecter.initTime;

    let count = EventCollecter.counter.get(e.fileName);
    if (count === undefined) {
      count = 0;
    } else {
      count++;
    }
    e.count = count;
    EventCollecter.counter.set(e.fileName, count);

    if (e.duration >= EventCollecter.maxDuration || e.count >= EventCollecter.maxCount) {
      EventCollecter.isReporting = true;
      EventCollecter.onReport(e);
      EventCollecter.isReporting = false;
    }
  }
}

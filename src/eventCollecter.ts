type SfdEvent = {
  fileName: String;
  row: number;
  column: number;
  isAsync: Boolean;
  isGenerator: Boolean;
  funcName: String;
  time: number;
  endTime: number;
  duration: number;
  timeFromInitTime: number;
  endTimeFromInitTime: number;
  count: number;
};

export default class EventCollecter {

  static maxDuration = 0;
  static maxCount = 0

  static init(maxDuration: number, maxCount: number, onReport?: (e: SfdEvent) => void) {
    EventCollecter.maxDuration = maxDuration;
    EventCollecter.maxCount = maxCount;
    if (onReport !== undefined) {
      EventCollecter.onReport = onReport;
    }
  }

  static onReport(e: SfdEvent) {
    console.info(`SDF: ${e.duration} startTime[${e.timeFromInitTime}] count[${e.count}] async[${e.isAsync || e.isGenerator}] ${e.funcName} ${e.fileName}`)
  }

  static initTime: number = 0;

  static counter: Map<String, number> = new Map();

  // 接受事件
  static receiveEvent(e: SfdEvent) {

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

    if (e.duration > EventCollecter.maxDuration || e.count > EventCollecter.maxCount) {
      EventCollecter.onReport(e);
    }
  }
}

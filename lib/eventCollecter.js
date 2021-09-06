"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class EventCollecter {
  // 防止堆栈溢出
  static init(maxDuration, maxCount, onReport) {
    EventCollecter.maxDuration = maxDuration;
    EventCollecter.maxCount = maxCount;

    if (onReport !== undefined) {
      EventCollecter.onReport = onReport;
    }
  }

  static onReport(e) {
    console.info(`SDF: 时长[${e.duration}] 开始时间[${e.timeFromInitTime}] 调用测试[${e.count}] 开始结束次序[${e.startSeq}-${e.endSeq}] 异步[${e.isAsync || e.isGenerator}] 方法名[${e.funcName}] 文件名 ${e.fileName}`);
  }

  // 接受事件
  static receiveEvent(e) {
    if (EventCollecter.isReporting) {
      return;
    } // 设置时间比较基准


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

exports.default = EventCollecter;

_defineProperty(EventCollecter, "isReporting", false);

_defineProperty(EventCollecter, "maxDuration", 0);

_defineProperty(EventCollecter, "maxCount", 0);

_defineProperty(EventCollecter, "initTime", 0);

_defineProperty(EventCollecter, "startSeq", 0);

_defineProperty(EventCollecter, "endSeq", 0);

_defineProperty(EventCollecter, "counter", new Map());
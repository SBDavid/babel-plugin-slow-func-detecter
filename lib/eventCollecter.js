"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class EventCollecter {
  static init(maxDuration, maxCount, onReport) {
    EventCollecter.maxDuration = maxDuration;
    EventCollecter.maxCount = maxCount;

    if (onReport !== undefined) {
      EventCollecter.onReport = onReport;
    }
  }

  static onReport(e) {
    console.info(`SDF: ${e.duration} startTime[${e.timeFromInitTime}] count[${e.count}] seq[${e.startSeq}-${e.endSeq}] async[${e.isAsync || e.isGenerator}] ${e.funcName} ${e.fileName}`);
  }

  // 接受事件
  static receiveEvent(e) {
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

exports.default = EventCollecter;

_defineProperty(EventCollecter, "maxDuration", 0);

_defineProperty(EventCollecter, "maxCount", 0);

_defineProperty(EventCollecter, "initTime", 0);

_defineProperty(EventCollecter, "startSeq", 0);

_defineProperty(EventCollecter, "endSeq", 0);

_defineProperty(EventCollecter, "counter", new Map());
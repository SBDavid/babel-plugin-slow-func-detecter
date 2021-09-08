declare type SfdEvent = {
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
    startSeq: number;
    endSeq: number;
};
export default class EventCollecter {
    static isReporting: boolean;
    static maxDuration: number;
    static maxCount: number;
    static init(maxDuration: number, maxCount: number, onReport?: (e: SfdEvent) => void): void;
    static onReport(e: SfdEvent): void;
    static initTime: number;
    static startSeq: number;
    static endSeq: number;
    static counter: Map<String, number>;
    static receiveEvent(e: SfdEvent): void;
}
export {};

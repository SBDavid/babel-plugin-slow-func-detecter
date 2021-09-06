import type { NodePath, PluginPass } from '@babel/core';
import type { Function, Statement, Identifier } from "@babel/types";
export default class Helper {
    static fileFilter(filename: string | null | undefined): boolean;
    static buildPreInject(varName: Identifier, path: NodePath<Function>, state: PluginPass, basedir: String, funcName?: String): Statement[];
    static buildPostInject(varName: Identifier): Statement;
    static printTransformInfo(path: NodePath<Function>, state: PluginPass, opt: any, basedir: String, funcName?: String): void;
    static getFilePath(path: NodePath<Function>, state: PluginPass, basedir: String): string;
}

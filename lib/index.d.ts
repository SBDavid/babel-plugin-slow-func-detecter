import type { NodePath, PluginPass } from "@babel/core";
import * as t from '@babel/types';
declare const _default: (api: object, options: Record<string, any> | null | undefined, dirname: string) => {
    visitor: {
        Program(this: PluginPass, path: NodePath<t.Program>, state: PluginPass): void;
    };
};
export default _default;

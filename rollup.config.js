import pkg from './package.json';
import json from 'rollup-plugin-json';
import nodeResolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

export default {
    input: "./src/index.ts",
    output: {
        file: pkg.main,
        format: 'umd',
        name:"SnakeGame",
        sourcemap:true,
    },
    plugins: [
        json(),
        nodeResolve(),
        typescript({
            tsconfigDefaults: {
                "compilerOptions": {
                    "target": "es2015",
                    "module": "es2015",
                }
            }
        }),
        terser()
    ]
};
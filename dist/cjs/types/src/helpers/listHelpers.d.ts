import { TextController, TextState } from "../types/CommandOptions";
export type AlterLineFunction = (line: string, index: number) => string;
export declare function makeList(state0: TextState, textController: TextController, insertBefore: string | AlterLineFunction): void;

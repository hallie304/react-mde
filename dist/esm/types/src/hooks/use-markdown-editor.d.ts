import React from "react";
import { CommandController } from "../commands/command-controller";
import { TextController } from "../types/CommandOptions";
import { CommandMap } from "../commands/command";
export type UseTextAreaMarkdownEditorResult<CommandName extends string> = {
    ref: React.RefObject<HTMLTextAreaElement>;
    textController: TextController;
    commandController: CommandController<CommandName>;
};
export type UseTextAreaMarkdownEditorOptions<CommandName extends string> = {
    commandMap: CommandMap<CommandName>;
};
export declare function useTextAreaMarkdownEditor<CommandName extends string>(options: UseTextAreaMarkdownEditorOptions<CommandName>): UseTextAreaMarkdownEditorResult<CommandName>;

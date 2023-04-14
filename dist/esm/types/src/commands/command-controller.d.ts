import { TextController } from "../types/CommandOptions";
import { CommandContext, CommandMap } from "./command";
export declare class CommandController<CommandName extends string> {
    private readonly textController;
    private readonly commandMap;
    /**
     * Indicates whether there is a command currently executing
     */
    isExecuting: boolean;
    constructor(textController: TextController, commandMap: CommandMap<CommandName>);
    executeCommand(commandName: CommandName, context?: CommandContext): Promise<void>;
}

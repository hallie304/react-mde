import { TextController, TextState } from "../types/CommandOptions";
import * as React from "react";
import { SelectionRange } from "../types/SelectionRange";
export declare class TextAreaTextController implements TextController {
    textAreaRef: React.RefObject<HTMLTextAreaElement>;
    constructor(textAreaRef: React.RefObject<HTMLTextAreaElement>);
    replaceSelection(text: string): TextState;
    setSelectionRange(selection: SelectionRange): TextState;
    getState(): TextState;
}
export declare function getStateFromTextArea(textArea: HTMLTextAreaElement): TextState;
/**
 * Inserts the given text at the cursor. If the element contains a selection, the selection
 * will be replaced by the text.
 *    The MIT License
 *    Copyright (c) 2018 Dmitriy Kubyshkin
 *    Copied from https://github.com/grassator/insert-text-at-cursor
 */
export declare function insertText(input: HTMLTextAreaElement | HTMLInputElement, text: string): void;

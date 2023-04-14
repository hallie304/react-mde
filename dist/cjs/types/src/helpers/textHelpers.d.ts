import { SelectionRange } from "../types/SelectionRange";
import { TextState } from "../types/CommandOptions";
import { AlterLineFunction } from "./listHelpers";
/**
 * A list of helpers for manipulating markdown text.
 * These helpers do not interface with a textarea. For that, see
 */
export declare function getSurroundingWord(text: string, position: number): SelectionRange;
/**
 * If the cursor is inside a word and (selection.start === selection.end)
 * returns a new Selection where the whole word is selected
 * @param text
 * @param selection
 */
export declare function selectWord({ text, selection }: TextState): SelectionRange;
/**
 *  Gets the number of line-breaks that would have to be inserted before the given 'startPosition'
 *  to make sure there's an empty line between 'startPosition' and the previous text
 */
export declare function getBreaksNeededForEmptyLineBefore(text: string | undefined, startPosition: number): number;
/**
 *  Gets the number of line-breaks that would have to be inserted after the given 'startPosition'
 *  to make sure there's an empty line between 'startPosition' and the next text
 */
export declare function getBreaksNeededForEmptyLineAfter(text: string | undefined, startPosition: number): number;
export declare function getSelectedText(textSection: TextState): string;
export declare function getCharactersBeforeSelection(textState: TextState, characters: number): string;
export declare function getCharactersAfterSelection(textState: TextState, characters: number): string;
/**
 * Inserts insertionString before each line
 */
export declare function insertBeforeEachLine(selectedText: string, insertBefore: string | AlterLineFunction): {
    modifiedText: string;
    insertionLength: number;
};

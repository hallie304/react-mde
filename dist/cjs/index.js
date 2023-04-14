'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('react');

/**
 * A list of helpers for manipulating markdown text.
 * These helpers do not interface with a textarea. For that, see
 */
function getSurroundingWord(text, position) {
    if (!text)
        throw Error("Argument 'text' should be truthy");
    var isWordDelimiter = function (c) { return c === " " || c.charCodeAt(0) === 10; };
    // leftIndex is initialized to 0 because if selection is 0, it won't even enter the iteration
    var start = 0;
    // rightIndex is initialized to text.length because if selection is equal to text.length it won't even enter the interation
    var end = text.length;
    // iterate to the left
    for (var i = position; i - 1 > -1; i--) {
        if (isWordDelimiter(text[i - 1])) {
            start = i;
            break;
        }
    }
    // iterate to the right
    for (var i = position; i < text.length; i++) {
        if (isWordDelimiter(text[i])) {
            end = i;
            break;
        }
    }
    return { start: start, end: end };
}
/**
 * If the cursor is inside a word and (selection.start === selection.end)
 * returns a new Selection where the whole word is selected
 * @param text
 * @param selection
 */
function selectWord(_a) {
    var text = _a.text, selection = _a.selection;
    if (text && text.length && selection.start === selection.end) {
        // the user is pointing to a word
        return getSurroundingWord(text, selection.start);
    }
    return selection;
}
/**
 *  Gets the number of line-breaks that would have to be inserted before the given 'startPosition'
 *  to make sure there's an empty line between 'startPosition' and the previous text
 */
function getBreaksNeededForEmptyLineBefore(text, startPosition) {
    if (text === void 0) { text = ""; }
    if (startPosition === 0)
        return 0;
    // rules:
    // - If we're in the first line, no breaks are needed
    // - Otherwise there must be 2 breaks before the previous character. Depending on how many breaks exist already, we
    //      may need to insert 0, 1 or 2 breaks
    var neededBreaks = 2;
    var isInFirstLine = true;
    for (var i = startPosition - 1; i >= 0 && neededBreaks >= 0; i--) {
        switch (text.charCodeAt(i)) {
            case 32: // blank space
                continue;
            case 10: // line break
                neededBreaks--;
                isInFirstLine = false;
                break;
            default:
                return neededBreaks;
        }
    }
    return isInFirstLine ? 0 : neededBreaks;
}
/**
 *  Gets the number of line-breaks that would have to be inserted after the given 'startPosition'
 *  to make sure there's an empty line between 'startPosition' and the next text
 */
function getBreaksNeededForEmptyLineAfter(text, startPosition) {
    if (text === void 0) { text = ""; }
    if (startPosition === text.length - 1)
        return 0;
    // rules:
    // - If we're in the first line, no breaks are needed
    // - Otherwise there must be 2 breaks before the previous character. Depending on how many breaks exist already, we
    //      may need to insert 0, 1 or 2 breaks
    var neededBreaks = 2;
    var isInLastLine = true;
    for (var i = startPosition; i < text.length && neededBreaks >= 0; i++) {
        switch (text.charCodeAt(i)) {
            case 32:
                continue;
            case 10: {
                neededBreaks--;
                isInLastLine = false;
                break;
            }
            default:
                return neededBreaks;
        }
    }
    return isInLastLine ? 0 : neededBreaks;
}
function getSelectedText(textSection) {
    return textSection.text.slice(textSection.selection.start, textSection.selection.end);
}
function getCharactersBeforeSelection(textState, characters) {
    return textState.text.slice(textState.selection.start - characters, textState.selection.start);
}
function getCharactersAfterSelection(textState, characters) {
    return textState.text.slice(textState.selection.end, textState.selection.end + characters);
}
/**
 * Inserts insertionString before each line
 */
function insertBeforeEachLine(selectedText, insertBefore) {
    var lines = selectedText.split(/\n/);
    var insertionLength = 0;
    var modifiedText = lines
        .map(function (item, index) {
        if (typeof insertBefore === "string") {
            insertionLength += insertBefore.length;
            return insertBefore + item;
        }
        else if (typeof insertBefore === "function") {
            var insertionResult = insertBefore(item, index);
            insertionLength += insertionResult.length;
            return insertBefore(item, index) + item;
        }
        throw Error("insertion is expected to be either a string or a function");
    })
        .join("\n");
    return { modifiedText: modifiedText, insertionLength: insertionLength };
}

var textHelpers = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getSurroundingWord: getSurroundingWord,
    selectWord: selectWord,
    getBreaksNeededForEmptyLineBefore: getBreaksNeededForEmptyLineBefore,
    getBreaksNeededForEmptyLineAfter: getBreaksNeededForEmptyLineAfter,
    getSelectedText: getSelectedText,
    getCharactersBeforeSelection: getCharactersBeforeSelection,
    getCharactersAfterSelection: getCharactersAfterSelection,
    insertBeforeEachLine: insertBeforeEachLine
});

function setHeader(initialState, api, prefix) {
    // Adjust the selection to encompass the whole word if the caret is inside one
    var newSelectionRange = selectWord({
        text: initialState.text,
        selection: initialState.selection
    });
    var state1 = api.setSelectionRange(newSelectionRange);
    // Add the prefix to the selection
    var state2 = api.replaceSelection("".concat(prefix).concat(getSelectedText(state1)));
    // Adjust the selection to not contain the prefix
    api.setSelectionRange({
        start: state2.selection.end - getSelectedText(state1).length,
        end: state2.selection.end
    });
}

var headerHelpers = /*#__PURE__*/Object.freeze({
    __proto__: null,
    setHeader: setHeader
});

var headingLevel1Command = {
    execute: function (_a) {
        var initialState = _a.initialState, textApi = _a.textApi;
        setHeader(initialState, textApi, "# ");
    }
};

var boldCommand = {
    shouldUndo: function (options) {
        return (getCharactersBeforeSelection(options.initialState, 2) === "**" &&
            getCharactersAfterSelection(options.initialState, 2) === "**");
    },
    execute: function (_a) {
        var initialState = _a.initialState, textApi = _a.textApi;
        // Adjust the selection to encompass the whole word if the caret is inside one
        var newSelectionRange = selectWord({
            text: initialState.text,
            selection: initialState.selection
        });
        var state1 = textApi.setSelectionRange(newSelectionRange);
        // Replaces the current selection with the bold mark up
        var state2 = textApi.replaceSelection("**".concat(getSelectedText(state1), "**"));
        // Adjust the selection to not contain the **
        textApi.setSelectionRange({
            start: state2.selection.end - 2 - getSelectedText(state1).length,
            end: state2.selection.end - 2
        });
    },
    undo: function (_a) {
        var initialState = _a.initialState, textApi = _a.textApi;
        var text = getSelectedText(initialState);
        textApi.setSelectionRange({
            start: initialState.selection.start - 2,
            end: initialState.selection.end + 2
        });
        textApi.replaceSelection(text);
        textApi.setSelectionRange({
            start: initialState.selection.start - 2,
            end: initialState.selection.end - 2
        });
    }
};

var italicCommand = {
    shouldUndo: function (options) {
        return (getCharactersBeforeSelection(options.initialState, 1) === "*" &&
            getCharactersAfterSelection(options.initialState, 1) === "*");
    },
    execute: function (_a) {
        var initialState = _a.initialState, textApi = _a.textApi;
        // Adjust the selection to encompass the whole word if the caret is inside one
        var newSelectionRange = selectWord({
            text: initialState.text,
            selection: initialState.selection
        });
        var state1 = textApi.setSelectionRange(newSelectionRange);
        // Replaces the current selection with the italic mark up
        var state2 = textApi.replaceSelection("*".concat(getSelectedText(state1), "*"));
        // Adjust the selection to not contain the *
        textApi.setSelectionRange({
            start: state2.selection.end - 1 - getSelectedText(state1).length,
            end: state2.selection.end - 1
        });
    },
    undo: function (_a) {
        var initialState = _a.initialState, textApi = _a.textApi;
        var text = getSelectedText(initialState);
        textApi.setSelectionRange({
            start: initialState.selection.start - 1,
            end: initialState.selection.end + 1
        });
        textApi.replaceSelection(text);
        textApi.setSelectionRange({
            start: initialState.selection.start - 1,
            end: initialState.selection.end - 1
        });
    }
};

var strikethroughCommand = {
    execute: function (_a) {
        var initialState = _a.initialState, textApi = _a.textApi;
        // Adjust the selection to encompass the whole word if the caret is inside one
        var newSelectionRange = selectWord({
            text: initialState.text,
            selection: initialState.selection
        });
        var state1 = textApi.setSelectionRange(newSelectionRange);
        // Replaces the current selection with the strikethrough mark up
        var state2 = textApi.replaceSelection("~~".concat(getSelectedText(state1), "~~"));
        // Adjust the selection to not contain the ~~
        textApi.setSelectionRange({
            start: state2.selection.end - 2 - getSelectedText(state1).length,
            end: state2.selection.end - 2
        });
    }
};

var linkCommand = {
    execute: function (_a) {
        var initialState = _a.initialState, textApi = _a.textApi;
        // Adjust the selection to encompass the whole word if the caret is inside one
        var newSelectionRange = selectWord({
            text: initialState.text,
            selection: initialState.selection
        });
        var state1 = textApi.setSelectionRange(newSelectionRange);
        // Replaces the current selection with the bold mark up
        var state2 = textApi.replaceSelection("[".concat(getSelectedText(state1), "](url)"));
        // Adjust the selection to not contain the **
        textApi.setSelectionRange({
            start: state2.selection.end - 6 - getSelectedText(state1).length,
            end: state2.selection.end - 6
        });
    }
};

var quoteCommand = {
    execute: function (_a) {
        var initialState = _a.initialState, textApi = _a.textApi;
        // Adjust the selection to encompass the whole word if the caret is inside one
        var newSelectionRange = selectWord({
            text: initialState.text,
            selection: initialState.selection
        });
        var state1 = textApi.setSelectionRange(newSelectionRange);
        var breaksBeforeCount = getBreaksNeededForEmptyLineBefore(state1.text, state1.selection.start);
        var breaksBefore = Array(breaksBeforeCount + 1).join("\n");
        var breaksAfterCount = getBreaksNeededForEmptyLineAfter(state1.text, state1.selection.end);
        var breaksAfter = Array(breaksAfterCount + 1).join("\n");
        // Replaces the current selection with the quote mark up
        textApi.replaceSelection("".concat(breaksBefore, "> ").concat(getSelectedText(state1)).concat(breaksAfter));
        var selectionStart = state1.selection.start + breaksBeforeCount + 2;
        var selectionEnd = selectionStart + getSelectedText(state1).length;
        textApi.setSelectionRange({
            start: selectionStart,
            end: selectionEnd
        });
    }
};

var imageCommand = {
    execute: function (_a) {
        var initialState = _a.initialState, textApi = _a.textApi;
        // Replaces the current selection with the whole word selected
        var state1 = textApi.setSelectionRange(selectWord({
            text: initialState.text,
            selection: initialState.selection
        }));
        // Replaces the current selection with the image
        var imageTemplate = getSelectedText(state1) || "https://example.com/your-image.png";
        textApi.replaceSelection("![](".concat(imageTemplate, ")"));
        // Adjust the selection to not contain the **
        textApi.setSelectionRange({
            start: state1.selection.start + 4,
            end: state1.selection.start + 4 + imageTemplate.length
        });
    }
};

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var CommandController = /** @class */ (function () {
    function CommandController(textController, commandMap) {
        /**
         * Indicates whether there is a command currently executing
         */
        this.isExecuting = false;
        this.textController = textController;
        this.commandMap = commandMap;
    }
    CommandController.prototype.executeCommand = function (commandName, context) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var command, executeOptions;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.isExecuting) {
                            // The simplest thing to do is to ignore commands while
                            // there is already a command execu
                            // ting. The alternative would be to queue commands
                            // but there is no guarantee that the state after one command executes will still be compatible
                            // with the next one. In fact, it is likely not to be.
                            return [2 /*return*/];
                        }
                        command = this.commandMap[commandName];
                        if (!command) {
                            throw new Error("Cannot execute command. Command not found: ".concat(commandName));
                        }
                        executeOptions = {
                            initialState: this.textController.getState(),
                            textApi: this.textController
                        };
                        if (!(((_a = command.shouldUndo) === null || _a === void 0 ? void 0 : _a.call(command, executeOptions)) && (command === null || command === void 0 ? void 0 : command.undo))) return [3 /*break*/, 1];
                        command.undo(executeOptions);
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, command.execute(executeOptions)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return CommandController;
}());

var TextAreaTextController = /** @class */ (function () {
    function TextAreaTextController(textAreaRef) {
        this.textAreaRef = textAreaRef;
    }
    TextAreaTextController.prototype.replaceSelection = function (text) {
        var textArea = this.textAreaRef.current;
        if (!textArea) {
            throw new Error("TextAreaRef is not set");
        }
        insertText(textArea, text);
        return getStateFromTextArea(textArea);
    };
    TextAreaTextController.prototype.setSelectionRange = function (selection) {
        var textArea = this.textAreaRef.current;
        if (!textArea) {
            throw new Error("TextAreaRef is not set");
        }
        textArea.focus();
        textArea.selectionStart = selection.start;
        textArea.selectionEnd = selection.end;
        return getStateFromTextArea(textArea);
    };
    TextAreaTextController.prototype.getState = function () {
        var textArea = this.textAreaRef.current;
        if (!textArea) {
            throw new Error("TextAreaRef is not set");
        }
        return getStateFromTextArea(textArea);
    };
    return TextAreaTextController;
}());
function getStateFromTextArea(textArea) {
    return {
        selection: {
            start: textArea.selectionStart,
            end: textArea.selectionEnd
        },
        text: textArea.value
    };
}
/**
 * Inserts the given text at the cursor. If the element contains a selection, the selection
 * will be replaced by the text.
 *    The MIT License
 *    Copyright (c) 2018 Dmitriy Kubyshkin
 *    Copied from https://github.com/grassator/insert-text-at-cursor
 */
function insertText(input, text) {
    var _a;
    // Most of the used APIs only work with the field selected
    input.focus();
    // IE 8-10
    if (document.selection) {
        var ieRange = document.selection.createRange();
        ieRange.text = text;
        // Move cursor after the inserted text
        ieRange.collapse(false /* to the end */);
        ieRange.select();
        return;
    }
    // Webkit + Edge
    var isSuccess = document.execCommand("insertText", false, text);
    if (!isSuccess) {
        var start = input.selectionStart || 0;
        var end = input.selectionEnd || 0;
        // Firefox (non-standard method)
        if (typeof input.setRangeText === "function") {
            input.setRangeText(text);
        }
        else {
            if (canManipulateViaTextNodes(input)) {
                var textNode = document.createTextNode(text);
                var node = input.firstChild;
                // If textarea is empty, just insert the text
                if (!node) {
                    input.appendChild(textNode);
                }
                else {
                    // Otherwise, we need to find a nodes for start and end
                    var offset = 0;
                    var startNode = null;
                    var endNode = null;
                    // To make a change we just need a Range, not a Selection
                    var range = document.createRange();
                    while (node && (startNode === null || endNode === null)) {
                        var nodeLength = ((_a = node.nodeValue) === null || _a === void 0 ? void 0 : _a.length) || 0;
                        // if start of the selection falls into current node
                        if (start >= offset && start <= offset + nodeLength) {
                            range.setStart((startNode = node), start - offset);
                        }
                        // if end of the selection falls into current node
                        if (end >= offset && end <= offset + nodeLength) {
                            range.setEnd((endNode = node), end - offset);
                        }
                        offset += nodeLength;
                        node = node.nextSibling;
                    }
                    // If there is some text selected, remove it as we should replace it
                    if (start !== end) {
                        range.deleteContents();
                    }
                    // Finally insert a new node. The browser will automatically
                    // split start and end nodes into two if necessary
                    range.insertNode(textNode);
                }
            }
            else {
                // For the text input the only way is to replace the whole value :(
                var value = input.value;
                input.value = value.slice(0, start) + text + value.slice(end);
            }
        }
        // Correct the cursor position to be at the end of the insertion
        input.setSelectionRange(start + text.length, start + text.length);
        // Notify any possible listeners of the change
        var e = document.createEvent("UIEvent");
        e.initEvent("input", true, false);
        input.dispatchEvent(e);
    }
}
/**
 *    The MIT License
 *    Copyright (c) 2018 Dmitriy Kubyshkin
 *    Copied from https://github.com/grassator/insert-text-at-cursor
 */
function canManipulateViaTextNodes(input) {
    if (input.nodeName !== "TEXTAREA") {
        return false;
    }
    var browserSupportsTextareaTextNodes;
    if (typeof browserSupportsTextareaTextNodes === "undefined") {
        var textarea = document.createElement("textarea");
        textarea.value = "1";
        browserSupportsTextareaTextNodes = !!textarea.firstChild;
    }
    return browserSupportsTextareaTextNodes;
}

function makeList(state0, textController, insertBefore) {
    // Adjust the selection to encompass the whole word if the caret is inside one
    var newSelectionRange = selectWord({
        text: state0.text,
        selection: state0.selection
    });
    var state1 = textController.setSelectionRange(newSelectionRange);
    var breaksBeforeCount = getBreaksNeededForEmptyLineBefore(state1.text, state1.selection.start);
    var breaksBefore = Array(breaksBeforeCount + 1).join("\n");
    var breaksAfterCount = getBreaksNeededForEmptyLineAfter(state1.text, state1.selection.end);
    var breaksAfter = Array(breaksAfterCount + 1).join("\n");
    var modifiedText = insertBeforeEachLine(getSelectedText(state1), insertBefore);
    textController.replaceSelection("".concat(breaksBefore).concat(modifiedText.modifiedText).concat(breaksAfter));
    // Specifically when the text has only one line, we can exclude the "- ", for example, from the selection
    var oneLinerOffset = getSelectedText(state1).indexOf("\n") === -1
        ? modifiedText.insertionLength
        : 0;
    var selectionStart = state1.selection.start + breaksBeforeCount + oneLinerOffset;
    var selectionEnd = selectionStart + modifiedText.modifiedText.length - oneLinerOffset;
    // Adjust the selection to not contain the **
    textController.setSelectionRange({
        start: selectionStart,
        end: selectionEnd
    });
}

var listHelpers = /*#__PURE__*/Object.freeze({
    __proto__: null,
    makeList: makeList
});

var codeCommand = {
    shouldUndo: function (options) {
        return (getCharactersBeforeSelection(options.initialState, 1) === "`" &&
            getCharactersAfterSelection(options.initialState, 1) === "`");
    },
    execute: function (_a) {
        var initialState = _a.initialState, textApi = _a.textApi;
        // Adjust the selection to encompass the whole word if the caret is inside one
        var newSelectionRange = selectWord({
            text: initialState.text,
            selection: initialState.selection
        });
        var state1 = textApi.setSelectionRange(newSelectionRange);
        // Replaces the current selection with the italic mark up
        var state2 = textApi.replaceSelection("`".concat(getSelectedText(state1), "`"));
        // Adjust the selection to not contain the *
        textApi.setSelectionRange({
            start: state2.selection.end - 1 - getSelectedText(state1).length,
            end: state2.selection.end - 1
        });
    },
    undo: function (_a) {
        var initialState = _a.initialState, textApi = _a.textApi;
        var text = getSelectedText(initialState);
        textApi.setSelectionRange({
            start: initialState.selection.start - 1,
            end: initialState.selection.end + 1
        });
        textApi.replaceSelection(text);
        textApi.setSelectionRange({
            start: initialState.selection.start - 1,
            end: initialState.selection.end - 1
        });
    }
};

function useTextAreaMarkdownEditor(options) {
    var textAreaRef = react.useRef(null);
    var textController = react.useMemo(function () {
        return new TextAreaTextController(textAreaRef);
    }, [textAreaRef]);
    var commandController = react.useMemo(function () { return new CommandController(textController, options.commandMap); }, [textAreaRef]);
    return {
        textController: textController,
        commandController: commandController,
        ref: textAreaRef
    };
}

var codeBlockCommand = {
    execute: function (_a) {
        var textApi = _a.textApi, initialState = _a.initialState;
        return __awaiter(void 0, void 0, void 0, function () {
            var newSelectionRange, state1, selectionStart_1, selectionEnd_1, breaksBeforeCount, breaksBefore, breaksAfterCount, breaksAfter, selectionStart, selectionEnd;
            return __generator(this, function (_b) {
                newSelectionRange = selectWord({
                    text: initialState.text,
                    selection: initialState.selection
                });
                state1 = textApi.setSelectionRange(newSelectionRange);
                // when there's no breaking line
                if (getSelectedText(state1).indexOf("\n") === -1) {
                    textApi.replaceSelection("`".concat(getSelectedText(state1), "`"));
                    selectionStart_1 = state1.selection.start + 1;
                    selectionEnd_1 = selectionStart_1 + getSelectedText(state1).length;
                    textApi.setSelectionRange({
                        start: selectionStart_1,
                        end: selectionEnd_1
                    });
                    return [2 /*return*/];
                }
                breaksBeforeCount = getBreaksNeededForEmptyLineBefore(state1.text, state1.selection.start);
                breaksBefore = Array(breaksBeforeCount + 1).join("\n");
                breaksAfterCount = getBreaksNeededForEmptyLineAfter(state1.text, state1.selection.end);
                breaksAfter = Array(breaksAfterCount + 1).join("\n");
                textApi.replaceSelection("".concat(breaksBefore, "```\n").concat(getSelectedText(state1), "\n```").concat(breaksAfter));
                selectionStart = state1.selection.start + breaksBeforeCount + 4;
                selectionEnd = selectionStart + getSelectedText(state1).length;
                textApi.setSelectionRange({
                    start: selectionStart,
                    end: selectionEnd
                });
                return [2 /*return*/];
            });
        });
    }
};

var checkedListCommand = {
    execute: function (_a) {
        var initialState = _a.initialState, textApi = _a.textApi;
        makeList(initialState, textApi, function () { return "- [ ] "; });
    }
};

var orderedListCommand = {
    execute: function (_a) {
        var initialState = _a.initialState, textApi = _a.textApi;
        makeList(initialState, textApi, function (item, index) { return "".concat(index + 1, ". "); });
    }
};

var unorderedListCommand = {
    execute: function (_a) {
        var initialState = _a.initialState, textApi = _a.textApi;
        makeList(initialState, textApi, "- ");
    }
};

var headingLevel2Command = {
    execute: function (_a) {
        var initialState = _a.initialState, textApi = _a.textApi;
        setHeader(initialState, textApi, "## ");
    }
};

var headingLevel3Command = {
    execute: function (_a) {
        var initialState = _a.initialState, textApi = _a.textApi;
        setHeader(initialState, textApi, "### ");
    }
};

var headingLevel4Command = {
    execute: function (_a) {
        var initialState = _a.initialState, textApi = _a.textApi;
        setHeader(initialState, textApi, "#### ");
    }
};

var headingLevel5Command = {
    execute: function (_a) {
        var initialState = _a.initialState, textApi = _a.textApi;
        setHeader(initialState, textApi, "##### ");
    }
};

var headingLevel6Command = {
    execute: function (_a) {
        var initialState = _a.initialState, textApi = _a.textApi;
        setHeader(initialState, textApi, "###### ");
    }
};

exports.CommandController = CommandController;
exports.TextAreaTextController = TextAreaTextController;
exports.boldCommand = boldCommand;
exports.checkedListCommand = checkedListCommand;
exports.codeBlockCommand = codeBlockCommand;
exports.codeCommand = codeCommand;
exports.headerHelpers = headerHelpers;
exports.headingLevel1Command = headingLevel1Command;
exports.headingLevel2Command = headingLevel2Command;
exports.headingLevel3Command = headingLevel3Command;
exports.headingLevel4Command = headingLevel4Command;
exports.headingLevel5Command = headingLevel5Command;
exports.headingLevel6Command = headingLevel6Command;
exports.imageCommand = imageCommand;
exports.italicCommand = italicCommand;
exports.linkCommand = linkCommand;
exports.listHelpers = listHelpers;
exports.orderedListCommand = orderedListCommand;
exports.quoteCommand = quoteCommand;
exports.strikethroughCommand = strikethroughCommand;
exports.textHelpers = textHelpers;
exports.unorderedListCommand = unorderedListCommand;
exports.useTextAreaMarkdownEditor = useTextAreaMarkdownEditor;
//# sourceMappingURL=index.js.map

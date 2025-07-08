import {
    App,
    DropdownComponent,
    Modal,
    TFile
} from "obsidian";
import AnkiIntegration from "../main";
import {
    AddContainer,
    AddSubtitle,
    AddTitle
} from "../utils";
import {
    GenerateFieldGroups,
    AddDeckSelector,
    AddModelSelector,
    AddSubmitButton,
    AddTagsSection,
    AutoAssignDeck,
    AutoAssignModel,
    AutoGenerateFields,
    AddTagInputGroup
} from "./addNoteModalsUtils";

/**
 * A modal dialog for creating a new Anki note by using a code block content as pre-filled values.
 *
 * @description
 * It provides options to select a deck and a model, and dynamically generates input fields based on the selected model's configuration.
 * It will pre-select both the deck to add the note in and the model to use to create the note by parsing the content of a code block using "AnkiIntegration" as language.
 * It will autofill fields of the note by parsing the content of a code block using "AnkiIntegration" as language.
 * It allows users to enter information and submit the data to create a new note.
 *
 * @extends Modal
 */
export class AddNoteFromCodeBlockModal extends Modal {
    /**
     * @type {AnkiIntegration}
     * @description The plugin instance associated with the modal.
     */
    plugin: AnkiIntegration;

    constructor(app: App, plugin: AnkiIntegration) {
        super(app);
        this.plugin = plugin;
    }

    onOpen() {
        /**
         * @type {Object} ankiData
         * @description The Anki dataset containing decks and models information.
         */
        const ankiData: Object = this.plugin.settings.ankiData;

        const { contentEl } = this;
        this.contentEl.focus();

        AddTitle(contentEl, "Add a new note using code block");
        AddSubtitle(contentEl, "Deck & Model");

        const dropdownContainer: HTMLDivElement = AddContainer(contentEl, ["ankiIntegrationModal__dropdownContainer--flex"])
        const deckSelector: DropdownComponent = AddDeckSelector(dropdownContainer, ankiData);
        const modelSelector: DropdownComponent = AddModelSelector(dropdownContainer, ankiData);
        const tagsContainer: HTMLDivElement = AddTagsSection(contentEl);
        const tagsBody: HTMLDivElement = tagsContainer.querySelector('#tagsBody');
        const tagsBodyParagraph: HTMLElement = tagsContainer.querySelector('#tagsBodyTip');

        AddSubtitle(contentEl, "Fields");
        const inputFieldsContainer: HTMLDivElement = AddContainer(contentEl, ["ankiIntegrationModal__inputContainer--flex"]);

        modelSelector.onChange(async (value) => {
            const codeBlockParameters = await this.GetCodeBlockParameters();
            GenerateFieldGroups(this.plugin, inputFieldsContainer, value, codeBlockParameters);
        });

        this.onOpenAsync(deckSelector, modelSelector, tagsBody, tagsBodyParagraph, inputFieldsContainer);

        AddSubmitButton(contentEl, deckSelector, modelSelector, inputFieldsContainer, this);
    }

    /**
     * Handles the closing of the modal by clearing the content container.
     * Removes all elements within the modal's content area.
     */
    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }

    /**
     * onOpen() async equivalent allowing asynchronous operations.
     * @param {DropdownComponent} deckSelector - Dropdown component that allows the user to select a deck.
     * @param {DropdownComponent} modelSelector - Dropdown component that allows the user to select a model.
     * @param {HTMLDivElement} tagsBody - Speaking for itself.
     * @param {HTMLDivElement} inputContainer - Speaking for itself.
     */
    async onOpenAsync(deckSelector: DropdownComponent, modelSelector: DropdownComponent, tagsBody: HTMLDivElement, tagsBodyParagraph: HTMLElement, inputContainer: HTMLDivElement): Promise<void> {
        const codeBlockParameters: Object = await this.GetCodeBlockParameters();
        if (!codeBlockParameters) {
            GenerateFieldGroups(this.plugin, inputContainer, modelSelector.getValue(), null);
        } else {
            AutoAssignDeck(deckSelector, codeBlockParameters);
            AutoAssignModel(modelSelector, codeBlockParameters);
            if (codeBlockParameters["tags"] != null) {
                if (codeBlockParameters["tags"].length > 0) {
                    tagsBody.removeChild(tagsBody.children[0]);
                }
                for (let i = 0; i < codeBlockParameters["tags"].length; i++) {
                    AddTagInputGroup(tagsBody, tagsBodyParagraph, codeBlockParameters["tags"][i]);
                }
            }
            AutoGenerateFields(this, modelSelector, inputContainer, codeBlockParameters);
        }
    }

    /**
     * Return the note's parameters defined in the code block.
     * @description Method that :
     * - retrieve the first code block using "AnkiIntegration" as its language in the open and currently active file in the instance of Obsidian.
     * - extract each lines following a "key: value;" or "key: "value";" and push it an object that is returned by the function.
     * @return {Object} codeBlockParameters
     */
    async GetCodeBlockParameters(): Promise<Object> {
        const activeFileData: TFile = this.app.workspace.getActiveFile();
        if (!activeFileData) return;
        const activeFileContent: string = await this.app.vault.read(activeFileData);
        const codeBlock: string = activeFileContent.match(/(```AnkiIntegration[\s\S]*?```)/)[1];
        const retrieveLinesRegex: RegExp = /^\s*(\w+):\s*(?:"([^"]+)"|([^;]+));/gm;
        const retrieveTagsRegex: RegExp = /"([^"]+)"/g;
        /**
         * @type {Object} codeBlockParameters
         * @description The object that stores all the fields of the note that has to be created, along with their values.
         * @remarks It has ""fields": {}" as a default child in order to store Anki note's fields related data.
         */
        const codeBlockParameters: Object = {
            "fields": {},
            "tags": {}
        };
        let match: Array<string> = []
        while ((match = retrieveLinesRegex.exec(codeBlock)) !== null) {
            const noteChildAttributes: Array<string> = ["deck", "model", "tags"];
            const key: string = match[1];
            const value: string = match[2] || match[3];
            const isKeyATag: boolean = key === "tags";
            const isKeyANoteChildAttribute: boolean = noteChildAttributes.includes(key);
            if (isKeyANoteChildAttribute) {
                codeBlockParameters[key] = isKeyATag ? [] : value;
                if (isKeyATag) {
                    while ((match = retrieveTagsRegex.exec(value)) !== null) {
                        const tag = match[1];
                        codeBlockParameters[key].push(tag);
                    }
                }
            } else {
                codeBlockParameters["fields"][key.toLowerCase()] = value;
            }
        }

        return codeBlockParameters;
    }
}
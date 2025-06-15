import {App, ButtonComponent, DropdownComponent, Modal, TFile} from "obsidian";
import AnkiIntegration from "../main";
import {
    AddButton,
    AddContainer,
    AddDropdown,
    AddFieldGroups,
    AddInput,
    AddOptionsToDropdownFromDataset,
    AddParagraph,
    AddSubtitle, AddTagInputGroup,
    AddTitle,
    AutoAssignDeck,
    AutoAssignModel,
    AutoGenerateFields,
    BuildTagsArray,
    CreateFieldsGroupData,
    FetchModelByName,
    ReadFileContent
} from "../utils";
import {ProcessAddNote} from "../AnkiConnect";

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

    /**
     * Creates a new AddNoteFromCodeBlockModal instance.
     * Initializes the modal with provided app and plugin.
     * @param {App} app - The Obsidian app instance.
     * @param {AnkiIntegration} plugin - The AnkiIntegration plugin instance.
     * @constructor
     */
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

        /**
         * @type {HTMLElement} contentEl
         * @description The main content container of the modal.
         */
        const { contentEl } = this;
        this.contentEl.focus();

        AddTitle(contentEl, "Add a new note using code block");
        AddSubtitle(contentEl, "Deck & Model");

        /**
         * @type {HTMLDivElement} dropdownContainer
         * @description Container for the deck and model dropdown selectors.
         */
        const dropdownContainer: HTMLDivElement = AddContainer(contentEl, [
            "ankiIntegrationModal__dropdownContainer--flex"
        ])

        /**
         * @type {DropdownComponent} deckSelector
         * @description Dropdown allowing the user to select a deck among those that are synchronized.
         */
        const deckSelector: DropdownComponent = AddDropdown(dropdownContainer, "Choose a deck");

        /**
         * @type {string[]} deckKeys
         * @description An array containing the keys of all available decks.
         */
        const deckKeys: string[] = Object.keys(ankiData["decksData"]);
        AddOptionsToDropdownFromDataset(deckSelector, deckKeys, "name", "name", ankiData["decksData"]);

        /**
         * @type {DropdownComponent} modelSelector
         * @description Dropdown allowing the user to select a model among those that are synchronized.
         */
        const modelSelector: DropdownComponent = AddDropdown(dropdownContainer, "Choose a model");

        /**
         * @type {string[]} modelKeys
         * @description An array containing the keys of all available models.
         */
        const modelKeys: string[] = Object.keys(ankiData["modelsData"]);
        AddOptionsToDropdownFromDataset(modelSelector, modelKeys, "name", "name", ankiData["modelsData"]);

        /**
         * @type {HTMLDivElement} tagsHeader
         * @description A container serving as the head part of the tags section.
         */
        const tagsHeader: HTMLDivElement = AddContainer(contentEl, [
            "ankiIntegrationModal__container--flex-row",
            "ankiIntegrationModal__container--flex-align-center",
            "ankiIntegrationModal__container--flex-justify-space-between",
        ]);
        AddSubtitle(tagsHeader, "Tags");
        /**
         * @type {ButtonComponent} addTagFieldButton
         * @description Button used by the user to add a tag field in the pop-up.
         */
        let addTagFieldButton: ButtonComponent = AddButton(tagsHeader, "", "circle-plus");
        addTagFieldButton.buttonEl.removeClasses([
            "ankiIntegrationModal__button--default-width",
            "ankiIntegrationModal__button--default-margin",
            "ankiIntegrationModal__button--default-padding"
        ]);
        /**
         * @type {HTMLDivElement} tagsBody
         * @description A container serving as the body of the tags section.
         */
        const tagsBody: HTMLDivElement = AddContainer(contentEl);
        tagsBody.addClasses([
            "ankiIntegrationModal__container--flex-row",
            "ankiIntegrationModal__container--flex-wrap",
            "ankiIntegrationModal__container--gap-16px"
        ])
        /**
         * @description addTagFieldButton's onClick() event listener used to add a tag input group in tagsBody.
         */
        addTagFieldButton.onClick(async () => {
            /**
             * @type {HTMLDivElement} inputGroup
             * @description A container storing the input field and the delete input field button.
             */
            const tagInputGroup: HTMLDivElement = AddTagInputGroup(tagsBody);
        });

        AddSubtitle(contentEl, "Fields");

        /**
         * @type {HTMLDivElement} inputContainer
         * @description Container for dynamically generated input fields based on the selected model.
         */
        const inputContainer: HTMLDivElement = AddContainer(contentEl, [
            "ankiIntegrationModal__inputContainer--flex"
        ]);

        /**
         * Event listener triggered when the model selector value changes.
         * Updates the inputContainer with the fields corresponding to the selected model.
         * @param {string} value - The selected model name.
         */
        modelSelector.onChange(async (value) => {
            const codeBlockParameters = await this.GetCodeBlockParameters();
            this.AddFieldsGroupsToModal(inputContainer, value, codeBlockParameters);
        });

        this.onOpenAsync(deckSelector, modelSelector, tagsBody, inputContainer);

        /**
         * @type {ButtonComponent} submitButtonEl
         * @description Submit button for the user to add the note.
         */
        const submitButtonEl: ButtonComponent = AddButton(contentEl, "Create Note");

        /**
         * @description
         * "Click" event handler to send the form and trigger ProcessAddNote().
         * @async
         * @param {MouseEvent} event - The click event triggered by the submit button.
         */
        submitButtonEl.onClick(async () => {
            const tags: Array<string> = BuildTagsArray();
            await ProcessAddNote(deckSelector, modelSelector, inputContainer, tags, this);
        });
        /**
         * @description
         * "SHIFT + ENTER" event shortcut handler to send the form and trigger ProcessAddNote().
         * @async
         * @param {KeyboardEvent} event - The registered keys that are pressed when contentEl is open.
         */
        this.contentEl.addEventListener("keydown", async (event) => {
            if (event.shiftKey && event.key === "Enter") {
                const tags: Array<string> = BuildTagsArray();
                await ProcessAddNote(deckSelector, modelSelector, inputContainer, tags, this);
            }
        })
    }

    /**
     * Handles the closing of the modal by clearing the content container.
     * Removes all elements within the modal's content area.
     */
    onClose() {
        /**
         * @type {HTMLElement} contentEl
         * @description The main content container of the modal.
         */
        const { contentEl } = this;

        // Clear the content of the modal.
        contentEl.empty();
    }

    /**
     * Adds as many fields groups as the currently selected model has fields to the modal.
     * @param {HTMLDivElement} inputContainer - DIV containing all the generated inputs.
     * @param {any} selectedValue - Currently selected model select value of the modelSelector (DropdownComponent).
     * @param {any} inputValues - The ??? of the currently active note.
     */
    AddFieldsGroupsToModal(inputContainer: HTMLDivElement, selectedValue: any, inputValues: any) {
        /**
         * @type {Object} selectedModel
         * @description The model object corresponding to the selected model name.
         */
        const selectedModel: Object = FetchModelByName(this.plugin, selectedValue);
        /**
         * @type {Array} fieldsGroupData
         * @description An array of input data storing as separate object (1 object = 1 input) the keys used to create each label-input pair and the values of each input.
         */
        const fieldsGroupData: Array<Object> = [];

        inputContainer.empty();

        /**
         * @description
         * Checks the currently selected option of the dropdown.
         * If its value is default, it displays a message requesting the user to select a model.
         * Else, it means that a model is selected, therefore, it creates the fields groups data and displays them.
         */
        if (selectedValue === "default") {
            AddParagraph(inputContainer, "Select a model to see its fields.");
            return;
        } else {
            if (inputValues) {
                CreateFieldsGroupData(fieldsGroupData, selectedModel["fields"], inputValues);
                console.log(inputValues);
                AddFieldGroups(inputContainer, fieldsGroupData);
            } else {
                CreateFieldsGroupData(fieldsGroupData, selectedModel["fields"]);
                AddFieldGroups(inputContainer, fieldsGroupData);
            }
        }
    }

    /**
     * onOpen() async equivalent allowing asynchronous operations.
     * @param {DropdownComponent} deckSelector - Dropdown component that allows the user to select a deck.
     * @param {DropdownComponent} modelSelector - Dropdown component that allows the user to select a model.
     * @param {HTMLDivElement} tagsBody - Speaking for itself.
     * @param {HTMLDivElement} inputContainer - Speaking for itself.
     */
    async onOpenAsync(deckSelector: DropdownComponent, modelSelector: DropdownComponent, tagsBody: HTMLDivElement, inputContainer: HTMLDivElement): Promise<void> {
        /**
         * @type {Object} codeBlockParameters
         * @description Stores the values parsed by GetCodeBlockParameters().
         */
        const codeBlockParameters: Object = await this.GetCodeBlockParameters();
        // console.log(codeBlockParameters);
        if (!codeBlockParameters) {
            this.AddFieldsGroupsToModal(inputContainer, modelSelector.getValue(), null);
        } else {
            /**
             * @description Functions called to pre-select and pre-fill both dropdowns and input fields.
             */
            AutoAssignDeck(deckSelector, codeBlockParameters);
            AutoAssignModel(modelSelector, codeBlockParameters);
            if (codeBlockParameters["tags"] != null) {
                for (let i = 0; i < codeBlockParameters["tags"].length; i++) {
                    AddTagInputGroup(tagsBody, codeBlockParameters["tags"][i]);
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
        /**
         * @type {TFile} activeFileData
         * @description The open and active file in the current instance of Obsidian.
         * @remarks Since we can't retrieve a code block if no file is opened, if activeFileData is null, we shut down the function.
         */
        const activeFileData: TFile = this.app.workspace.getActiveFile();
        if (!activeFileData) {
            return;
        }
        /**
         * @type {string} activeFileContent
         * @description The whole content of the note.
         */
        const activeFileContent: string = await ReadFileContent(this, activeFileData);
        /**
         * @type {string} codeBlock
         * @description The first code block using "AnkiIntegration" as its language in activeFileContent.
         */
        const codeBlock: string = activeFileContent.match(/(```AnkiIntegration[\s\S]*?```)/)[1];
        /**
         * @type {RegExp} regex
         * @description A regular expression that is used to retrieve each line of the code block using a "Key: Value;" or "Key: "Value";" format.
         */
        const regex: RegExp = /^\s*(\w+):\s*(?:"([^"]+)"|([^;]+));/gm;
        /**
         * @type {RegExp} tagsRegex
         * @description A regular expression used to retrieve tags from the extracted corresponding line.
         */
        const tagsRegex: RegExp = /"([^"]+)"/g;
        /**
         * @type {Object} codeBlockParameters
         * @description The object that stores all the fields of the note that has to be created, along with their values.
         * @remarks It has ""fields": {}" as a default child in order to store Anki note's fields related data.
         */
        const codeBlockParameters: Object = {
            "fields": {},
            "tags": {}
        };
        /**
         * @type {Array} match
         * @description Stores all the result of regex.exec(codeBlock).
         */
        let match: Array<string> = []
        /**
         * @description As long as there are string that match the regex,
         * we add them as field of codeBlockParameters or as field of codeBlockParameters["fields"].
         */
        while ((match = regex.exec(codeBlock)) !== null) {
            /**
             * @type {Array<string>} codeBlockFields
             * @description All the fields that has to be added as direct child fields of codeBlockParameters.
             */
            const codeBlockChildFields: Array<string> = ["deck", "model", "tags"];
            /**
             * @type {string} key
             * @description The key of the item that will be added to codeBlockParameters.
             */
            const key: string = match[1];
            /**
             * @type {string} value
             * @description The value of the item that will be added to codeBlockParameters.
             */
            const value: string = match[2] || match[3];
            /**
             * @description If/else statements allowing to add a value as a direct child of codeBlockParameters or as a direct child of codeBlockParameters["fields"].
             */
            if (codeBlockChildFields.includes(key)) {
                if (key == "tags") {
                    codeBlockParameters[key] = [];
                    while ((match = tagsRegex.exec(value)) !== null) {
                        const tag = match[1];
                        codeBlockParameters[key].push(tag);
                    }
                } else {
                    codeBlockParameters[key] = value;
                }
            } else {
                codeBlockParameters["fields"][key.toLowerCase()] = value;
            }
        }

        return codeBlockParameters;
    }
}
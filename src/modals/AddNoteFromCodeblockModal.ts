import {App, DropdownComponent, Modal, TFile} from "obsidian";
import AnkiIntegration from "../main";
import {
    AddButton,
    AddContainer,
    AddDropdown, AddFieldGroups,
    AddOptionsToDropdownFromDataset, AddParagraph,
    AddSubtitle,
    AddTitle, AutoAssignDeck, AutoAssignModel, AutoGenerateFields, CreateFieldsGroupData, FetchModelByName,
    ReadFileContent
} from "../utils";
import {ProcessAddNote} from "../AnkiConnect";

/**
 * A modal dialog for creating a new Anki note by using a codeblock content as pre-filled values.
 *
 * @description
 * It provides options to select a deck and a model, and dynamically generates input fields based on the selected model's configuration.
 * It will pre-select both the deck to add the note in and the model to use to create the note by parsing the content of a codeblock using "AnkiIntegration" as language.
 * It will autofill fields of the note by parsing the content of a codeblock using "AnkiIntegration" as language.
 * It allows users to enter information and submit the data to create a new note.
 *
 * @extends Modal
 */
export class AddNoteFromCodeblockModal extends Modal {
    /**
     * @type {AnkiIntegration}
     * @description The plugin instance associated with the modal.
     */
    plugin: AnkiIntegration;

    /**
     * Creates a new AddNoteFromCodeblockModal instance.
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

        AddTitle(contentEl, "Add a new note using codeblock");
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
            const codeblockParameters = await this.GetCodeBlockParameters();
            this.AddFieldsGroupsToModal(inputContainer, value, codeblockParameters);
        });

        this.onOpenAsync(deckSelector, modelSelector, inputContainer);

        /**
         * @type {HTMLButtonElement} submitButtonEl
         * @description Submit button for the user to add the note.
         */
        const submitButtonEl: HTMLButtonElement = AddButton(contentEl, "Create Note", "submit");

        /**
         * @description
         * "Click" event handler to send the form and trigger ProcessAddNote().
         * @async
         * @param {MouseEvent} event - The click event triggered by the submit button.
         */
        submitButtonEl.addEventListener("click", async () => {
            await ProcessAddNote(deckSelector, modelSelector, inputContainer, this);
        });
        /**
         * @description
         * "SHIFT + ENTER" event shortcut handler to send the form and trigger ProcessAddNote().
         * @async
         * @param {KeyboardEvent} event - The registered keys that are pressed when contentEl is open.
         */
        this.contentEl.addEventListener("keydown", async (event) => {
            if (event.shiftKey && event.key === "Enter") {
                await ProcessAddNote(deckSelector, modelSelector, inputContainer, this);
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
            /**
             * @description
             * Create the different fields group objects and push them into fieldsGroupData.
             */
            CreateFieldsGroupData(fieldsGroupData, selectedModel["fields"], inputValues["fields"]);
            AddFieldGroups(inputContainer, fieldsGroupData);
        }
    }

    async onOpenAsync(deckSelector: DropdownComponent, modelSelector: DropdownComponent, inputContainer: HTMLDivElement): Promise<void> {
        const codeblockParameters: Object = await this.GetCodeBlockParameters();

        await AutoAssignDeck(deckSelector, codeblockParameters);
        await AutoAssignModel(modelSelector, codeblockParameters);
        await AutoGenerateFields(this, modelSelector, inputContainer, codeblockParameters);
    }

    async GetCodeBlockParameters() {
        /**
         * @type {TFile} activeFileData
         * @description The open and active file in the current instance of Obsidian.
         */
        const activeFileData: TFile = this.app.workspace.getActiveFile();
        /**
         * @type {string} activeFileContent
         * @description The whole content of the note.
         */
        const activeFileContent: string = await ReadFileContent(this, activeFileData);
        /**
         * @type {string} codeblock
         * @description The first codeblock using "AnkiIntegration" as its language in activeFileContent.
         */
        const codeblock: string = activeFileContent.match(/(```AnkiIntegration[\s\S]*?```)/)[1];
        /**
         * @type {RegExp} regex
         * @description A regular expression that is used to retrieve each line of the codeblock using a "Key: Value;" or "Key: "Value";" format.
         */
        const regex: RegExp = /^\s*(\w+):\s*(?:"([^"]+)"|([^;]+));/gm;
        /**
         * @type {Object} codeblockParameters
         * @description The object that stores all the fields of the note that has to be created, along with their values.
         * @remarks It has ""fields": {}" as a default child in order to store Anki note's fields related data.
         */
        const codeblockParameters: Object = {
            "fields": {}
        };
        /**
         * @type {Array} match
         * @description Stores all the result of regex.exec(codeblock).
         */
        let match: Array<string> = []
        /**
         * @description As long as there are string that match the regex,
         * we add them as field of codeblockParameters or as field of codeblockParameters["fields"].
         */
        while ((match = regex.exec(codeblock)) !== null) {
            /**
             * @type {Array<string>} codeblockFields
             * @description All the fields that has to be added as direct child fields of codeblockParameters.
             */
            const codeblockChildFields: Array<string> = ["deck", "model"];
            /**
             * @type {string} key
             * @description The key of the item that will be added to codeblockParameters.
             */
            const key: string = match[1];
            /**
             * @type {string} value
             * @description The value of the item that will be added to codeblockParameters.
             */
            const value: string = match[2] || match[3];
            /**
             * @description If/else statements allowing to add a value as a direct child of codeblockParameters or as a direct child of codeblockParameters["fields"].
             */
            if (codeblockChildFields.includes(key)) {
                codeblockParameters[key] = value;
            } else {
                codeblockParameters["fields"][key.toLowerCase()] = value;
            }
        }

        return codeblockParameters;
    }
}
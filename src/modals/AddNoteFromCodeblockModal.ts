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
            this.AddFieldsGroupsToModal(inputContainer, value, codeblockParameters["fields"]);
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

    onClose() {

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
            CreateFieldsGroupData(fieldsGroupData, selectedModel["fields"], inputValues);
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
        const activeFileData: TFile = this.app.workspace.getActiveFile();
        const activeFileContent: string = await ReadFileContent(this, activeFileData);

        const codeblock = activeFileContent.match(/(```AnkiIntegration[\s\S]*?```)/)[1];

        const regex = /^\s*(\w+):\s*(?:"([^"]+)"|([^;]+));/gm;

        const codeblockParameters = {
            "fields": {}
        };
        let match: Object = {};

        while ((match = regex.exec(codeblock)) !== null) {
            const mandatoryKeys = ["deck", "model"];
            const key: string = match[1];
            const value: string = match[2] || match[3];

            if (mandatoryKeys.includes(key)) {
                codeblockParameters[key] = value;
            } else {
                codeblockParameters["fields"][key.toLowerCase()] = value;
            }
        }

        return codeblockParameters;
    }
}
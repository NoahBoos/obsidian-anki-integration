import {
    App, DropdownComponent, FrontMatterCache, MetadataCache,
    Modal,
    TFile
} from "obsidian";
import AnkiIntegration from "../main";
import {
    ProcessAddNote
} from "../AnkiConnect";
import {
    AddButton,
    AddContainer,
    AddDropdown, AddFieldGroups,
    AddOptionsToDropdownFromDataset,
    AddParagraph,
    AddSubtitle,
    AddTitle, AutoAssignDeck, AutoAssignModel, AutoGenerateFields, CreateFieldsGroupData,
    FetchModelByName
} from "../utils";

/**
 * A modal dialog for creating a new Anki note by using metadata as pre-filled values.
 *
 * @description
 * It provides options to select a deck and a model, and dynamically generates input fields based on the selected model's configuration.
 * It will pre-select both the deck to add the note in and the model to use to create the note by parsing YAML metadata.
 * It will autofill fields of the note by parsing YAML metadata.
 * It allows users to enter information and submit the data to create a new note.
 *
 * @extends Modal
 */
export class AddNoteFromMetadataModal extends Modal {
    /**
     * @type {AnkiIntegration}
     * @description The plugin instance associated with the modal.
     */
    plugin: AnkiIntegration;

    /**
     * Creates a new AddNoteFromMetadataModal instance.
     * Initializes the modal with the provided app and plugin.
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

        /**
         * @type {TFile} activeFileData
         * @description The file defined as active in the Obsidian instance.
         * @type {FrontMatterCache} yaml
         * @description The YAML metadata stored in an object under the key: "value" format.
         */
        const activeFileData: TFile = this.app.workspace.getActiveFile();
        const yaml: FrontMatterCache = this.app.metadataCache.getFileCache(activeFileData).frontmatter;

        // Add the title and subtitle to the modal.
        AddTitle(contentEl, "Add a new note using metadata");
        AddSubtitle(contentEl, "Deck & Model");

        /**
         * @type {HTMLDivElement} dropdownContainer
         * @description Container for the deck and model dropdown selectors.
         */
        const dropdownContainer: HTMLDivElement = AddContainer(contentEl, [
            "ankiIntegrationModal__dropdownContainer--flex"
        ]);

        // Create and configure the deck selector dropdown.
        const deckSelector = AddDropdown(dropdownContainer, "Choose a deck");

        /**
         * @type {string[]} deckKeys
         * @description An array containing the keys of all available decks.
         */
        const deckKeys: string[] = Object.keys(ankiData["decksData"]);
        AddOptionsToDropdownFromDataset(deckSelector, deckKeys, "name", "name", ankiData["decksData"]);

        // Create and configure the model selector dropdown.
        const modelSelector = AddDropdown(dropdownContainer, "Choose a model");

        /**
         * @type {string[]} modelKeys
         * @description An array containing the keys of all available models.
         */
        const modelKeys: string[] = Object.keys(ankiData["modelsData"]);
        AddOptionsToDropdownFromDataset(modelSelector, modelKeys, "name", "name", ankiData["modelsData"]);

        // Add the "Fields" section subtitle.
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
            this.AddFieldsGroupsToModal(inputContainer, value, yaml);
        });

        this.onOpenAsync(deckSelector, modelSelector, inputContainer, yaml);

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

    async onOpenAsync(deckSelector: DropdownComponent, modelSelector: DropdownComponent, inputContainer: HTMLDivElement, yaml: FrontMatterCache): Promise<void> {
        await AutoAssignDeck(deckSelector, yaml);
        await AutoAssignModel(modelSelector, yaml);
        await AutoGenerateFields(this, modelSelector, inputContainer, yaml);
    }

    /**
     * Adds as many fields groups as the currently selected model has fields to the modal.
     * @param {HTMLDivElement} inputContainer - DIV containing all the generated inputs.
     * @param {any} selectedValue - Currently selected model select value of the modelSelector (DropdownComponent).
     * @param {FrontMatterCache} inputValues - The YAML metadata of the currently active note.
     */
    AddFieldsGroupsToModal(inputContainer: HTMLDivElement, selectedValue: any, inputValues: FrontMatterCache) {
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
}
import {
    App,
    Modal,
    Notice
} from "obsidian";
import AnkiIntegration from "../main";
import {
    AddNote
} from "../AnkiConnect";
import {
    AddButton,
    AddContainer,
    AddDropdown, AddFieldGroups,
    AddOptionsToDropdownFromDataset,
    AddParagraph,
    AddSubtitle,
    AddTitle,
    FetchModelByName
} from "../utils";

/**
 * A modal dialog for creating a new Anki note.
 *
 * @description
 * It provides options to select a deck and a model, and dynamically generates input fields based on the selected model's configuration.
 * It allows users to enter information and submit the data to create a new note.
 *
 * @extends Modal
 */
export class AddNoteModal extends Modal {
    /**
     * @type {AnkiIntegration}
     * The plugin instance associated with the modal.
     */
    plugin: AnkiIntegration;

    /**
     * Creates a new AddNoteModal instance.
     * Initializes the modal with the provided app and plugin.
     * @param {App} app - The Obsidian app instance.
     * @param {AnkiIntegration} plugin - The AnkiIntegration plugin instance.
     */
    constructor(app: App, plugin: AnkiIntegration) {
        super(app);
        this.plugin = plugin;
    }


    /**
     * Handles the opening of the modal for creating a new Anki note.
     * Initializes the UI elements, populates dropdowns with Anki data, and sets up event listeners.
     */
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

        // Add the title and subtitle to the modal.
        AddTitle(contentEl, "Create a new note");
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

        // Display default message before a model is selected.
        AddParagraph(inputContainer, "Select a model to see its fields.");

        /**
         * Event listener triggered when the model selector value changes.
         * Updates the inputContainer with the fields corresponding to the selected model.
         * @param {string} value - The selected model name.
         */
        modelSelector.onChange(async (value) => {
            /**
             * @type {Object} selectedModel
             * @description The model object corresponding to the selected model name.
             */
            const selectedModel: Object = FetchModelByName(this.plugin, value);

            // Clear existing input fields before updating.
            inputContainer.empty();

            // Display default message if no valid model is selected.
            if (value === "default") {
                AddParagraph(inputContainer, "Select a model to see its fields.");
                return;
            }

            // Add input fields dynamically based on the model's fields.
            AddFieldGroups(inputContainer, selectedModel["fields"]);
        });

        /**
         * @type {HTMLButtonElement} submitButtonEl
         * @description Submit button for the user to add the note.
         */
        const submitButtonEl: HTMLButtonElement = AddButton(contentEl, "Create note", "submit");

        /**
         * Event listener triggered when the submit button is clicked.
         * @async
         * @param {MouseEvent} event - The click event triggered by the submit button.
         *
         * @description
         * - Check if the value of `deckName` is default, if yes, stop its execution.
         * - Check if the value of `modelName` is default, if yes, stop its execution.
         * - Retrieve each active input in the `inputContainer`.
         *  - Retrieve its placeholder and its value.
         *  - Push them as a `key => value` line of `modelName`.
         * - Execute `AddNote()`.
         */
        submitButtonEl.addEventListener("click", async () => {
            /**
             * @type {string} deckName
             * @definition The name of the deck selected for the note.
             */
            const deckName: string = deckSelector.getValue();
            if (deckName === "default") {
                new Notice("Please select a deck.");
                return;
            }

            /**
             * @type {string} modelName
             * @definition The name of the model selected for the note.
             */
            const modelName: string = modelSelector.getValue();
            if (modelName === "default") {
                new Notice("Please select a model.");
                return;
            }

            /**
             * @type {Object} modelFields
             * @definition An Object containing the fields and their values stored in the input.
             */
            const modelFields: Object = {};
            /**
             * @type {NodeListOf<HTMLInputElement>} inputs
             * @description A list of all the inputs generated previously.
             */
            const inputs: NodeListOf<HTMLInputElement> = inputContainer.querySelectorAll("input");

            for (let i = 0; i < inputs.length; i++) {
                modelFields[inputs[i].placeholder] = inputs[i].value;
            }

            /**
             * @type {boolean} result
             * @definition Has the note been successfully created ?
             */
            const result: boolean = await AddNote(
                deckName,
                modelName,
                modelFields
            );

            if (result === false) {
                return;
            } else {
                this.close();
            }
        });
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
}
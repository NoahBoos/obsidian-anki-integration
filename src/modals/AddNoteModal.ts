import {
    App,
    DropdownComponent,
    Modal
} from "obsidian";
import AnkiIntegration from "../main";
import {
    AddContainer,
    AddParagraph,
    AddSubtitle,
    AddTitle
} from "../utils";
import {
    AddDeckSelector,
    AddModelSelector,
    AddSubmitButton,
    AddTagsSection,
    GenerateFieldGroups
} from "./addNoteModalsUtils";

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

        const { contentEl } = this;
        this.contentEl.focus();

        AddTitle(contentEl, "Add a new note");
        AddSubtitle(contentEl, "Deck & Model");

        const dropdownContainer: HTMLDivElement = AddContainer(contentEl, ["ankiIntegrationModal__dropdownContainer--flex"]);
        const deckSelector: DropdownComponent = AddDeckSelector(dropdownContainer, ankiData);
        const modelSelector: DropdownComponent = AddModelSelector(dropdownContainer, ankiData);
        AddTagsSection(contentEl);

        AddSubtitle(contentEl, "Fields");

        const inputFieldsContainer: HTMLDivElement = AddContainer(contentEl, [
            "ankiIntegrationModal__inputContainer--flex"
        ]);

        AddParagraph(inputFieldsContainer, "Select a model to see its fields.");

        modelSelector.onChange(async (value) => {
            GenerateFieldGroups(this.plugin, inputFieldsContainer, value, null);
        });

        AddSubmitButton(contentEl, deckSelector, modelSelector, inputFieldsContainer, this)
    }

    /**
     * Handles the closing of the modal by clearing the content container.
     * Removes all elements within the modal's content area.
     */
    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
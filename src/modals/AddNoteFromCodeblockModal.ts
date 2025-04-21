import {App, DropdownComponent, Modal, TFile} from "obsidian";
import AnkiIntegration from "../main";

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

    }

    onClose() {

    }
}
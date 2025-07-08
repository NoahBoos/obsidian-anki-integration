import {
    App,
    DropdownComponent,
    FrontMatterCache,
    Modal,
    TFile
} from "obsidian";
import AnkiIntegration from "../main";
import {
    AddContainer,
    AddParagraph,
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

        /**
         * @type {TFile} activeFileData
         * @description The file defined as active in the Obsidian instance.
         * @type {FrontMatterCache} yaml
         * @description The YAML metadata stored in an object under the key: "value" format.
         */
        const activeFileData: TFile = this.app.workspace.getActiveFile();
        let yaml: FrontMatterCache = null;
        if (activeFileData) {
            yaml = this.app.metadataCache.getFileCache(activeFileData).frontmatter;
        }

        AddTitle(contentEl, "Add a new note using metadata");
        AddSubtitle(contentEl, "Deck & Model");

        const dropdownContainer: HTMLDivElement = AddContainer(contentEl, ["ankiIntegrationModal__dropdownContainer--flex"]);
        const deckSelector: DropdownComponent = AddDeckSelector(dropdownContainer, ankiData);
        const modelSelector: DropdownComponent = AddModelSelector(dropdownContainer, ankiData);
        const tagsContainer: HTMLDivElement = AddTagsSection(contentEl);
        const tagsBody: HTMLDivElement = tagsContainer.querySelector('#tagsBody');
        const tagsBodyParagraph: HTMLElement = tagsContainer.querySelector('#tagsBodyTip');

        if (yaml != null && yaml["cardTags"] != null) {
            tagsBody.removeChild(tagsBodyParagraph);
            for (let i = 0; i < yaml["cardTags"].length; i++) {
                AddTagInputGroup(tagsBody, tagsBodyParagraph, yaml["cardTags"][i]);
            }
        }

        AddSubtitle(contentEl, "Fields");
        const inputFieldsContainer: HTMLDivElement = AddContainer(contentEl, ["ankiIntegrationModal__inputContainer--flex"]);

        modelSelector.onChange(async (value) => {
            GenerateFieldGroups(this.plugin, inputFieldsContainer, value, yaml);
        });

        if (yaml != null) {
            AutoAssignDeck(deckSelector, yaml);
            AutoAssignModel(modelSelector, yaml);
            AutoGenerateFields(this, modelSelector, inputFieldsContainer, yaml);
        } else {
            AddParagraph(inputFieldsContainer, "Select a model to see its fields.");
        }

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
}
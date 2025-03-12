import {
    App,
    Modal,
    Notice
} from "obsidian";
import AnkiIntegration from "../main";
import {
    AddButton,
    AddContainer,
    AddDropdown, AddFieldGroups,
    AddOptionsToDropdownFromDataset,
    AddParagraph,
    AddSubtitle,
    AddTitle,
    GetModelByName
} from "../utils";

export class AddNoteModal extends Modal {
    plugin: AnkiIntegration;
    constructor(app: App, plugin: AnkiIntegration) {
        super(app);
        this.plugin = plugin;
    }

    onOpen() {
        const ankiData: Object = this.plugin.settings.ankiData;
        const {contentEl} = this;
        // Adding the title of the modal.
        AddTitle(contentEl, "Create a new note");
        // Adding subtitle.
        AddSubtitle(contentEl, "Deck & Model");
        // Adding the deck & model selectors container.
        const dropdownContainer = AddContainer(contentEl, [
            "ankiIntegrationModal__dropdownContainer--flex"
        ]);
        // Adding the deck selector.
        const deckSelector = AddDropdown(dropdownContainer, "Choose a deck");
        // Adding deck selector's options.
        const deckKeys = Object.keys(ankiData["decksData"]);
        AddOptionsToDropdownFromDataset(deckSelector, deckKeys, "name", "name", ankiData["decksData"]);
        // Adding the model selector.
        const modelSelector = AddDropdown(dropdownContainer, "Choose a model");
        // Adding model selector's options.
        const modelKeys = Object.keys(ankiData["modelsData"]);
        AddOptionsToDropdownFromDataset(modelSelector, modelKeys, "name", "name", ankiData["modelsData"]);
        // Adding subtitle.
        AddSubtitle(contentEl, "Fields");
        // Adding the input fields container.
        const inputContainer = AddContainer(contentEl, [
            "ankiIntegrationModal__inputContainer--flex"
        ]);
        // Adding the "Select a model..." message to display it by default.
        AddParagraph(inputContainer, "Select a model to see its fields.");
        // Adding the input fields.
        modelSelector.onChange(async (value) => {
            const selectedModel: Object = GetModelByName(this.plugin, value);
            inputContainer.empty();
            if (value === "default") {
                AddParagraph(inputContainer, "Select a model to see its fields.");
                return;
            }
            AddFieldGroups(inputContainer, selectedModel["fields"])
        });
        // Adding the submitting button
        const submitButtonEl = AddButton(contentEl, "Create note", "submit");
        submitButtonEl.addEventListener("click", async () => {
            if (deckSelector.getValue() === "default") {
                new Notice("Please select a deck.");
                return;
            }
            if (modelSelector.getValue() === "default") {
                new Notice("Please select a model.");
                return;
            }
            const inputFields = inputContainer.querySelectorAll("input");
            for (let i = 0; i < 2; i++) {
                if (inputFields[i].value === "") {
                    new Notice("Please fill the two first fields, at least.")
                    return;
                }
            }
        });
    }

    onClose() {
        const {contentEl} = this;
        contentEl.empty();
    }
}
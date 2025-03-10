import {
    App, DropdownComponent, Modal, Notice, Plugin
} from "obsidian";
import {
    CreateDeck
} from "./AnkiConnect";
import AnkiIntegration from "./main";
import {
    GetModelByName,
    AddContainer,
    AddTitle,
    AddSubtitle,
    AddParagraph,
    AddDropdown,
    AddInputsToDropdownFromDataset,
    AddInput,
    AddButton
} from "./utils";

export class CreateDeckModal extends Modal {
    constructor(app: App) {
        super(app);
    }

    onOpen() {
        const {contentEl} = this;
        // Adding the title of the modal
        AddTitle(contentEl, "Create a new deck");
        // Adding the input of the modal
        const inputEl = AddInput(contentEl, "text", "Enter the name of your new deck.");
        // Adding the submitting button
        const submitButtonEl = AddButton(contentEl, "Create a new deck", "submit");
        submitButtonEl.addEventListener("click", async () => {
            const deckName = inputEl.value;
            const result = await CreateDeck(deckName);
            if (result === false) {
                // If the deck hasn't been created, we do not close the modal.
                return;
            } else {
                //  Else, we close it.
                this.close()
            }
        })
    }

    onClose() {
        const {contentEl} = this;
        contentEl.empty();
    }
}

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
        AddTitle(contentEl, "Create a new note")
        // Adding subtitle.
        AddSubtitle(contentEl, "Deck & Model")
        // Adding the deck & model selectors container.
        const dropdownContainer = AddContainer(contentEl);
        // Adding the deck selector.
        const deckSelector = AddDropdown(dropdownContainer, "Choose a deck");
        // Adding deck selector's options.
        const deckKeys = Object.keys(ankiData["decksData"]);
        AddInputsToDropdownFromDataset(deckSelector, deckKeys, "name", "name", ankiData["decksData"]);
        // Adding the model selector.
        const modelSelector = AddDropdown(dropdownContainer, "Choose a model");
        // Adding model selector's options.
        const modelKeys = Object.keys(ankiData["modelsData"]);
        AddInputsToDropdownFromDataset(modelSelector, modelKeys, "name", "name", ankiData["modelsData"]);
        // Adding subtitle.
        AddSubtitle(contentEl, "Fields");
        // Adding the input fields container.
        const inputContainer = contentEl.createEl("div", {
            cls: [
                "ankiIntegrationModal__inputContainer--flex"
            ]
        });
        // Adding the "Select a model..." message to display it by default.
        AddParagraph(inputContainer, "Select a model to see its fields.");
        // Adding the input fields.
        modelSelector.onChange(async (value) => {
            const selectedModel: Object = GetModelByName(this.plugin, value);
            inputContainer.empty();
            console.log(value);
            if (value === "default") {
                AddParagraph(inputContainer, "Select a model to see its fields.");
                return;
            }
            for (const input of selectedModel["fields"]) {
                inputContainer.createEl("label", {
                    text: input
                })
                inputContainer.createEl("input", {
                    type: "text",
                    placeholder: input,
                    cls: [
                        "ankiIntegrationModal__input--width"
                    ]
                })
            }
        })
        // Adding the submitting button
        contentEl.createEl("button", {
            text: "Create note",
            attr: {type: "submit"},
            cls: [
                "ankiIntegrationModal__button--width",
                "ankiIntegrationModal__button--margin",
                "ankiIntegrationModal__button--padding"
            ]
        }).addEventListener("click", async () => {
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
        })
    }

    onClose() {
        const {contentEl} = this;
        contentEl.empty();
    }
}
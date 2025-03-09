import {
    App, DropdownComponent, Modal, Notice, Plugin
} from "obsidian";
import {
    CreateDeck
} from "./AnkiConnect";
import AnkiIntegration from "./main";
import {
    GetModelByName
} from "./utils";

export class CreateDeckModal extends Modal {
    constructor(app: App) {
        super(app);
    }

    onOpen() {
        const {contentEl} = this;
        // Adding the title of the modal
        contentEl.createEl("h1", {
            text: "Create a new deck",
            cls: [
                "ankiIntegrationModal__h1--width",
                "ankiIntegrationModal__h1--text-align"
            ]
        })
        // Adding the input of the modal
        const inputEl = contentEl.createEl("input", {
            type: "text",
            placeholder: "Enter the name of your new deck.",
            cls: [
                "ankiIntegrationModal__input--width"
            ]
        })
        // Adding the submitting button
        contentEl.createEl("button", {
            text: "Create deck",
            attr: {type: "submit"},
            cls: [
                "ankiIntegrationModal__button--width",
                "ankiIntegrationModal__button--margin",
                "ankiIntegrationModal__button--padding"
            ]
        }).addEventListener("click", async () => {
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
        contentEl.createEl("h1", {
            text: "Create a new flashcard",
            cls: [
                "ankiIntegrationModal__h1--margin",
                "ankiIntegrationModal__h1--text-align"
            ]
        })
        // Adding subtitle.
        contentEl.createEl("h2", {
            text: "Deck and Model"
        })
        // Adding the deck & model selectors container.
        const dropdownContainer = contentEl.createEl("div", {
            cls: [
                "ankiIntegrationModal__dropdownContainer--flex",
            ]
        })
        // Adding the deck selector.
        const deckSelector = new DropdownComponent(dropdownContainer);
        deckSelector.selectEl.addClass("ankiIntegrationModal__dropdown--width");
        deckSelector.addOption("default", "Choose a deck");
        for (const deck in ankiData["decksData"]) {
            deckSelector.addOption(deck, deck);
        }
        // Adding the model selector.
        const modelSelector = new DropdownComponent(dropdownContainer);
        modelSelector.selectEl.addClass("ankiIntegrationModal__dropdown--width");
        modelSelector.addOption("default", "Choose a model");
        for (let i = 0; i < Object.values(ankiData["modelsData"]).length; i++) {
            const modelKey = "model" + i;
            const model = ankiData["modelsData"][modelKey];
            modelSelector.addOption(model["name"], model["name"]);
        }
        // Adding subtitle.
        contentEl.createEl("h2", {
            text: "Fields"
        })
        // Adding the input fields container.
        const inputContainer = contentEl.createEl("div", {
            cls: [
                "ankiIntegrationModal__inputContainer--flex"
            ]
        });
        // Adding the "Select a model..." message to display it by default.
        inputContainer.createEl("p", {
            "text": "Select a model to see its fields.",
            "cls": [
                "ankiIntegrationModal__paragraph--text-align"
            ]
        })
        // Adding the input fields.
        modelSelector.onChange(async (value) => {
            const selectedModel: Object = GetModelByName(this.plugin, value);
            inputContainer.empty();
            console.log(value);
            if (value === "default") {
                inputContainer.createEl("p", {
                    "text": "Select a model to see its fields.",
                    "cls": [
                        "ankiIntegrationModal__paragraph--text-align"
                    ]
                })
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
        })
    }

    onClose() {
        const {contentEl} = this;
        contentEl.empty();
    }
}
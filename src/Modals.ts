import {
    App, ButtonComponent, Modal
} from "obsidian";

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
        }).addEventListener("click", () => {
            this.close();
        })
    }

    onClose() {
        const {contentEl} = this;
        contentEl.empty();
    }
}
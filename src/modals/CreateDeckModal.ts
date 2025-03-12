import {
    App,
    Modal
} from "obsidian";
import {
    CreateDeck
} from "../AnkiConnect";
import {
    AddTitle,
    AddInput,
    AddButton
} from "../utils";

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
                this.close();
            }
        })
    }

    onClose() {
        const {contentEl} = this;
        contentEl.empty();
    }
}
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

/**
 * A modal dialog for creating a new deck.
 * This modal allows the user to enter a deck name and submit it to create a new deck.
 * Upon successful creation, the modal closes; if creation fails, it remains open.
 * @extends Modal
 */
export class CreateDeckModal extends Modal {
    /**
     * Creates a new CreateDeckModal instance.
     * Initializes the modal with the provided app instance.
     * @param {App} app - The Obsidian app instance.
     */
    constructor(app: App) {
        super(app);
    }

    /**
     * Handles the opening of the modal for creating a new deck.
     * Sets up the modal UI with a title, input field for the deck name, and a submit button.
     * An event listener is attached to the submit button to handle the deck creation process.
     */
    onOpen() {
        /**
         * @type {HTMLElement} contentEl
         * @description The main content container of the modal.
         */
        const {contentEl} = this;

        // Adding the title of the modal
        AddTitle(contentEl, "Create a new deck");

        /**
         * @type {HTMLInputElement} inputEl
         * @description Input field for the user to enter the name of the new deck.
         */
        const inputEl = AddInput(contentEl, "text", "Enter the name of your new deck.");

        // Adding the submitting button
        const submitButtonEl = AddButton(contentEl, "Create a new deck", "submit");

        /**
         * Event listener triggered when the submit button is clicked.
         * It attempts to create a new deck and closes the modal if the deck is successfully created.
         * If the deck creation fails, the modal remains open.
         * @async
         * @param {MouseEvent} event - The click event triggered by the submit button.
         */
        submitButtonEl.addEventListener("click", async () => {
            const deckName = inputEl.value;
            const result = await CreateDeck(deckName);

            if (result === false) {
                // If the deck hasn't been created, we do not close the modal.
                return;
            } else {
                // Else, we close it.
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
        const {contentEl} = this;

        // Clear the content of the modal.
        contentEl.empty();
    }
}

import {
    App, ButtonComponent,
    Modal
} from "obsidian";
import {
    ProcessCreateDeck
} from "../AnkiConnect";
import {
    AddTitle,
    AddInput,
    AddButton
} from "../utils";

/**
 * A modal dialog for creating a new deck.
 *
 * @description
 * This modal allows the user to enter a deck name and submit it to create a new deck.
 * Upon successful creation, the modal closes; if creation fails, it remains open.
 *
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
        const { contentEl } = this;
        this.contentEl.focus();

        // Adding the title of the modal
        AddTitle(contentEl, "Create a new deck");

        /**
         * @type {HTMLInputElement} inputEl
         * @description Input field for the user to enter the name of the new deck.
         */
        const inputEl: HTMLInputElement = AddInput(contentEl, "text", "Enter the name of your new deck.");

        /**
         * @type {ButtonComponent} submitButtonEl
         * @description Submit button for the user to create the deck.
         */
        const submitButtonEl: ButtonComponent = AddButton(contentEl, "Create a new deck");

        /**
         * @description
         * "Click" event handler to send the form and trigger ProcessCreateDeck().
         * @async
         * @param {MouseEvent} event - The click event triggered by the submit button.
         */
        submitButtonEl.onClick(async () => {
            await ProcessCreateDeck(inputEl, this);
        });
        /**
         * @description
         * "SHIFT + ENTER" event shortcut handler to send the form and trigger ProcessCreateDeck().
         * @async
         * @param {KeyboardEvent} event - The registered keys that are pressed when contentEl is open.
         */
        this.contentEl.addEventListener("keydown", async (event) => {
            if (event.shiftKey && event.key === "Enter") {
                await ProcessCreateDeck(inputEl, this);
            }
        })
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

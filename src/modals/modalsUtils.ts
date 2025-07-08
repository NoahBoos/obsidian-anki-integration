import {ButtonComponent, DropdownComponent, Modal} from "obsidian";
import {
    AddButton,
    AddContainer,
    AddDropdown,
    AddOptionsToDropdownFromDataset,
    AddParagraph,
    AddSubtitle,
    AddTagInputGroup, BuildTagsArray
} from "../utils";
import {ProcessAddNote} from "../AnkiConnect";
import {Drop} from "esbuild";

export function GenerateDeckSelector(parent: HTMLDivElement, ankiData: Object) {
    /**
     * @type {DropdownComponent} deckSelector
     * @description Dropdown allowing the user to select a deck among those that are synchronized.
     */
    const deckSelector: DropdownComponent = AddDropdown(parent, "Choose a deck");

    /**
     * @type {string[]} deckKeys
     * @description An array containing the keys of all available decks.
     */
    const deckKeys: string[] = Object.keys(ankiData["decksData"]);
    AddOptionsToDropdownFromDataset(deckSelector, deckKeys, "name", "name", ankiData["decksData"]);

    return deckSelector;
}

export function GenerateModelSelector(parent: HTMLDivElement, ankiData: Object) {
    /**
     * @type {DropdownComponent} modelSelector
     * @description Dropdown allowing the user to select a model among those that are synchronized.
     */
    const modelSelector: DropdownComponent = AddDropdown(parent, "Choose a model");

    /**
     * @type {string[]} modelKeys
     * @description An array containing the keys of all available models.
     */
    const modelKeys: string[] = Object.keys(ankiData["modelsData"]);
    AddOptionsToDropdownFromDataset(modelSelector, modelKeys, "name", "name", ankiData["modelsData"]);

    return modelSelector;
}

export function GenerateTagsSection(parent: HTMLElement) {
    /**
     *
     */
    const tagsContainer: HTMLDivElement = AddContainer(parent, [
        "ankiIntegrationModal__container--flex-column"
    ])
    /**
     * @type {HTMLDivElement} tagsHeader
     * @description A container serving as the head part of the tags section.
     */
    const tagsHeader: HTMLDivElement = AddContainer(tagsContainer, [
        "ankiIntegrationModal__container--flex-row",
        "ankiIntegrationModal__container--flex-align-center",
        "ankiIntegrationModal__container--flex-justify-space-between",
    ]);
    AddSubtitle(tagsHeader, "Tags");
    /**
     * @type {ButtonComponent} addTagFieldButton
     * @description Button used by the user to add a tag field in the pop-up.
     */
    let addTagFieldButton: ButtonComponent = AddButton(tagsHeader, "", "circle-plus");
    addTagFieldButton.buttonEl.removeClasses([
        "ankiIntegrationModal__button--default-width",
        "ankiIntegrationModal__button--default-margin",
        "ankiIntegrationModal__button--default-padding"
    ]);
    /**
     * @type {HTMLDivElement} tagsBody
     * @description A container serving as the body of the tags section.
     */
    const tagsBody: HTMLDivElement = AddContainer(
        tagsContainer,
        [
            "ankiIntegrationModal__container--flex-row",
            "ankiIntegrationModal__container--flex-wrap",
            "ankiIntegrationModal__container--gap-16px"
        ],
        "tagsBody")
    ;

    const tagsBodyParagraph: HTMLElement = AddParagraph(tagsBody, "No tags will be added to this note, click the \"+\" button to add a new one.", [], "tagsBodyTip");

    /**
     * @description addTagFieldButton's onClick() event listener used to add a tag input group in tagsBody.
     */
    addTagFieldButton.onClick(async () => {
        if (tagsBody.firstChild == tagsBodyParagraph) {
            tagsBody.removeChild(tagsBodyParagraph);
        }
        /**
         * @type {HTMLDivElement} inputGroup
         * @description A container storing the input field and the delete input field button.
         */
        const tagInputGroup: HTMLDivElement = AddTagInputGroup(tagsBody, tagsBodyParagraph);
    });

    return tagsContainer;
}

export function GenerateSubmitButton(parent: HTMLElement, deckSelector: DropdownComponent, modelSelector: DropdownComponent, inputContainer: HTMLDivElement, modal: Modal) {
    /**
     * @type {ButtonComponent} submitButtonEl
     * @description Submit button for the user to add the note.
     */
    const submitButtonEl: ButtonComponent = AddButton(parent, "Create Note");

    /**
     * @description
     * "Click" event handler to send the form and trigger ProcessAddNote().
     * @async
     * @param {MouseEvent} event - The click event triggered by the submit button.
     */
    submitButtonEl.onClick(async () => {
        const tags: Array<string> = BuildTagsArray();
        await ProcessAddNote(deckSelector, modelSelector, inputContainer, tags, modal);
    });
    /**
     * @description
     * "SHIFT + ENTER" event shortcut handler to send the form and trigger ProcessAddNote().
     * @async
     * @param {KeyboardEvent} event - The registered keys that are pressed when contentEl is open.
     */
    parent.addEventListener("keydown", async (event) => {
        if (event.shiftKey && event.key === "Enter") {
            const tags: Array<string> = BuildTagsArray();
            await ProcessAddNote(deckSelector, modelSelector, inputContainer, tags, modal);
        }
    })
}
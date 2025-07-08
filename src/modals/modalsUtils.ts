import {DropdownComponent} from "obsidian";
import {AddDropdown, AddOptionsToDropdownFromDataset} from "../utils";

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
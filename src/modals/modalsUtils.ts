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
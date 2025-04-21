import {DropdownComponent, Modal, Notice} from "obsidian";
import AnkiIntegration from "./main";
import {Drop} from "esbuild";

const ANKI_PORT = 8765;

export function Invoke(action: string, params={}) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('error', () => reject('failed to issue request'));
        xhr.addEventListener('load', () => {
            try {
                const response = JSON.parse(xhr.responseText);
                if (Object.getOwnPropertyNames(response).length != 2) {
                    throw 'response has an unexpected number of fields';
                }
                if (!response.hasOwnProperty('error')) {
                    throw 'response is missing required error field';
                }
                if (!response.hasOwnProperty('result')) {
                    throw 'response is missing required result field';
                }
                if (response.error) {
                    throw response.error;
                }
                resolve(response.result);
            } catch (e) {
                reject(e);
            }
        });

        xhr.open('POST', 'http://127.0.0.1:' + ANKI_PORT.toString());
        xhr.send(JSON.stringify({action, version: 6, params}));
    });
}

// Asking permission
export async function RequestPermission(): Promise<any> {
    try {
        const result = await Invoke("requestPermission", {});
        // @ts-ignore
        if (!result || result.permission != "granted") {
            new Notice(
                "Permission to access Anki was denied."
                + "\n"
                + "Check the documentation for more information."
            );
            return null;
        }
        new Notice("Permission to access Anki was granted.");
        return result;
    } catch (error) {
        new Notice(
            "Failed to request the permission."
            + "\n"
            + "Please make sure that Anki is running."
        );
        return null;
    }
}

/**
 * Synchronizes data between Obsidian and Anki by retrieving decks and models data.
 *
 * @async
 * @function SynchronizeData
 * @param {AnkiIntegration} plugin - The plugin instance managing Anki integration settings.
 * @returns {Promise<void>} A promise that resolves once the synchronization is complete.
 */
export async function SynchronizeData(plugin: AnkiIntegration): Promise<void> {
    /**
     * @type {Object | null}
     * @definition Object storing decks-related data retrieved from Anki. If no data is found, it remains `null`.
     */
    let decksData: Object | null;
    decksData = await GetDecksData();

    // If valid deck data is retrieved, store it in the plugin settings.
    if (decksData !== null) plugin.settings.ankiData["decksData"] = decksData;

    /**
     * @type {Object | null}
     * @definition Object storing models-related data retrieved from Anki. If no data is found, it remains `null`.
     */
    let modelsData: Object | null;
    modelsData = await GetModelsData();

    // If valid model data is retrieved, store it in the plugin settings.
    if (modelsData !== null) plugin.settings.ankiData["modelsData"] = modelsData;

    // Save the updated settings.
    await plugin.saveSetting();
}


/**
 * Retrieves decks-related data from Anki.
 *
 * @description
 * - Calls AnkiConnect to fetch deck names and IDs.
 * - If no decks are found, a notice is displayed, and the function returns `null`.
 * - Iterates through each deck and stores its name and ID in an object.
 * - If successful, a notice informs the user that decks have been synchronized.
 * - If an error occurs, an error notice is displayed, and the function returns `null`.
 *
 * @async
 * @function GetDecksData
 * @returns {Promise<Object | null>} A promise that resolves to an object containing decks data,
 * or `null` if no decks were found or if an error occurred.
 */
async function GetDecksData(): Promise<Object | null> {
    try {
        /**
         * @type {Object}
         * @description Object storing all retrieved decks data.
         */
        let result: Object = {};
        /**
         * @type {any}
         * @description Response from AnkiConnect containing deck names and their corresponding IDs.
         */
        const decksNamesAndIds: any = await Invoke("deckNamesAndIds", {});

        // Checking if there is no result coming from the request.
        if (!decksNamesAndIds) {
            new Notice(
                "No decks were found.\nCreate a deck to synchronize deck data."
            );
            return null;
        }

        for (let i = 0; i < Object.values(decksNamesAndIds).length; i++) {
            // Storing the deck data in the result object.
            result["deck" + i] = {
                "name": Object.keys(decksNamesAndIds)[i],
                "id": Object.values(decksNamesAndIds)[i]
            };
        }

        // Notify the user of successful deck synchronization.
        new Notice("Decks have been synchronized.");
        return result;
    } catch (error) {
        // Notify the user of the error and suggest ensuring Anki is running.
        new Notice(
            "Failed to synchronize decks." +
            "\n" + error +
            "\n" + "Please make sure that Anki is running."
        );
        return null;
    }
}

/**
 * Retrieves models-related data from Anki.
 *
 * @description
 * - Calls AnkiConnect to fetch model names and IDs.
 * - If no models are found, a notice is displayed, and the function returns `null`.
 * - Iterates through each model, retrieves its fields, and stores the data in an object.
 * - If successful, a notice informs the user that models have been synchronized.
 * - If an error occurs, an error notice is displayed, and the function returns `null`.
 *
 * @async
 * @function GetModelsData
 * @returns {Promise<Object | null>} A promise that resolves to an object containing models data,
 * or `null` if no models were found or if an error occurred.
 */
async function GetModelsData(): Promise<Object | null> {
    try {
        /**
         * @type {Object}
         * @description Object storing all retrieved decks data.
         */
        let result: Object = {};
        /**
         * @type {any}
         * @description Response from AnkiConnect containing model names and their corresponding IDs.
         */
        const modelNamesAndIds: any = await Invoke("modelNamesAndIds", {});

        // Checking if there is no result coming from the request.
        if (!modelNamesAndIds) {
            new Notice(
                "No models were found." +
                "\n" +
                "Create a model to synchronize model data."
            );
            return null;
        }

        for (let i = 0; i < Object.values(modelNamesAndIds).length; i++) {
            /**
             * @type {Object}
             * @description Object representing a single model with its name, ID, and fields.
             */
            let model: Object = {
                "name": Object.keys(modelNamesAndIds)[i],
                "id": Object.values(modelNamesAndIds)[i]
            };

            // Retrieving field names for the current model.
            model["fields"] = await Invoke("modelFieldNames", {
                "modelName": Object.keys(modelNamesAndIds)[i]
            });

            // Storing the model data in the result object.
            result["model" + i] = model;
        }

        // Notify the user of successful model synchronization.
        new Notice("Models have been synchronized.");
        return result;
    } catch (error) {
        // Notify the user of the error and suggest ensuring Anki is running.
        new Notice(
            "Failed to synchronize models." +
            "\n" + error +
            "\n" + "Please make sure that Anki is running."
        );
        return null;
    }
}


/**
 * Creates a new Anki deck.
 *
 * @description
 * - If the deck name is empty, a notice is displayed, and the function returns `false`.
 * - If the deck creation is successful, a notice is displayed, and the function returns `true`.
 * - If an error occurs, an error notice is displayed, and the function returns `false`.
 *
 * @async
 * @function CreateDeck
 * @param {string} deckName - The name of the deck to be created.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the deck was successfully created,
 * or `false` if the creation failed or if deckName is empty.
 */
export async function CreateDeck(deckName: string): Promise<boolean> {
    /**
     * @description
     * Throwing an error if deckName is an empty string.
     */
    if (deckName === "") {
        new Notice("Please enter a name for your deck.");
        return false;
    }

    try {
        // Attempt to create the deck in Anki.
        await Invoke("createDeck", { "deck": deckName });

        // Notify the user of successful deck creation.
        new Notice("Deck " + deckName + " has been created.");
        return true;
    } catch (error) {
        // Notify the user of the error and suggest ensuring Anki is running.
        new Notice(
            "Failed to create the deck \"${deckName}\"." +
            "\n" + error +
            "\n" + "Make sure Anki is running."
        );
        return false;
    }
}

/**
 * Verifies, analyzes and treats data related to the CreateDeck() method ; Called to send a form once it's completed.
 *
 * @param {HTMLInputElement} inputEl - The input element that contains the name of the deck to be created.
 * @param {Modal} modal - The opened modal itself.
 */
export async function ProcessCreateDeck(inputEl: HTMLInputElement, modal: Modal): Promise<boolean> {
    /**
     * @type {string} deckName
     * @definition The name of the deck selected for the note.
     */
    const deckName: string = inputEl.value;

    /**
     * @type {boolean} result
     * @definition Has the deck been successfully created ?
     */
    const result: boolean = await CreateDeck(deckName);

    if (result === false) {
        // If the deck hasn't been created, we do not close the modal.
        return;
    } else {
        // Else, we close it.
        modal.close();
    }
}

/**
 * Adds a new note to Anki in the specified deck and model.
 *
 * @description
 * This function attempts to create a new note in Anki using the provided deck name, model name, and field data.
 * If the operation is successful, a notification is displayed to the user. Otherwise, an error message is shown.
 *
 * @param {string} deckName - The name of the Anki deck where the note will be added.
 * @param {string} modelName - The name of the Anki model to use for the note.
 * @param {Object} fields - An object containing the fields of the note.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the note was successfully added, otherwise `false`.
 */
export async function AddNote(deckName: string, modelName: string, fields: Object): Promise<boolean> {
    try {
        // Attempt to create the note in Anki.
        await Invoke("addNote", {
            "note": {
                "deckName": deckName,
                "modelName": modelName,
                "fields": fields
            }
        });

        // Notify the user of successful note creation.
        new Notice("Note has been added.");
        return true;
    } catch (error) {
        new Notice(
            "Failed to add note." +
            "\n" + error +
            "\n" + "Make sure that Anki is running."
        );
    }
}

/**
 * Verifies, analyzes and treats data related to the AddNote() method ; Called to send a form once it's completed.
 *
 * @description
 * - Check if the value of `deckName` is default, if yes, return.
 * - Check if the value of `modelName` is default, if yes, return.
 * - Check if the two first input fields are empty, if yes, return.
 * - Create a modelFields objects that will store under a key: "value" format data related to each field of the note that will be created.
 * - Trigger AddNote() and wait for it to return "true" or "false" depending on if the note has been added successfully.
 * - Treat AddNote() boolean returns by closing the modal or not.
 *
 * @param {DropdownComponent} deckSelector - Dropdown component storing deck-related data.
 * @param {DropdownComponent} modelSelector - Dropdown component storing model-related data.
 * @param {HTMLDivElement} inputContainer - Speaking for itself.
 * @param {Modal} modal - The opened modal itself.
 */
export async function ProcessAddNote(deckSelector: DropdownComponent, modelSelector: DropdownComponent, inputContainer: HTMLDivElement, modal: Modal): Promise<boolean> {
    /**
     * @type {string} deckName
     * @definition The name of the deck selected for the note.
     */
    const deckName: string = deckSelector.getValue();
    /**
     * @description
     * Throwing an error if no deck is selected.
     */
    if (deckName === "default") {
        new Notice("Please select a deck.");
        return;
    }

    /**
     * @type {string} modelName
     * @definition The name of the model selected for the note.
     */
    const modelName: string = modelSelector.getValue();
    /**
     * @description
     * Throwing an error if no model is selected.
     */
    if (modelName === "default") {
        new Notice("Please select a model.");
        return;
    }

    /**
     * @type {Object} modelFields
     * @definition An Object containing the fields and their values stored in the input.
     */
    const modelFields: Object = {};
    /**
     * @type {NodeListOf<HTMLInputElement>} inputs
     * @description A list of all the inputs generated previously.
     */
    const inputs: NodeListOf<HTMLInputElement> = inputContainer.querySelectorAll("input");

    /**
     * @description
     * Throwing an error if one or both of the two first inputs aren't filled.
     */
    if (inputs[0].value === "" || inputs[1].value === "") {
        new Notice("Please fill at least the two first fields of your note.")
        return;
    }

    /**
     * @description
     * Building modelFields Object by adding data using the key: "value" format.
     * The key is the placeholder of the input that is looped, the value is value of the input that is looped.
     */
    for (let i = 0; i < inputs.length; i++) {
        modelFields[inputs[i].placeholder] = inputs[i].value;
    }

    /**
     * @type {boolean} result
     * @definition Has the note been successfully created ?
     */
    const result: boolean = await AddNote(
        deckName,
        modelName,
        modelFields
    );

    if (result === false) {
        return;
    } else {
        modal.close();
    }
}
import {Notice} from "obsidian";
import AnkiIntegration from "./main";

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
 * or `false` if the creation failed or the deck name was empty.
 */
export async function CreateDeck(deckName: string): Promise<boolean> {
    // Checking if the deck name is empty.
    if (deckName === "") {
        // Display a notice informing the user that a deck name is required.
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
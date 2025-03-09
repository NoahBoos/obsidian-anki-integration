import {
    Notice,
    Plugin
} from "obsidian";
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

// Synchronize data between Obsidian and Anki
export async function SynchronizeData(plugin: AnkiIntegration) {
    // Attempting to synchronize decks-related data.
    let decksData: Object;
    decksData = await GetDecksData();
    if (decksData !== null) plugin.settings.ankiData["decksData"] = decksData;
    // Attempting to synchronize models-related data.
    let modelsData: Object;
    modelsData = await GetModelsData();
    if (modelsData !== null) plugin.settings.ankiData["modelsData"] = modelsData;
    // Saving settings.
    await plugin.saveSetting();
}

// Get decks-related data.
async function GetDecksData() {
    try {
        const result: any = await Invoke("deckNamesAndIds", {});
        // Checking if there is no result coming of the request.
        if (!result) {
            // The user has no decks, so we inform them that no decks have been found.
            new Notice(
                "No decks were found."
                + "\n" + "Create a deck to synchronize deck data."
            );
            return null;
        }
        // Decks-related data has been synchronized successfully, so we inform the user that Decks have been synchronized.
        new Notice ("Decks have been synchronized.");
        return result;
    } catch (error) {
        // We can't get decks-related data, so we display a Notice stating that we failed to synchronize decks-related data, along with the error.
        new Notice(
            "Failed to synchronize decks."
            + "\n" + error
            + "\n" + "Please make sure that Anki is running."
        );
        return null;
    }
}

// Get models-related data.
async function GetModelsData() {
    try {
        let result: Object = {};
        const modelNamesAndIds: any = await Invoke("modelNamesAndIds", {});
        // Checking if there is no result coming of the request.
        if (!modelNamesAndIds) {
            // The user has no models, so we inform them that no models have been found.
            new Notice(
                "No models were found."
                + "\n" + "Create a model to synchronize model data."
            );
            return null;
        }
        for (let i = 0; i < Object.values(modelNamesAndIds).length; i++) {
            // Initializing a model Object.
            let model: Object;
            model = {
                "name": Object.keys(modelNamesAndIds)[i],
                "id": Object.values(modelNamesAndIds)[i]
            };
            // Initializing an Object that will store the data coming out of a request.
            let modelFieldNames: Object;
            // The request allow us to gather the name of each field of a model based on its name.
            modelFieldNames = await Invoke("modelFieldNames", {"modelName": Object.keys(modelNamesAndIds)[i]});
            // Adding the data resulting the request as the "field" attribute of the model Object.
            model["fields"] = modelFieldNames;
            // Adding the whole model Object to the result Object.
            result["model" + i] = model;
        }
        // Models-related data has been synchronized successfully, so we inform the user that Models have been synchronized.
        new Notice ("Models have been synchronized.");
        return result;
    } catch (error) {
        // We can't get models-related data, so we display a Notice stating that we failed to synchronize models-related data, along with the error.
        new Notice(
            "Failed to synchronize models."
            + "\n" + error
            + "\n" + "Please make sure that Anki is running."
        );
        return null;
    }
}

// Creating an Anki Deck
export async function CreateDeck(deckName: string) {
    // Checking if the deck name is empty.
    if (deckName === "") {
        // We can't create a nameless deck, so we display a Notice informing the user that he needs to provide us a deck name.
        new Notice("Please enter a name for your deck.");
        // We can't create a nameless deck, therefore we return false and stop the process.
        return false;
    }
    try {
        await Invoke("createDeck", {"deck": deckName});
        // We created the deck, so we display a Notice informing the user that his deck has been successfully created.
        new Notice("Deck " + deckName + " has been created.");
        // We successfully managed to create the deck, therefore we return true.
        return true;
    } catch (error) {
        // We met an error, so we display a Notice informing the user that the deck creation process has been stopped.
        new Notice("Failed to create the deck " + deckName
            + ".\n" + error
            + "\n" + "Make sure Anki is running."
        );
        // We did not manage to create the deck, therefore we return false.
        return false;
    }
}
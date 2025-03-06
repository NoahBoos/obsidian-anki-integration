import {
    Notice
} from "obsidian";
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
export async function requestPermission(): Promise<any> {
    try {
        let r = await Invoke("requestPermission", {});
        // @ts-ignore
        if (!r || r.permission != "granted") {
            new Notice(
                "Permission to access Anki was denied."
                + "\n"
                + "Check the documentation for more information.");
            return null;
        }
        new Notice("Permission to access Anki was granted.");
        return r;
    } catch (error) {
        new Notice(
            "Failed to request the permission."
            + "\n"
            + "Please make sure that Anki is running.");
        return null;
    }
}

// Creating an Anki Deck
export async function CreateDeck(deckName: String) {
    return await Invoke("createDeck", {"deck": deckName});
}
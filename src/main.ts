// Import des différentes classes d'Obsidian.
import {
    Plugin
} from "obsidian";
// Import des autres classes et jeux de variables nécessaires.
import {
    AnkiIntegrationSettings,
    DEFAULT_SETTINGS,
    AnkiIntegrationSettingTab
} from "./AnkiIntegrationSettingTab";
import {
    CreateDeckModal
} from "./modals/CreateDeckModal";
import {
    AddNoteModal
} from "./modals/AddNoteModal";
import {
    AddNoteFromMetadataModal
} from "./modals/AddNoteFromMetadataModal";
import {
    RequestPermission,
    SynchronizeData
} from "./AnkiConnect";

export default class AnkiIntegration extends Plugin {
    settings: AnkiIntegrationSettings;

    async onload() {
        await this.loadSetting();
        await RequestPermission();
        await SynchronizeData(this);

        // Adding the setting tab the user can use to edit settings.
        this.addSettingTab(new AnkiIntegrationSettingTab(this.app, this));

        // Adding a command to launch SynchronizeData().
        this.addCommand({
            id: 'synchronize-data',
            name: 'Synchronize data',
            callback: () => {
                SynchronizeData(this);
            }
        })
        // Adding a command to open the CreateDeckModal.
        this.addCommand({
           id: 'create-a-new-deck',
           name: 'Create a new deck',
           callback: () => {
               new CreateDeckModal(this.app).open();
           }
        });
        // Adding a command to open the AddNoteModal.
        this.addCommand({
            id: 'add-a-new-note',
            name: 'Add a new note',
            callback: () => {
                new AddNoteModal(this.app, this).open();
            }
        })
        // Adding a command to open the AddNoteFromMetadataModal.
        this.addCommand({
            id: 'add-a-new-note-from-metadata',
            name: 'Add a new note from metadata',
            callback: () => {
                new AddNoteFromMetadataModal(this.app, this).open();
            }
        })
    }

    async onunload() {
        await this.saveSetting();
    }

    async loadSetting() {
        // Create an empty object where we inject the values that "DEFAULT_SETTINGS" stores, then, we inject the values loaded by "this.loadData()".
        // If a key already exists in this new empty object thanks to "DEFAULT_SETTINGS", it gets overwritten by the one loaded by "this.loadData()".
        // "loadData()" returns the value stored in the "data.json" file located in the root of the folder.
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSetting() {
        // Save the settings of the plugin stored in the "settings" variable into the "data.json" file.
        await this.saveData(this.settings);
    }
}
// Import des différentes classes d'Obsidian.
import {
    App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting
} from "obsidian";
// Import des autres classes et jeux de variables nécessaires.
import {
    AnkiIntegrationSettings,
    DEFAULT_SETTINGS,
    AnkiIntegrationSettingTab
} from "./AnkiIntegrationSettingTab"

export default class AnkiIntegration extends Plugin {
    settings: AnkiIntegrationSettings;

    async onload() {
        await this.loadSetting();

        // Adding the setting tab the user can use to edit settings.
        this.addSettingTab(new AnkiIntegrationSettingTab(this.app, this))
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
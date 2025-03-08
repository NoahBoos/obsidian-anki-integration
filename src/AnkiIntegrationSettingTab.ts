import {App, PluginSettingTab, Setting} from "obsidian";
import AnkiIntegration from "./main";
import {
    RequestPermission,
    SynchronizeData
} from "./AnkiConnect";

// Anki Integration Settings declaration
export interface AnkiIntegrationSettings {
    mySetting: string;
    ankiData: Object;
}

// Anki Integration Settings default value
export const DEFAULT_SETTINGS: AnkiIntegrationSettings = {
    mySetting: "default value",
    ankiData: {}
}

export class AnkiIntegrationSettingTab extends PluginSettingTab {
    plugin: AnkiIntegration;

    constructor(app: App, plugin: AnkiIntegration) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();

        // Adding the connection button
        new Setting(containerEl)
            .setName("Connect Obsidian to Anki")
            .setDesc("Click this button to connect Obsidian to Anki. Make sure that your Anki App is running before attempting to connect.")
            .addButton((button) => button
                .setButtonText("Connect")
                .setCta()
                .onClick(async () => {
                    await RequestPermission();
                }))
        // Adding the synchronization button
        new Setting(containerEl)
            .setName("Synchronize data between Obsidian and Anki")
            .setDesc("Click this button to synchronize data between Obsidian and Anki. Make sure that your Anki App is running before attempting to synchronize.")
            .addButton((button) => button
                .setButtonText("Synchronize")
                .setCta()
                .onClick(async () => {
                    await SynchronizeData(this.plugin);
                }))
    }
}
import {
    App,
    PluginSettingTab,
    Setting
} from "obsidian";
import AnkiIntegration from "./main";
import {
    RequestPermission,
    SynchronizeData
} from "./AnkiConnect";

// Anki Integration Settings declaration
export interface AnkiIntegrationSettings {
    ankiData: Object;
    invisibleCodeblock: boolean;
}

// Anki Integration Settings default value
export const DEFAULT_SETTINGS: AnkiIntegrationSettings = {
    ankiData: {},
    invisibleCodeblock: true
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
        // Adding invisibleCodeblock toggle
        new Setting(containerEl)
            .setName("Enable invisible codeblock")
            .setDesc("Toggle by default, define if Anki Integration codeblock should be hidden or not.")
            .addToggle((toggle) => toggle
                .setValue(this.plugin.settings.invisibleCodeblock)
                .onChange(async (value) => {
                    this.plugin.settings.invisibleCodeblock = value;
                    await this.plugin.saveSetting();
                }))
    }
}
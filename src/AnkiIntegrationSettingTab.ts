import {App, PluginSettingTab, Setting} from "obsidian";
import AnkiIntegration from "./main";

// Anki Integration Settings declaration
export interface AnkiIntegrationSettings {
    mySetting: string;
}

// Anki Integration Settings default value
export const DEFAULT_SETTINGS: AnkiIntegrationSettings = {
    mySetting: "default value"
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

        // Adding a setting to the setting tab.
        new Setting(containerEl)
            // Name
            .setName("My setting")
            // Description
            .setDesc("This is the description of My Setting.")
            // Input field
            .addText(text => text
                // Placeholder text
                .setPlaceholder("Enter your value")
                // Default value in the input field
                .setValue(this.plugin.settings.mySetting)
                // Code to execute when changing the value of the input field
                .onChange(async (value) => {
                    // Overwriting the setting in the settings object of the plugin.
                    this.plugin.settings.mySetting = value;
                    // Saving settings in "data.json" thanks to "saveSetting()".
                    await this.plugin.saveSetting();
                }))
    }
}
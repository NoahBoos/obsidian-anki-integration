// Import des différentes classes d'Obsidian.
import {
    MarkdownView,
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
import {AddNoteFromCodeBlockModal} from "./modals/AddNoteFromCodeBlockModal";

export default class AnkiIntegration extends Plugin {
    settings: AnkiIntegrationSettings;

    async onload() {
        await this.loadSetting();
        await RequestPermission();
        await SynchronizeData(this);

        /**
         * Add a new setting tab the user will be able to use to edit settings.
         */
        this.addSettingTab(new AnkiIntegrationSettingTab(this.app, this));

        /**
         * Add a command to trigger SynchronizeData().
         */
        this.addCommand({
            id: 'synchronize-data',
            name: 'Synchronize data',
            callback: () => {
                SynchronizeData(this);
            }
        });

        /**
         * Add a command to open the CreateDeckModal
         */
        this.addCommand({
           id: 'create-a-new-deck',
           name: 'Create a new deck',
           callback: () => {
               new CreateDeckModal(this.app).open();
           }
        });

        /**
         * @description Adding a command to open the AddNoteModal.
         */
        this.addCommand({
            id: 'add-a-new-note',
            name: 'Add a new note',
            callback: () => {
                new AddNoteModal(this.app, this).open();
            }
        });

        /**
         * @description Adding a command to open the AddNoteFromMetadataModal.
         */
        this.addCommand({
            id: 'add-a-new-note-from-metadata',
            name: 'Add a new note from metadata',
            callback: () => {
                new AddNoteFromMetadataModal(this.app, this).open();
            }
        });

        /**
         * @description Add a command to open the AddNoteFromCodeBlockModal
         */
        this.addCommand({
            id: 'add-a-new-note-to-code-block',
            name: 'Add a new note from code block',
            callback: () => {
                new AddNoteFromCodeBlockModal(this.app, this).open();
            }
        });

        /**
         * @description Register a new Markdown code block processor linked to code block using "AnkiIntegration" as language.
         */
        this.registerMarkdownCodeBlockProcessor("AnkiIntegration", (source, element, context) => {
            /**
             * @type {MarkdownView} activeView
             * @description The current view type of the active note.
             */
            const activeView: MarkdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (this.settings.invisibleCodeblock === true && activeView.getMode() === "preview") {
                return;
            } else {
                /**
                 * @type {RegExpMatchArray} headerText
                 * @description The first line of the parsed code block.*
                 * @legacy
                 */
                // const headerText: RegExpMatchArray = source.match(/^[^\n]+/);
                /**
                 * @type {HTMLHeadingElement} h1
                 * @description The header element used to "prefix" the code block.
                 * @legacy
                 */
                // let h1: HTMLHeadingElement = element.createEl("h1", ({
                //     text: headerText[0]
                // }));
                /**
                 * @type {HTMLPreElement} pre
                 * @description A <pre> element that will store the <code> element.
                 * @remarks Default CSS class "language-none" is removed.
                 */
                let pre: HTMLPreElement = element.createEl("pre");
                pre.removeClass("language-none");
                /**
                 * @type {HTMLElement} code
                 * @description A <code> element that will store the inner content of the code block.
                 * @remarks Default CSS class "language-none" is removed.
                 */
                let code: HTMLElement = pre.createEl("code", ({ text: source }));
                code.removeClass("language-none");
            }
        });
    }

    async onunload() {
        await this.saveSetting();
    }

    /**
     * @description
     * Create an empty object where we inject the values that "DEFAULT_SETTINGS" stores, then, we inject the values loaded by "this.loadData()".
     * If a key already exists in this new empty object thanks to "DEFAULT_SETTINGS", it gets overwritten by the one loaded by "this.loadData()".
     * "loadData()" returns the value stored in the "data.json" file located in the root of the folder.
     */
    async loadSetting() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    /**
     * Save the settings of the plugin stored in the "settings" variable into the "data.json" file.
     */
    async saveSetting() {
        await this.saveData(this.settings);
    }
}
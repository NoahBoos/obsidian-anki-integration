import AnkiIntegration from "./main";
import {ButtonComponent, DropdownComponent, Modal, TFile} from "obsidian";
import {AddNoteFromMetadataModal} from "./modals/AddNoteFromMetadataModal";
import {AddNoteFromCodeBlockModal} from "./modals/AddNoteFromCodeBlockModal";

/**
 * Fetches a model that has been saved in data.json by SynchronizeData().
 * @param {AnkiIntegration} plugin - A reference to the instance of the plugin.
 * @param {string} name - The name of the model whose data we want to fetch.
 * @return {Object} model - The model data, if found.
 */
export function FetchModelByName(plugin: AnkiIntegration, name: string): Object {
    /**
     * @type {Object<string, string|number>} modelsData
     * A reference to the JSON containing every model-related data.
     */
    const modelsData: Object = plugin.settings.ankiData["modelsData"];
    for (const [key, model] of Object.entries(modelsData)) {
        if (model.name === name) {
            return model;
        }
    }
}

/**
 * Adds a container (HTML: `<div>`) as a child of a given HTMLElement.
 * @param {HTMLElement} parent - The parent container to which the container will be added.
 * @param {string[]} classes - An array of strings containing CSS classes to add to the created element.
 * @return {HTMLDivElement} createdEl - The created container.
 */
export function AddContainer(parent: HTMLElement, classes: string[] = []): HTMLDivElement {
    /**
     * @remarks
     * Pushes into classes all CSS classes that are mandatory for a container.
     */
    classes.push();
    /**
     * @type {HTMLDivElement} createdEl
     * The created container.
     */
    let createdEl: HTMLDivElement;
    createdEl = parent.createEl("div", {
        cls: [
            classes.join(" ")
        ]
    });
    return createdEl;
}

/**
 * Adds a title (HTML: `<h1>`) as a child of a given HTMLElement.
 * @param {HTMLElement} parent - The parent container to which the title will be added.
 * @param {string} title - A string containing the text that needs to be displayed.
 * @param {string[]} classes - An array of strings containing CSS classes to add to the created element.
 * @return {HTMLElement} createdEl - The created title.
 */
export function AddTitle(parent: HTMLElement, title: string, classes: string[] = []): HTMLElement {
    /**
     * @remarks
     * Pushes into classes all CSS classes that are mandatory for a container.
     */
    classes.push(
        "ankiIntegrationModal__h1--margin",
        "ankiIntegrationModal__h1--text-align"
    );
    /**
     * @type {HTMLElement} createdEl
     * The created title.
     */
    let createdEl: HTMLElement;
    createdEl = parent.createEl("h1", {
        text: title,
        cls: [
            classes.join(" ")
        ]
    });
    return createdEl;
}

/**
 * Adds a subtitle (HTML: `<h2>`) as a child of a given HTMLElement.
 * @param {HTMLElement} parent - The parent container to which the subtitle will be added.
 * @param {string} subtitle - A string containing the text that needs to be displayed.
 * @param {string[]} classes - An array of strings containing CSS classes to add to the created element.
 * @return {HTMLElement} createdEl - The created subtitle.
 */
export function AddSubtitle(parent: HTMLElement, subtitle: string, classes: string[] = []): HTMLElement {
    /**
     * @remarks
     * Pushes into classes all CSS classes that are mandatory for a container.
     */
    classes.push(
        "ankiIntegrationModal__h2--fit-content"
    );
    /**
     * @type {HTMLElement} createdEl
     * The created subtitle.
     */
    let createdEl: HTMLElement;
    createdEl = parent.createEl("h2", {
        text: subtitle,
        cls: [
            classes.join(" ")
        ]
    });
    return createdEl;
}

/**
 * Adds a paragraph (HTML: `<p>`) as a child of a given HTMLElement.
 * @param {HTMLElement} parent - The parent container to which the paragraph will be added.
 * @param {string} text - A string containing the text that needs to be displayed.
 * @param {string[]} classes - An array of strings containing CSS classes to add to the created element.
 * @return {HTMLElement} createdEl - The created paragraph.
 */
export function AddParagraph(parent: HTMLElement, text: string, classes: string[] = []): HTMLElement {
    /**
     * @remarks
     * Pushes into classes all CSS classes that are mandatory for a container.
     */
    classes.push(
        "ankiIntegrationModal__paragraph--text-align"
    );
    /**
     * @type {HTMLElement} createdEl
     * The created paragraph.
     */
    let createdEl: HTMLElement;
    createdEl = parent.createEl("p", {
        text: text,
        cls: [
            classes.join(" ")
        ]
    });
    return createdEl;
}

/**
 * Adds a dropdown (Instance of: `DropdownComponent`) (HTML: `<select>`) as a child of a given HTMLElement.
 * @param {HTMLElement} parent - The parent container to which the dropdown will be added.
 * @param {string} defaultString - A string containing the text of the default option.
 * @param {string[]} classes - An array of strings containing CSS classes to add to the created element.
 * @return {DropdownComponent} createdEl - The created dropdown.
 */
export function AddDropdown(parent: HTMLElement, defaultString: string, classes: string[] = []): DropdownComponent {
    /**
     * @remarks
     * Pushes into classes all CSS classes that are mandatory for a container.
     */
    classes.push(
        "ankiIntegrationModal__dropdown--default-width"
    )
    /**
     * @type {DropdownComponent} createdEl
     * The created dropdown component.
     */
    let createdEl: DropdownComponent;
    createdEl = new DropdownComponent(parent);
    /**
     * @remarks
     * `selectEl` is a property of `createdEl` that allows you to access the `<select>` element.
     */
    createdEl.selectEl.addClass(classes.join(" "));
    createdEl.addOption("default", defaultString);
    return createdEl;
}

/**
 * Adds all the options (HTML: `<option>`) of a saved dataset to a given DropdownComponent.
 * @param {HTMLElement} parent - The parent container to which the options will be added.
 * @param {string[]} keys - An array of strings representing the keys of sub-objects inside `where`.
 * @param {string} valueKey - A string containing the key used to retrieve the value of each option.
 * @param {string} placeholderKey - A string containing the key used to retrieve placeholder text of each option.
 * @param {Object} where - An object containing the dataset to create the options.
 */
export function AddOptionsToDropdownFromDataset(parent: DropdownComponent, keys: string[], valueKey: string, placeholderKey:string, where: Object) {
    for (const key of keys) {
        const optionValue = where[key][valueKey];
        const optionPlaceholder = where[key][placeholderKey];
        parent.addOption(optionValue, optionPlaceholder)
    }
}

/**
 * Adds a label (HTML `<label>`) as a child of a given HTMLElement.
 * @param {HTMLElement} parent - The parent container to which the label will be added.
 * @param {string} text - A string containing the text that needs to be displayed.
 * @param {string[]} classes - An array of strings containing CSS classes to add to the created element.
 * @return {HTMLLabelElement} createdEl - The created label.
 */
export function AddLabel(parent: HTMLElement, text: string, classes: string[] = []): HTMLLabelElement {
    /**
     * @remarks
     * Pushes into classes all CSS classes that are mandatory for a container.
     */
    classes.push();
    /**
     * @type {HTMLLabelElement} createdEl
     * The created label.
     * @remarks
     * Defining the created label as an `HTMLLabelElement` instead of a generic `HTMLElement` ensures access to label-specific properties.
     */
    let createdEl: HTMLLabelElement;
    createdEl = parent.createEl("label", {
        text: text,
        cls: [
            classes.join(" ")
        ]
    });
    return createdEl;
}

/**
 * Adds an input (HTML `<input>`) as a child of a given HTMLElement.
 * @param {HTMLElement} parent - The parent container to which the input will be added.
 * @param {string} type - A string containing the type of the input.
 * @param {string} placeholder - A string containing the placeholder text of the input.
 * @param {string} value - A string containing the placeholder text of the input.
 * @param {string[]} classes - An array of strings containing CSS classes to add to the created element.
 * @return {HTMLInputElement} createdEl - The created input.
 */
export function AddInput(parent: HTMLElement, type: string, placeholder: string = "", value: string = "", classes: string[] = []): HTMLInputElement {
    /**
     * @remarks
     * Pushes into classes all CSS classes that are mandatory for a container.
     */
    classes.push(
        "ankiIntegrationModal__input--default-width"
    );
    /**
     * @type {HTMLInputElement} createdEl
     * The created input.
     * @remarks
     * Defining the created input as an `HTMLInputElement` instead of a generic `HTMLElement` ensures access to input-specific properties such as `value` or `checked`.
     */
    let createdEl: HTMLInputElement;
    createdEl = parent.createEl("input", {
        type: type,
        placeholder: placeholder,
        value: value,
        cls: [
            classes.join(" ")
        ]
    });
    return createdEl;
}

/**
 * Adds a pair of label and input as children of a given HTMLElement for each key in the provided array.
 * @param {HTMLElement} parent - The parent container to which the label and input pairs will be added.
 * @param {Array} inputData - An array of input data storing the keys used to create each label-input pair and the value of each input.
 */
export function AddFieldGroups(parent: HTMLElement, inputData: Array<Object>) {
    for (let i = 0; i < inputData.length; i++) {
        AddLabel(parent, inputData[i]["fieldName"]);
        AddInput(parent, "text", inputData[i]["fieldName"], inputData[i]["fieldValue"]);
    }
}

/**
 * Adds a button as a child of a given HTMLElement.
 * @param {HTMLElement} parent - The parent container to which the button will be added.
 * @param {string} text - A string containing the text that needs to be displayed.
 * @param {string} icon - A string corresponding to the lucid icon identifier.
 * @param {string[]} classes - An array of string containing CSS classes to add to the created element.
 * @return {ButtonComponent} createdEl - The created button.
 */
export function AddButton(parent: HTMLElement, text: string = null, icon: string = null, classes: string[] = []): ButtonComponent {
    /**
     * @remarks
     * Pushes into classes all CSS classes that are mandatory for a container.
     */
    classes.push(
        "ankiIntegrationModal__button--default-width",
        "ankiIntegrationModal__button--default-margin",
        "ankiIntegrationModal__button--default-padding"
    );
    /**
     * @type {ButtonComponent} createdEl
     * The created button.
     */
    let createdEl: ButtonComponent = new ButtonComponent(parent);
    createdEl.setCta();
    if (text) {
        createdEl.setButtonText(text);
    }
    if (icon) {
        createdEl.setIcon(icon);
    }
    classes.forEach(cssClass => {
        createdEl.setClass(cssClass);
    })
    return createdEl;
}

/**
 * Function that create and push fields group data in a given array.
 *
 * @description
 * The following for statement inject in fieldsGroupData a new object corresponding to an input and its label that has to be generated.
 * Each object has the following property :
 * - fieldName, a string used as the label text and the placeholder text of the input.
 * - fieldValue, a string used as the value text of the input.
 * The fieldName is mandatorily filled, while the fieldValue is optional by being set to null in the first place and being overwritten if the set of value contains a key that is the same as the currently used key.
 * @param fieldsGroupData - The array in which fieldsGroupData Object will be push.
 * @param {Array} keys - The set of keys.
 * @param {Array} values - The set of values.
 */
export function CreateFieldsGroupData(fieldsGroupData: Array<Object>, keys: Array<string>, values: Object = {}) {
    for (let i = 0 ; i < keys.length; i++) {
        const fieldName = keys[i];
        let fieldValue = null;
        if (values["fields"]) {
            fieldValue = ExtractValueFromCodeBlock(fieldValue, values, fieldName);
        } else {
            fieldValue = ExtractValueFromMetadata(fieldValue, values, fieldName);
        }
        fieldsGroupData[i] = {
            fieldName: fieldName,
            fieldValue: fieldValue
        }
    }
}

/**
 * Extract value from metadata.
 * @param {string} fieldValue - The value to change.
 * @param {Object} values - An object storing the gathered values to draw in.
 * @param {string} fieldName - The name of the field the value has to be taken for.
 * @return {string} fieldValue
 */
function ExtractValueFromMetadata(fieldValue: string, values: Object, fieldName: string): string {
    if (values.hasOwnProperty(fieldName.toLowerCase())) {
        fieldValue = values[fieldName.toLowerCase()];
        return fieldValue;
    }
}

/**
 * Extract value from code block.
 * @param {string} fieldValue - The value to change.
 * @param {Object} values - An object storing the gathered values to draw in.
 * @param {string} fieldName - The name of the field the value has to be taken for.
 * @return {string} fieldValue
 */
function ExtractValueFromCodeBlock(fieldValue: string, values: Object, fieldName: string): string {
    if (values["fields"].hasOwnProperty(fieldName.toLowerCase())) {
        fieldValue = values["fields"][fieldName.toLowerCase()];
        return fieldValue;
    }
}

/**
 * Function that returns the content of a given TFile.
 * @param {Modal} modal - The instance of the modal that needs to read a file content.
 * @param {TFile} fileData - The file that has to be read.
 */
export async function ReadFileContent(modal: Modal, fileData: TFile): Promise<string> {
    return await modal.app.vault.read(fileData);
}

/**
 * Check if the value of noteParameters["deck"] exists as an option of deckSelector and pre-select it if it exists.
 */
export function AutoAssignDeck(deckSelector: DropdownComponent, noteParameters: Object) {
    let deckSelectorHasNoteParametersDeck: boolean = Array.from(deckSelector.selectEl.options).some(option => option.value === noteParameters["deck"]);
    if (deckSelectorHasNoteParametersDeck) {
        deckSelector.setValue(noteParameters["deck"]);
    }
}

/**
 * Check if the value of noteParameters["model"] exists as an option of modelSelector and pre-select it if it exists.
 */
export function AutoAssignModel(modelSelector: DropdownComponent, noteParameters: Object) {
    let modelSelectorHasNoteParametersModel: boolean = Array.from(modelSelector.selectEl.options).some(option => option.value === noteParameters["model"]);
    if (modelSelectorHasNoteParametersModel) {
        modelSelector.setValue(noteParameters["model"]);
    }
}

/**
 * If there is no model metadata existing as model option, it displays the "Select a model..." message,
 * else, since it means that a model has been preselected, it generates the fields groups and pre-fill them.
 */
export function AutoGenerateFields(modal: AddNoteFromMetadataModal | AddNoteFromCodeBlockModal, modelSelector: DropdownComponent, inputContainer: HTMLDivElement, noteParameters: Object) {
    let modelSelectorHasNoteParametersModel: boolean = Array.from(modelSelector.selectEl.options).some(option => option.value === noteParameters["model"]);
    if (!modelSelectorHasNoteParametersModel) {
        AddParagraph(inputContainer, "Select a model to see its fields.");
    } else {
        modal.AddFieldsGroupsToModal(inputContainer, modelSelector.getValue(), noteParameters);
    }
}

/**
 * Build an array that stores all tags entered by the user in the form used to add a note.
 * @return {Array<string>} tags
 */
export function BuildTagsArray(): Array<string> {
    const tagInputs = document.querySelectorAll('#tagInput');
    let tags: Array<string> = [];
    tagInputs.forEach((tagInput) => {
        // @ts-ignore
        tags.push(tagInput.value);
    })
    return tags;
}

/**
 * Adds a div as a child of a given HTMLElement. The div contains an input and a button.
 * @param {HTMLElement} parent - The parent container to which the button will be added.
 * @return {HTMLDivElement} tagInputGroup
 */
export function AddTagInputGroup(parent: HTMLElement, tagValue: string = null) {
    /**
     * @type {HTMLDivElement} inputGroup
     * @description A container storing the input field and the delete input field button.
     */
    const tagInputGroup: HTMLDivElement = AddContainer(parent);
    tagInputGroup.addClasses([
        "ankiIntegrationModal__container--width-fit-content",
        "ankiIntegrationModal__container--flex-row"
    ]);
    /**
     * @type {HTMLInputElement} tagInput
     * @description A tag input field.
     * @remarks Default width class has to be removed and replaced by a field-sizing width for the great-parent's wrap to work.
     */
    const tagInput: HTMLInputElement = AddInput(tagInputGroup, "text", "My tag::Super", tagValue, [
        "ankiIntegrationModal__input--field-sizing-content",
        "ankiIntegrationModal__tagInput--border",
        "ankiIntegrationModal__tagInput--focus"
    ]);
    tagInput.removeClasses([
        "ankiIntegrationModal__input--default-width"
    ]);
    tagInput.id = 'tagInput';
    /**
     * @type {ButtonComponent} deleteTagInputButton
     * @description A button allowing the user to delete the field group the button belongs to.
     * @remarks For the button to look great along with the input, the CTA is disabled, a class is added and all the default classes are removed.
     */
    const deleteTagInputButton: ButtonComponent = AddButton(tagInputGroup, "", "x", [
        "ankiIntegrationModal__deleteInputButton--border",
        "ankiIntegrationModal__icon--color-red"
    ]);
    deleteTagInputButton.removeCta();
    deleteTagInputButton.buttonEl.removeClasses([
        "ankiIntegrationModal__button--default-width",
        "ankiIntegrationModal__button--default-margin",
        "ankiIntegrationModal__button--default-padding"
    ]);
    /**
     * @description deleteTagInputButton's onClick() event listener used to delete an input group in tagsBody.
     */
    deleteTagInputButton.onClick(async () => {
        tagInputGroup.remove();
    })

    tagInput.focus();

    return tagInputGroup;
}
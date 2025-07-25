import AnkiIntegration from "./main";
import {
    ButtonComponent,
    DropdownComponent,
} from "obsidian";

/**
 * Fetches a model that has been saved in data.json by SynchronizeData().
 * @param {AnkiIntegration} plugin - A reference to the instance of the plugin.
 * @param {string} name - The name of the model whose data we want to fetch.
 * @return {Object} model - The model data, if found.
 */
export function FetchModelByName(plugin: AnkiIntegration, name: string): Object {
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
export function AddContainer(parent: HTMLElement, classes: string[] = [], id: string = null): HTMLDivElement {
    /**
     * @remarks
     * Pushes into classes all CSS classes that are mandatory for a container.
     */
    classes.push();
    let createdEl: HTMLDivElement;
    createdEl = parent.createEl("div", {
        cls: [
            classes.join(" ")
        ]
    });
    if (id) {
        createdEl.id = id;
    }
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
 * @param id
 * @return {HTMLElement} createdEl - The created paragraph.
 */
export function AddParagraph(parent: HTMLElement, text: string, classes: string[] = [], id: string = null): HTMLElement {
    /**
     * @remarks
     * Pushes into classes all CSS classes that are mandatory for a container.
     */
    classes.push(
        "ankiIntegrationModal__paragraph--text-align",
        "ankiIntegrationModal__paragraph--default-width"
    );
    let createdEl: HTMLElement;
    createdEl = parent.createEl("p", {
        text: text,
        cls: [
            classes.join(" ")
        ]
    });
    if (id) {
        createdEl.id = id;
    }
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
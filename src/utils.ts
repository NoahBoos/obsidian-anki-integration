import AnkiIntegration from "./main";
import {DropdownComponent} from "obsidian";

// Allow to gather a model that has been saved in data.json thanks to SynchronizeData().
export function GetModelByName(plugin: AnkiIntegration, name: string) {
    const modelsData: Object = plugin.settings.ankiData["modelsData"];
    for (const [key, model] of Object.entries(modelsData)) {
        if (model.name === name) {
            return model;
        }
    }
}

// Adding a container to a given HTMLElement.
export function AddContainer(parent: HTMLElement, classes: string[] = []) {
    // Pushing into classes[] all mandatory classes.
    classes.push(
        "ankiIntegrationModal__dropdownContainer--flex"
    );
    // Creating the div HTMLDivElement.
    let createdEl: HTMLDivElement;
    createdEl = parent.createEl("div", {
        cls: [
            classes.join(" ")
        ]
    });
    // Returning the title.
    return createdEl;
}

// Adding a title to a given HTMLElement.
export function AddTitle(parent: HTMLElement, title: string, classes: string[] = []) {
    // Pushing into classes[] all mandatory classes.
    classes.push(
        "ankiIntegrationModal__h1--margin",
        "ankiIntegrationModal__h1--text-align"
    );
    // Creating the title as an H1 HTMLElement.
    let createdEl: HTMLElement;
    createdEl = parent.createEl("h1", {
        text: title,
        cls: [
            classes.join(" ")
        ]
    });
    // Returning the title.
    return createdEl;
}

// Adding a subtitle to a given HTMLElement.
export function AddSubtitle(parent: HTMLElement, subtitle: string, classes: string[] = []) {
    // Pushing into classes[] all mandatory classes.
    classes.push();
    // Creating the subtitle as an H2 HTMLElement.
    let createdEl: HTMLElement;
    createdEl = parent.createEl("h2", {
        text: subtitle,
        cls: [
            classes.join(" ")
        ]
    });
    // Returning the subtitle.
    return createdEl;
}

// Adding a paragraph to a given HTMLElement.
export function AddParagraph(parent: HTMLElement, text: string, classes: string[] = []) {
    // Pushing into classes[] all mandatory classes.
    classes.push(
        "ankiIntegrationModal__paragraph--text-align"
    );
    // Creating the paragraph as a p HTMLElement.
    let createdEl: HTMLElement;
    createdEl = parent.createEl("p", {
        text: text,
        cls: [
            classes.join(" ")
        ]
    });
    // Returning the paragraph.
    return createdEl;
}

// Adding a drop-down input to a given HTMLElement.
export function AddDropdown(parent: HTMLElement, defaultString: string, classes: string[] = []) {
    // Pushing into classes[] all mandatory classes.
    classes.push(
        "ankiIntegrationModal__dropdown--width"
    )
    // Creating the drop-down DropdownComponent.
    let createdEl: DropdownComponent;
    createdEl = new DropdownComponent(parent);
    /* TIPS
    *  "selectEl" allow you to interact directly on the selector contains in the created drop-down.
    */
    createdEl.selectEl.addClass(classes.join(" "));
    createdEl.addOption("default", defaultString);
    // Returning the drop-down input.
    return createdEl;
}

// Adding all the inputs of a saved dataset to a given DropdownComponent.
export function AddInputsToDropdownFromDataset(parent: DropdownComponent, keys: string[], valueKey: string, placeholderKey:string, where: Object) {
    for (const key of keys) {
        const inputValue = where[key][valueKey];
        const inputPlaceholder = where[key][placeholderKey];
        parent.addOption(inputValue, inputPlaceholder)
    }
}

// Adding an input to a given HTMLElement.
export function AddInput(parent: HTMLElement, type: string, placeholder: string = "", classes: string[] = []) {
    // Pushing into classes[] all mandatory classes.
    classes.push(
        "ankiIntegrationModal__input--width"
    );
    // Creating the input HTMLInputElement.
    /* TIPS
     * It's important to define it as an HTMLInputElement instead of an HTMLElement,
     * if we want to access the data an input would usually store, such as its value.
     */
    let createdEl: HTMLInputElement;
    createdEl = parent.createEl("input", {
        type: type,
        placeholder: placeholder,
        cls: [
            classes.join(" ")
        ]
    });
    // Returning the input.
    return createdEl;
}

// Adding a button to a given HTMLElement.
export function AddButton(parent: HTMLElement, text: string, type: string, classes: string[] = []) {
    // Pushing into classes[] all mandatory classes.
    classes.push(
        "ankiIntegrationModal__button--width",
        "ankiIntegrationModal__button--margin",
        "ankiIntegrationModal__button--padding"
    );
    // Creating the button HTMLButtonElement.
    /* TIPS
     * It's important to define it as an HTMLButtonElement instead of an HTMLElement,
     * if we want to access the data a button would usually store, such as its value.
     */
    let createdEl: HTMLButtonElement;
    createdEl = parent.createEl("button", {
        text: text,
        attr: {
            type: type
        },
        cls: [
            classes.join(" ")
        ]
    });
    // Returning the button.
    return createdEl;
}
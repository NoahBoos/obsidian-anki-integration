import {
    ButtonComponent,
    DropdownComponent,
    FrontMatterCache,
    Modal
} from "obsidian";
import {
    AddButton,
    AddContainer,
    AddDropdown,
    AddFieldGroups, AddInput,
    AddOptionsToDropdownFromDataset,
    AddParagraph,
    AddSubtitle,
    FetchModelByName
} from "../utils";
import {ProcessAddNote} from "../AnkiConnect";
import AnkiIntegration from "../main";
import {AddNoteFromMetadataModal} from "./AddNoteFromMetadataModal";
import {AddNoteFromCodeBlockModal} from "./AddNoteFromCodeBlockModal";

export function AddDeckSelector(parent: HTMLDivElement, ankiData: Object) {
    const deckSelector: DropdownComponent = AddDropdown(parent, "Choose a deck");
    const deckKeys: string[] = Object.keys(ankiData["decksData"]);
    AddOptionsToDropdownFromDataset(deckSelector, deckKeys, "name", "name", ankiData["decksData"]);

    return deckSelector;
}

export function AddModelSelector(parent: HTMLDivElement, ankiData: Object) {
    const modelSelector: DropdownComponent = AddDropdown(parent, "Choose a model");
    const modelKeys: string[] = Object.keys(ankiData["modelsData"]);
    AddOptionsToDropdownFromDataset(modelSelector, modelKeys, "name", "name", ankiData["modelsData"]);

    return modelSelector;
}

export function AddTagsSection(parent: HTMLElement) {
    const tagsContainer: HTMLDivElement = AddContainer(parent, [
        "ankiIntegrationModal__container--flex-column"
    ]);

    const tagsHeader: HTMLDivElement = AddContainer(tagsContainer, [
        "ankiIntegrationModal__container--flex-row",
        "ankiIntegrationModal__container--flex-align-center",
        "ankiIntegrationModal__container--flex-justify-space-between",
    ]);

    AddSubtitle(tagsHeader, "Tags");

    let addTagFieldButton: ButtonComponent = AddButton(tagsHeader, "", "circle-plus");
    addTagFieldButton.buttonEl.removeClasses([
        "ankiIntegrationModal__button--default-width",
        "ankiIntegrationModal__button--default-margin",
        "ankiIntegrationModal__button--default-padding"
    ]);

    const tagsBody: HTMLDivElement = AddContainer(
        tagsContainer,
        [
            "ankiIntegrationModal__container--flex-row",
            "ankiIntegrationModal__container--flex-wrap",
            "ankiIntegrationModal__container--gap-16px"
        ],
        "tagsBody")
    ;

    const tagsBodyParagraph: HTMLElement = AddParagraph(tagsBody, "No tags will be added to this note, click the \"+\" button to add a new one.", [], "tagsBodyTip");

    addTagFieldButton.onClick(async () => {
        if (tagsBody.firstChild == tagsBodyParagraph) {
            tagsBody.removeChild(tagsBodyParagraph);
        }
        AddTagInputGroup(tagsBody, tagsBodyParagraph);
    });

    return tagsContainer;
}

export function AddSubmitButton(parent: HTMLElement, deckSelector: DropdownComponent, modelSelector: DropdownComponent, inputContainer: HTMLDivElement, modal: Modal) {
    const submitButtonEl: ButtonComponent = AddButton(parent, "Create Note");

    submitButtonEl.onClick(async () => {
        const tags: Array<string> = BuildTagsArray();
        await ProcessAddNote(deckSelector, modelSelector, inputContainer, tags, modal);
    });

    parent.addEventListener("keydown", async (event) => {
        if (event.shiftKey && event.key === "Enter") {
            const tags: Array<string> = BuildTagsArray();
            await ProcessAddNote(deckSelector, modelSelector, inputContainer, tags, modal);
        }
    })
}

export function GenerateFieldGroups(plugin: AnkiIntegration, inputContainer: HTMLDivElement, selectedValue: any, inputValues: FrontMatterCache | Object | null) {
    inputContainer.empty();

    const selectedModel: Object = FetchModelByName(plugin, selectedValue);
    const inputFieldGroupData: Array<Object> = [];

    if (selectedValue === "default") {
        AddParagraph(inputContainer, "Select a model to see its fields.");
        return;
    } else {
        if (inputValues) {
            CreateFieldsGroupData(inputFieldGroupData, selectedModel["fields"], inputValues);
            AddFieldGroups(inputContainer, inputFieldGroupData);
        } else {
            CreateFieldsGroupData(inputFieldGroupData, selectedModel["fields"]);
            AddFieldGroups(inputContainer, inputFieldGroupData);
        }
    }
}

/**
 * Adds a div as a child of a given HTMLElement. The div contains an input and a button.
 * @param {HTMLElement} parent - The parent container to which the button will be added.
 * @param tagsBodyParagraph
 * @param {string} tagValue - Speaking for itself.
 * @return {HTMLDivElement} tagInputGroup
 */
export function AddTagInputGroup(parent: HTMLElement, tagsBodyParagraph: HTMLElement, tagValue: string = null): HTMLDivElement {
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
        if (parent.children.length == 0) {
            parent.appendChild(tagsBodyParagraph);
        }
    })

    tagInput.focus();

    return tagInputGroup;
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
        GenerateFieldGroups(modal.plugin, inputContainer, modelSelector.getValue(), noteParameters);
    }
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
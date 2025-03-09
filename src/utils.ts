import AnkiIntegration from "./main";

// Allow to gather a model that has been saved in data.json thanks to SynchronizeData().
export function GetModelByName(plugin: AnkiIntegration, name: string) {
    const modelsData: Object = plugin.settings.ankiData["modelsData"];
    for (const [key, model] of Object.entries(modelsData)) {
        if (model.name === name) {
            return model;
        }
    }
}
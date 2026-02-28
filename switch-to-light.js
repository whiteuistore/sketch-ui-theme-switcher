const sketch = require('sketch');
const document = sketch.getSelectedDocument();
const selectedLayers = document.selectedLayers;

/**
 * REVERSED Renaming rules configuration.
 * Swapping Dark versions back to Light versions.
 */
const RENAMING_RULES = [
    { search: "onDark", replace: "onLight" },
    { search: "DarkUI", replace: "LightUI" }
];

function main() {
    // Filter only Artboards from the current selection
    const selectedArtboards = selectedLayers.layers.filter(layer => layer.type === 'Artboard');

    if (selectedArtboards.length === 0) {
        sketch.UI.message("❌ Please select one or more Artboards");
        return;
    }

    let changeCount = 0;
    let alreadyLightCount = 0; // Counter for symbols already in Light state
    let missingSymbols = new Set();
    const allSymbols = document.getSymbols();

    // Iterate through each selected Artboard
    selectedArtboards.forEach(artboard => {
        // Find all symbol instances inside the current artboard
        const instances = sketch.find('SymbolInstance', artboard);
        
        instances.forEach(instance => {
            const master = instance.master;
            if (!master) return;

            const currentName = master.name;

            // 1. Check if the symbol is ALREADY in Light state
            const isAlreadyLight = RENAMING_RULES.some(r => currentName.endsWith(r.replace));
            if (isAlreadyLight) {
                alreadyLightCount++;
                return;
            }

            // 2. Find a matching rule for the dark version
            let ruleFound = RENAMING_RULES.find(r => currentName.endsWith(r.search));

            if (ruleFound) {
                const newMasterName = currentName.replace(ruleFound.search, ruleFound.replace);
                const newMaster = allSymbols.find(s => s.name === newMasterName);

                if (newMaster) {
                    if (instance.symbolId !== newMaster.symbolId) {
                        instance.symbolId = newMaster.symbolId;
                        changeCount++;
                    }
                } else {
                    // Collect the name of the missing "Light" version
                    missingSymbols.add(newMasterName);
                }
            }
        });
    });

    // --- Final Notifications ---
    
    const artboardCount = selectedArtboards.length;
    let resultMsg = `Processed ${artboardCount} artboard(s). Swapped to Light: ${changeCount}`;
    
    if (alreadyLightCount > 0) {
        resultMsg += ` (Skipped ${alreadyLightCount} already light)`;
    }
    
    sketch.UI.message(`☀️ ${resultMsg}`);

    if (missingSymbols.size > 0) {
        const missingList = Array.from(missingSymbols).join('\n• ');
        sketch.UI.alert(
            "Missing Light Symbols", 
            `The script found dark symbols, but their Light versions are missing in the document:\n\n• ${missingList}`
        );
    }
}

main();
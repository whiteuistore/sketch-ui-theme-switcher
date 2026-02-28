const sketch = require('sketch');
const document = sketch.getSelectedDocument();
const selectedLayers = document.selectedLayers;

/**
 * Renaming rules configuration.
 */
const RENAMING_RULES = [
    { search: "onLight", replace: "onDark" },
    { search: "LightUI", replace: "DarkUI" }
];

function main() {
    // Filter only Artboards from the current selection
    const selectedArtboards = selectedLayers.layers.filter(layer => layer.type === 'Artboard');

    if (selectedArtboards.length === 0) {
        sketch.UI.message("❌ Please select one or more Artboards");
        return;
    }

    let changeCount = 0;
    let alreadyCorrectCount = 0;
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

            // 1. Check if the symbol is already in the target state
            const isAlreadyDark = RENAMING_RULES.some(r => currentName.endsWith(r.replace));
            if (isAlreadyDark) {
                alreadyCorrectCount++;
                return;
            }

            // 2. Find a matching rule for the light version
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
                    missingSymbols.add(newMasterName);
                }
            }
        });
    });

    // --- Final Notifications ---
    
    const artboardCount = selectedArtboards.length;
    let resultMsg = `Processed ${artboardCount} artboard(s). Swapped: ${changeCount}`;
    
    if (alreadyCorrectCount > 0) {
        resultMsg += ` (Skipped ${alreadyCorrectCount} already dark)`;
    }
    
    sketch.UI.message(`✅ ${resultMsg}`);

    if (missingSymbols.size > 0) {
        const missingList = Array.from(missingSymbols).join('\n• ');
        sketch.UI.alert(
            "Missing Symbols in Library", 
            `Found ${missingSymbols.size} symbols to swap, but their Dark versions are missing:\n\n• ${missingList}`
        );
    }
}

main();
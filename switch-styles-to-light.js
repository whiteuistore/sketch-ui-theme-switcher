const sketch = require('sketch');
const document = sketch.getSelectedDocument();
const selectedLayers = document.selectedLayers;

/**
 * REVERSED Configuration for Style renaming rules.
 * Swapping Dark versions back to Light versions.
 */
const STYLE_RULES = [
    { search: "onDark", replace: "onLight" },
    { search: "DarkUI", replace: "LightUI" }
];

// Global counters for the final report
let changeCount = 0;
let alreadyLightCount = 0;
let missingStyles = new Set();

/**
 * Recursive function to process layers and their children deeply
 */
function processLayer(layer, layerStyles) {
    // 1. Attempt to swap style if the layer has one
    if (layer.sharedStyleId) {
        const currentStyle = layer.sharedStyle;
        if (currentStyle) {
            const styleName = currentStyle.name;

            // Check if the style is already in Light state
            const isAlreadyLight = STYLE_RULES.some(r => styleName.endsWith(r.replace));
            if (isAlreadyLight) {
                alreadyLightCount++;
            } else {
                // Find a matching rule for the dark version
                let ruleFound = STYLE_RULES.find(r => styleName.endsWith(r.search));

                if (ruleFound) {
                    const targetStyleName = styleName.replace(ruleFound.search, ruleFound.replace);
                    const targetStyle = layerStyles.find(s => s.name === targetStyleName);

                    if (targetStyle) {
                        layer.sharedStyle = targetStyle;
                        layer.style.syncWithSharedStyle(targetStyle);
                        changeCount++;
                    } else {
                        missingStyles.add(targetStyleName);
                    }
                }
            }
        }
    }

    // 2. If the layer has children (Group, Artboard), process them recursively
    if (layer.layers && layer.layers.length > 0) {
        layer.layers.forEach(child => processLayer(child, layerStyles));
    }
}

function main() {
    if (selectedLayers.length === 0) {
        sketch.UI.message("❌ Please select at least one layer or group");
        return;
    }

    const allLayerStyles = document.sharedLayerStyles;

    // Start recursive processing from each selected item
    selectedLayers.forEach(selection => {
        processLayer(selection, allLayerStyles);
    });

    // --- Final Feedback Logic ---

    let resultMsg = `Updated to Light: ${changeCount}`;
    if (alreadyLightCount > 0) {
        resultMsg += ` | Already light: ${alreadyLightCount}`;
    }
    
    if (changeCount > 0 || alreadyLightCount > 0) {
        sketch.UI.message(`☀️ ${resultMsg}`);
    }

    if (missingStyles.size > 0) {
        const missingList = Array.from(missingStyles).join('\n• ');
        sketch.UI.alert(
            "Target Light Styles Not Found", 
            `The script found dark styles, but these Light versions are missing in your library:\n\n• ${missingList}`
        );
    }

    if (changeCount === 0 && missingStyles.size === 0 && alreadyLightCount === 0) {
        sketch.UI.message("ℹ️ No matching dark styles found to switch.");
    }
}

main();
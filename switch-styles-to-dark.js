const sketch = require('sketch');
const document = sketch.getSelectedDocument();
const selectedLayers = document.selectedLayers;

/**
 * Configuration for Style renaming rules.
 */
const STYLE_RULES = [
    { search: "onLight", replace: "onDark" },
    { search: "LightUI", replace: "DarkUI" }
];

// Global counters for the final report
let changeCount = 0;
let noStyleLayers = [];
let missingStyles = new Set();

/**
 * Recursive function to process layers and their children
 */
function processLayer(layer, layerStyles) {
    // 1. Attempt to swap style if the layer has one
    if (layer.sharedStyleId) {
        const currentStyle = layer.sharedStyle;
        if (currentStyle) {
            const styleName = currentStyle.name;
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
    } else {
        // Log layers without styles (only for leaf nodes like Shapes, not Groups)
        if (layer.type !== 'Group' && layer.type !== 'Artboard') {
            noStyleLayers.push(layer.name);
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

    // Start processing from each selected item
    selectedLayers.forEach(selection => {
        processLayer(selection, allLayerStyles);
    });

    // --- Final Feedback Logic ---

    if (changeCount > 0) {
        sketch.UI.message(`✅ Successfully updated ${changeCount} style(s) deep in hierarchy`);
    }

    if (missingStyles.size > 0) {
        const missingList = Array.from(missingStyles).join('\n• ');
        sketch.UI.alert(
            "Target Styles Not Found", 
            `The script found styles to swap, but these Dark versions are missing:\n\n• ${missingList}`
        );
    }

    if (changeCount === 0 && missingStyles.size === 0) {
        sketch.UI.message("ℹ️ No matching styles found in selection.");
    }
}

main();
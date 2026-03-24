const sketch = require('sketch');
const document = sketch.getSelectedDocument();
const selectedLayers = document.selectedLayers;

// Reversed rules: now searching for Dark and replacing with Light
const RULES = [
    { search: "onDark", replace: "onLight" },
    { search: "DarkUI", replace: "LightUI" }
];

function processStyles(layer, layerStyles) {
    if (layer.sharedStyleId) {
        const currentStyle = layer.sharedStyle;
        if (currentStyle) {
            const styleName = currentStyle.name;
            let ruleFound = RULES.find(r => styleName.endsWith(r.search));

            if (ruleFound) {
                const targetStyleName = styleName.replace(ruleFound.search, ruleFound.replace);
                const targetStyle = layerStyles.find(s => s.name === targetStyleName);

                if (targetStyle) {
                    layer.sharedStyle = targetStyle;
                    layer.style.syncWithSharedStyle(targetStyle);
                }
            }
        }
    }

    if (layer.layers && layer.layers.length > 0) {
        layer.layers.forEach(child => processStyles(child, layerStyles));
    }
}

function main() {
    // 1. Select Artboard/Frame
    const selectedFrames = selectedLayers.layers.filter(
        layer => layer.type === 'Artboard' || layer.type === 'Frame'
    );

    if (selectedFrames.length === 0) {
        sketch.UI.message("❌ Please select one or more Artboards or Frames");
        return;
    }

    const allSymbols = document.getSymbols();
    const allLayerStyles = document.sharedLayerStyles;
    const allSwatches = document.swatches;

    let duplicatedFrames = [];

    selectedFrames.forEach(frame => {
        
        // 2. Create a copy
        const newFrame = frame.duplicate();
        newFrame.frame.x = frame.frame.x + frame.frame.width + 100;
        newFrame.frame.y = frame.frame.y;
        
        // Changed suffix to Light Theme
        newFrame.name = frame.name + " Light Theme";

        duplicatedFrames.push(newFrame);

        // 3. Switch SYMBOLS with OVERRIDES PROTECTION
        const instances = sketch.find('SymbolInstance', newFrame);
        
        instances.forEach(instance => {
            const master = instance.master;
            if (!master) return;

            const currentName = master.name;
            
            const isAlreadyLight = RULES.some(r => currentName.endsWith(r.replace));
            if (isAlreadyLight) return;

            let ruleFound = RULES.find(r => currentName.endsWith(r.search));

            if (ruleFound) {
                const newMasterName = currentName.replace(ruleFound.search, ruleFound.replace);
                const newMaster = allSymbols.find(s => s.name === newMasterName);

                if (newMaster && instance.symbolId !== newMaster.symbolId) {
                    
                    const savedOverrides = [];
                    instance.overrides.forEach(ov => {
                        if (!ov.isDefault) {
                            savedOverrides.push({
                                id: ov.id,
                                value: ov.value
                            });
                        }
                    });

                    instance.symbolId = newMaster.symbolId;

                    savedOverrides.forEach(saved => {
                        const targetOv = instance.overrides.find(o => o.id === saved.id);
                        if (targetOv) {
                            targetOv.value = saved.value;
                        }
                    });
                }
            }
        });

        // 4. Switch STYLES
        processStyles(newFrame, allLayerStyles);
    });

    // 5. NATIVE CONFIRMATION DIALOG (NSAlert)
    const alert = NSAlert.alloc().init();
    alert.setMessageText("Apply color variable to text layers?");
    alert.setInformativeText("Select a color variable from the list below.");
    
    // Buttons
    alert.addButtonWithTitle("Apply");
    alert.addButtonWithTitle("Cancel");

    let dropdown = null;
    
    // Ideal width, matching the width of two macOS buttons (Apply + Cancel)
    const uiWidth = 160; 

    // Check if Color Variables exist
    if (allSwatches && allSwatches.length > 0) {
        const swatchNames = allSwatches.map(s => s.name);
        
        // Create a container view
        const view = NSView.alloc().initWithFrame(NSMakeRect(0, 0, uiWidth, 34));
        
        // Create the Dropdown
        dropdown = NSPopUpButton.alloc().initWithFrame(NSMakeRect(0, 4, uiWidth, 25));
        dropdown.addItemsWithTitles(swatchNames);
        
        view.addSubview(dropdown);
        alert.setAccessoryView(view);
    } else {
        const view = NSView.alloc().initWithFrame(NSMakeRect(0, 0, uiWidth, 34));
        
        const warningText = NSTextField.alloc().initWithFrame(NSMakeRect(0, 4, uiWidth, 25));
        warningText.setStringValue("Please create variables");
        warningText.setEditable(false);
        warningText.setBezeled(false);
        warningText.setDrawsBackground(false);
        warningText.setTextColor(NSColor.grayColor());
        
        view.addSubview(warningText);
        alert.setAccessoryView(view);
    }

    const response = alert.runModal();

    if (response === 1000) {
        if (allSwatches && allSwatches.length > 0 && dropdown) {
            const selectedIndex = dropdown.indexOfSelectedItem();
            const selectedSwatch = allSwatches[selectedIndex];
            const targetColor = selectedSwatch.referencingColor;

            // Function to recolor text layers only
            function applyColorToTextLayers(layer) {
                if (layer.type === 'Text') {
                    layer.style.textColor = targetColor;
                }
                
                if (layer.layers && layer.layers.length > 0) {
                    layer.layers.forEach(applyColorToTextLayers);
                }
            }

            duplicatedFrames.forEach(frame => {
                frame.layers.forEach(applyColorToTextLayers);
            });

            document.selectedLayers = duplicatedFrames;
            sketch.UI.message(`✅ Color variable "${selectedSwatch.name}" applied to text layers!`);
        } else {
            sketch.UI.message("⚠️ No color variables to apply, but process finished.");
        }
    } else {
        document.selectedLayers = duplicatedFrames;
        // Updated fallback message for Light Theme
        sketch.UI.message("✅ Light Theme generated! Variables skipped.");
    }
}

main();
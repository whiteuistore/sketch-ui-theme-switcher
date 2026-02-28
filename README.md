# UI Theme Switcher for Sketch 🎨

<img src="https://github.com/whiteuistore/sketch-ui-theme-switcher/blob/b0225bb57c439505e20f98c1cd8c72ca6c1712bd/assets/Plugin%20Cover.png" alt="UI Theme Switcher for Sketch">

**UI Theme Switcher** is a professional Sketch plugin designed to automate the transition between Light and Dark themes. It intelligently swaps Symbol Instances and Shared Styles across your Artboards based on your naming conventions.

---

## 🚀 Features


* **Symbol Swapper:** Automatically replaces "Light" symbols with their "Dark" counterparts.
* **Recursive Style Switcher:** Updates Shared Styles for vector shapes, groups, and stacks, no matter how deep they are nested.
* **Smart Detection:** Skips layers that are already in the target theme to prevent redundant operations.
* **Detailed Feedback:** Provides alerts if a matching symbol or style is missing from your document or library.


---
## ℹ️ How it works

<p align="center">
  <video src="https://github.com/user-attachments/assets/a11f28a6-0732-4ffa-b8d3-36216ad741ed" width="100%" controls>
  </video>
</p>


---

## 🏷 Naming Convention (Required)

For the plugin to work correctly, your Symbols and Shared Styles must follow a specific naming suffix. The plugin looks for matches at the **end** of the name.

### 1. Symbols
Your symbols must have identical paths/names, differing only by the suffix:
* **Light Suffixes:** `onLight` or `LightUI`
* **Dark Suffixes:** `onDark` or `DarkUI`

**Example:**
* `Symbol/abc/onLight` ↔️ `Symbol/abc/onDark`
* `Icons/Settings/LightUI` ↔️ `Icons/Settings/DarkUI`

### 2. Shared Styles (Layer Styles)
The same logic applies to Shared Styles for shapes and groups:
* `Background/Fill - onLight` ↔️ `Background/Fill - onDark`
* `UI/Button/Primary/LightUI` ↔️ `UI/Button/Primary/DarkUI`

> **Note:** The script is case-sensitive. Ensure the suffixes match exactly as shown above.

---

## 🛠 Installation

1.  Download the repository as a `.zip` file.
2.  Unzip the folder.
3.  Ensure the folder is named `UI-Theme-Switcher.sketchplugin`.
4.  Double-click the folder to install it in Sketch or drag it into `Plugins -> Manage Plugins...`.

---

## 📖 How to Use

1.  **Select Artboards:** Choose one or more Artboards on your canvas.
2.  **Run Plugin:** Go to `Plugins -> UI Theme Switcher`.
3.  **Choose Action:**
    * `Switch Symbols to Dark/Light`: Swaps symbol instances.
    * `Switch Styles to Dark/Light`: Recursively updates all vector styles inside your selection.
4.  **Check Results:** A message will appear at the bottom of the screen. If any symbols/styles are missing, a detailed alert will show you exactly what needs to be added to your library.

<p align="center">
  <video src="https://github.com/user-attachments/assets/a522ff6b-2ff3-49e6-a915-a961dc6494cc" width="100%" controls>
  </video>
</p>

---

## ☕ Support & Resources

If you find this plugin helpful, feel free to explore more resources or support the development:

* **Official Website:** [WhiteUI.Store](https://www.whiteui.store/)
* **Support the Project:** [Buy Me a Coffee](https://buymeacoffee.com/whiteuistore)

---

### License
This project is available under the MIT License.

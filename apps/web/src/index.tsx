import { registerRootComponent } from "expo";
import { Platform } from "react-native";
import { App } from "./App";

// Ensure full height on web
if (Platform.OS === "web") {
  const style = document.createElement("style");
  style.textContent = `
    html, body, #root {
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
  `;
  document.head.appendChild(style);
}

registerRootComponent(App);

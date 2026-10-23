import { NAVIGATIONS } from "./navigation.icons";
import { ACTIONS } from "./action.icons";
import { STATUSES } from "./status.icons";
import { SOCIALS } from "./social.icons";
import { UI } from "./ui.icons";

// Export groups for when needed subset
export { NAVIGATIONS, ACTIONS, STATUSES, SOCIALS, UI };

// Main export
export const SVG_PATHS = {
  ...NAVIGATIONS,
  ...ACTIONS,
  ...STATUSES,
  ...SOCIALS,
  ...UI,
};

/** Three valid shapes for an icon value:
 *      1. Single path string                           : "M8 16s6-5.686 6-10A6 6 0 0 0 2 6..."
 *      2. Array of path strings (multi-path icon)      : [
 *                                                          "M2 1a1 1 0 0 1 1-1h10...",
 *                                                          "M4.5 2a.5.5 0 0 0-.5.5v1..."
 *                                                        ]
 *      3. Array of shape objects (mixed shapes)        : [
 *                                                          { type: "path", d: "M8 1.6L1.6 6.4v8h4v-4h4.8v4h4v-8L8 1.6z" },
 *                                                          { type: "circle", cx: 8, cy: 8, r: 3 },
 *                                                          { type: "rect", x: 2, y: 2, width: 4, height: 4, rx: 1 },
 *                                                        ]
 **/

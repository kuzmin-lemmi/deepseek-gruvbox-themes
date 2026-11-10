/**
 * Picker styles.
 *
 * Row chrome reads host tokens only, so it follows whatever theme is active.
 * The preview artwork deliberately uses each theme's literal colors; those are
 * passed as inline styles by the component.
 */
export const PICKER_CSS = `
.dsh-gruvbox-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 0.5px solid var(--dsw-alias-border-l2);
}
.dsh-gruvbox-head { display: flex; flex-direction: column; gap: 4px; }
.dsh-gruvbox-title {
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
}
.dsh-gruvbox-desc {
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 18px;
  max-width: 680px;
}
.dsh-gruvbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 10px;
}
.dsh-gruvbox-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 8px;
  border: 0.5px solid var(--dsw-alias-border-l4);
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color 120ms ease, box-shadow 120ms ease;
}
@media (hover: hover) {
  .dsh-gruvbox-card:hover { background: var(--dsw-alias-interactive-bg-hover); }
}
.dsh-gruvbox-card:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: 2px;
}
.dsh-gruvbox-cardSelected {
  box-shadow: 0 0 0 2px var(--dsw-alias-brand-primary);
  border-color: transparent;
}
.dsh-gruvbox-shot {
  position: relative;
  display: flex;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  border: 0.5px solid var(--dsw-alias-border-l2);
}
.dsh-gruvbox-shotSide {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 27%;
  padding: 7px 6px;
}
.dsh-gruvbox-shotSide i {
  display: block;
  height: 4px;
  border-radius: 2px;
  width: 78%;
}
.dsh-gruvbox-shotSide i:first-child { width: 46%; height: 5px; margin-bottom: 3px; }
.dsh-gruvbox-shotMain {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
  padding: 7px 7px 6px;
}
.dsh-gruvbox-shotBar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 10px;
  padding: 0 4px;
  border-radius: 4px;
}
.dsh-gruvbox-shotBar i { display: block; height: 3px; border-radius: 2px; }
.dsh-gruvbox-shotBar i:first-child { width: 34%; }
.dsh-gruvbox-shotBar i:last-child { width: 12%; }
.dsh-gruvbox-shotLine {
  display: block;
  height: 4px;
  width: 86%;
  border-radius: 2px;
}
.dsh-gruvbox-shotLineShort { width: 54%; }
.dsh-gruvbox-shotCode {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: auto;
  padding: 5px;
  border-radius: 5px;
}
.dsh-gruvbox-shotCode i { display: block; height: 3px; border-radius: 2px; }
.dsh-gruvbox-check {
  position: absolute;
  top: 6px;
  right: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 11px;
  line-height: 1;
}
.dsh-gruvbox-cardMeta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;
}
.dsh-gruvbox-cardName {
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
}
.dsh-gruvbox-cardTag {
  flex: none;
  color: var(--dsw-alias-label-tertiary);
  font-size: 11px;
  line-height: 16px;
}
.dsh-gruvbox-cardDesc {
  color: var(--dsw-alias-label-tertiary);
  font-size: 11px;
  line-height: 15px;
}
.dsh-gruvbox-swatches { display: flex; gap: 4px; }
.dsh-gruvbox-swatches i {
  display: block;
  width: 16px;
  height: 10px;
  border-radius: 3px;
  border: 0.5px solid var(--dsw-alias-border-l3);
}
.dsh-gruvbox-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 16px;
}
.dsh-gruvbox-follow {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 240px;
  flex: 1;
}
.dsh-gruvbox-switch {
  position: relative;
  flex: none;
  width: 34px;
  height: 20px;
  margin-top: 1px;
  padding: 0;
  border: 0.5px solid var(--dsw-alias-border-l3);
  border-radius: 999px;
  background: var(--dsw-alias-bg-layer-3);
  cursor: pointer;
  transition: background-color 120ms ease;
}
.dsh-gruvbox-switch[aria-checked='true'] {
  background: var(--dsw-alias-brand-primary);
  border-color: transparent;
}
.dsh-gruvbox-switch:disabled { opacity: 0.45; cursor: default; }
.dsh-gruvbox-switch:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: 2px;
}
.dsh-gruvbox-switchThumb {
  position: absolute;
  top: 1px;
  left: 1px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--dsw-alias-switch-thumb);
  transition: transform 120ms ease;
}
.dsh-gruvbox-switch[aria-checked='true'] .dsh-gruvbox-switchThumb {
  transform: translateX(14px);
}
.dsh-gruvbox-followText { display: flex; flex-direction: column; gap: 2px; }
.dsh-gruvbox-followLabel {
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  line-height: 18px;
}
.dsh-gruvbox-followDesc {
  color: var(--dsw-alias-label-tertiary);
  font-size: 11px;
  line-height: 16px;
}
.dsh-gruvbox-reset {
  flex: none;
  padding: 6px 12px;
  border: 0.5px solid var(--dsw-alias-border-l3);
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  line-height: 18px;
  cursor: pointer;
}
@media (hover: hover) {
  .dsh-gruvbox-reset:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }
}
.dsh-gruvbox-reset:disabled { opacity: 0.45; cursor: default; }
.dsh-gruvbox-reset:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: 2px;
}
.dsh-gruvbox-status {
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 18px;
}
.dsh-gruvbox-statusError { color: var(--dsw-alias-state-error-primary); }
@media (max-width: 520px) {
  .dsh-gruvbox-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
  .dsh-gruvbox-cardDesc { display: none; }
}
`

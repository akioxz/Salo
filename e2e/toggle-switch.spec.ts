import { test, expect } from "@playwright/test";
import type { MouseEvent } from "react";
import { ToggleSwitch } from "../src/components/ui/ToggleSwitch";

test("exposes the setting name, both states, and a non-submit button", () => {
  for (const checked of [false, true]) {
    const element = ToggleSwitch({
      label: "Notifications", checked, onCheckedChange: () => {},
    });
    expect(element.type).toBe("button");
    expect(element.props.role).toBe("switch");
    expect(element.props["aria-label"]).toBe("Notifications");
    expect(element.props["aria-checked"]).toBe(checked);
    expect(element.props.type).toBe("button");
  }
});
test("requests the opposite state without changing parent-owned state", () => {
  for (const checked of [false, true]) {
    const changes: boolean[] = [];
    const element = ToggleSwitch({
      label: "Notifications", checked,
      onCheckedChange: (next) => changes.push(next),
    });
    const event = { defaultPrevented: false } as MouseEvent<HTMLButtonElement>;
    element.props.onClick(event);
    expect(changes).toEqual([!checked]);
    expect(element.props["aria-checked"]).toBe(checked);
  }
});

test("disabled and cancelled clicks do not request changes", () => {
  for (const disabled of [false, true]) {
    const changes: boolean[] = [];
    const element = ToggleSwitch({
      label: "Notifications", checked: false, disabled,
      onCheckedChange: (next) => changes.push(next),
      onClick: (event) => event.preventDefault(),
    });
    const event = {
      defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; },
    } as MouseEvent<HTMLButtonElement>;
    element.props.onClick(event);
    expect(changes).toEqual([]);
    expect(element.props.disabled).toBe(disabled);
  }
});


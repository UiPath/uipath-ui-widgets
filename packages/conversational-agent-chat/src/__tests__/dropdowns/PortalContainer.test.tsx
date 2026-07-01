import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it } from "vitest";
import {
  Combobox,
  PortalContainerProvider,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/dropdowns";

// Radix Select drives open/close through pointer-capture APIs and scrolls the
// active item into view — neither exists in jsdom, so shim them.
beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
  Element.prototype.scrollIntoView = () => {};
});

describe("dropdown portal container", () => {
  it("portals Select content into the provider's subtree, not document.body", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PortalContainerProvider>
        <Select defaultValue="a">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
            <SelectItem value="b">Option B</SelectItem>
          </SelectContent>
        </Select>
      </PortalContainerProvider>,
    );

    await user.click(screen.getByRole("combobox"));

    const option = await screen.findByRole("option", { name: "Option B" });
    // Inside the widget's own render tree — the whole point of the fix.
    expect(container.contains(option)).toBe(true);
    // And therefore not orphaned as a direct child of <body> (Radix's default).
    expect(document.body.contains(container)).toBe(true);
    expect(option.parentElement).not.toBe(document.body);
  });

  it("portals Combobox content into the provider's subtree, not document.body", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PortalContainerProvider>
        <Combobox
          items={[
            { value: "one", label: "One" },
            { value: "two", label: "Two" },
          ]}
        />
      </PortalContainerProvider>,
    );

    await user.click(screen.getByRole("combobox"));

    const option = await screen.findByText("Two");
    expect(container.contains(option)).toBe(true);
    expect(option.closest("body")).toBe(document.body);
    // The listbox is nested within the render container, not a body sibling.
    expect(within(container).getByText("One")).toBeInTheDocument();
  });

  it("falls back to document.body when no provider is mounted", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Select defaultValue="a">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Only A</SelectItem>
        </SelectContent>
      </Select>,
    );

    await user.click(screen.getByRole("combobox"));

    const option = await screen.findByRole("option", { name: "Only A" });
    // Without a provider the menu keeps Radix's default body portal.
    expect(container.contains(option)).toBe(false);
  });
});

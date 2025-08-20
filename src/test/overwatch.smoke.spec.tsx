import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import OverWatch from "@/pages/OverWatch";
import { MemoryRouter } from "react-router-dom";
import { TerminologyProvider } from "@/contexts/TerminologyContext";
import { AdvancedThemeProvider } from "@/contexts/AdvancedThemeContext";

describe("OverWatch smoke interactions", () => {
  beforeEach(() => {
    // reset in-memory localStorage mock
    window.localStorage.clear();
    // stub mapMethods
    (window as any).mapMethods = { setPoints: vi.fn() };
  });

  it("calls setPoints when Load Demo Points is clicked and saves a preset", async () => {
    render(
      <MemoryRouter>
        <TerminologyProvider>
          <AdvancedThemeProvider>
            <OverWatch />
          </AdvancedThemeProvider>
        </TerminologyProvider>
      </MemoryRouter>,
    );

    // Load Demo Points triggers window.mapMethods.setPoints
    const loadBtn = await screen.findByText("Load Demo Points");
    fireEvent.click(loadBtn);
    expect((window as any).mapMethods.setPoints).toHaveBeenCalled();

    // Quick Save creates a preset in localStorage
    const quickSave = await screen.findByText("Quick Save");
    fireEvent.click(quickSave);
    const raw = window.localStorage.getItem("overwatch-layer-presets");
    expect(raw).toBeTruthy();
    const list = JSON.parse(String(raw));
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
  });
});


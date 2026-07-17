import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("InOrdo landing shell", () => {
  it("links to an honestly labeled synthetic demo", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /project change without the chain reaction/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Synthetic demo ready to explore",
    );
    expect(
      screen.getByRole("link", { name: "Explore synthetic demo" }),
    ).toHaveAttribute("href", "/demo");
    expect(screen.getByRole("status")).toHaveTextContent(
      /model extraction.*not connected/i,
    );
    expect(screen.getByText("Evidence", { selector: "h3" })).toBeVisible();
    expect(screen.getByText("Human approval", { selector: "h3" })).toBeVisible();
  });
});

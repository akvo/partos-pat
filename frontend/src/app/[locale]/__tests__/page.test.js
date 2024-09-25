import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

import { HeroSection } from "../page";

const messages = {
  Landing: {
    title: "The Power Awareness Tool",
    description:
      "The decision to develop the Power Awareness Tool is based on the assumption that if partners have a better understanding of the way power works in the partnership, they will be in a better position to work towards shifting power in accordance with their shared principles.",
    createAccount: "Create Account",
  },
};

describe("Home", () => {
  it("renders a PAT landing page", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <HeroSection />
      </NextIntlClientProvider>
    );

    const patTitle = screen.getByText(messages.Landing.title);

    expect(patTitle).toBeInTheDocument();
  });

  it("renders correctly & match with the snapshot", () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <HeroSection />
      </NextIntlClientProvider>
    );
    expect(container).toMatchSnapshot();
  });
});

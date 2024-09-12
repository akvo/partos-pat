import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

import Home from "../page";

const messages = {
  Register: {
    btnCreateAccount: "Create account",
  },
};

describe("HomePage", () => {
  it("renders a default page nextjs", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Home />
      </NextIntlClientProvider>,
    );

    const nextjsLogo = screen.getByAltText("Next.js Logo");

    expect(nextjsLogo).toBeInTheDocument();
  });

  it("renders correctly & match with the snapshot", () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Home />
      </NextIntlClientProvider>,
    );
    expect(container).toMatchSnapshot();
  });
});

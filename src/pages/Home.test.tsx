import { createInMemoryOctocatApi } from "../api/InMemoryOctocatApi";
import { createTestOctocat } from "../api/OctocatMockFactory";
import { Home } from "./Home";
import { renderWithProviders } from "../../test/renderWithProviders";
import { User } from "../api/types/User";
import { useUser } from "../auth/UserContextProvider";
import userEvent from "@testing-library/user-event";
import { cleanup, screen } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { Route, Routes } from "react-router-dom";

describe("<Home />", (): void => {
  afterEach((): void => {
    cleanup();
  });

  it("removes mark of all owned cats if user logs out.", async (): Promise<void> => {
    const user: User = { id: "id1", name: "testuser" };
    const inMemoryAPI = createInMemoryOctocatApi();
    inMemoryAPI.addOctocats([
      createTestOctocat({ id: "#1", name: "Octocat 1" }),
    ]);
    await inMemoryAPI.addOctocatToUser({ itemId: "#1", userId: "id1" });

    const LogoutButton = () => {
      const { logout } = useUser();
      return (
        <button data-testid="logoutbutton" onClick={() => logout()}>
          Logout
        </button>
      );
    };

    renderWithProviders({
      component: (
        <>
          <Home />
          <LogoutButton />
        </>
      ),
      inMemoryApi: inMemoryAPI,
      initialUser: user,
    });

    await screen.findByLabelText("Remove Octocat 1 from your collection");

    await userEvent.click(screen.getByTestId("logoutbutton"));

    expect(
      await screen.findByLabelText("Add Octocat 1 to your collection")
    ).toBeDefined();
  });
});

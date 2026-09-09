import "./globals.css";
import { StoreProvider } from "../lib/store";
import Shell from "../components/Shell";

export const metadata = {
  title: "IX-Machines — SoMaCoSF",
  description: "Federated garage inventory, agent-swarm builds, GYST UUIDv8 labeling and shipping.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StoreProvider>
          <Shell>{children}</Shell>
        </StoreProvider>
      </body>
    </html>
  );
}

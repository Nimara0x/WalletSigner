import { Provider as WalletsProvider } from "@rango-dev/wallets-react";
import * as metamask from "@rango-dev/provider-metamask";
import "./App.css";
import { useMeta } from "./hooks/useMeta";
import Home from "./pages/home";

function App() {
  const { meta } = useMeta();

  return (
    <WalletsProvider
      providers={[metamask]}
      allBlockChains={meta?.blockchains || []}
    >
      <Home />
    </WalletsProvider>
  );
}

export default App;

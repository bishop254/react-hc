import logo from "./logo.svg";
import "./App.css";
import "primeflex/primeflex.css";
import "primereact/resources/themes/lara-light-cyan/theme.css";

import { PrimeReactProvider } from "primereact/api";
import ChartsHeader from "./components/ChartsHeader";

function App() {
  return (
    <PrimeReactProvider>
      <div className="App">
        <ChartsHeader />
      </div>
    </PrimeReactProvider>
  );
}

export default App;

import "./App.css";
import DemoApp from "@/demo/index";
import { TableLocalizationProvider } from "@/tables-framework/localization/localization";
import { useState } from "react";

function App() {
  const [locale, setLocale] = useState("it");
  return <TableLocalizationProvider value={{ locale }}>
    <label>Lingua / Language <select value={locale} onChange={event => setLocale(event.target.value)}>
      <option value="it">Italiano</option><option value="en">English</option>
    </select></label>
    <DemoApp />
  </TableLocalizationProvider>;
}

export default App;

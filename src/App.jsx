import { Router, Route } from "@solidjs/router";
import Upload from "./pages/Upload";
import Share from "./pages/Share";
import QRGenerator from "./pages/QRGenerator";

function App() {
    return (
        <Router>
            <Route path="/" component={Upload} />
            <Route path="/share/:fileId" component={Share} />
            <Route path="/qrgen" component={QRGenerator} />
        </Router>
    );
}

export default App;

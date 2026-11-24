import { SignInPage } from "./pages/SignInPage";
import { features } from "./config/features";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { createAppKit } from "@reown/appkit/react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { projectId, metadata, networks, wagmiAdapter } from "./config";
import { base } from "@reown/appkit/networks";
import { ToastContainer } from "react-toastify";
import Dashboard from "./pages/Dashboard";

// ui#779: route-level code splitting. Every page below is lazy-loaded so the
// initial bundle ships only the shell + the landing route (Dashboard). The heavy
// explorer/admin/table pages download on demand when their route is visited.
// Dashboard stays eager because it is the "/" landing route — eager-loading it
// avoids a Suspense flash on the most common entry point.
// Multi-tabling workspace (ui#55): the /table/:id route now renders a workspace
// that can keep several tables live at once, each in its own GameStateProvider.
// It statically imports Table, so Table ships in this lazy chunk.
const MultiTableRoute = lazy(() => import("./components/MultiTable/MultiTableWorkspace"));
const CosmosWalletPage = lazy(() => import("./components/CosmosWalletPage"));
const WalletHome = lazy(() => import("./pages/wallet/WalletHome"));
const BlocksPage = lazy(() => import("./pages/explorer/BlocksPage"));
const ExplorerHome = lazy(() => import("./pages/explorer/ExplorerHome"));
const BlockDetailPage = lazy(() => import("./pages/explorer/BlockDetailPage"));
const BlockHome = lazy(() => import("./pages/explorer/BlockHome"));
const TxHome = lazy(() => import("./pages/explorer/TxHome"));
const TransactionPage = lazy(() => import("./pages/explorer/TransactionPage"));
const AddressPage = lazy(() => import("./pages/explorer/AddressPage"));
const AllAccountsPage = lazy(() => import("./pages/explorer/AllAccountsPage"));
const DistributionPage = lazy(() => import("./pages/explorer/DistributionPage"));
const FairnessPage = lazy(() => import("./pages/fairness/FairnessPage"));
const HandReplayPage = lazy(() => import("./pages/explorer/HandReplayPage"));
const HandPage = lazy(() => import("./pages/explorer/HandPage"));
const TestSigningPage = lazy(() => import("./pages/TestSigningPage"));
const ManualBridgeTrigger = lazy(() => import("./pages/ManualBridgeTrigger"));
const BridgeAdminDashboard = lazy(() => import("./pages/BridgeAdminDashboard"));
const WithdrawalDashboard = lazy(() => import("./pages/WithdrawalDashboard"));
const TableAdminPage = lazy(() => import("./pages/TableAdminPage"));
const GenesisState = lazy(() => import("./pages/GenesisState"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const NodeStatusPage = lazy(() => import("./pages/NodeStatusPage"));
const NodesPage = lazy(() => import("./pages/NodesPage"));
const PlayersPage = lazy(() => import("./pages/PlayersPage"));
const PlayerAwardsPage = lazy(() => import("./pages/PlayerAwardsPage"));
const PlayersHome = lazy(() => import("./pages/players/PlayersHome"));
const AwardsHome = lazy(() => import("./pages/players/AwardsHome"));
const MyHandsPage = lazy(() => import("./pages/MyHandsPage"));
const HandsHome = lazy(() => import("./pages/hands/HandsHome"));
const PlayerProfilePage = lazy(() => import("./pages/PlayerProfilePage"));
const TechNotesPage = lazy(() => import("./pages/tech-notes/TechNotesPage"));
// test-sdk only has a named export; re-shape it to a default for React.lazy.
const TestSdk = lazy(() => import("./test-sdk").then(m => ({ default: m.TestSdk })));
import { GameStateProvider } from "./context/GameStateContext";
import { GameSettingsProvider } from "./context/GameSettingsContext";
import { getSiteLook, siteLookScopeFor } from "./utils/siteLook";
import "./styles/flagshipSite.css";
import { generateCSSVariables } from "./utils/colorConfig";
import { useEffect, useState, lazy, Suspense } from "react";
import FaviconSetter from "./components/FaviconSetter";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import ClubLoginPage from "./pages/ClubLoginPage";
import ClubPage from "./pages/ClubPage";
import ClubProofPage from "./pages/ClubProofPage";
import { ClubNotifier } from "./components/ClubNotifier";
import { ClubApiProvider } from "./context/ClubApiContext";
import { SiteNav, SiteNavPage } from "./components/nav/SiteNav";
import { GlobalHeader } from "./components/GlobalHeader";
import { ClubMessages } from "./components/ClubMessages";
import { ProfileAvatarProvider } from "./context/profile/ProfileAvatarContext";
import { ProfileAvatarModal } from "./components/profile";
import { PaymentApiProvider } from "./context/PaymentApiContext";
import { CosmosApiProvider } from "./context/CosmosApiContext";
import { IndexerApiProvider } from "./context/IndexerApiContext";
import { ActionSubmitProvider } from "./context/ActionSubmitContext";

const queryClient = new QueryClient();

// Lazy-load debug modal (dev only)
const ChipDebugModal = lazy(() => import("./components/ChipDebugModal"));

// Create modal
createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    metadata,
    features: {
        socials: false,
        email: false,
        analytics: true
    },
    enableCoinbase: true,
    defaultNetwork: base,
    allWallets: "SHOW"
});

// ui#779: shown while a lazy route chunk is downloading.
function RouteFallback() {
    return (
        <div className="flex items-center justify-center min-h-[60vh] text-white/70">
            <div className="animate-pulse text-sm">Loading…</div>
        </div>
    );
}

// Main App content to be wrapped with providers
function AppContent() {
    const location = useLocation();
    const [showChipDebug, setShowChipDebug] = useState(false);

    // The whole site's look (Flagship or Traditional); the page background follows it.
    const siteLook = getSiteLook();
    useEffect(() => {
        document.documentElement.dataset.siteBg = siteLook;
    }, [siteLook]);

    // Inject CSS variables on mount
    useEffect(() => {
        const style = document.createElement("style");
        style.innerHTML = generateCSSVariables();
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // Ctrl+Shift+D to toggle chip debug modal
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === "D") {
                e.preventDefault();
                setShowChipDebug(prev => !prev);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    return (
        <div className="bg-[#2c3245] min-h-screen" data-site-look={siteLookScopeFor(siteLook, location.pathname)}>
            <FaviconSetter />
            {/* Flagship: the icon rail + top bar (tab bar on phones). Traditional: the old header. */}
            {siteLook === "flagship" ? <SiteNav /> : <GlobalHeader />}
            <ClubMessages />
            <ProfileAvatarModal />
            {/* poker-vm#2097: a throw inside a page shows an error page, not a white
                screen; keyed by path so navigating away resets it. */}
            <SiteNavPage enabled={siteLook === "flagship"}>
            <ErrorBoundary key={location.pathname} showDetails={import.meta.env.DEV}>
            {/* ui#779: lazy routes need a Suspense boundary for their load state. */}
            <Suspense fallback={<RouteFallback />}>
            <ClubNotifier />
            <Routes>
                <Route path="/test-sdk" element={<TestSdk />} />
                <Route path="/table/:id" element={<MultiTableRoute />} />
                <Route path="/table/admin" element={<TableAdminPage />} /> {/* Legacy - keep for backwards compat */}
                <Route path="/wallet" element={siteLook === "flagship" ? <WalletHome /> : <CosmosWalletPage />} />
                {features.clubAccounts && <Route path="/signin" element={<SignInPage />} />}
                <Route path="/club-login" element={<ClubLoginPage />} />
                <Route path="/club/:handle" element={<ClubPage />} />
                <Route path="/club/:handle/proof" element={<ClubProofPage />} />
                {/* User-facing routes */}
                <Route path="/withdrawals" element={<WithdrawalDashboard />} />
                <Route path="/bridge/withdrawals" element={<WithdrawalDashboard />} />
                {/* Admin routes - consolidated under /admin */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/genesis" element={<GenesisState />} />
                <Route path="/admin/bridge" element={<BridgeAdminDashboard />} />
                <Route path="/admin/bridge-manual" element={<ManualBridgeTrigger />} />
                <Route path="/admin/tables" element={<TableAdminPage />} />
                <Route path="/admin/test-signing" element={<TestSigningPage />} />
                {/* Legacy routes - redirect to new admin paths */}
                <Route path="/test-signing" element={<TestSigningPage />} />
                <Route path="/bridge/manual" element={<ManualBridgeTrigger />} />
                <Route path="/bridge/admin" element={<BridgeAdminDashboard />} />
                <Route path="/genesis" element={<GenesisState />} />
                <Route path="/explorer" element={siteLook === "flagship" ? <ExplorerHome /> : <BlocksPage />} />
                <Route path="/explorer/block/:height" element={siteLook === "flagship" ? <BlockHome /> : <BlockDetailPage />} />
                <Route path="/explorer/tx/:hash" element={siteLook === "flagship" ? <TxHome /> : <TransactionPage />} />
                <Route path="/explorer/address" element={<AddressPage />} />
                <Route path="/explorer/address/:address" element={<AddressPage />} />
                <Route path="/explorer/accounts" element={<AllAccountsPage />} />
                <Route path="/explorer/distribution" element={<DistributionPage />} />
                <Route path="/fairness" element={<FairnessPage />} />
                <Route path="/explorer/hand/:gameId/:handNumber" element={<HandReplayPage />} />
                <Route path="/explorer/hand/:gameId" element={<HandPage />} />
                <Route path="/hands" element={siteLook === "flagship" ? <HandsHome /> : <MyHandsPage />} />
                <Route path="/players" element={siteLook === "flagship" ? <PlayersHome /> : <PlayersPage />} />
                <Route path="/players/:address" element={<PlayerProfilePage />} />
                <Route path="/awards" element={siteLook === "flagship" ? <AwardsHome /> : <PlayerAwardsPage />} />
                <Route path="/nodes" element={<NodesPage />} />
                <Route path="/node/:name" element={<NodeStatusPage />} />
                <Route path="/tech-notes" element={<TechNotesPage />} />
                <Route path="/" element={<Dashboard />} />
            </Routes>
            </Suspense>
            </ErrorBoundary>
            </SiteNavPage>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss={false}
                draggable
                pauseOnHover={false}
                closeButton={true}
                theme={"dark"}
            />
            {showChipDebug && (
                <Suspense fallback={null}>
                    <ChipDebugModal onClose={() => setShowChipDebug(false)} />
                </Suspense>
            )}
        </div>
    );
}

function App() {
    return (
        // Router should be the outermost wrapper
        <Router>
            <QueryClientProvider client={queryClient}>
                <WagmiProvider config={wagmiAdapter.wagmiConfig}>
                    <GameStateProvider>
                        <GameSettingsProvider>
                        <ProfileAvatarProvider>
                            <PaymentApiProvider>
                                <CosmosApiProvider>
                                    <IndexerApiProvider>
                                        <ClubApiProvider>
                                            <ActionSubmitProvider>
                                                <AppContent />
                                            </ActionSubmitProvider>
                                        </ClubApiProvider>
                                    </IndexerApiProvider>
                                </CosmosApiProvider>
                            </PaymentApiProvider>
                        </ProfileAvatarProvider>
                        </GameSettingsProvider>
                    </GameStateProvider>
                </WagmiProvider>
            </QueryClientProvider>
        </Router>
    );
}

export default App;

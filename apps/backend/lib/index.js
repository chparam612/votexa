"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onVoteSubmitted = exports.helloWorld = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const algorithms_1 = require("@votexa/algorithms");
admin.initializeApp();
exports.helloWorld = functions.https.onRequest((request, response) => {
    const fsm = new algorithms_1.FiniteStateMachine();
    functions.logger.info("Hello logs! FSM initialized: " + !!fsm, { structuredData: true });
    response.send("Hello from Votexa Backend!");
});
// Create an instance of the risk engine
const riskEngine = new algorithms_1.RiskScoringEngine();
exports.onVoteSubmitted = functions.firestore
    .document("votes/{voteId}")
    .onCreate(async (snap, context) => {
    const voteData = snap.data();
    functions.logger.info(`Analyzing new vote: ${context.params.voteId}`);
    // Extract metadata from the vote
    // In a real app, deviceVoteCount might be fetched from Firestore based on the device ID
    // For this demo, we assume the client passed some base metadata we can trust, or we compute it.
    const metadata = {
        voterRegisteredRegion: voteData.voterRegisteredRegion || "UNKNOWN",
        ipRegion: voteData.ipRegion || "UNKNOWN",
        deviceVoteCount: voteData.deviceVoteCount || 1,
        failedAuthAttempts: voteData.failedAuthAttempts || 0,
        timeElapsedSinceRegistrationMs: voteData.timeElapsedSinceRegistrationMs || 60000,
    };
    // Calculate risk
    const riskResult = riskEngine.evaluate(metadata);
    functions.logger.info(`Risk Evaluation for ${context.params.voteId}: Score ${riskResult.score}, Level ${riskResult.level}`, { flags: riskResult.flags });
    // Securely update the vote document with the calculated risk
    // This happens server-side, so clients cannot tamper with it.
    return snap.ref.set({
        riskScore: riskResult.score,
        riskLevel: riskResult.level,
        flags: riskResult.flags,
        analyzedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
});
//# sourceMappingURL=index.js.map
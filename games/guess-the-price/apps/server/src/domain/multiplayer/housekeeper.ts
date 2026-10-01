import { MPSessionDatasource } from '../datasources/mp-session-datasource';

export class Housekeeper {
	private static readonly sessionDatasource = new MPSessionDatasource();
	private static running = false;

	private static startRoundClock() {
		console.log('CLK -> Round clock running');
		setInterval(this.sessionDatasource.roundTick, 1000);
	}

	private static startCleanupClock() {
		console.log('CLK -> Cleanup clock running');
		setInterval(this.sessionDatasource.cleanupTick, 60000);
	}

	public static start() {
		if (this.running) return;
		this.startRoundClock();
		this.startCleanupClock();
	}
}

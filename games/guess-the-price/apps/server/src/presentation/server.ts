import express from 'express';
import cors from 'cors';
import { AppRoutes } from './routes';
import 'dotenv/config';

export class Server {
	public readonly app = express();
	private readonly appRoutes = new AppRoutes();

	constructor() {}

	public async start() {
		this.app.use(express.urlencoded({ extended: true }));
		this.app.use(express.json());
		this.app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));

		this.app.use('/api', this.appRoutes.routes);

		// this.app.listen(this.port, () => {
		// 	console.log(`Server listening on port ${this.port}`);
		// });
	}
}

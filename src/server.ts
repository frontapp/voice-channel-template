import path from 'path';
import express from 'express';
import PluginRouter from './plugin_routes';
import ChannelRouter from './routes';
import { randomBytes } from 'crypto';
import bodyParser from 'body-parser';

export const frontId = 'yourFrontId';
export const frontSecret = 'shhhhhhhhh';
export const frontUrl = 'https://api2.frontapp.com/';
export const callbackHostname = 'https://your-ngrok-hostnmae.ngrok.io';
export const serverPort = '3000';

export function randomString(length: number): string {
  return randomBytes(Math.floor(length / 2)).toString('hex');
}

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, '../dist/public')));
app.use(ChannelRouter);
app.use(PluginRouter);

app.listen(serverPort, () => {
  console.log(`Express server listening on port ${serverPort}`);
});

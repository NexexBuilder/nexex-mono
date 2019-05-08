import {Test, TestingModule} from '@nestjs/testing';
import {NestFactory} from '@nestjs/core';
import {WsGateway} from './events.gateway';
import * as io from 'socket.io-client';
import * as express from 'express';

const socketURL = 'http://localhost:5000';
const options = {
    transports: ['websocket'],
    'force new connection': true
};

describe('EventsGateway', () => {
    let module: TestingModule;
    let app;
    let client;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [WsGateway]
        }).compile();
        app = NestFactory.create(module, express);
        app.listen(5000);
    });

    describe('on connection', () => {
        it('should return "Welcome"', () => {
            client = io.connect(
                socketURL,
                options
            );
            client.on('connect', data => {
                expect(data.toBe('Welcome'));
            });
        });
    });
});

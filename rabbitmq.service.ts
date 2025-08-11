import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RabbitMQService {
  constructor(@Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy) {}

  async sendMessage(pattern: string, data: any) {
    return this.client.emit(pattern, data).toPromise();
  }

  async sendXrayData(data: any) {
    return this.client.emit('xray_data', data).toPromise();
  }
}

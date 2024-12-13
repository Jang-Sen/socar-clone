import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  // @Cron('* * * * * *')
  testSchedule() {
    return console.log('스케줄러 테스트');
  }
}

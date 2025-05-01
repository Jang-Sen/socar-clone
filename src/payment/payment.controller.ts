import { Controller } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('결제 API')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {
  }

}

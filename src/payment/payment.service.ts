import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Payment } from '@root/payment/entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly repository: Repository<Payment>,
  ) {
  }

}

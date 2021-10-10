import { EntityRepository, Repository } from 'typeorm';
import { Carts } from '../entity/carts';

@EntityRepository(Carts)
export class CartsRepository extends Repository<Carts> {}
